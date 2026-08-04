import { Module } from '@nestjs/common';
import { CargasService } from './cargas.service';
import { CargasController } from './cargas.controller';

@Module({
  providers: [CargasService],
  controllers: [CargasController],
})
export class CargasModule {}
