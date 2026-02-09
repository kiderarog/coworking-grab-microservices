import {Controller} from '@nestjs/common';
import {NotificationsService} from './notifications.service';
import {Ctx, EventPattern, Payload, RmqContext} from "@nestjs/microservices";
import {RmqService} from "../infrastructure/rmq/rmq.service";
import {EmailService} from "../email/email.service";
import {OtpRabbitmqSendingDto} from "./dto/otp-rabbitmq-sending.dto";

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
}

