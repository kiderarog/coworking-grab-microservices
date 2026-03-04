import {IsUUID} from "class-validator";
import {ApiProperty} from "@nestjs/swagger";

export class CoworkingIdParamDto {
    @ApiProperty()
    @IsUUID()
    id: string;
}