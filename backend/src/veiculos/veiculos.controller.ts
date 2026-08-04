import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { VeiculosService } from './veiculos.service';
import { CreateVeiculoDto, UpdateVeiculoDto } from './dto/veiculo.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('veiculos')
export class VeiculosController {
  constructor(private readonly veiculosService: VeiculosService) {}

  @Post()
  @Roles('ADMIN', 'OPERADOR')
  create(@Body() dto: CreateVeiculoDto) {
    return this.veiculosService.create(dto);
  }

  @Get()
  findAll() {
    return this.veiculosService.findAll();
  }

  @Get('alertas/documentos')
  @Roles('ADMIN', 'OPERADOR')
  documentosVencendo(@Query('dias') dias?: string) {
    return this.veiculosService.documentosVencendo(Number(dias) || 30);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.veiculosService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'OPERADOR')
  update(@Param('id') id: string, @Body() dto: UpdateVeiculoDto) {
    return this.veiculosService.update(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.veiculosService.remove(id);
  }
}
