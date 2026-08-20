import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrdemDto, FiltroOrdemDto } from './dto/ordem.dto';

const INCLUDE_COMPLETO = {
  carga: { include: { cliente: true, clienteDestino: true } },
  motorista: true,
  veiculo: true,
  criadoPor: { select: { id: true, nome: true } },
};

@Injectable()
export class OrdensService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateOrdemDto, criadoPorId: string) {
    let veiculoId = dto.veiculoId;
    if (!veiculoId) {
      const veiculo = await this.prisma.veiculo.findFirst({ where: { motoristaId: dto.motoristaId } });
      veiculoId = veiculo?.id;
    }

    return this.prisma.ordem.create({
      data: {
        cargaId: dto.cargaId,
        motoristaId: dto.motoristaId,
        veiculoId,
        peso: dto.peso,
        freteMotorista: dto.freteMotorista,
        observacao: dto.observacao,
        criadoPorId,
      },
      include: INCLUDE_COMPLETO,
    });
  }

  async findAll(filtro: FiltroOrdemDto, userId: string, isAdmin: boolean) {
    const podeVerTodas = isAdmin && filtro.escopo === 'todas';

    const where = {
      ...(podeVerTodas ? {} : { criadoPorId: userId }),
      ...(filtro.de || filtro.ate
        ? {
            criadoEm: {
              ...(filtro.de && { gte: new Date(filtro.de) }),
              ...(filtro.ate && { lte: new Date(filtro.ate + 'T23:59:59') }),
            },
          }
        : {}),
    };

    return this.prisma.ordem.findMany({
      where,
      include: INCLUDE_COMPLETO,
      orderBy: { criadoEm: 'desc' },
    });
  }

  async findOne(id: string) {
    const ordem = await this.prisma.ordem.findUnique({ where: { id }, include: INCLUDE_COMPLETO });
    if (!ordem) throw new NotFoundException('Ordem não encontrada.');
    return ordem;
  }

  async finalizar(id: string) {
    await this.findOne(id);
    return this.prisma.ordem.update({ where: { id }, data: { status: 'FINALIZADA' }, include: INCLUDE_COMPLETO });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.ordem.delete({ where: { id } });
    return { ok: true };
  }
}
