import {
    BadRequestException,
    ConflictException,
    ForbiddenException, HttpException,
    Inject,
    Injectable,
    InternalServerErrorException
} from '@nestjs/common';
import {BookingRepository} from "./infrastructure/repositories/booking.repository";
import axios from "axios";
import {ConfigService} from "@nestjs/config";
import {CoworkingInternalDataDto} from "./dto/coworking-internal-data.dto";
import {CreateBookingDto} from "./dto/create-booking-dto";
import {CreateBookingData} from "./domain/create-booking-data";
import {BookingStatus} from "../../generated/prisma/enums";
import {ClientProxy} from "@nestjs/microservices";
import {PaymentResponseDto} from "./dto/payment-response.dto";
import {firstValueFrom} from "rxjs";
import {Cron, CronExpression} from "@nestjs/schedule";
import {InjectPinoLogger, PinoLogger} from "nestjs-pino";
import {BookingResponseDto} from "./dto/booking-response-dto";

@Injectable()
export class BookingService {
    private readonly bookingRepository: BookingRepository;
    private readonly BACK_OFFICE_SERVICE_URL: string;
    private readonly INTERNAL_API_KEY: string;
    @InjectPinoLogger(BookingService.name)
    private readonly logger: PinoLogger;


    constructor(bookingRepository: BookingRepository, private readonly configService: ConfigService,
                @Inject('BOOKING_CLIENT')
                private readonly bookingClient: ClientProxy,
                @Inject('BOOKING_ACTIVE_EVENT')
                private readonly activeBookingClient: ClientProxy,
                @Inject('EXPIRED_BOOKING_CLIENT')
                private readonly expiredBookingClient: ClientProxy) {
        this.bookingRepository = bookingRepository;
        this.BACK_OFFICE_SERVICE_URL = configService.getOrThrow('BACK_OFFICE_SERVICE_URL');
        this.INTERNAL_API_KEY = configService.getOrThrow('INTERNAL_API_KEY');

    }

    async createBooking(coworkingId: string, userId: string, dto: CreateBookingDto) {
        console.log('createBooking called', {
            coworkingId,
            userId,
            time: new Date().toISOString()
        });
        const existingBooking = await this.bookingRepository.checkExistingBooking(
            {
                coworkingId, userId
            }
        );
        if (existingBooking > 0) {
            this.logger.warn({coworkingId, userId}, 'User already has active or pending booking');
            throw new ForbiddenException("You already have active or pending booking into this coworking");
        }
        let coworkingInternalData: CoworkingInternalDataDto;
        try {
            const response = await axios.get(
                `${this.BACK_OFFICE_SERVICE_URL}/coworkings/${coworkingId}/is-available`,
                {
                    headers: {'x-internal-key': this.INTERNAL_API_KEY}
                }
            )
            coworkingInternalData = new CoworkingInternalDataDto(
                response.data.coworkingId,
                response.data.isFrozen,
                response.data.totalSpots,
                response.data.availableSpots,
                response.data.priceForDay,
                response.data.priceForMonth);
            this.logger.info({coworkingId, data: coworkingInternalData}, 'Received internal coworking data');
        } catch (error: any) {
            this.logger.error({error, coworkingId}, 'Back-office service error (booking-service requester)');
            throw new InternalServerErrorException("Back-office service error");
        }

        if (coworkingInternalData.isFrozen) {
            this.logger.warn({coworkingId}, 'Coworking is frozen');
            throw new ForbiddenException("Coworking is frozen by administrator");
        }
        if (coworkingInternalData.availableSpots === 0) {
            this.logger.warn({coworkingId}, 'No free spots available');
            throw new ConflictException("Here is NO available free spaces for booking");
        }

        const startDate = new Date(dto.startTime);
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + dto.days);
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 2);

        const bookingData = new CreateBookingData({
            coworking_id: coworkingId,
            user_id: userId,
            start_time: startDate,
            end_time: endDate,
            amount_of_money: coworkingInternalData.priceForDay * dto.days,
            status: BookingStatus.PENDING,
            expires_at: expiresAt
        });

        this.logger.info({bookingData}, 'Initializing booking in repository');
        const booking = await this.bookingRepository.initializeBooking(bookingData);
        const paymentResponse = await firstValueFrom(
            this.bookingClient.send<PaymentResponseDto>('payment_request', {
                userId: bookingData.user_id,
                amount: bookingData.amount_of_money
            })
        );
        this.logger.info({bookingId: booking.id, paymentResponse}, 'Payment request sent (from booking to payment)');
        if (paymentResponse.status !== 'success') {
            this.logger.warn({bookingId: booking.id, error: paymentResponse.error}, 'Payment failed');
            throw new ConflictException("Failed while money writing-off attempt:" + paymentResponse.error);
        }

        const activatedBooking = await this.bookingRepository.activateBooking(booking.id, booking.end_time);
        this.logger.info({bookingId: booking.id}, "Booking activated and expiration set");

        this.activeBookingClient.emit('booking.active', {
            coworkingId
        });
        this.logger.info({bookingId: booking.id, coworkingId}, "Booking.active event sent (to back-office)");

        return this.mapToBookingResponseDto(activatedBooking);
    }

    @Cron(CronExpression.EVERY_MINUTE)
    async checkingBookingStatus() {
        this.logger.info("Booking status checker started (scheduler every minute)");
        const now = new Date();
        const pendingBookings = await this.bookingRepository.getPendingBookings();
        this.logger.info({count: pendingBookings.length}, "Pending bookings found (counted amount)");
        for (let pb of pendingBookings) {
            await this.bookingRepository.deleteBooking(pb.id);
            this.logger.info({bookingId: pb.id}, "Deleted pending booking(s)");
        }

        const expiredBookings = await this.bookingRepository.getExpiredBookings(now);
        this.logger.info({count: expiredBookings.length}, "Expired bookings found (counted amount)");

        for (let eb of expiredBookings) {
            await this.bookingRepository.changeStatusForExpiredBookings(eb.id);
            this.expiredBookingClient.emit('booking.expired', {
                coworkingId: eb.coworking_id,
            });
        }
        this.logger.info("Booking checker finished" + now);
        this.logger.info({
            pendingCount: pendingBookings.length,
            expiredCount: expiredBookings.length
        }, 'Booking status check completed');
    }

    async getBookingInfo(bookingId: string) {
        if (!bookingId) {
            this.logger.warn('Empty or invalid booking ID');
            throw new BadRequestException("Empty or invalid booking ID");
        }
        try {
            const booking = await this.bookingRepository.getBooking(bookingId);
            if (!booking) {
                this.logger.warn({bookingId}, 'Booking not found by this ID');
                throw new BadRequestException("No booking with such ID");
            }
            this.logger.info({bookingId}, 'Booking info retrieved successfully');
            return this.mapToBookingResponseDto(booking);

        } catch (error) {
            if (error instanceof HttpException) {
                this.logger.error({error, bookingId}, 'Unexpected error while getting booking info');
                throw error;
            }
            throw new InternalServerErrorException("Internal unexpected error while getting booking");
        }
    }

    async getBookingList() {
        this.logger.info('Booking list was requested');
        const bookings = await this.bookingRepository.getBookingList();
        const bookingList: BookingResponseDto[] = [];
        for (const booking of bookings) {
            bookingList.push(this.mapToBookingResponseDto(booking));
        }
        return bookingList;
    }

    async getBookingsByUserId(userId: string) {
        if (!userId) {
            this.logger.warn('Empty or invalid user ID');
            throw new BadRequestException("Incorrect or empty user ID");
        }
        this.logger.info({userId: userId}, 'Retrieved bookings by userId');
        const bookings = await this.bookingRepository.getBookingsByUserId(userId);
        const bookingList: BookingResponseDto[] = [];
        for (const booking of bookings) {
            bookingList.push(this.mapToBookingResponseDto(booking));
        }
        return bookingList;
    }

    private mapToBookingResponseDto(booking: any): BookingResponseDto {
        const dto = new BookingResponseDto();
        dto.id = booking.id;
        dto.coworkingId = booking.coworking_id;
        dto.userId = booking.user_id;
        dto.startTime = booking.start_time;
        dto.endTime = booking.end_time;
        dto.amountOfMoney = Number(booking.amount_of_money);
        dto.status = booking.status;
        dto.createdAt = booking.created_at;
        dto.expiresAt = booking.expires_at;
        return dto;
    }
}
