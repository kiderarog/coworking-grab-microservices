import {ApiProperty} from "@nestjs/swagger";

export class HealthResponseDto {
    @ApiProperty({
        example: "ok"
    })
    status: string

    @ApiProperty({
        example: "2026-01-30T12:50:0.000Z"
    })
    timestamp: string
}