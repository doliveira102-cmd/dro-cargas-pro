import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/roles.guard';
import { PisoAnttService } from './piso-antt.service';
import { CalcularPisoDto } from './dto/calcular-piso.dto';

@UseGuards(JwtAuthGuard)
@Controller('piso-antt')
export class PisoAnttController {
  constructor(private readonly pisoAnttService: PisoAnttService) {}

  // Lista de UFs, tipos de carga e configurações de veículo para popular os selects do formulário
  @Get('opcoes')
  opcoes() {
    return this.pisoAnttService.listarOpcoes();
  }

  @Post('calcular')
  calcular(@Body() dto: CalcularPisoDto) {
    return this.pisoAnttService.calcular(dto);
  }
}
