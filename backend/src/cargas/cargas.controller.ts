import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard, RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CargasService } from './cargas.service';
import {
  CreateCargaDto, UpdateCargaDto, UpdateStatusCargaDto, FiltroCargaDto, AddMotoristaCargaDto,
} from './dto/carga.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('cargas')
export class CargasController {
  constructor(private readonly cargasService: CargasService) {}

  @Post()
  @Roles('ADMIN', 'OPERADOR', 'COMERCIAL')
  create(@Body() dto: CreateCargaDto, @CurrentUser() user: { userId: string }) {
    return this.cargasService.create(dto, user.userId);
  }

  @Get()
  findAll(
    @Query() filtro: FiltroCargaDto,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    return this.cargasService.findAll(filtro, Number(page) || 1, Number(pageSize) || 20);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cargasService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'OPERADOR')
  update(@Param('id') id: string, @Body() dto: UpdateCargaDto) {
    return this.cargasService.update(id, dto);
  }

  @Patch(':id/status')
  @Roles('ADMIN', 'OPERADOR', 'MOTORISTA')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateStatusCargaDto) {
    return this.cargasService.updateStatus(id, dto);
  }

  @Post(':id/duplicar')
  @Roles('ADMIN', 'OPERADOR', 'COMERCIAL')
  duplicate(@Param('id') id: string, @CurrentUser() user: { userId: string }) {
    return this.cargasService.duplicate(id, user.userId);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.cargasService.remove(id);
  }

  @Post(':id/motoristas')
  @Roles('ADMIN', 'OPERADOR')
  addMotorista(@Param('id') id: string, @Body() dto: AddMotoristaCargaDto) {
    return this.cargasService.addMotorista(id, dto);
  }

  @Delete(':id/motoristas/:atribuicaoId')
  @Roles('ADMIN', 'OPERADOR')
  removeMotorista(@Param('id') id: string, @Param('atribuicaoId') atribuicaoId: string) {
    return this.cargasService.removeMotorista(id, atribuicaoId);
  }
}
