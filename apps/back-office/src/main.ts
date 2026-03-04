import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {ConfigService} from "@nestjs/config";
import {Logger} from 'nestjs-pino';
import {Transport} from "@nestjs/microservices";
import {ValidationPipe} from "@nestjs/common";
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";
import { Request, Response } from 'express';


async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const config = app.get(ConfigService);

    const logger = app.get(Logger);
    app.useLogger(logger);

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            transformOptions: { enableImplicitConversion: true },
        }),
    );

    const swaggerConfig = new DocumentBuilder()
        .setTitle('Back office')
        .setDescription('Back-Office microservice')
        .setVersion('1.0')
        .addTag('BackOffice')
        .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);

    const expressApp = app.getHttpAdapter().getInstance();

    expressApp.get('/docs-json', (_req: Request, res: Response) => {
        res.json(document);
    });

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

    const port = config.getOrThrow('HTTP_PORT');
    const host = config.getOrThrow('HTTP_HOST');
    await app.startAllMicroservices();
    await app.listen(port, '0.0.0.0');
    logger.log(`Backoffice successfully started at: ${host}`);
}

bootstrap();
