import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVeiculoDto, UpdateVeiculoDto } from './dto/veiculo.dto';

@Injectable()
export class VeiculosService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateVeiculoDto) {
    return this.prisma.veiculo.create({ data: dto });
  }

  findAll() {
    return this.prisma.veiculo.findMany({
      include: { motorista: { select: { id: true, nome: true } } },
      orderBy: { criadoEm: 'desc' },
    });
  }

  async findOne(id: string) {
    const veiculo = await this.prisma.veiculo.findUnique({
      where: { id },
      include: { motorista: true, cargas: { orderBy: { criadoEm: 'desc' }, take: 10 } },
    });
    if (!veiculo) throw new NotFoundException('Veículo não encontrado.');
    return veiculo;
  }

  async update(id: string, dto: UpdateVeiculoDto) {
    await this.findOne(id);
    return this.prisma.veiculo.update({ where: { id }, data: dto });
  }

  // Documentos (seguro/licenciamento) vencendo nos próximos `dias`
  async documentosVencendo(dias = 30) {
    const limite = new Date(Date.now() + dias * 24 * 60 * 60 * 1000);
    return this.prisma.veiculo.findMany({
      where: {
        OR: [
          { seguroValidade: { lte: limite } },
          { licenciamentoValidade: { lte: limite } },
        ],
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.veiculo.delete({ where: { id } });
    return { ok: true };
  }
}
