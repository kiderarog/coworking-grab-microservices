import {
  IsEmail,
  IsString,
  IsOptional,
  IsEnum,
  MinLength,
  Matches,
  MaxLength,
  Length,
} from 'class-validator';
import { Role } from '../../../generated/prisma/enums';

export class CreateUserDto {
  @IsEmail({}, { message: 'Invalid email type' })
  email: string;

  @IsString()
  @MinLength(8, {
    message: 'The password length must be more than 8 characters',
  })
  // @Matches(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/)
  password: string;

  @IsString()
  @Length(2, 50)
  name: string;

  @IsString()
  @Length(2, 50)
  surname: string;

  @IsString()
  @Matches(/^\+7\d{10}$/, {
    message: 'Invalid phone number. Example: +7XXXXXXXXXX',
  })
  phone: string;
}
