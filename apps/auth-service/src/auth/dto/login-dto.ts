import { IsEmail, IsString } from 'class-validator';

export class LogInDto {
  @IsEmail({}, {message: "Invalid email type"})
  email: string;

  @IsString()
  password: string;
}
