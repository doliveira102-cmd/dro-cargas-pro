import { IsString, IsOptional, IsNumber, IsUUID } from 'class-validator';

export class CreateClienteDto {
  @IsString() razaoSocial: string;
  @IsString() cnpjCpf: string;
  @IsOptional() @IsString() email?: string;
  @IsOptional() @IsString() telefone?: string;
  @IsOptional() @IsString() cidade?: string;
  @IsOptional() @IsString() uf?: string;
  @IsOptional() @IsString() responsavel?: string;
  @IsOptional() @IsString() localizacaoLink?: string;
  @IsOptional() @IsString() observacoes?: string;
}

export class UpdateClienteDto {
  @IsOptional() @IsString() razaoSocial?: string;
  @IsOptional() @IsString() email?: string;
  @IsOptional() @IsString() telefone?: string;
  @IsOptional() @IsString() cidade?: string;
  @IsOptional() @IsString() uf?: string;
  @IsOptional() @IsString() responsavel?: string;
  @IsOptional() @IsString() localizacaoLink?: string;
  @IsOptional() @IsString() observacoes?: string;
}

export class CreatePropostaDto {
  @IsUUID() clienteId: string;
  @IsString() descricao: string;
  @IsNumber() valor: number;
}

export class UpdatePropostaStatusDto {
  @IsString() status: string; // aberta | aceita | recusada
}
