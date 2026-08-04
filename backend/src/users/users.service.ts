import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true, nome: true, email: true, role: true, ativo: true,
        fotoUrl: true, ultimoAcesso: true, criadoEm: true,
        // senhaHash nunca é retornado
      },
      orderBy: { criadoEm: 'desc' },
    });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true, nome: true, email: true, role: true, ativo: true,
        fotoUrl: true, ultimoAcesso: true, criadoEm: true,
      },
    });
    if (!user) throw new NotFoundException('Usuário não encontrado.');
    return user;
  }
}
