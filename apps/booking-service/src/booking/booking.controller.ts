import {Body, Controller, Get, Param, Post, Req} from '@nestjs/common';
import {BookingService} from './booking.service';
import {Authorization, JwtPayload, Roles} from "../security";
import type {Response, Request} from 'express';
import {CreateBookingDto} from "./dto/create-booking-dto";


@Controller('bookings')
export class BookingController {
    constructor(private readonly bookingService: BookingService) {
    }

    @Get()
    @Authorization()
    @Roles('ADMIN', 'SUPERADMIN')
    async getBookingsList() {
        return this.bookingService.getBookingList();
    }

    // Для пользователя (просм. своих броней по вычлененному id)
    @Get('user')
    @Authorization()
    async getUsersBookings(@Req() req: Request) {
        return this.bookingService.getBookingByUserId((req.user as JwtPayload).id);
    }

    @Post(':id')
    @Authorization()
    async createBooking(@Req() req: Request, @Param('id') id: string, @Body() dto: CreateBookingDto) {
        return this.bookingService.createBooking(id, (req.user as JwtPayload).id, dto);
    }

    @Get(':id')
    @Authorization()
    @Roles('ADMIN', 'SUPERADMIN')
    async getBooking(@Param('id') id: string) {
        return this.bookingService.getBookingInfo(id);
    }

}
