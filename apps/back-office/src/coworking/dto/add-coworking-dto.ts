import {IsInt, IsNumber, IsPositive, IsString, Length, Max} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class AddCoworkingDto {
    @ApiProperty()
    @IsString()
    @Length(2,100)
    name: string;

    @ApiProperty()
    @IsString()
    @Length(10,1000)
    description: string;

    @ApiProperty()
    @IsString()
    @Length(10,100)
    location: string;

    @ApiProperty()
    @IsNumber()
    @IsPositive()
    priceForDay: number;

    @ApiProperty()
    @IsNumber()
    @IsPositive()
    priceForMonth: number;

    @ApiProperty()
    @IsInt()
    @IsPositive()
    @Max(500)
    amountOfSpots: number;
}