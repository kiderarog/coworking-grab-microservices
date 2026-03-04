import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {ConfigService} from "@nestjs/config";
import {Logger} from "@nestjs/common";
import * as swaggerUi from 'swagger-ui-express';
import axios from "axios";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const config = app.get(ConfigService);

    const logger = new Logger();
    app.enableCors({
        origin: config.getOrThrow('HTTP_CORS').split(','),
        credentials: true
    })

    async function fetchSwagger(url: string) {
        try {
            const { data } = await axios.get(url);
            logger.log(`Swagger loaded from ${url}`);
            return data;
        } catch (e) {
            logger.error(`Failed to load swagger from ${url}`);
            return null;
        }
    }

    async function mergeSwaggerDocs() {
        const services = [
            'http://auth-service:4001/docs-json',
            'http://payment-service:4003/docs-json',
            'http://back-office:4004/docs-json',
            'http://booking-service:4005/docs-json',
        ];

        const docs = await Promise.all(
            services.map(url => fetchSwagger(url))
        );

        const merged: any = {
            openapi: '3.0.0',
            info: {
                title: 'Unified API Gateway',
                version: '1.0',
            },
            paths: {},
            components: {
                schemas: {},
            },
        };

        for (const doc of docs) {
            if (!doc) continue;

            Object.assign(merged.paths, doc.paths || {});

            if (doc.components?.schemas) {
                Object.assign(
                    merged.components.schemas,
                    doc.components.schemas
                );
            }
        }

        return merged;
    }

    const document = await mergeSwaggerDocs();
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(document));

    const port = config.getOrThrow('HTTP_PORT');
    const host = config.getOrThrow('HTTP_HOST');

    await app.listen(port);

    logger.log(`API-Gateway started: ${host}`);


}

bootstrap();
