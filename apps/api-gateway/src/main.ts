import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {ConfigService} from "@nestjs/config";
import {Logger} from "@nestjs/common";
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const config = app.get(ConfigService);

    const logger = new Logger();
    app.enableCors({
        origin: config.getOrThrow('HTTP_CORS').split(','),
        credentials: true
    })

    const swaggerConfig = new DocumentBuilder()
        .setTitle('CoworkingGrab API')
        .setDescription('API Gateway for CoworkingGrab Microservices')
        .setVersion('1.0.0')
        .addBearerAuth()
        .build();

    const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);

    SwaggerModule.setup('/docs', app, swaggerDocument, {
        yamlDocumentUrl: '/openapi.yaml'
    });
    const port = config.getOrThrow('HTTP_PORT');
    const host = config.getOrThrow('HTTP_HOST');

    await app.listen(port);

    logger.log(`API-Gateway started: ${host}`);


}

bootstrap();
