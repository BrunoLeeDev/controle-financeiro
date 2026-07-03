# Controle Financeiro

Aplicativo full-stack de controle de despesas pessoais.

## Stack

- **Backend:** Node.js, Express, TypeScript, Prisma, PostgreSQL, JWT, Swagger
- **Frontend:** React, Vite, TypeScript, Tailwind CSS, TanStack Query
- **Infra:** Docker, Docker Compose

## Funcionalidades

- Autenticação JWT (cadastro e login)
- CRUD de categorias e despesas
- Orçamentos mensais por categoria com alertas
- Despesas recorrentes com geração automática (cron)
- Relatórios mensais com exportação Excel e PDF
- Documentação Swagger em `/api/docs`

## Início rápido com Docker

```bash
cp .env.example .env
docker compose up --build
```

- Frontend: http://localhost:8080
- Backend API: http://localhost:3001/api/v1
- Swagger: http://localhost:3001/api/docs

### Conta demo (após seed)

- E-mail: `demo@controle.com`
- Senha: `demo123`

## Desenvolvimento local

### Pré-requisitos

- Node.js 20+
- PostgreSQL 16+

### Backend

```bash
cd backend
cp ../.env.example .env
npm install
npx prisma migrate dev
npm run prisma:seed
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend em http://localhost:5173 (proxy `/api` → backend)

## Testes

```bash
# Backend - unitários
cd backend && npm test

# Backend - integração (requer PostgreSQL)
cd backend && npm run test:integration

# Backend - cobertura
cd backend && npm run test:coverage

# Frontend
cd frontend && npm test
```

## API

Documentação completa disponível via Swagger UI:

**http://localhost:3001/api/docs**

Principais endpoints (`/api/v1`):

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/auth/register` | Cadastro |
| POST | `/auth/login` | Login |
| GET | `/auth/me` | Perfil |
| GET/POST | `/categories` | Categorias |
| GET/POST | `/expenses` | Despesas |
| GET/POST | `/budgets` | Orçamentos |
| GET/POST | `/recurring-expenses` | Recorrentes |
| GET | `/reports/summary` | Relatório mensal |
| GET | `/reports/export?format=excel\|pdf` | Exportação |

## Arquitetura

O backend segue **Clean Architecture** com princípios **SOLID**:

```
domain/       → entidades e interfaces
application/  → use cases
infrastructure/ → Prisma, JWT, exportadores
presentation/ → routes, middlewares, Swagger
```
