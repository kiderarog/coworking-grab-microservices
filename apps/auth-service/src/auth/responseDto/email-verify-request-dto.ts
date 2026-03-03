import {ApiProperty} from "@nestjs/swagger";

export class EmailVerifyRequestDto {
    @ApiProperty()
    message: string;
}