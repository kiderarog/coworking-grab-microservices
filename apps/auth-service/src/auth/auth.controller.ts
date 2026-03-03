import {Body, Controller, Post, Req, Res} from '@nestjs/common';
import {AuthService} from './auth.service';
import {CreateUserDto} from './dto/create-user.dto';
import type {Response, Request} from 'express';
import {LogInDto} from './dto/login-dto';
import {Authorization, JwtPayload} from "../security";
import {ApiBody, ApiOperation, ApiResponse, ApiTags} from "@nestjs/swagger";
import {RegisterResponseDto} from "./responseDto/register-response-dto";
import {LoginResponseDto} from "./responseDto/login-response-dto";
import {OtpCodeDto} from "./dto/otp-code-dto";
import {EmailVerifyRequestDto} from "./responseDto/email-verify-request-dto";
import {EmailVerifyStatusDto} from "./responseDto/email-verify-status-dto";

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {
    }

    @ApiOperation({summary: 'User-register (creating) endpoint'})
    @ApiBody({type: CreateUserDto})
    @ApiResponse({status: 201, description: 'User successfully created', type: RegisterResponseDto})
    @ApiResponse({status: 400, description: 'Validation error'})
    @ApiResponse({status: 409, description: 'Email already in use'})
    @ApiResponse({status: 500, description: 'Unexpected auth-service error while user-creating-operation'})
    @Post('register')
    async register(
        @Body() dto: CreateUserDto,
        @Res({passthrough: true}) res: Response,
    ) {
        return await this.authService.createUser(dto, res);
    }

    @ApiOperation({summary: 'user login endpoint'})
    @ApiBody({type: LogInDto})
    @ApiResponse({status: 200, description: 'Success'})
    @ApiResponse({status: 400, description: 'Validation error'})
    @ApiResponse({status: 401, description: 'Invalid credentials (wrong email or password)'})
    @Post('login')
    async login(
        @Body() dto: LogInDto,
        @Res({passthrough: true}) res: Response,
    ) {
        return await this.authService.logIn(dto, res);
    }

    @ApiOperation({summary: 'user logout endpoint (RESET COOKIES)'})
    @ApiResponse({status: 200, description: 'Logout was successful (cookies set to null)'})
    @Post('logout')
    async logout(@Res({passthrough: true}) res: Response) {
        return await this.authService.logout(res);
    }

    @ApiOperation({summary: 'refresh token endpoint (using Request object metadata)'})
    @ApiResponse({status: 200, description: 'Generated new access token', type: LoginResponseDto})
    @ApiResponse({status: 401, description: 'Invalid refresh token'})
    @Post('refresh')
    async refreshToken(@Req() req: Request) {
        return await this.authService.refresh(req);
    }

    @ApiOperation({summary: 'Request email verification via OTP (only initialization without verifying'})
    @ApiResponse({status: 200, description: 'Verification code sent to email', type: EmailVerifyRequestDto})
    @ApiResponse({status: 404, description: 'User not found'})
    @ApiResponse({status: 409, description: 'Email already verified'})
    @Post('email-verification/request')
    @Authorization()
    async requestEmailVerification(@Req() req: Request) {
        await this.authService.generateAndSendOtp((req.user as JwtPayload).id);
        return {message: 'Verification code sent to your email'};

    }

    @ApiOperation({summary: 'Verify email using OTP code'})
    @ApiResponse({status: 200, description: 'Email successfully verified', type: EmailVerifyStatusDto})
    @ApiResponse({status: 400, description: 'Invalid OTP code'})
    @ApiResponse({status: 409, description: 'Email already verified'})
    @ApiBody({type: OtpCodeDto})
    @Post('email-verification/verify')
    @Authorization()
    async emailVerifying(@Req() req: Request, @Body() data: OtpCodeDto) {
        await this.authService.verifyEmail((req.user as JwtPayload).id, data.otp);
        return {message: 'Your email was successfully verified!'};
    }
}
