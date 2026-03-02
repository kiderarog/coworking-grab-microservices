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
import {InjectPinoLogger, PinoLogger} from "nestjs-pino";

@Injectable()
export class AuthService {
    private readonly JWT_ACCESS_TOKEN_TTL: number;
    private readonly JWT_REFRESH_TOKEN_TTL: number;
    private readonly COOKIE_DOMAIN: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService,
        private readonly redisService: RedisService,
        private readonly messagingService: MessagingService,
        @InjectPinoLogger(AuthService.name)
        private readonly logger: PinoLogger
    ) {
        this.JWT_ACCESS_TOKEN_TTL = configService.getOrThrow(
            'JWT_ACCESS_TOKEN_TTL',
        );
        this.JWT_REFRESH_TOKEN_TTL = configService.getOrThrow(
            'JWT_REFRESH_TOKEN_TTL',
        );

        this.COOKIE_DOMAIN = configService.getOrThrow('COOKIE_DOMAIN');
    }

    private maskEmail(email: string): string {
        return email.replace(/^(.{3})([^@]*)/, (_, a, b) => a + '*'.repeat(b.length));
    }

    private generateTokens(
        id: string,
        email: string,
        role: Role,
        bookedSpotId: string | null,
        emailVerified: boolean
    ) {
        const payLoad = {id, email, role, bookedSpotId, emailVerified};

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
            this.logger.warn({userEmail: this.maskEmail(dto.email)}, 'Unsuccessful login. Invalid credentials');
            throw new UnauthorizedException('Wrong email or password');
        }

        const isPasswordValid = await bcrypt.compare(
            dto.password,
            logUser.password,
        );

        if (!isPasswordValid) {
            this.logger.warn({userEmail: this.maskEmail(dto.email)}, 'Unsuccessful login. Invalid credentials');
            throw new UnauthorizedException('Wrong email or password');
        }

        const {accessToken, refreshToken} = this.generateTokens(
            logUser.id,
            logUser.email,
            logUser.role,
            logUser.bookedSpotId,
            logUser.emailVerified,
        );

        const decodedRefresh = this.jwtService.decode(refreshToken) as any;
        const refreshTokenExpires = new Date(decodedRefresh.exp * 1000);

        this.setCookie(res, refreshToken, refreshTokenExpires);
        this.logger.info({userId: logUser.id}, 'Successful login');
        return {accessToken};
    }

    async refresh(req: Request) {
        const refreshToken = req.cookies['refreshToken'];
        if (!refreshToken) {
            this.logger.warn('Attempt to use invalid refresh token');
            throw new UnauthorizedException('Invalid refresh-token');
        }
        const payload: JwtPayload = await this.jwtService.verifyAsync(refreshToken);

        const user = await prisma.user.findUnique({
            where: {
                id: payload.id,
            },
            select: {
                id: true,
                email: true,
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
            user.email,
            user.role,
            user.bookedSpotId,
            user.emailVerified,
        );

        return {accessToken};
    }

    async logout(res: Response) {
        this.setCookie(res, 'refreshToken', new Date(0));
        this.logger.debug('Logout successful. Refresh token cleared');

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
            this.logger.info({userId: user.id}, 'User successfully created');
            this.messagingService.addUserRequestToPayment(user.id)
                .then(() => {
                    this.logger.info({ userId: user.id }, 'User-created event sent to Payment-Service')
                ;})
                .catch(err => {
                    this.logger.error({userId: user.id, err}, `Failed to send user-created-event to Payment-service`);
                });


            const {accessToken, refreshToken} = this.generateTokens(
                user.id,
                user.email,
                user.role,
                user.bookedSpotId,
                user.emailVerified,
            );

            const decodedRefresh = this.jwtService.decode(refreshToken) as any;
            const refreshTokenExpires = new Date(decodedRefresh.exp * 1000);

            this.setCookie(res, refreshToken, refreshTokenExpires);
            this.logger.debug({userId: user.id}, `Refresh token set`);
            return {
                accessToken,
                user,
            };

        } catch (error: any) {
            if (error.code === 'P2002') {
                this.logger.warn({ code: error.code }, 'Attempt to create user with existing email');
                throw new ConflictException('This email already in use');
            }
            throw new InternalServerErrorException(
                'Unexpected error while creating user',
            );
        }
    }

    async generateAndSendOtp(userId: string) {
        this.logger.debug({userId: userId}, 'OTP generation request');
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
            this.logger.warn({userId: userId}, `Error while generating OTP code. User not found`);
            throw new NotFoundException("User not found");
        }
        if (user.emailVerified) {
            this.logger.warn({userEmail: this.maskEmail(user.email)}, 'Attempting to verify an already verified email');
            throw new ConflictException("This user already has verified email");
        }
        const otp = crypto.randomInt(0, 1000000).toString().padStart(6, "0");

        try {
            this.logger.info({userEmail: this.maskEmail(user.email)}, 'OTP code was successfully sent to Redis');
            await this.sendOtpToRedis(user.email, otp);
        } catch (err: any) {
            this.logger.error({userEmail: this.maskEmail(user.email)}, 'Failed to send OTP code to Redis DB');
            throw new InternalServerErrorException("Failed to save OTP to Redis");
        }

        try {
            this.logger.debug({userId: userId}, 'OTP sending operation');
            await this.messagingService.otpRequested({
                userId,
                otp,
                email: user.email
            });
        } catch (err) {
            this.logger.error({ err, userId },'Failed to send OTP to Notification-Service');
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
            this.logger.warn({userId: userId}, 'Error finding User');
            throw new NotFoundException("User not found");
        }
        if (user.emailVerified) {
            this.logger.info({userId: userId}, 'Attempting to verify an already verified email');
            throw new ConflictException("User email has already verified");
        }

        let otpFromRedis: string | null;
        try {
            otpFromRedis = await this.redisService.getClient().get(`otp:email:${user.email}`);
            this.logger.debug('Trying to get OTP code from Redis DB before comparing operation');
        } catch (error) {
            this.logger.error({err: error, userId },'Error extracting OTP from Redis');
            throw new InternalServerErrorException("Error while extracting OTP from Redis")
        }

        if (otpFromRedis === otp) {
            this.logger.info({userId: userId}, 'OTP code successfully validated');
            await prisma.user.update({
                where: {
                    id: userId
                }, data: {
                    emailVerified: true
                }
            });
            this.logger.info({userId: userId}, 'Email successfully verified');
            await this.redisService.getClient().del(`otp:email:${user.email}`);
            return user.email;
        } else {
            this.logger.warn({userId: userId}, 'Failed to verify email due to Invalid OTP')
            throw new BadRequestException("Invalid OTP-code.");
        }

    }
}
