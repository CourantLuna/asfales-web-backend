import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiProperty({ example: 'usuario@test.com', description: 'Correo electrónico' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456', description: 'Contraseña del usuario' })
  @IsString()
  @MinLength(6)
  password: string;
}