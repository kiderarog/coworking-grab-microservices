import {
  Body,
  Controller,
  NotFoundException,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import axios from 'axios';

@Controller('auth')
export class AuthController {
  private readonly AUTH_SERVICE_URL: string;

  constructor(private readonly configService: ConfigService) {
    this.AUTH_SERVICE_URL = configService.getOrThrow('AUTH_SERVICE_URL');
  }

  @Post('register')
  async register(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    try {
      const response = await axios.post(
        `${this.AUTH_SERVICE_URL}/auth/register`,
        body,
        { withCredentials: true },
      );

      if (response.headers['set-cookie']) {
        res.setHeader('set-cookie', response.headers['set-cookie']);
      }

      return res.status(response.status).json(response.data);
    } catch (error: any) {
      if (error.response) {
        return res.status(error.response.status).json(error.response.data);
      }

      return res.status(500).json({ message: 'Gateway error' });
    }
  }

  @Post('login')
  async login(@Body() body: any, @Res() res: Response) {
    try {
      const response = await axios.post(
        `${this.AUTH_SERVICE_URL}/auth/login`,
        body,
        { withCredentials: true },
      );
      if (response.headers['set-cookie']) {
        res.setHeader('set-cookie', response.headers['set-cookie']);
      }

      return res.status(response.status).json(response.data);
    } catch (error: any) {
      if (error.response) {
        return res.status(error.response.status).json(error.response.data);
      }

      return res.status(500).json({ message: 'Gateway error' });
    }
  }

  @Post('refresh')
  async refreshToken(@Req() req: Request, @Res() res: Response) {
    // Нужно взять токен, если он есть (проверка), на его основе обновить инфо, отправить обратно (Установить куку)
    if (!req.headers.cookie) {
      throw new NotFoundException('Cookies not found');
    }
    try {
      const response = await axios.post(
        `${this.AUTH_SERVICE_URL}/auth/refresh`,
        {},
        {
          headers: {
            cookie: req.headers.cookie || '',
          },
          withCredentials: true,
        },
      );
      if (response.headers['set-cookie']) {
        res.setHeader('set-cookie', response.headers['set-cookie']);
      }
      return res.status(response.status).json(response.data);
    } catch (error) {
      if (error.response) {
        return res.status(error.response.status).json(error.response.data);
      }
    }
    return res.status(500).json({ message: 'Gateway error' });
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    if (!req.headers.cookie) {
      throw new NotFoundException('No refresh-token or cookies');
    }
    try {
      const response = await axios.post(
        `${this.AUTH_SERVICE_URL}/auth/logout`,
        {},
        {
          headers: {
            cookie: req.headers.cookie || '',
          },
          withCredentials: true,
        },
      );
      if (response.headers['set-cookie']) {
        res.setHeader('set-cookie', response.headers['set-cookie']);
      }
      return res.status(response.status).json(response.data);
    } catch (error) {
      if (error.response) {
        return res.status(error.response.status).json(error.response.data);
      }
    }
    return res.status(500).json({ message: 'Gateway error' });
  }
}
