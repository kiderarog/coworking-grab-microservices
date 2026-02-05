import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import {getJwtConfig, RolesGuard} from "../security";
import {JwtStrategy} from "../security/strategies/jwt.strategy";
import {Reflector} from "@nestjs/core";
import {RedisModule} from "../redis/redis.module";

@Module({
  imports: [JwtModule.registerAsync({
    imports: [ConfigModule, PassportModule, RedisModule],
    useFactory: getJwtConfig,
    inject: [ConfigService],
  })],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, Reflector, RolesGuard],
})
export class AuthModule {}