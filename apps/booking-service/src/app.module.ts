import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {ConfigModule} from "@nestjs/config";
import { BookingModule } from './booking/booking.module';
import {ScheduleModule} from "@nestjs/schedule";
import {LoggerModule} from "nestjs-pino";
import pino from "pino";

@Module({
    imports: [ConfigModule.forRoot({
        isGlobal: true,
    }), BookingModule, ScheduleModule.forRoot(),
        LoggerModule.forRoot({
            pinoHttp: {
                name: 'booking-service',
                level: 'debug',
                stream: pino.destination({
                    dest: '/logs/app.log',
                    sync: false,
                }),
                genReqId: () => require('crypto').randomUUID()
            }
        })],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {
}
