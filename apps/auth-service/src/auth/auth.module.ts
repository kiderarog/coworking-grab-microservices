import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { getJwtConfig } from './config/jwt.config';

@Module({
  imports: [JwtModule.registerAsync({
    imports: [ConfigModule, PassportModule],
    useFactory: getJwtConfig,
    inject: [ConfigService],
  })],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}