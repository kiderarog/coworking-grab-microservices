import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {ConfigService} from "@nestjs/config";
import {Logger} from "@nestjs/common";
import * as swaggerUi from 'swagger-ui-express';
import axios from "axios";
import {Request, Response} from 'express';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const config = app.get(ConfigService);

    const logger = new Logger();
    app.enableCors({
        origin: config.getOrThrow('HTTP_CORS').split(','),
        credentials: true
    })

    app.use('/swagger/auth', async (_req: Request, res: Response) => {
        const {data} = await axios.get('http://auth-service:4001/docs-json');
        res.json(data);
    });
    app.use('/swagger/payment', async (_req: Request, res: Response) => {
        const {data} = await axios.get('http://payment-service:4003/docs-json');
        res.json(data);
    });
    app.use('/swagger/backoffice', async (_req: Request, res: Response) => {
        const {data} = await axios.get('http://back-office:4004/docs-json');
        res.json(data);
    });
    app.use('/swagger/booking', async (_req: Request, res: Response) => {
        const {data} = await axios.get('http://booking-service:4005/docs-json');
        res.json(data);
    });

    app.use('/docs', swaggerUi.serve, swaggerUi.setup(null, {
        swaggerOptions: {
            urls: [{
                url: 'http://localhost:4000/swagger/auth',
                name: 'Auth-Service'
            }, {
                url: 'http://localhost:4000/swagger/payment',
                name: 'Payment-Service'
            }, {
                url: 'http://localhost:4000/swagger/backoffice',
                name: 'BackOffice-Service'
            }, {url: 'http://localhost:4000/swagger/booking', name: 'Booking-Service'}]
        }
    }));

    const port = config.getOrThrow('HTTP_PORT');
    const host = config.getOrThrow('HTTP_HOST');

    await app.listen(port);

    logger.log(`API-Gateway started: ${host}`);


}

bootstrap();
