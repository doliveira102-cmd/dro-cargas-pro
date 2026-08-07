import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import {
  CreateCargaDto,
  UpdateCargaDto,
  UpdateStatusCargaDto,
  FiltroCargaDto,
} from './dto/carga.dto';

@Injectable()
export class CargasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeGateway,
  ) {}

  private async gerarCodigo(): Promise<string> {
    const ultima = await this.prisma.carga.findFirst({ orderBy: { criadoEm: 'desc' } });
    const proximoNumero = ultima ? parseInt(ultima.codigo.split('-')[1], 10) + 1 : 1;
    return `CG-${proximoNumero}`;
  }

  async create(dto: CreateCargaDto, criadoPorId: string) {
    const codigo = await this.gerarCodigo();
    return this.prisma.carga.create({
      data: {
        ...dto,
        codigo,
        criadoPorId,
        historico: { create: { statusPara: 'DISPONIVEL' } },
      },
      include: { cliente: true, clienteDestino: true, motorista: true, veiculo: true, motoristasAtribuidos: { include: { motorista: true, veiculo: true } } },
    });
  }

  async findAll(filtro: FiltroCargaDto, page = 1, pageSize = 20) {
    const where = {
      ...(filtro.status && { status: filtro.status }),
      ...(filtro.produto && { produto: { contains: filtro.produto, mode: 'insensitive' as const } }),
      ...(filtro.origem && { origemCidade: { contains: filtro.origem, mode: 'insensitive' as const } }),
      ...(filtro.destino && { destinoCidade: { contains: filtro.destino, mode: 'insensitive' as const } }),
      ...(filtro.clienteId && { clienteId: filtro.clienteId }),
      ...(filtro.motoristaId && { motoristaId: filtro.motoristaId }),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.carga.findMany({
        where,
        include: { cliente: true, clienteDestino: true, motorista: true, veiculo: true, motoristasAtribuidos: { include: { motorista: true, veiculo: true } } },
        orderBy: { criadoEm: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.carga.count({ where }),
    ]);

    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
  }

  async findOne(id: string) {
    const carga = await this.prisma.carga.findUnique({
      where: { id },
      include: {
        cliente: true,
        clienteDestino: true,
        motorista: true,
        veiculo: true,
        documentos: true,
        historico: { orderBy: { criadoEm: 'desc' } },
        motoristasAtribuidos: { include: { motorista: true, veiculo: true } },
      },
    });
    if (!carga) throw new NotFoundException('Carga não encontrada.');
    return carga;
  }

  async update(id: string, dto: UpdateCargaDto) {
    await this.findOne(id);
    return this.prisma.carga.update({ where: { id }, data: dto });
  }

  async updateStatus(id: string, dto: UpdateStatusCargaDto) {
    const carga = await this.findOne(id);
    const atualizada = await this.prisma.carga.update({
      where: { id },
      data: {
        status: dto.status,
        historico: {
          create: { statusDe: carga.status, statusPara: dto.status, observacao: dto.observacao },
        },
      },
    });
    this.realtime.emitStatusCarga(id, dto.status);
    return atualizada;
  }

  async duplicate(id: string, criadoPorId: string) {
    const original = await this.findOne(id);
    const codigo = await this.gerarCodigo();
    return this.prisma.carga.create({
      data: {
        codigo,
        origemCidade: original.origemCidade,
        origemUf: original.origemUf,
        destinoCidade: original.destinoCidade,
        destinoUf: original.destinoUf,
        produto: original.produto,
        valor: original.valor,
        peso: original.peso,
        criadoPorId,
        status: 'DISPONIVEL',
        historico: { create: { statusPara: 'DISPONIVEL' } },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.carga.delete({ where: { id } });
    return { ok: true };
  }

  // Permite agendar mais de um caminhão/motorista para o mesmo lote de carga
  async addMotorista(cargaId: string, dto: { motoristaId: string; veiculoId?: string }) {
    await this.findOne(cargaId);
    return this.prisma.cargaMotorista.create({
      data: { cargaId, motoristaId: dto.motoristaId, veiculoId: dto.veiculoId },
      include: { motorista: true, veiculo: true },
    });
  }

  async removeMotorista(cargaId: string, atribuicaoId: string) {
    await this.prisma.cargaMotorista.deleteMany({ where: { id: atribuicaoId, cargaId } });
    return { ok: true };
  }
}
