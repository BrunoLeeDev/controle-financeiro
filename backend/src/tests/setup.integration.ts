import { prisma } from '../infrastructure/database/prisma';

afterAll(async () => {
  await prisma.$disconnect();
});
