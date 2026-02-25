import {Injectable} from "@nestjs/common";
import {prisma} from '../../../prisma';
import {CreateBookingData} from "../../domain/create-booking-data";
import {BookingStatus} from "../../../../generated/prisma/enums";


@Injectable()
export class BookingRepository {

    async initializeBooking(data: CreateBookingData) {
        return prisma.booking.create({
            data
        });
    }

    async changeBookingStatus(bookingId: string, status: BookingStatus) {
        return prisma.booking.update({
            where: { id: bookingId },
            data: { status }
        });
    }

    async checkExistingBooking(data: {userId: string, coworkingId: string})
    {
        return prisma.booking.count({
            where: {
                user_id: data.userId,
                coworking_id: data.coworkingId,
                status: {
                    in: [BookingStatus.PENDING, BookingStatus.ACTIVE]
                }
            }
        })
    }
}