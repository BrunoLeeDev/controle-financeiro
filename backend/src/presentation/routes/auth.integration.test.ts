import request from 'supertest';
import app from '../../server';
import { prisma } from '../../infrastructure/database/prisma';

describe('Auth Integration', () => {
  const email = `test-${Date.now()}@test.com`;

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email } });
    await prisma.$disconnect();
  });

  it('should register, login and get profile', async () => {
    const registerRes = await request(app)
      .post('/api/v1/auth/register')
      .send({ email, name: 'Test User', password: '123456' });

    expect(registerRes.status).toBe(201);
    expect(registerRes.body.email).toBe(email);

    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email, password: '123456' });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.accessToken).toBeDefined();

    const meRes = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${loginRes.body.accessToken}`);

    expect(meRes.status).toBe(200);
    expect(meRes.body.email).toBe(email);
  });

  it('should reject protected route without token', async () => {
    const res = await request(app).get('/api/v1/auth/me');
    expect(res.status).toBe(401);
  });
});

describe('Swagger', () => {
  it('should serve openapi spec', async () => {
    const res = await request(app).get('/api/docs.json');
    expect(res.status).toBe(200);
    expect(res.body.openapi).toBe('3.0.0');
    expect(res.body.info.title).toBe('Controle Financeiro API');
  });
});
