import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTransacaoDto, FiltroTransacaoDto } from './dto/transacao.dto';

@Injectable()
export class FinanceiroService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateTransacaoDto) {
    return this.prisma.transacao.create({ data: dto });
  }

  findAll(filtro: FiltroTransacaoDto) {
    return this.prisma.transacao.findMany({
      where: {
        ...(filtro.tipo && { tipo: filtro.tipo }),
        ...(filtro.de || filtro.ate
          ? {
              criadoEm: {
                ...(filtro.de && { gte: new Date(filtro.de) }),
                ...(filtro.ate && { lte: new Date(filtro.ate) }),
              },
            }
          : {}),
      },
      orderBy: { criadoEm: 'desc' },
    });
  }

  // Fluxo de caixa consolidado — usado pelos cards do dashboard
  async resumo(de?: string, ate?: string) {
    const where = {
      ...(de || ate
        ? { criadoEm: { ...(de && { gte: new Date(de) }), ...(ate && { lte: new Date(ate) }) } }
        : {}),
    };

    const [receitas, despesas, comissoes] = await Promise.all([
      this.prisma.transacao.aggregate({ where: { ...where, tipo: 'RECEITA' }, _sum: { valor: true } }),
      this.prisma.transacao.aggregate({ where: { ...where, tipo: 'DESPESA' }, _sum: { valor: true } }),
      this.prisma.transacao.aggregate({ where: { ...where, tipo: 'COMISSAO' }, _sum: { valor: true } }),
    ]);

    const totalReceitas = Number(receitas._sum.valor || 0);
    const totalDespesas = Number(despesas._sum.valor || 0);
    const totalComissoes = Number(comissoes._sum.valor || 0);

    return {
      receitas: totalReceitas,
      despesas: totalDespesas,
      comissoes: totalComissoes,
      lucro: totalReceitas - totalDespesas - totalComissoes,
    };
  }
}
