import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto, ResetPasswordDto } from './dto/auth.dto';

const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL_DAYS = 30;
const BCRYPT_ROUNDS = 12;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  private hashToken(token: string) {
    // Refresh tokens nunca ficam em texto puro no banco
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private async issueTokens(userId: string, role: string) {
    const accessToken = await this.jwt.signAsync(
      { sub: userId, role },
      { expiresIn: ACCESS_TOKEN_TTL },
    );

    const refreshToken = crypto.randomBytes(48).toString('hex');
    const expiraEm = new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);

    await this.prisma.refreshToken.create({
      data: { tokenHash: this.hashToken(refreshToken), userId, expiraEm },
    });

    return { accessToken, refreshToken };
  }

  async register(dto: RegisterDto) {
    const existente = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existente) throw new ConflictException('E-mail já cadastrado.');

    const senhaHash = await bcrypt.hash(dto.senha, BCRYPT_ROUNDS);
    const user = await this.prisma.user.create({
      data: { nome: dto.nome, email: dto.email, senhaHash, role: dto.role },
    });

    return this.issueTokens(user.id, user.role);
  }

  async login(dto: LoginDto, ip?: string) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    // Mensagem genérica propositalmente — não revela se o e-mail existe ou não
    if (!user || !user.ativo) throw new UnauthorizedException('Credenciais inválidas.');

    const senhaValida = await bcrypt.compare(dto.senha, user.senhaHash);
    if (!senhaValida) throw new UnauthorizedException('Credenciais inválidas.');

    await this.prisma.user.update({
      where: { id: user.id },
      data: { ultimoAcesso: new Date() },
    });

    await this.prisma.auditLog.create({
      data: { userId: user.id, acao: 'LOGIN', entidade: 'User', entidadeId: user.id, ip },
    });

    return this.issueTokens(user.id, user.role);
  }

  async refresh(refreshToken: string) {
    const tokenHash = this.hashToken(refreshToken);
    const stored = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!stored || stored.revogado || stored.expiraEm < new Date()) {
      throw new UnauthorizedException('Sessão expirada, faça login novamente.');
    }

    // Rotação: revoga o token usado e emite um novo par (mitiga replay de refresh token roubado)
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revogado: true },
    });

    return this.issueTokens(stored.userId, stored.user.role);
  }

  async logout(refreshToken: string) {
    const tokenHash = this.hashToken(refreshToken);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash },
      data: { revogado: true },
    });
    return { ok: true };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    // Sempre responde OK, exista ou não o e-mail — evita enumeração de contas
    if (!user) return { ok: true };

    const token = crypto.randomBytes(32).toString('hex');
    await this.prisma.passwordResetToken.create({
      data: {
        email,
        tokenHash: this.hashToken(token),
        expiraEm: new Date(Date.now() + 60 * 60 * 1000), // 1h
      },
    });

    // TODO: disparar e-mail via provedor configurado (SES/SendGrid/SMTP) com o link contendo `token`
    return { ok: true };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const tokenHash = this.hashToken(dto.token);
    const record = await this.prisma.passwordResetToken.findUnique({ where: { tokenHash } });

    if (!record || record.usado || record.expiraEm < new Date()) {
      throw new BadRequestException('Token inválido ou expirado.');
    }

    const senhaHash = await bcrypt.hash(dto.novaSenha, BCRYPT_ROUNDS);
    await this.prisma.$transaction([
      this.prisma.user.update({ where: { email: record.email }, data: { senhaHash } }),
      this.prisma.passwordResetToken.update({ where: { id: record.id }, data: { usado: true } }),
      // Revoga todas as sessões ativas ao trocar a senha
      this.prisma.refreshToken.updateMany({
        where: { user: { email: record.email } },
        data: { revogado: true },
      }),
    ]);

    return { ok: true };
  }
}
