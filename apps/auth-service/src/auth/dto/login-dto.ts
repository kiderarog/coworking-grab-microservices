import {IsEmail, IsNotEmpty, IsString, Matches} from 'class-validator';

export class LogInDto {
    @IsNotEmpty({message: 'Email is required'})
    @IsEmail({}, {message: "Invalid email type"})
    email: string;

    @IsNotEmpty({message: 'Password is required'})
    @IsString()
    // @Matches(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/,
    //     {message: 'Password must be at least 8 characters long, contain one uppercase letter, one number, and one special character'})
    password: string;
}
