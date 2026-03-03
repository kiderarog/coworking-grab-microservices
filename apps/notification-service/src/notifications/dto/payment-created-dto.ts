import {IsEmail, IsNotEmpty, IsString} from "class-validator";

export class PaymentCreatedDto {

    @IsNotEmpty()
    @IsString()
    userId: string;

    @IsNotEmpty()
    @IsEmail()
    userEmail: string;

    @IsNotEmpty()
    amount: number;

    @IsNotEmpty()
    @IsString()
    status: string;
}