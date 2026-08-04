import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RealtimeGateway } from '../realtime/realtime.gateway';
import { CreateMotoristaDto, UpdateMotoristaDto, AtualizarLocalizacaoDto } from './dto/motorista.dto';

@Injectable()
export class MotoristasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly realtime: RealtimeGateway,
  ) {}

  create(dto: CreateMotoristaDto) {
    return this.prisma.motorista.create({ data: dto });
  }

  findAll(disponivel?: boolean) {
    return this.prisma.motorista.findMany({
      where: disponivel !== undefined ? { disponivel } : undefined,
      orderBy: { avaliacaoMedia: 'desc' },
    });
  }

  async findOne(id: string) {
    const motorista = await this.prisma.motorista.findUnique({
      where: { id },
      include: { veiculos: true, cargas: { orderBy: { criadoEm: 'desc' }, take: 10 } },
    });
    if (!motorista) throw new NotFoundException('Motorista não encontrado.');
    return motorista;
  }

  async update(id: string, dto: UpdateMotoristaDto) {
    await this.findOne(id);
    return this.prisma.motorista.update({ where: { id }, data: dto });
  }

  async atualizarLocalizacao(id: string, dto: AtualizarLocalizacaoDto) {
    await this.findOne(id);
    const atualizado = await this.prisma.motorista.update({
      where: { id },
      data: { latitude: dto.latitude, longitude: dto.longitude },
    });
    // Emite em tempo real para o dashboard (mapa de cargas)
    this.realtime.emitLocalizacaoMotorista(id, dto.latitude, dto.longitude);
    return atualizado;
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.motorista.delete({ where: { id } });
    return { ok: true };
  }
}
