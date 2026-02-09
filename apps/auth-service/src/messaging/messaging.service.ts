import {Inject, Injectable} from "@nestjs/common";
import {ClientProxy} from "@nestjs/microservices";
import {OtpRabbitmqSendingDto} from "./dto/otp-rabbitmq-sending.dto";

@Injectable()
export class MessagingService {
    public constructor(@ Inject('NOTIFICATIONS_CLIENT') private readonly client: ClientProxy) {
    }

    public async otpRequested(data: OtpRabbitmqSendingDto) {
        return this.client.emit('auth.otp.requested', data)
    }
}