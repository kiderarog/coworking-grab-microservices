import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {ConfigModule} from '@nestjs/config';
import {AuthModule} from './auth/auth.module';
import {RedisModule} from "./redis/redis.module";
import {MessagingModule} from "./messaging/messaging.module";
import {LoggerModule} from "nestjs-pino";
import pino from "pino";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        RedisModule,
        MessagingModule,
        AuthModule,
        LoggerModule.forRoot({
            pinoHttp: {
                name: 'auth-service',
                level: 'debug',
                stream: pino.destination({
                    dest: '/logs/app.log',
                    sync: false,
                }),
                genReqId: () => require('crypto').randomUUID()
            }
        })
    ],
    controllers: [AppController],
    providers: [AppService],
})

export class AppModule {
}
