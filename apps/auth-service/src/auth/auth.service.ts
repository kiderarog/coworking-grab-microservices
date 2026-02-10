import {
    BadRequestException,
    ConflictException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {Request, Response} from 'express';
import {Role} from '../../generated/prisma/enums';
import {LogInDto} from './dto/login-dto';
import {prisma} from '../prisma';
import * as bcrypt from 'bcrypt';
import {CreateUserDto} from './dto/create-user.dto';
import {JwtService} from '@nestjs/jwt';
import {JwtPayload} from "../security";
import * as crypto from 'crypto';
import {RedisService} from "../redis/redis.service";
import {MessagingService} from "../messaging/messaging.service";

@Injectable()
export class AuthService {
    private readonly JWT_ACCESS_TOKEN_TTL: number;
    private readonly JWT_REFRESH_TOKEN_TTL: number;
    private readonly COOKIE_DOMAIN: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService,
        private readonly redisService: RedisService,
        private readonly messagingService: MessagingService
    ) {
        this.JWT_ACCESS_TOKEN_TTL = configService.getOrThrow(
            'JWT_ACCESS_TOKEN_TTL',
        );
        this.JWT_REFRESH_TOKEN_TTL = configService.getOrThrow(
            'JWT_REFRESH_TOKEN_TTL',
        );

        this.COOKIE_DOMAIN = configService.getOrThrow('COOKIE_DOMAIN');
    }

    private generateTokens(
        id: string,
        role: Role,
        bookedSpotId: string | null,
        emailVerified: boolean,
    ) {
        const payLoad = {id, role, bookedSpotId, emailVerified};

        const accessToken = this.jwtService.sign(payLoad, {
            expiresIn: this.JWT_ACCESS_TOKEN_TTL,
        });

        const refreshToken = this.jwtService.sign(payLoad, {
            expiresIn: this.JWT_REFRESH_TOKEN_TTL,
        });

        return {accessToken, refreshToken};
    }

    private setCookie(res: Response, value: string, expires: Date) {
        res.cookie('refreshToken', value, {
            httpOnly: true,
            domain: this.COOKIE_DOMAIN,
            expires,
        });
    }

    async logIn(dto: LogInDto, res: Response) {
        const logUser = await prisma.user.findUnique({
            where: {email: dto.email},
        });

        if (!logUser) {
            throw new UnauthorizedException('Wrong email or password');
        }

        const isPasswordValid = await bcrypt.compare(
            dto.password,
            logUser.password,
        );

        if (!isPasswordValid) {
            throw new UnauthorizedException('Wrong email or password');
        }

        const {accessToken, refreshToken} = this.generateTokens(
            logUser.id,
            logUser.role,
            logUser.bookedSpotId,
            logUser.emailVerified,
        );

        const decodedRefresh = this.jwtService.decode(refreshToken) as any;
        const refreshTokenExpires = new Date(decodedRefresh.exp * 1000);

        this.setCookie(res, refreshToken, refreshTokenExpires);

        return {accessToken};
    }

    async refresh(req: Request) {
        const refreshToken = req.cookies['refreshToken'];
        if (!refreshToken) {
            throw new UnauthorizedException('Invalid refresh-token');
        }
        const payload: JwtPayload = await this.jwtService.verifyAsync(refreshToken);

        const user = await prisma.user.findUnique({
            where: {
                id: payload.id,
            },
            select: {
                id: true,
                role: true,
                bookedSpotId: true,
                emailVerified: true,
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }
        const {accessToken} = this.generateTokens(
            user.id,
            user.role,
            user.bookedSpotId,
            user.emailVerified,
        );

        return {accessToken};
    }

    async logout(res: Response) {
        this.setCookie(res, 'refreshToken', new Date(0));
    }

    async createUser(dto: CreateUserDto, res: Response) {
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(dto.password, salt);

        try {
            const user = await prisma.user.create({
                data: {
                    email: dto.email,
                    password: hashedPassword,
                    name: dto.name,
                    surname: dto.surname,
                    phone: dto.phone,
                },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    surname: true,
                    phone: true,
                    bookedSpotId: true,
                    role: true,
                    emailVerified: true,
                },
            });

            const {accessToken, refreshToken} = this.generateTokens(
                user.id,
                user.role,
                user.bookedSpotId,
                user.emailVerified,
            );

            const decodedRefresh = this.jwtService.decode(refreshToken) as any;
            const refreshTokenExpires = new Date(decodedRefresh.exp * 1000);

            this.setCookie(res, refreshToken, refreshTokenExpires);

            return {
                accessToken,
                user,
            };

        } catch (error) {
            if (error.code === 'P2002') {
                throw new ConflictException('This email already in use');
            }
            throw new InternalServerErrorException(
                'Unexpected error while creating user',
            );
        }
    }

    async generateAndSendOtp(userId: string) {
        const user = await prisma.user.findUnique({
            where: {id: userId},
            select: {
                id: true,
                name: true,
                email: true,
                emailVerified: true
            }
        });
        if (!user) {
            throw new NotFoundException("User not found");
        }
        if (user.emailVerified) {
            throw new ConflictException("This user already has verified email");
        }
        const otp = crypto.randomInt(0, 1000000).toString().padStart(6, "0");

        try {
            await this.sendOtpToRedis(user.email, otp);
        } catch (err) {
            throw new InternalServerErrorException("Failed to save OTP to Redis");
        }

        try {
            await this.messagingService.otpRequested({
                userId,
                otp,
                email: user.email
            });
        } catch (err) {
            throw new InternalServerErrorException("Failed to send OTP message to RabbitMQ");
        }
    }


    private async sendOtpToRedis(email: string, otp: string) {
        await this.redisService.getClient().set(
            `otp:email:${email}`,
            otp,
            'EX',
            300,
        );
    }

    async verifyEmail(userId: string, otp: string) {
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            }
        });
        if (!user) {
            throw new NotFoundException("User not found");
        }
        if (user.emailVerified) {
            throw new ConflictException("User email has already verified");
        }

        let otpFromRedis: string | null;
        try {
            otpFromRedis = await this.redisService.getClient().get(`otp:email:${user.email}`);
        } catch (error) {
            throw new InternalServerErrorException("Error while extracting OTP from Redis")
        }

        if (otpFromRedis === otp) {
            await prisma.user.update({
                where: {
                    id: userId
                }, data: {
                    emailVerified: true
                }
            });
            await this.redisService.getClient().del(`otp:email:${user.email}`);
            return { message: "Email successfully verified" };
        } else {
            throw new BadRequestException("Invalid OTP-code.");
        }

    }

}
