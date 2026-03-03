import {
    IsEmail,
    IsString,
    IsOptional,
    IsEnum,
    MinLength,
    Matches,
    MaxLength,
    Length, IsNotEmpty,
} from 'class-validator';
import {Role} from '../../../generated/prisma/enums';
import {ApiProperty} from "@nestjs/swagger";

export class CreateUserDto {

    @ApiProperty({example: 'test@mail.ru', description: 'user Email'})
    @IsNotEmpty({message: 'Email is required'})
    @IsEmail({}, {message: 'Invalid email type'})
    email: string;

    @ApiProperty({example: '123456Aa@', description: 'user password', writeOnly: true})
    @IsNotEmpty()
    @IsString()
    @MinLength(8, {
        message: 'The password length must be more than 8 characters',
    })
        // @Matches(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/,
        //     {message: 'Password must be at least 8 characters long, contain one uppercase letter, one number, and one special character'})
    password: string;

    @ApiProperty({example: 'Georgiy', description: 'user real name'})
    @IsNotEmpty()
    @IsString()
    @Length(2, 50)
    name: string;

    @ApiProperty({example: 'Neif', description: 'user real surname'})
    @IsNotEmpty()
    @IsString()
    @Length(2, 50)
    surname: string;

    @ApiProperty({example: '+79959465040', description: 'user phone number'})
    @IsNotEmpty()
    @IsString()
    @Matches(/^\+7\d{10}$/, {
        message: 'Invalid phone number. Example: +7XXXXXXXXXX',
    })
    phone: string;
}
