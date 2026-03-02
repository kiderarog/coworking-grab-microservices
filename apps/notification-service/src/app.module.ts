import {Module} from '@nestjs/common';
import {RmqModule} from './infrastructure/rmq/rmq.module';
import {ConfigModule} from "@nestjs/config";
import { NotificationsModule } from './notifications/notifications.module';
import { EmailModule } from './email/email.module';
import {LoggerModule} from "nestjs-pino";
import pino from "pino";

@Module({
    imports: [ConfigModule.forRoot({isGlobal: true}), RmqModule, NotificationsModule, EmailModule,
        LoggerModule.forRoot({
            pinoHttp: {
                name: 'notification-service',
                level: 'debug',
                stream: pino.destination({
                    dest: '/logs/app.log',
                    sync: false,
                }),
                genReqId: () => require('crypto').randomUUID()
            }
        })],
    controllers: [],
    providers: [],
})
export class AppModule {
}
