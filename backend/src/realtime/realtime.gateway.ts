import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Injectable } from '@nestjs/common';

@Injectable()
@WebSocketGateway({ cors: { origin: (process.env.CORS_ORIGINS || '').split(',') } })
export class RealtimeGateway {
  @WebSocketServer()
  server: Server;

  emitStatusCarga(cargaId: string, status: string) {
    this.server?.emit('carga:status', { cargaId, status });
  }

  emitLocalizacaoMotorista(motoristaId: string, latitude: number, longitude: number) {
    this.server?.emit('motorista:localizacao', { motoristaId, latitude, longitude });
  }

  emitNovaCarga(carga: unknown) {
    this.server?.emit('carga:nova', carga);
  }
}
