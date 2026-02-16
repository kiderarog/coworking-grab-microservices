import {IsEmail, IsString} from "class-validator";

export class PaymentCreatedDto {
    @IsString()
    userId: string;
    @IsEmail()
    userEmail: string;
    amount: number;
    @IsString()
    status: string;
}