import { Module } from '@nestjs/common';
import { MotoristasService } from './motoristas.service';
import { MotoristasController } from './motoristas.controller';

@Module({
  providers: [MotoristasService],
  controllers: [MotoristasController],
})
export class MotoristasModule {}
