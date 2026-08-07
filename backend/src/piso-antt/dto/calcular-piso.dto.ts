import { IsString, IsNumber, IsOptional, IsIn, IsObject } from 'class-validator';

export class CalcularPisoDto {
  @IsString() origemUf: string;
  @IsString() destinoUf: string;

  @IsIn(['NACIONAL', 'EXPORTAÇÃO'])
  operacao: 'NACIONAL' | 'EXPORTAÇÃO';

  @IsNumber() distanciaKm: number;

  @IsString() tipoCarga: string;

  @IsOptional() @IsNumber() margemPercent?: number;

  @IsOptional() @IsObject() pedagios?: Record<string, number>;
}
