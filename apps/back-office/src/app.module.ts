import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {ConfigModule} from "@nestjs/config";
import { CoworkingModule } from './coworking/coworking.module';
import { SpotModule } from './spot/spot.module';
import {RmqModule} from "./rabbitmq/rmq.module";
import pino from "pino";
import {LoggerModule} from "nestjs-pino";

@Module({
  imports: [ConfigModule.forRoot({
      isGlobal: true,
  }), CoworkingModule, SpotModule, RmqModule,
      LoggerModule.forRoot({
          pinoHttp: {
              name: 'back-office',
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
export class AppModule {}
