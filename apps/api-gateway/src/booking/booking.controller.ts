import {Body, Controller, Get, HttpException, HttpStatus, Param, Post, Req} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";
import axios from "axios";
import type {Request} from "express";

@Controller('booking')
export class BookingController {
    private readonly BOOKING_SERVICE_URL: string;

    constructor(private readonly configService: ConfigService) {
        this.BOOKING_SERVICE_URL =
            configService.getOrThrow('BOOKING_SERVICE_URL');
    }

    @Get()
    async getBookingsList(@Req() req: Request) {
        try {
            const response = await axios.get(
                `${this.BOOKING_SERVICE_URL}/bookings`,
                {
                    headers: {
                        Authorization: req.headers.authorization
                    }
                }
            );

            return response.data;
        } catch (error: any) {
            if (error.response) {
                throw new HttpException(error.response.data, error.response.status);
            }
            throw new HttpException('Gateway error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('user')
    async getUsersBookings(@Req() req: Request) {
        try {
            const response = await axios.get(
                `${this.BOOKING_SERVICE_URL}/bookings/user`,
                {
                    headers: {
                        Authorization: req.headers.authorization
                    }
                }
            );
            return response.data;

        } catch (error: any) {
            if (error.response) {
                throw new HttpException(error.response.data, error.response.status);
            }
            throw new HttpException('Gateway error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Post(':id')
    async createBooking(@Req() req: Request, @Param('id') id: string, @Body() body: unknown) {
        try {
            const response = await axios.post(
                `${this.BOOKING_SERVICE_URL}/bookings/${id}`,
                body,
                {
                    headers: {
                        Authorization: req.headers.authorization
                    }
                }
            );

            return response.data;
        } catch (error: any) {
            if (error.response) {
                throw new HttpException(error.response.data, error.response.status);
            }
            throw new HttpException('Gateway error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get(':id')
    async getBooking(@Req() req: Request, @Param('id') id: string) {
        try {
            const response = await axios.get(
                `${this.BOOKING_SERVICE_URL}/bookings/${id}`,
                {
                    headers: {
                        Authorization: req.headers.authorization
                    }
                }
            );

            return response.data;
        } catch (error: any) {
            if (error.response) {
                throw new HttpException(error.response.data, error.response.status);
            }
            throw new HttpException('Gateway error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}