import {Module} from '@nestjs/common';
import {BookingService} from './booking.service';
import {BookingController} from './booking.controller';
import {ConfigModule, ConfigService} from "@nestjs/config";
import {getJwtConfig, RolesGuard} from "../security";
import {JwtModule} from "@nestjs/jwt";
import {PassportModule} from "@nestjs/passport";
import {JwtStrategy} from "../security/strategies/jwt.strategy";

@Module({
    imports: [PassportModule, JwtModule.registerAsync({
        imports: [ConfigModule],
        useFactory: getJwtConfig,
        inject: [ConfigService],
    }),],
    controllers: [BookingController],
    providers: [BookingService, JwtStrategy, RolesGuard],
})
export class BookingModule {
}
