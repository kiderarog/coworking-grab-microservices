import {IsNotEmpty, IsNumber, IsString} from "class-validator";

export class CreateBookingDto {
    @IsString()
    @IsNotEmpty()
    startTime: string;

    @IsNumber()
    @IsNotEmpty()
    days: number;
}
