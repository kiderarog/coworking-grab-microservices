import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {ConfigService} from "@nestjs/config";
import {Logger} from "@nestjs/common";
import {Transport} from "@nestjs/microservices";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const config = app.get(ConfigService);

    app.connectMicroservice({
        transport: Transport.RMQ,
        options: {
            urls: [
                config.getOrThrow<string>('RMQ_URL')],
            queue: config.getOrThrow<string>('RMQ_ACTIVE_BOOKING_QUEUE'),
            queueOptions: {
                durable: true,
            },
            noAck: false,
            prefetchCount: 1,
            // persistent: true
        },
    });

    app.connectMicroservice({
        transport: Transport.RMQ,
        options: {
            urls: [
                config.getOrThrow<string>('RMQ_URL')],
            queue: config.getOrThrow<string>('RMQ_EXPIRED_BOOKING_QUEUE'),
            queueOptions: {
                durable: true,
            },
            noAck: false,
            prefetchCount: 1,
            // persistent: true
        },
    });

    const logger = new Logger();
    const port = config.getOrThrow('HTTP_PORT');
    const host = config.getOrThrow('HTTP_HOST');
    await app.listen(port, '0.0.0.0');
    logger.log(`Backoffice successfully started at: ${host}`);



    await app.startAllMicroservices();
    await app.init();
}

bootstrap();
