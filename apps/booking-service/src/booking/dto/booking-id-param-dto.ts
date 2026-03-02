import {IsUUID} from "class-validator";

export class BookingIdParamDto {
    @IsUUID()
    id: string;
}