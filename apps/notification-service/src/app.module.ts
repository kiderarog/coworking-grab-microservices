import {Module} from '@nestjs/common';
import {RmqModule} from './infrastructure/rmq/rmq.module';
import {ConfigModule} from "@nestjs/config";
import { NotificationsModule } from './notifications/notifications.module';
import { EmailModule } from './email/email.module';

@Module({
    imports: [ConfigModule.forRoot({isGlobal: true}), RmqModule, NotificationsModule, EmailModule],
    controllers: [],
    providers: [],
})
export class AppModule {
}
