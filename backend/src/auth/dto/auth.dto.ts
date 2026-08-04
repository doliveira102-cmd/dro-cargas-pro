import { IsEmail, IsString, MinLength, IsEnum } from 'class-validator';
import { Role } from '@prisma/client';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  senha: string;
}

export class RegisterDto {
  @IsString()
  nome: string;

  @IsEmail()
  email: string;

  // Mínimo 8 caracteres — reforçado por checagem de força na service
  @IsString()
  @MinLength(8)
  senha: string;

  @IsEnum(Role)
  role: Role;
}

export class RefreshTokenDto {
  @IsString()
  refreshToken: string;
}

export class ForgotPasswordDto {
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @IsString()
  token: string;

  @IsString()
  @MinLength(8)
  novaSenha: string;
}
