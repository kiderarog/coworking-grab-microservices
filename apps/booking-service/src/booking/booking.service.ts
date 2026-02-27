import {
    ConflictException,
    ForbiddenException,
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

@Injectable()
export class BookingService {
    private readonly bookingRepository: BookingRepository;
    private readonly BACK_OFFICE_SERVICE_URL: string;
    private readonly INTERNAL_API_KEY: string;


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

        } catch (error: any) {
            throw new InternalServerErrorException("Back-office service error");
        }

        if (coworkingInternalData.isFrozen) {
            throw new ForbiddenException("Coworking is frozen by administrator");
        }
        if (coworkingInternalData.availableSpots === 0) {
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

        const booking = await this.bookingRepository.initializeBooking(bookingData);
        const paymentResponse = await firstValueFrom(
            this.bookingClient.send<PaymentResponseDto>('payment_request', {
                userId: bookingData.user_id,
                amount: bookingData.amount_of_money
            })
        );
        console.log("BOOKING EVENT SENT TO PAYMENT-SERVICE");
        if (paymentResponse.status !== 'success') {
            throw new ConflictException("Failed while money writing-off attempt:" + paymentResponse.error);
        }

        try {
            await this.bookingRepository.activateBooking(booking.id, booking.end_time);
            console.log("BOOKING STATUS SET ON 'ACTIVE'. EXPIRATION DATE SET ON END_TIME");
        } catch (error: any) {
            throw new InternalServerErrorException("Internal error while activating booking");
        }

        this.activeBookingClient.emit('booking.active', {
            coworkingId
        });
    }

    @Cron(CronExpression.EVERY_MINUTE)
    async checkingBookingStatus() {
        console.log("Воркер начал работу" + new Date());
        const now = new Date();
        console.log("Текущее время (в ютс)", now.toISOString());
        const pendingBookings = await this.bookingRepository.getPendingBookings();
        console.log("Отловлено в статусе ожидание:", pendingBookings.length);

        for (let pb of pendingBookings) {
            await this.bookingRepository.deleteBooking(pb.id);
        }

        const expiredBookings = await this.bookingRepository.getExpiredBookings(now);
        console.log("Отловлено истекших бронирований:", expiredBookings.length);

        for (let eb of expiredBookings) {
            await this.bookingRepository.changeStatusForExpiredBookings(eb.id);
            this.expiredBookingClient.emit('booking.expired', {
                coworkingId: eb.coworking_id,
            });
        }
        console.log("Воркер закончил работу." + new Date());
    }

}
