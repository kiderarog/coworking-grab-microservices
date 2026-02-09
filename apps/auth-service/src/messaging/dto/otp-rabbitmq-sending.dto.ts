import {IsEmail, IsString} from "class-validator";

export class OtpRabbitmqSendingDto {
    @IsString()
    userId: string;
    @IsString()
    otp: string;
    @IsEmail()
    email: string;
}