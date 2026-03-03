import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {ConfigService} from '@nestjs/config';
import cookieParser from 'cookie-parser';
import {Logger} from 'nestjs-pino';
import {ValidationPipe} from "@nestjs/common";
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";


async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        bufferLogs: true,
    });
    app.use(cookieParser());
    const logger = app.get(Logger);
    app.useLogger(logger);

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            transformOptions: {enableImplicitConversion: true},
        }),
    );


    const config = app.get(ConfigService);

    const port = config.getOrThrow('HTTP_PORT');
    const host = config.getOrThrow('HTTP_HOST');

    const swaggerConfig = new DocumentBuilder()
        .setTitle('Auth Service')
        .setDescription('Authentication microservice')
        .setVersion('1.0')
        .addTag('Auth')
        .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);

    SwaggerModule.setup('docs', app, document);

    await app.listen(port, '0.0.0.0');

    logger.log(`Auth-service started: ${host}`);

}

bootstrap();
