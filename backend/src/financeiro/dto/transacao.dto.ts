import { IsEnum, IsString, IsNumber, IsOptional, IsDateString, IsUUID } from 'class-validator';
import { TipoTransacao } from '@prisma/client';

export class CreateTransacaoDto {
  @IsEnum(TipoTransacao) tipo: TipoTransacao;
  @IsString() descricao: string;
  @IsNumber() valor: number;
  @IsOptional() @IsUUID() cargaId?: string;
  @IsOptional() @IsString() categoria?: string;
  @IsOptional() @IsDateString() dataPagamento?: string;
}

export class FiltroTransacaoDto {
  @IsOptional() @IsEnum(TipoTransacao) tipo?: TipoTransacao;
  @IsOptional() @IsDateString() de?: string;
  @IsOptional() @IsDateString() ate?: string;
}
