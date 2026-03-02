import {Injectable} from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import {ConfigService} from "@nestjs/config";
import {SendOtpDto} from "./dto/send-otp.dto";
import {PaymentCreatedDto} from "../notifications/dto/payment-created-dto";
import {InjectPinoLogger, PinoLogger} from "nestjs-pino";


@Injectable()
export class EmailService {
    private transporter: nodemailer.Transporter;
    @InjectPinoLogger(EmailService.name)
    private readonly logger: PinoLogger;

    constructor(private readonly configService: ConfigService) {

        this.transporter = nodemailer.createTransport({
            host: "smtp.yandex.ru",
            port: 587,
            secure: false,
            auth: {
                user: this.configService.getOrThrow('EMAIL_USER'),
                pass: this.configService.getOrThrow('EMAIL_PASSWORD')
            },
        });

    }

    async sendOtp(dto: SendOtpDto) {
        try {
            await this.transporter.sendMail({
                from: 'g.valdemarych@yandex.ru',
                to: dto.email,
                subject: "Email Verification Code for Coworking-Grab Application",
                text: `Hello, dear friend! Your OTP code for email verification is: ${dto.otp}`
            });
            this.logger.info({userEmail: dto.email}, 'OTP was successfully sent to user\' email (notification-service');
        } catch (error) {
            this.logger.error({error, userEmail: dto.email}, 'Unexpected error while sending OTP code via email');
        }
    }

    async sendPaymentSuccess(dto: PaymentCreatedDto) {
        try {
            await this.transporter.sendMail({
                from: 'g.valdemarych@yandex.ru',
                to: dto.userEmail,
                subject: "You have successfully topped up your balance in CoworkingApp!",
                text: `Your CoworkingApp balance has been replenished by ${dto.amount} rubles`
            });
            this.logger.info({userEmail: dto.userEmail}, 'Payment documentation was successfully sent to user-email');
        } catch (error) {
            this.logger.error({error, userEmail: dto.userEmail}, 'Unexpected error while sending payment docs via email');
        }
    }
}
