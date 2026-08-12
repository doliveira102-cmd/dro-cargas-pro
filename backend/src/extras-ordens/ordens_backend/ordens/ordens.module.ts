import { Module } from '@nestjs/common';
import { OrdensService } from './ordens.service';
import { OrdensController } from './ordens.controller';

@Module({
  providers: [OrdensService],
  controllers: [OrdensController],
})
export class OrdensModule {}
