import { IsString, IsUUID, IsOptional, IsNumber } from 'class-validator';

export class CreateOrdemDto {
  @IsUUID() cargaId: string;
  @IsUUID() motoristaId: string;
  @IsOptional() @IsUUID() veiculoId?: string;
  @IsOptional() @IsString() peso?: string;
  @IsOptional() @IsNumber() freteMotorista?: number;
  @IsOptional() @IsString() observacao?: string;
}

export class FiltroOrdemDto {
  @IsOptional() @IsString() de?: string;
  @IsOptional() @IsString() ate?: string;
  // 'minhas' (padrão) = só as ordens do usuário logado. 'todas' = qualquer ordem (uso restrito a ADMIN).
  @IsOptional() @IsString() escopo?: 'minhas' | 'todas';
}
