import {Module} from '@nestjs/common';
import {BookingService} from './booking.service';
import {BookingController} from './booking.controller';
import {ConfigModule, ConfigService} from "@nestjs/config";
import {getJwtConfig, RolesGuard} from "../security";
import {JwtModule} from "@nestjs/jwt";
import {PassportModule} from "@nestjs/passport";
import {JwtStrategy} from "../security/strategies/jwt.strategy";
import {BookingRepository} from "./infrastructure/repositories/booking.repository";

@Module({
    imports: [PassportModule, JwtModule.registerAsync({
        imports: [ConfigModule],
        useFactory: getJwtConfig,
        inject: [ConfigService],
    }),],
    controllers: [BookingController],
    providers: [BookingService, JwtStrategy, RolesGuard, BookingRepository],
    exports: [BookingRepository]
})
export class BookingModule {
}
