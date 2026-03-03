import {IsInt, IsNotEmpty, IsNumber, IsPositive, IsString, Length, Max} from "class-validator";

export class AddCoworkingDto {
    @IsString()
    @Length(2,100)
    name: string;

    @IsString()
    @Length(10,1000)
    description: string;

    @IsString()
    @Length(10,100)
    location: string;

    @IsNumber()
    @IsPositive()
    priceForDay: number;

    @IsNumber()
    @IsPositive()
    priceForMonth: number;

    @IsInt()
    @IsPositive()
    @Max(500)
    amountOfSpots: number;
}