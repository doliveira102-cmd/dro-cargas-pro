import { Module } from '@nestjs/common';
import { ComercialService } from './comercial.service';
import { ComercialController } from './comercial.controller';

@Module({
  providers: [ComercialService],
  controllers: [ComercialController],
})
export class ComercialModule {}
