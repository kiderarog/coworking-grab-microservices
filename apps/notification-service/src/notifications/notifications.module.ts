import {Module} from '@nestjs/common';
import {NotificationsService} from './notifications.service';
import {NotificationsController} from './notifications.controller';
import {EmailModule} from "../email/email.module";

@Module({
    imports: [EmailModule],
    controllers: [NotificationsController],
    providers: [NotificationsService],
})
export class NotificationsModule {
}
