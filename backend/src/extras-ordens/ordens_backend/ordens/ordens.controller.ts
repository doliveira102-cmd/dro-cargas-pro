import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { OrdensService } from './ordens.service';
import { CreateOrdemDto, FiltroOrdemDto } from './dto/ordem.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('ordens')
export class OrdensController {
  constructor(private readonly ordensService: OrdensService) {}

  @Post()
  @Roles('ADMIN', 'OPERADOR', 'COMERCIAL')
  create(@Body() dto: CreateOrdemDto, @CurrentUser() user: { userId: string }) {
    return this.ordensService.create(dto, user.userId);
  }

  @Get()
  findAll(@Query() filtro: FiltroOrdemDto, @CurrentUser() user: { userId: string; role: string }) {
    return this.ordensService.findAll(filtro, user.userId, user.role === 'ADMIN');
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordensService.findOne(id);
  }

  @Patch(':id/finalizar')
  finalizar(@Param('id') id: string) {
    return this.ordensService.finalizar(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ordensService.remove(id);
  }
}
