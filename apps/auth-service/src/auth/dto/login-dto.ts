import {IsEmail, IsNotEmpty, IsString, Matches} from 'class-validator';
import {ApiProperty} from "@nestjs/swagger";

export class LogInDto {
    @ApiProperty({example: 'test@mail.ru', description: 'user Email'})
    @IsNotEmpty({message: 'Email is required'})
    @IsEmail({}, {message: "Invalid email type"})
    email: string;

    @ApiProperty()
    @IsNotEmpty({message: 'Password is required'})
    @IsString()
    // @Matches(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/,
    //     {message: 'Password must be at least 8 characters long, contain one uppercase letter, one number, and one special character'})
    password: string;
}
