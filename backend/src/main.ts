import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Segurança básica de cabeçalhos HTTP
  app.use(helmet());
  app.use(compression());

  // CORS restrito ao(s) domínio(s) configurado(s)
  app.enableCors({
    origin: (process.env.CORS_ORIGINS || '').split(',').filter(Boolean),
    credentials: true,
  });

  // Validação global de DTOs — bloqueia payloads fora do formato esperado
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,          // remove campos não declarados no DTO (mitiga mass assignment)
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  app.setGlobalPrefix('api/v1');

  const port = process.env.PORT || 3333;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`DRO Cargas PRO API rodando na porta ${port}`);
}
bootstrap();
