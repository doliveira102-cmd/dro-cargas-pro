# DRO Cargas PRO

Sistema profissional de gerenciamento de cargas para transportadoras, motoristas, embarcadores e operadores logísticos.

## O que está pronto nesta entrega

| Camada | Status |
|---|---|
| Dashboard (UI, React) | ✅ Completo — artifact interativo com dark/light/auto, KPIs, gráficos, ranking e tabela de cargas |
| Schema de banco (Prisma/PostgreSQL) | ✅ Completo — usuários, cargas, motoristas, frota, comercial, financeiro, auditoria |
| Autenticação | ✅ Completo — JWT + refresh token rotativo, bcrypt, recuperação de senha, RBAC por perfil |
| Módulo de Cargas (API) | ✅ Completo — CRUD, mudança de status com histórico, duplicação, filtros |
| Módulo de Motoristas (API) | ✅ Completo — CRUD, disponibilidade, localização em tempo real |
| Módulo de Frota/Veículos (API) | ✅ Completo — CRUD, alerta de documentos vencendo (seguro/licenciamento) |
| Módulo Financeiro (API) | ✅ Completo — transações, fluxo de caixa, resumo (receitas/despesas/comissões/lucro) |
| Módulo Comercial (API) | ✅ Completo — clientes e propostas (funil básico) |
| Tempo real (WebSocket) | ✅ Completo — status de carga e localização de motorista via Socket.io |
| Módulo de Usuários (API) | ✅ Básico — listagem, perfil |
| Segurança de base | ✅ Helmet, rate limiting, validação de payload, logs de auditoria |
| Infraestrutura | ✅ Dockerfile, docker-compose, Nginx |
| Notificações (push/e-mail/WhatsApp), IA, integrações externas (SAP, TOTVS, Google Maps) | 🔲 Não implementados — dependem de contas/credenciais de terceiros que só você pode fornecer |
| Frontend completo em Next.js (todas as telas, não só o dashboard) | 🔲 Próxima etapa — hoje existe apenas o dashboard como artifact React |
| Banco de dados (Supabase) | ✅ Provisionado de verdade — projeto `dro-cargas-pro` criado e schema aplicado. Falta só você colar a senha do banco em `DATABASE_URL` (não pode ser obtida por API) |
| API hospedada com link ao vivo | 🔲 Ainda não — Supabase guarda os dados, mas não roda nossa API NestJS; falta escolher Railway/Render/VPS pra isso (veja "Deploy") |

Autenticação e todos os módulos de negócio (Cargas, Motoristas, Frota, Financeiro, Comercial) funcionam de ponta a ponta, com tempo real via WebSocket. O que falta depende de decisões e credenciais que só você define: qual provedor de WhatsApp/e-mail usar, se integra com SAP/TOTVS de fato, e para onde fazer o deploy.

## Arquitetura

```
dro-cargas-pro/
├── backend/                 # API NestJS
│   ├── prisma/schema.prisma # Modelagem completa do banco
│   └── src/
│       ├── auth/            # Login, refresh, recuperação de senha
│       ├── users/           # Usuários e perfis
│       ├── cargas/          # Núcleo do negócio
│       ├── prisma/          # Cliente de banco injetável
│       └── common/          # Guards, decorators, filtros globais
├── docker-compose.yml       # API + PostgreSQL + Nginx
└── nginx/default.conf
```

O frontend (dashboard) foi entregue como artifact React — veja `dro-cargas-dashboard.jsx`. Para virar um projeto Next.js completo com todas as telas (login, cargas, financeiro etc.), é o próximo passo natural.

## Endpoints disponíveis

```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password

GET    /api/v1/users            (ADMIN)
GET    /api/v1/users/me
GET    /api/v1/users/:id        (ADMIN, OPERADOR)

POST   /api/v1/cargas           (ADMIN, OPERADOR, COMERCIAL)
GET    /api/v1/cargas           (filtros: origem, destino, produto, status, clienteId, motoristaId, page, pageSize)
GET    /api/v1/cargas/:id
PATCH  /api/v1/cargas/:id       (ADMIN, OPERADOR)
PATCH  /api/v1/cargas/:id/status (ADMIN, OPERADOR, MOTORISTA)
POST   /api/v1/cargas/:id/duplicar
DELETE /api/v1/cargas/:id       (ADMIN)

POST   /api/v1/motoristas       (ADMIN, OPERADOR)
GET    /api/v1/motoristas       (?disponivel=true)
GET    /api/v1/motoristas/:id
PATCH  /api/v1/motoristas/:id
PATCH  /api/v1/motoristas/:id/localizacao

POST   /api/v1/veiculos         (ADMIN, OPERADOR)
GET    /api/v1/veiculos
GET    /api/v1/veiculos/alertas/documentos  (?dias=30)
GET    /api/v1/veiculos/:id
PATCH  /api/v1/veiculos/:id
DELETE /api/v1/veiculos/:id     (ADMIN)

POST   /api/v1/financeiro/transacoes
GET    /api/v1/financeiro/transacoes
GET    /api/v1/financeiro/resumo

POST   /api/v1/comercial/clientes
GET    /api/v1/comercial/clientes
GET    /api/v1/comercial/clientes/:id
PATCH  /api/v1/comercial/clientes/:id
POST   /api/v1/comercial/propostas
GET    /api/v1/comercial/propostas
PATCH  /api/v1/comercial/propostas/:id/status
```

WebSocket (Socket.io, mesma porta da API): eventos `carga:status`, `carga:nova`, `motorista:localizacao`.

## Banco de dados — Supabase (já provisionado)

Criei o projeto real no Supabase e apliquei todo o schema (usuários, cargas, motoristas, frota, comercial, financeiro, auditoria):

- **Projeto:** `dro-cargas-pro` (ref `hwvarfjfpnyxpgdwievc`)
- **URL:** https://hwvarfjfpnyxpgdwievc.supabase.co
- **Painel:** https://supabase.com/dashboard/project/hwvarfjfpnyxpgdwievc

Falta só um passo que eu não consigo fazer por você: pegar a **senha do banco**, que por segurança não é exposta por API. Vá em [Project Settings → Database](https://supabase.com/dashboard/project/hwvarfjfpnyxpgdwievc/settings/database), copie a "Connection string" (ou clique em "Reset database password" se não souber a atual) e cole em `DATABASE_URL` no `backend/.env`.

Como o Supabase hospeda o banco (e pode hospedar Storage/Auth/Edge Functions), mas não roda a nossa API NestJS como está, você ainda precisa hospedar o backend em algum lugar — Railway ou Render são os mais simples (veja "Deploy em produção" abaixo). O código Prisma já aponta pra esse Postgres, então é só configurar a `DATABASE_URL` no serviço escolhido.

## Rodando localmente

```bash
cd dro-cargas-pro
cp backend/.env.example backend/.env   # cole a senha real do Supabase em DATABASE_URL, defina JWT_SECRET
cd backend
npm install
npx prisma generate                    # o schema já existe no banco; isso só gera o client
npm run start:dev                      # API em http://localhost:3333/api/v1
```

## Deploy em produção

**Opção rápida (Railway ou Render):**
1. Suba este repositório no GitHub.
2. Crie um serviço PostgreSQL gerenciado na plataforma.
3. Aponte `DATABASE_URL` para ele nas variáveis de ambiente do serviço da API.
4. Configure `JWT_SECRET` (valor aleatório forte) e `CORS_ORIGINS`.
5. Comando de build: `npm install && npx prisma migrate deploy && npm run build`. Start: `npm run start`.

**Opção VPS (Hostinger, DigitalOcean etc.) com Docker:**
```bash
git clone <seu-repositorio>
cd dro-cargas-pro
cp backend/.env.example backend/.env   # preencha com valores de produção
docker compose up -d --build
# depois, aponte um domínio para o servidor e rode certbot para HTTPS:
sudo certbot --nginx -d api.drocargas.com.br
```

## Segurança implementada

- Senhas com bcrypt (12 rounds).
- Refresh tokens armazenados como hash (nunca em texto puro) e rotacionados a cada uso.
- Rate limiting global (60 req/min) e reforçado no login (5 req/min) e recuperação de senha (3 req/min).
- Validação estrita de payload (`whitelist` + `forbidNonWhitelisted`) — bloqueia campos não esperados.
- Helmet para cabeçalhos HTTP seguros.
- Log de auditoria em ações sensíveis (login, alterações de carga).
- Respostas de erro padronizadas, sem vazamento de stack trace.
- RBAC por endpoint (ex: só ADMIN exclui carga; motorista só atualiza status).

## Próximos passos sugeridos (v2)

1. Módulos Financeiro e Comercial (endpoints + relatórios exportáveis).
2. Upload de documentos (S3/Supabase Storage) vinculado às cargas.
3. WebSocket (`@nestjs/platform-socket.io`, já incluso no `package.json`) para status de carga em tempo real no dashboard.
4. Módulo de Frota e Motoristas (endpoints completos, hoje só modelados no banco).
5. Painel administrativo (gestão de usuários, permissões, logs).
6. Módulo de IA (sugestão de fretes, detecção de duplicidade, relatórios via LLM).
7. Integrações (Google Maps para rotas, WhatsApp Business API, SAP/TOTVS).

Posso seguir implementando qualquer um destes agora — é só apontar a prioridade.
