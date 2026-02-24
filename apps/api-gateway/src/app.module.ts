import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import {PaymentModule} from "./payment/payment.module";
import {BackofficeModule} from "./backoffice/backoffice.module";

@Module({
  imports: [AuthModule, PaymentModule, BackofficeModule, ConfigModule.forRoot({
      isGlobal: true,})],
  controllers: [AuthController],
  providers: [AppService],
})
export class AppModule {}
