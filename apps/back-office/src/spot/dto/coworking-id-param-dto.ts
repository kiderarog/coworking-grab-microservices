import {IsUUID} from "class-validator";

export class CoworkingIdParamDto {
    @IsUUID()
    coworkingId: string;
}