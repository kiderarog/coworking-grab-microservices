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

export class CreateUserDto {
    @IsNotEmpty({message: 'Email is required'})
    @IsEmail({}, {message: 'Invalid email type'})
    email: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(8, {
        message: 'The password length must be more than 8 characters',
    })
        // @Matches(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/,
        //     {message: 'Password must be at least 8 characters long, contain one uppercase letter, one number, and one special character'})
    password: string;

    @IsNotEmpty()
    @IsString()
    @Length(2, 50)
    name: string;

    @IsNotEmpty()
    @IsString()
    @Length(2, 50)
    surname: string;

    @IsNotEmpty()
    @IsString()
    @Matches(/^\+7\d{10}$/, {
        message: 'Invalid phone number. Example: +7XXXXXXXXXX',
    })
    phone: string;
}
