import { ApiProperty } from "@nestjs/swagger";
import {IsUUID} from "class-validator";

export class CoworkingIdParamDto {
    @ApiProperty()
    @IsUUID()
    id: string;
}