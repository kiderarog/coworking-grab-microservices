import {IsEmail, IsNotEmpty, IsString} from "class-validator";

export class OtpRabbitmqSendingDto {

    @IsNotEmpty()
    @IsString()
    userId: string;

    @IsNotEmpty()
    @IsString()
    otp: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;
}