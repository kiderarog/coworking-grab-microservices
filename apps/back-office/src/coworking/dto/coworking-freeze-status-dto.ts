import { ApiProperty } from "@nestjs/swagger";

export class CoworkingFreezeStatusDto {
    @ApiProperty({example: true, description: 'Is coworking frozen or not (boolean)'})
    isFrozen: boolean;
}