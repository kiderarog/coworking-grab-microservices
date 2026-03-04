import {ApiProperty} from "@nestjs/swagger";
import {BookingStatus} from "../../../generated/prisma/enums";

export class BookingResponseDto {
    @ApiProperty({description: 'UUID'})
    id: string;

    @ApiProperty({description: 'UUID'})
    coworkingId: string;

    @ApiProperty({description: 'UUID'})
    userId: string;

    @ApiProperty({description: 'utc date (start booking)', type: String, format: 'date-time'})
    startTime: Date;

    @ApiProperty({description: 'utc date (end booking)', type: String, format: 'date-time'})
    endTime: Date;

    @ApiProperty({example: 280.00})
    amountOfMoney: number;

    @ApiProperty({description: 'Booking status', enum: BookingStatus})
    status: BookingStatus;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    expiresAt?: Date | null;

}