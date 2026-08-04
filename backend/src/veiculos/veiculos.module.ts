import { Module } from '@nestjs/common';
import { VeiculosService } from './veiculos.service';
import { VeiculosController } from './veiculos.controller';

@Module({
  providers: [VeiculosService],
  controllers: [VeiculosController],
})
export class VeiculosModule {}
