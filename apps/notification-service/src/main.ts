import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {Transport} from "@nestjs/microservices";
import {ConfigService} from "@nestjs/config";


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

    app.connectMicroservice({
        transport: Transport.RMQ,
        options: {
            urls: [
                config.getOrThrow<string>('RMQ_URL')],
            queue: config.getOrThrow<string>('RMQ_QUEUE'),
            queueOptions: {
                durable: true,
            },
            noAck: false,
            prefetchCount: 1,
            // persistent: true
        },
    });

    await app.startAllMicroservices();
    await app.init();
    console.log("Notification-service is started successfully")


}
bootstrap();
