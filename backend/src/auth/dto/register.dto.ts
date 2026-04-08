import { IsEmail, IsString, MaxLength, MinLength, Matches } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(3)
  @MaxLength(32)
  @Matches(/^[a-zA-Z0-9_]+$/, {
    message: 'Username can contain only letters, numbers and underscore',
  })
  username!: string;

  @IsEmail()
  @MaxLength(128)
  mail!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;
}
