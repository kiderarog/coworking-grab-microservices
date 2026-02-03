import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  const config = app.get(ConfigService);

  const logger = new Logger();

  const port = config.getOrThrow('HTTP_PORT');
  const host = config.getOrThrow('HTTP_HOST');

  await app.listen(port, '0.0.0.0');

  logger.log(`Auth-service started: ${host}`);
}

bootstrap();
