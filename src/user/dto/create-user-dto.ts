import {
  IsString,
  IsEmail,
  MinLength,
  MaxLength,
  IsNotEmpty,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  @ApiProperty()
  first_name: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  @ApiProperty()
  last_name: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  @ApiProperty()
  username: string;

  @IsNotEmpty()
  @IsEmail()
  @ApiProperty()
  email: string;

  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(100)
  @ApiProperty()
  password: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(10)
  @ApiProperty()
  country_code: string;

  @IsNotEmpty()
  @Matches(/^[0-9]+$/, { message: 'Mobile number must be numeric' })
  @MinLength(10)
  @MaxLength(15)
  @ApiProperty()
  mobile: string;
}
