import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateClienteDto, UpdateClienteDto, CreatePropostaDto, UpdatePropostaStatusDto,
} from './dto/comercial.dto';

@Injectable()
export class ComercialService {
  constructor(private readonly prisma: PrismaService) {}

  async createCliente(dto: CreateClienteDto) {
    const existente = await this.prisma.cliente.findUnique({ where: { cnpjCpf: dto.cnpjCpf } });
    if (existente) throw new ConflictException('Cliente já cadastrado com este CNPJ/CPF.');
    return this.prisma.cliente.create({ data: dto });
  }

  findAllClientes() {
    return this.prisma.cliente.findMany({ orderBy: { razaoSocial: 'asc' } });
  }

  async findClienteById(id: string) {
    const cliente = await this.prisma.cliente.findUnique({
      where: { id },
      include: { cargas: { orderBy: { criadoEm: 'desc' }, take: 10 }, propostas: true },
    });
    if (!cliente) throw new NotFoundException('Cliente não encontrado.');
    return cliente;
  }

  async updateCliente(id: string, dto: UpdateClienteDto) {
    await this.findClienteById(id);
    return this.prisma.cliente.update({ where: { id }, data: dto });
  }

  createProposta(dto: CreatePropostaDto) {
    return this.prisma.proposta.create({ data: dto });
  }

  findAllPropostas(status?: string) {
    return this.prisma.proposta.findMany({
      where: status ? { status } : undefined,
      include: { cliente: { select: { razaoSocial: true } } },
      orderBy: { criadoEm: 'desc' },
    });
  }

  async updatePropostaStatus(id: string, dto: UpdatePropostaStatusDto) {
    const proposta = await this.prisma.proposta.findUnique({ where: { id } });
    if (!proposta) throw new NotFoundException('Proposta não encontrada.');
    return this.prisma.proposta.update({ where: { id }, data: { status: dto.status } });
  }
}
