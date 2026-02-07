import {Controller} from '@nestjs/common';
import {NotificationsService} from './notifications.service';
import {Ctx, EventPattern, Payload, RmqContext} from "@nestjs/microservices";
import {RmqService} from "../infrastructure/rmq/rmq.service";

@Controller()
export class NotificationsController {
    public constructor(
        private readonly rmqService: RmqService,
        private readonly notificationsService: NotificationsService) {
    }

    @EventPattern('auth.otp.requested')
    public async getOtpRequestFromRabbit(@Payload() data: any, @Ctx() ctx: RmqContext) {
        try {
            console.log("OTP EVENT RECEIVED: " + JSON.stringify(data));

            this.rmqService.ack(ctx);
        } catch (error) {
            console.log("OTP PROCESSING ERROR " + error);
            this.rmqService.nack(ctx);
        }
    }
}

