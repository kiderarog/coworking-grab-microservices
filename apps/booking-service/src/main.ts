import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {ConfigService} from "@nestjs/config";
import cookieParser from "cookie-parser";
import {Logger} from "nestjs-pino";
import {ValidationPipe} from "@nestjs/common";
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";
import { Request, Response } from 'express';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { bufferLogs: true });
    app.use(cookieParser());
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
        .setTitle('Booking Service')
        .setDescription('Booking microservice')
        .setVersion('1.0')
        .addTag('Booking')
        .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);

    const expressApp = app.getHttpAdapter().getInstance();

    expressApp.get('/docs-json', (_req: Request, res: Response) => {
        res.json(document);
    });

    const port = config.getOrThrow('HTTP_PORT');
    const host = config.getOrThrow('HTTP_HOST');

    await app.listen(port, '0.0.0.0');

    logger.log(`Booking-service successfully started: ${host}`);
}
bootstrap();
