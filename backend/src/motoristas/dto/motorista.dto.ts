import { IsString, IsOptional, IsBoolean, IsDateString, IsNumber } from 'class-validator';

export class CreateMotoristaDto {
  @IsString() nome: string;
  @IsString() cnh: string;
  @IsString() cnhCategoria: string;
  @IsDateString() cnhValidade: string;
  @IsOptional() @IsString() telefone?: string;
  @IsOptional() @IsString() userId?: string;
}

export class UpdateMotoristaDto {
  @IsOptional() @IsString() nome?: string;
  @IsOptional() @IsString() telefone?: string;
  @IsOptional() @IsBoolean() disponivel?: boolean;
  @IsOptional() @IsDateString() cnhValidade?: string;
}

export class AtualizarLocalizacaoDto {
  @IsNumber() latitude: number;
  @IsNumber() longitude: number;
}
