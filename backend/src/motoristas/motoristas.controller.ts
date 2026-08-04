import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { MotoristasService } from './motoristas.service';
import { CreateMotoristaDto, UpdateMotoristaDto, AtualizarLocalizacaoDto } from './dto/motorista.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('motoristas')
export class MotoristasController {
  constructor(private readonly motoristasService: MotoristasService) {}

  @Post()
  @Roles('ADMIN', 'OPERADOR')
  create(@Body() dto: CreateMotoristaDto) {
    return this.motoristasService.create(dto);
  }

  @Get()
  findAll(@Query('disponivel') disponivel?: string) {
    return this.motoristasService.findAll(
      disponivel === undefined ? undefined : disponivel === 'true',
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.motoristasService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'OPERADOR', 'MOTORISTA')
  update(@Param('id') id: string, @Body() dto: UpdateMotoristaDto) {
    return this.motoristasService.update(id, dto);
  }

  @Patch(':id/localizacao')
  @Roles('MOTORISTA', 'ADMIN')
  atualizarLocalizacao(@Param('id') id: string, @Body() dto: AtualizarLocalizacaoDto) {
    return this.motoristasService.atualizarLocalizacao(id, dto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  remove(@Param('id') id: string) {
    return this.motoristasService.remove(id);
  }
}
