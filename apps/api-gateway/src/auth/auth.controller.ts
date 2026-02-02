import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import axios from 'axios';

@Controller('auth')
export class AuthController {
  private readonly AUTH_SERVICE_URL: string;

  constructor(private readonly configService: ConfigService) {
    this.AUTH_SERVICE_URL = configService.getOrThrow('AUTH_SERVICE_URL');
  }

  @Post('/register')
  async register(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    try {
      const response = await axios.post(
        `${this.AUTH_SERVICE_URL}/auth/register`,
        body,
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
    } catch (error: any) {
      if (error.response) {
        return res.status(error.response.status).json(error.response.data);
      }

      return res.status(500).json({ message: 'Gateway error' });
    }
  }
}
