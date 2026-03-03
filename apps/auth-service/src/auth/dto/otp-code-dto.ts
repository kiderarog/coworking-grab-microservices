import {IsNotEmpty} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class OtpCodeDto {
    @ApiProperty({example: '123456', description: '6-digits OTP code which sent to user\'s email'})
    @IsNotEmpty()
    otp: string;
}