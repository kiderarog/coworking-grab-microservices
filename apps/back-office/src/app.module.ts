import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {ConfigModule} from "@nestjs/config";
import { CoworkingModule } from './coworking/coworking.module';
import { SpotModule } from './spot/spot.module';

@Module({
  imports: [ConfigModule.forRoot({
      isGlobal: true,
  }), CoworkingModule, SpotModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
