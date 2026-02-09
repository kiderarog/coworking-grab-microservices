import {Injectable} from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import {ConfigService} from "@nestjs/config";
import {SendOtpDto} from "./dto/send-otp.dto";


@Injectable()
export class EmailService {
    private transporter: nodemailer.Transporter;

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
            console.log("EMAIL SUCCESSFULLY SEND")
        } catch (error) {
            console.log("EMAIL SENDING ERROR" + error);
        }
    }
}
