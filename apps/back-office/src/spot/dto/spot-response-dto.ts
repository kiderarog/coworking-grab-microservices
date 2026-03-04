import { ApiProperty } from "@nestjs/swagger";

export class SpotResponseDto {
    @ApiProperty({ example: 'UUID'})
    id: string;

    @ApiProperty()
    spotNumber: number;

    @ApiProperty({ example: 'FREE or BOOKED', description: 'Current spot status' })
    status: string;

    @ApiProperty()
    coworkingId: string;
}