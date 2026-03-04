import {IsNumber, IsOptional, IsPositive, IsString, Length} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class UpdateCoworkingDto {

    @ApiProperty()
    @IsOptional()
    @IsString()
    @Length(2,100)
    name?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    @Length(10,1000)
    description?: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    @Length(10,100)
    location?: string;

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    @IsPositive()
    priceForDay?: number;

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    @IsPositive()
    priceForMonth?: number;
}