import {Body, Controller, Get, Post, Req, Res} from '@nestjs/common';
import {AuthService} from './auth.service';
import {CreateUserDto} from './dto/create-user.dto';
import type {Response, Request} from 'express';
import {LogInDto} from './dto/login-dto';
import {Authorization, JwtPayload} from "../security";

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {
    }

    @Post('register')
    async register(
        @Body() dto: CreateUserDto,
        @Res({passthrough: true}) res: Response,
    ) {
        return await this.authService.createUser(dto, res);
    }

    @Post('login')
    async login(
        @Body() dto: LogInDto,
        @Res({passthrough: true}) res: Response,
    ) {
        return await this.authService.logIn(dto, res);
    }

    @Post('logout')
    async logout(@Res({passthrough: true}) res: Response) {
        return await this.authService.logout(res);
    }

    @Post('refresh')
    async refreshToken(@Req() req: Request) {
        return await this.authService.refresh(req);
    }

    @Post('request-email-verification')
    @Authorization()
    async requestEmailVerification(@Req() req: Request) {
        return await this.authService.generateAndSendOtp((req.user as JwtPayload).id);
    }
}
