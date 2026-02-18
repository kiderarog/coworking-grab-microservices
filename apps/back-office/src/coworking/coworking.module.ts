import {Module} from '@nestjs/common';
import {CoworkingService} from './coworking.service';
import {CoworkingController} from './coworking.controller';
import {JwtModule} from "@nestjs/jwt";
import {ConfigModule, ConfigService} from "@nestjs/config";
import {PassportModule} from "@nestjs/passport";
import {getJwtConfig, RolesGuard} from "../security";
import {CoworkingRepository} from "./infrastructure/repositories/coworking.repository";
import {SpotModule} from "../spot/spot.module";
import {JwtStrategy} from "../security/strategies/jwt.strategy";

@Module({
    imports: [
        JwtModule.registerAsync({
            imports: [ConfigModule, PassportModule],
            useFactory: getJwtConfig,
            inject: [ConfigService],
        })
        , SpotModule,],
    controllers: [CoworkingController],
    providers: [CoworkingService, CoworkingRepository, JwtStrategy, RolesGuard],
})
export class CoworkingModule {
}
