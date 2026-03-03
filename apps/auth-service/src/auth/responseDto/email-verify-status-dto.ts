import {ApiProperty} from "@nestjs/swagger";

export class EmailVerifyStatusDto {
    @ApiProperty()
    message: string;
}