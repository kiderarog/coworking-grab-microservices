import {Controller} from '@nestjs/common';
import {Ctx, EventPattern, Payload, RmqContext} from "@nestjs/microservices";
import {RmqService} from "../infrastructure/rmq/rmq.service";
import {EmailService} from "../email/email.service";
import {OtpRabbitmqSendingDto} from "./dto/otp-rabbitmq-sending.dto";
import {PaymentCreatedDto} from "./dto/payment-created-dto";

@Controller()
export class NotificationsController {
    public constructor(
        private readonly rmqService: RmqService,
        private readonly emailService: EmailService) {
    }

    @EventPattern('auth.otp.requested')
    public async getOtpRequestFromRabbit(@Payload() data: OtpRabbitmqSendingDto, @Ctx() ctx: RmqContext) {
        try {
            console.log("OTP EVENT RECEIVED: " + JSON.stringify(data));
            await this.emailService.sendOtp({
                    email: data.email,
                    otp: data.otp
                }
            )

            this.rmqService.ack(ctx);
        } catch (error) {
            console.log("OTP PROCESSING ERROR " + error);
            this.rmqService.nack(ctx);
        }
    }

    @EventPattern("payment.created")
    public async getPaymentRequest(@Payload() data: PaymentCreatedDto, @Ctx() ctx: RmqContext) {
        try {
            console.log("PAYMENT EVENT RECEIVED: " + JSON.stringify(data));
            await this.emailService.sendPaymentSuccess({
                userId: data.userId,
                userEmail: data.userEmail,
                amount: data.amount,
                status: data.status

            })
            this.rmqService.ack(ctx);

        } catch (error) {
            console.log("PAYMENT EVENT PROCESSING ERROR" + error);
            this.rmqService.nack(ctx);
        }
    }
}

