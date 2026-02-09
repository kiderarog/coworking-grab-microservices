import {IsEmail, IsString} from "class-validator";

export class SendOtpDto {
    @IsEmail()
    email: string;
    @IsString()
    otp: string;
}