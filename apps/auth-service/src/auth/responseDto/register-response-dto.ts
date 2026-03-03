import {CreateUserDto} from "../dto/create-user.dto";
import {ApiProperty} from "@nestjs/swagger";

export class RegisterResponseDto {
    @ApiProperty({ example: 'jwt' })
    accessToken: string;

    // Отдаем все кроме пароля (он write-only)
    @ApiProperty({ type: CreateUserDto })
    user: CreateUserDto;
}