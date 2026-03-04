import {ApiProperty} from "@nestjs/swagger";

export class CoworkingResponseDto {

    @ApiProperty({example: 'UUID'})
    id: string;

    @ApiProperty()
    name: string;

    @ApiProperty()
    description: string;

    @ApiProperty()
    location: string;

    @ApiProperty({example: 180.00})
    priceForDay: number;

    @ApiProperty({example: 4000.00})
    priceForMonth: number;
}