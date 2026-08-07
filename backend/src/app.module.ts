import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CargasModule } from './cargas/cargas.module';
import { PrismaModule } from './prisma/prisma.module';
import { RealtimeModule } from './realtime/realtime.module';
import { MotoristasModule } from './motoristas/motoristas.module';
import { VeiculosModule } from './veiculos/veiculos.module';
import { FinanceiroModule } from './financeiro/financeiro.module';
import { ComercialModule } from './comercial/comercial.module';
import { PisoAnttModule } from './piso-antt/piso-antt.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Rate limit global: 60 requisições por minuto por IP (mitiga brute-force / DoS básico)
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),
    PrismaModule,
    RealtimeModule,
    AuthModule,
    UsersModule,
    CargasModule,
    MotoristasModule,
    VeiculosModule,
    FinanceiroModule,
    ComercialModule,
    PisoAnttModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
