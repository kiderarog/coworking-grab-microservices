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


    async checkExistingBooking(data: { userId: string, coworkingId: string }) {
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

    async activateBooking(bookingId: string, expiresAt: Date) {
        return prisma.booking.update({
            where: {id: bookingId},
            data: {
                status: BookingStatus.ACTIVE,
                expires_at: expiresAt
            }
        });
    }

    async getPendingBookings() {
        return prisma.booking.findMany({
            where: {
                status: BookingStatus.PENDING,
                expires_at: {lt: new Date()}
            }
        })
    }

    async getExpiredBookings(date: Date) {
        return prisma.booking.findMany({
            where: {
                status: BookingStatus.ACTIVE,
                expires_at: {lt: date}
            }
        })
    }

    async deleteBooking(bookingId: string) {
        return prisma.booking.delete({
            where: {
                id: bookingId
            }
        })
    }

    async changeStatusForExpiredBookings(bookingId: string) {
        return prisma.booking.update({
            where: {
                id: bookingId
            }, data: {
                status: BookingStatus.EXPIRED
            }
        })
    }

    async getBooking(bookingId: string) {
        return prisma.booking.findUnique({
            where: {
                id: bookingId
            }
        })
    }

    async getBookingList() {
        return prisma.booking.findMany();
    }

    async getBookingsByUserId(userId: string) {
        return prisma.booking.findMany({
            where: {
                user_id: userId
            }
        })
    }


}