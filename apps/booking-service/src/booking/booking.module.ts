import {Global, Module} from '@nestjs/common';
import {BookingService} from './booking.service';
import {BookingController} from './booking.controller';
import {ConfigModule, ConfigService} from "@nestjs/config";
import {getJwtConfig, RolesGuard} from "../security";
import {JwtModule} from "@nestjs/jwt";
import {PassportModule} from "@nestjs/passport";
import {JwtStrategy} from "../security/strategies/jwt.strategy";
import {BookingRepository} from "./infrastructure/repositories/booking.repository";
import {ClientsModule, Transport} from "@nestjs/microservices";

@Global()
@Module({
    imports: [PassportModule, JwtModule.registerAsync({
        imports: [ConfigModule],
        useFactory: getJwtConfig,
        inject: [ConfigService],
    }), ClientsModule.registerAsync([
        {
            name: 'BOOKING_CLIENT',
            useFactory: () => ({
                transport: Transport.RMQ,
                options: {
                    urls: ['amqp://USER:123456@rabbitmq:5672'],
                    queue: 'booking_initialization_queue',
                    queueOptions: { durable: true },
                },
            }),
        },
        {
            name: 'BOOKING_ACTIVE_EVENT',
            useFactory: () => ({
                transport: Transport.RMQ,
                options: {
                    urls: ['amqp://USER:123456@rabbitmq:5672'],
                    queue: 'booking_active_queue',
                    queueOptions: { durable: true },
                },
            }),
        },
    ]),
        ],
    controllers: [BookingController],
    providers: [BookingService, JwtStrategy, RolesGuard, BookingRepository],
    exports: [BookingRepository]
})
export class BookingModule {
}
