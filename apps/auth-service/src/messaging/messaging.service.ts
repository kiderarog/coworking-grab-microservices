import {Inject, Injectable} from "@nestjs/common";
import {ClientProxy} from "@nestjs/microservices";
import {OtpRabbitmqSendingDto} from "./dto/otp-rabbitmq-sending.dto";

@Injectable()
export class MessagingService {
    public constructor(@Inject('NOTIFICATIONS_CLIENT')
                       private readonly notificationsClient: ClientProxy,
                       @Inject('USER_CREATED_CLIENT')
                       private readonly userCreatedClient: ClientProxy,) {
    }

    public async otpRequested(data: OtpRabbitmqSendingDto) {
        return this.notificationsClient.emit('auth.otp.requested', data);
    }

    public async addUserRequestToPayment(userId: String) {
        this.userCreatedClient.emit('add.user.request', {userId: userId});
    }
}