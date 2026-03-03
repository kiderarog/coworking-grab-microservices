import {IsNumber, IsOptional, IsPositive, IsString, Length} from "class-validator";

export class UpdateCoworkingDto {

    @IsOptional()
    @IsString()
    @Length(2,100)
    name?: string;

    @IsOptional()
    @IsString()
    @Length(10,1000)
    description?: string;

    @IsOptional()
    @IsString()
    @Length(10,100)
    location?: string;

    @IsOptional()
    @IsNumber()
    @IsPositive()
    priceForDay?: number;

    @IsOptional()
    @IsNumber()
    @IsPositive()
    priceForMonth?: number;
}