import {IsUUID} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class BookingIdParamDto {
    @ApiProperty()
    @IsUUID()
    id: string;
}