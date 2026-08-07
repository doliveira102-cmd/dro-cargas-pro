import { Module } from '@nestjs/common';
import { PisoAnttService } from './piso-antt.service';
import { PisoAnttController } from './piso-antt.controller';

@Module({
  providers: [PisoAnttService],
  controllers: [PisoAnttController],
})
export class PisoAnttModule {}
