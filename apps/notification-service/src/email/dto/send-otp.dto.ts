import {IsEmail, IsNotEmpty, IsString} from "class-validator";

export class SendOtpDto {

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    otp: string;
}