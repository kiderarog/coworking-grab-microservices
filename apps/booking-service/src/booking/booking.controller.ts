import {Body, Controller, Get, Param, Post, Req} from '@nestjs/common';
import {BookingService} from './booking.service';
import {Authorization, JwtPayload, Roles} from "../security";
import type {Request} from 'express';
import {CreateBookingDto} from "./dto/create-booking-dto";
import {CoworkingIdParamDto} from "./dto/coworking-id-param-dto";
import {BookingIdParamDto} from "./dto/booking-id-param-dto";
import {ApiBody, ApiOperation, ApiParam, ApiResponse} from "@nestjs/swagger";
import {BookingResponseDto} from "./dto/booking-response-dto";


@Controller('bookings')
export class BookingController {
    constructor(private readonly bookingService: BookingService) {
    }

    @Get()
    @Authorization()
    @Roles('ADMIN', 'SUPERADMIN')
    @ApiOperation({ summary: 'Get list of all bookings (Admin only)' })
    @ApiResponse({status: 200, description: 'List of bookings retrieved successfully', type: BookingResponseDto, isArray: true})
    @ApiResponse({ status: 403, description: 'Unauthorized (insufficient role)' })
    @ApiResponse({ status: 500, description: 'Unexpected internal server error' })
    async getBookingsList() {
        return this.bookingService.getBookingList();
    }

    // Для пользователя (просм. своих броней по вычлененному id)
    @Get('user')
    @Authorization()
    @ApiOperation({summary: 'Get list of all bookings'})
    @ApiResponse({status: 200, description: 'List of bookings got successfully', type: BookingResponseDto, isArray: true})
    @ApiResponse({status: 403, description: 'Unauthorized (gurd-role)'})
    @ApiResponse({status: 500, description: 'Unexpected internal server error'})
    async getUsersBookings(@Req() req: Request) {
        return this.bookingService.getBookingsByUserId((req.user as JwtPayload).id);
    }

    @Post(':id')
    @Authorization()
    @ApiOperation({summary: 'Creating new booking endpoint'})
    @ApiParam({name: 'id', description: 'UUID of the coworking'})
    @ApiBody({type: CreateBookingDto})
    @ApiResponse({status: 201, description: 'Booking successfully created', type: BookingResponseDto})
    @ApiResponse({status: 403, description: 'User already has active or pending booking or coworking is frozen'})
    @ApiResponse({status: 409, description: 'No available free spots (or payment failed)'})
    @ApiResponse({status: 500, description: 'Unexpected internal server error'})
    async createBooking(@Req() req: Request, @Param() data: CoworkingIdParamDto, @Body() dto: CreateBookingDto) {
        return this.bookingService.createBooking(data.id, (req.user as JwtPayload).id, dto);
    }

    @Get(':id')
    @Authorization()
    @Roles('ADMIN', 'SUPERADMIN')
    @ApiOperation({summary: 'Get booking info by booking ID'})
    @ApiParam({name: 'id', description: 'UUID (booking)'})
    @ApiResponse({status: 200, description: 'Booking info got successfully', type: BookingResponseDto})
    @ApiResponse({status: 400, description: 'Invalid or empty booking ID'})
    @ApiResponse({status: 403, description: 'Unauthorized by role-guard'})
    @ApiResponse({status: 500, description: 'Unexpected internal server error'})
    async getBooking(@Param() data: BookingIdParamDto) {
        return this.bookingService.getBookingInfo(data.id);
    }

}
