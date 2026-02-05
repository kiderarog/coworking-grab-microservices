import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {ConfigModule} from '@nestjs/config';
import {AuthModule} from './auth/auth.module';
import {RedisModule} from "./redis/redis.module";
import {MessagingModule} from "./messaging/messaging.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        RedisModule,
        MessagingModule,
        AuthModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {
}
