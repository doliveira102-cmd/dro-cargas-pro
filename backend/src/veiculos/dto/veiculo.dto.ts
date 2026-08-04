import { IsString, IsOptional, IsDateString, IsInt, IsUUID } from 'class-validator';

export class CreateVeiculoDto {
  @IsString() placa: string;
  @IsString() tipo: string;
  @IsOptional() @IsUUID() motoristaId?: string;
  @IsOptional() @IsDateString() seguroValidade?: string;
  @IsOptional() @IsDateString() licenciamentoValidade?: string;
}

export class UpdateVeiculoDto {
  @IsOptional() @IsString() tipo?: string;
  @IsOptional() @IsUUID() motoristaId?: string;
  @IsOptional() @IsDateString() seguroValidade?: string;
  @IsOptional() @IsDateString() licenciamentoValidade?: string;
  @IsOptional() @IsInt() quilometragem?: number;
}
