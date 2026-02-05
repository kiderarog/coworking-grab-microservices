import {MessagingService} from "./messaging.service";
import {Global, Module} from "@nestjs/common";
import {ClientsModule, Transport} from "@nestjs/microservices";

@Global()
@Module({
    imports: [ClientsModule.registerAsync([{
        name: 'NOTIFICATIONS_CLIENT',
        useFactory: () => ({
            transport: Transport.RMQ,
            options: {
                urls: ['amqp://USER:123456@rabbitmq:5672'],
                queue: 'notifications_queue',
                queueOptions: {
                    durable: true
                }
            }
        })
    }])],
    providers: [MessagingService],
    exports: [MessagingService]
})

export class MessagingModule {}