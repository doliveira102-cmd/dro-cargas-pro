import { IsString, IsOptional, IsDateString, IsInt, IsUUID } from 'class-validator';

export class CreateVeiculoDto {
  @IsString() placa: string;
  @IsOptional() @IsString() tipo?: string;
  @IsOptional() @IsUUID() motoristaId?: string;
  @IsOptional() @IsDateString() seguroValidade?: string;
  @IsOptional() @IsDateString() licenciamentoValidade?: string;
  @IsOptional() @IsString() reboque1?: string;
  @IsOptional() @IsString() reboque2?: string;
  @IsOptional() @IsString() reboque3?: string;
  @IsOptional() @IsString() proprietarioNome?: string;
  @IsOptional() @IsString() proprietarioCpfCnpj?: string;
  @IsOptional() @IsString() proprietarioEndereco?: string;
  @IsOptional() @IsString() proprietarioMunicipioUf?: string;
}

export class UpdateVeiculoDto {
  @IsOptional() @IsString() tipo?: string;
  @IsOptional() @IsUUID() motoristaId?: string;
  @IsOptional() @IsDateString() seguroValidade?: string;
  @IsOptional() @IsDateString() licenciamentoValidade?: string;
  @IsOptional() @IsInt() quilometragem?: number;
}
