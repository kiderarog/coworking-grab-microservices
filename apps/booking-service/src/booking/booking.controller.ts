import {Body, Controller, Get, Param, Post, Req} from '@nestjs/common';
import {BookingService} from './booking.service';
import {Authorization, JwtPayload} from "../security";
import type {Response, Request} from 'express';
import {CreateBookingDto} from "./dto/create-booking-dto";


@Controller('booking')
export class BookingController {
    constructor(private readonly bookingService: BookingService) {
    }

    @Post(':id')
    @Authorization()
    async test(@Req() req: Request, @Param('id') id: string, @Body() dto: CreateBookingDto) {
        return this.bookingService.createBooking(id, (req.user as JwtPayload).id, dto);
    }
}
