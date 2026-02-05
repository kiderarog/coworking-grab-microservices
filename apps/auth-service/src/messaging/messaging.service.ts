import {Inject, Injectable} from "@nestjs/common";
import {ClientProxy} from "@nestjs/microservices";

@Injectable()
export class MessagingService {
    public constructor(@ Inject('NOTIFICATIONS_CLIENT') private readonly client: ClientProxy) {
    }

    public async otpRequested(data: any) {
        return this.client.emit('auth.otp.requested', data)
    }
}