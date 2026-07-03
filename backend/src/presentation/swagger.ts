import swaggerJsdoc from 'swagger-jsdoc';
import { Express } from 'express';
import swaggerUi from 'swagger-ui-express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Controle Financeiro API',
      version: '1.0.0',
      description: 'API REST para controle de despesas pessoais',
    },
    servers: [{ url: '/api/v1', description: 'API v1' }],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Category: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            color: { type: 'string' },
            icon: { type: 'string', nullable: true },
          },
        },
        Expense: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            amount: { type: 'number' },
            description: { type: 'string' },
            date: { type: 'string', format: 'date' },
            source: { type: 'string', enum: ['MANUAL', 'RECURRING'] },
          },
        },
        Budget: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            month: { type: 'integer' },
            year: { type: 'integer' },
            limitAmount: { type: 'number' },
            spent: { type: 'number' },
            remaining: { type: 'number' },
            percentage: { type: 'number' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            code: { type: 'string' },
          },
        },
      },
    },
    security: [{ BearerAuth: [] }],
  },
  apis: ['./src/presentation/routes/index.ts', './src/docs/*.ts'],
};

export function setupSwagger(app: Express) {
  const spec = swaggerJsdoc(options);
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(spec, { customSiteTitle: 'Controle Financeiro API' }));
  app.get('/api/docs.json', (_req, res) => res.json(spec));
}
