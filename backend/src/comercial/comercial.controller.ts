import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { ComercialService } from './comercial.service';
import {
  CreateClienteDto, UpdateClienteDto, CreatePropostaDto, UpdatePropostaStatusDto,
} from './dto/comercial.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'COMERCIAL', 'OPERADOR')
@Controller('comercial')
export class ComercialController {
  constructor(private readonly comercialService: ComercialService) {}

  @Post('clientes')
  createCliente(@Body() dto: CreateClienteDto) {
    return this.comercialService.createCliente(dto);
  }

  @Get('clientes')
  findAllClientes() {
    return this.comercialService.findAllClientes();
  }

  @Get('clientes/:id')
  findClienteById(@Param('id') id: string) {
    return this.comercialService.findClienteById(id);
  }

  @Patch('clientes/:id')
  updateCliente(@Param('id') id: string, @Body() dto: UpdateClienteDto) {
    return this.comercialService.updateCliente(id, dto);
  }

  @Post('propostas')
  createProposta(@Body() dto: CreatePropostaDto) {
    return this.comercialService.createProposta(dto);
  }

  @Get('propostas')
  findAllPropostas(@Query('status') status?: string) {
    return this.comercialService.findAllPropostas(status);
  }

  @Patch('propostas/:id/status')
  updatePropostaStatus(@Param('id') id: string, @Body() dto: UpdatePropostaStatusDto) {
    return this.comercialService.updatePropostaStatus(id, dto);
  }
}
