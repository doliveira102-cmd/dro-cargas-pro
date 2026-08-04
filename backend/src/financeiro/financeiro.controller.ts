import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { FinanceiroService } from './financeiro.service';
import { CreateTransacaoDto, FiltroTransacaoDto } from './dto/transacao.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'OPERADOR')
@Controller('financeiro')
export class FinanceiroController {
  constructor(private readonly financeiroService: FinanceiroService) {}

  @Post('transacoes')
  create(@Body() dto: CreateTransacaoDto) {
    return this.financeiroService.create(dto);
  }

  @Get('transacoes')
  findAll(@Query() filtro: FiltroTransacaoDto) {
    return this.financeiroService.findAll(filtro);
  }

  @Get('resumo')
  resumo(@Query('de') de?: string, @Query('ate') ate?: string) {
    return this.financeiroService.resumo(de, ate);
  }
}
