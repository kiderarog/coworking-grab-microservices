import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {ConfigService} from "@nestjs/config";
import cookieParser from "cookie-parser";
import {Logger} from "nestjs-pino";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.use(cookieParser());
    const config = app.get(ConfigService);

    const logger = app.get(Logger);
    app.useLogger(logger);

    const port = config.getOrThrow('HTTP_PORT');
    const host = config.getOrThrow('HTTP_HOST');

    await app.listen(port, '0.0.0.0');

    logger.log(`Booking-service successfully started: ${host}`);
}
bootstrap();
