import {Body, Controller, Get, Post, Req, Res} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";
import type {Request, Response} from 'express';
import axios from "axios";
import {CreatePaymentDto} from "./dto/create-payment-dto";

@Controller('payment')
export class PaymentController {
    private readonly PAYMENT_SERVICE_URL: string;

    constructor(private readonly configService: ConfigService) {
        this.PAYMENT_SERVICE_URL = configService.getOrThrow('PAYMENT_SERVICE_URL');
    }

    @Post('create')
    async createPayment(@Req() req: Request, @Res() res: Response, @Body() body: CreatePaymentDto) {
        try {
            const response = await axios.post(
                `${this.PAYMENT_SERVICE_URL}/payment/create`,
                body,
                {
                    headers: {
                        Authorization: req.headers.authorization
                    },
                    withCredentials: true,
                },
            )
            return res.status(response.status).json(response.data);
        } catch (error: any) {
            if (error.response) {
                return res.status(error.response.status).json(error.response.data);
            }
            return res.status(500).json({message: 'Gateway error'});
        }
    }

    @Get('balance')
    async getBalance(@Req() req: Request, @Res() res: Response) {
        try {
            const response = await axios.get(
                `${this.PAYMENT_SERVICE_URL}/payment/balance`,
                {
                    headers: {
                        Authorization: req.headers.authorization,
                    },
                    withCredentials: true,
                },
            );
            return res.status(response.status).json(response.data);

        } catch (error: any) {
            if (error.response) {
                return res.status(error.response.status).json(error.response.data);
            }
            return res.status(500).json({message: 'Gateway error'});
        }
    }
}
