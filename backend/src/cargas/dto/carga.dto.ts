import { IsString, IsNumber, IsOptional, IsEnum, IsUUID, IsDateString } from 'class-validator';
import { CargaStatus } from '@prisma/client';

export class CreateCargaDto {
  @IsString() origemCidade: string;
  @IsString() origemUf: string;
  @IsString() destinoCidade: string;
  @IsString() destinoUf: string;
  @IsString() produto: string;

  @IsNumber() valor: number;
  @IsOptional() @IsNumber() valorMotorista?: number;
  @IsOptional() @IsString() opCn?: string;
  @IsOptional() @IsString() localizacaoLink?: string;

  @IsOptional() @IsNumber() peso?: number;
  @IsOptional() @IsString() observacoes?: string;
  @IsOptional() @IsUUID() clienteId?: string;
  @IsOptional() @IsUUID() clienteDestinoId?: string;
  @IsOptional() @IsUUID() motoristaId?: string;
  @IsOptional() @IsUUID() veiculoId?: string;
  @IsOptional() @IsDateString() dataColeta?: string;
  @IsOptional() @IsDateString() dataEntrega?: string;
}

export class UpdateCargaDto {
  @IsOptional() @IsString() origemCidade?: string;
  @IsOptional() @IsString() origemUf?: string;
  @IsOptional() @IsString() destinoCidade?: string;
  @IsOptional() @IsString() destinoUf?: string;
  @IsOptional() @IsString() produto?: string;
  @IsOptional() @IsNumber() valor?: number;
  @IsOptional() @IsNumber() valorMotorista?: number;
  @IsOptional() @IsString() opCn?: string;
  @IsOptional() @IsString() localizacaoLink?: string;
  @IsOptional() @IsNumber() peso?: number;
  @IsOptional() @IsString() observacoes?: string;
  @IsOptional() @IsUUID() clienteId?: string;
  @IsOptional() @IsUUID() clienteDestinoId?: string;
  @IsOptional() @IsUUID() motoristaId?: string;
  @IsOptional() @IsUUID() veiculoId?: string;
}

export class UpdateStatusCargaDto {
  @IsEnum(CargaStatus) status: CargaStatus;
  @IsOptional() @IsString() observacao?: string;
}

export class FiltroCargaDto {
  @IsOptional() @IsString() origem?: string;
  @IsOptional() @IsString() destino?: string;
  @IsOptional() @IsString() produto?: string;
  @IsOptional() @IsEnum(CargaStatus) status?: CargaStatus;
  @IsOptional() @IsUUID() clienteId?: string;
  @IsOptional() @IsUUID() motoristaId?: string;
}

export class AddMotoristaCargaDto {
  @IsUUID() motoristaId: string;
  @IsOptional() @IsUUID() veiculoId?: string;
}
