import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const DEFAULT_CATEGORIES = [
  { name: 'Alimentação', color: '#ef4444', icon: 'utensils' },
  { name: 'Transporte', color: '#3b82f6', icon: 'car' },
  { name: 'Moradia', color: '#8b5cf6', icon: 'home' },
  { name: 'Saúde', color: '#10b981', icon: 'heart' },
  { name: 'Lazer', color: '#f59e0b', icon: 'gamepad' },
];

async function main() {
  const demoEmail = 'demo@controle.com';
  const existing = await prisma.user.findUnique({ where: { email: demoEmail } });

  if (existing) {
    console.log('Seed já executado.');
    return;
  }

  const passwordHash = await bcrypt.hash('demo123', 10);
  const user = await prisma.user.create({
    data: {
      email: demoEmail,
      name: 'Usuário Demo',
      passwordHash,
      categories: {
        create: DEFAULT_CATEGORIES,
      },
    },
    include: { categories: true },
  });

  const alimentacao = user.categories.find((c) => c.name === 'Alimentação')!;
  const transporte = user.categories.find((c) => c.name === 'Transporte')!;

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  await prisma.expense.createMany({
    data: [
      {
        userId: user.id,
        categoryId: alimentacao.id,
        amount: 450.5,
        description: 'Supermercado',
        date: new Date(year, month - 1, 5),
        source: 'MANUAL',
      },
      {
        userId: user.id,
        categoryId: transporte.id,
        amount: 120,
        description: 'Combustível',
        date: new Date(year, month - 1, 10),
        source: 'MANUAL',
      },
    ],
  });

  await prisma.budget.create({
    data: {
      userId: user.id,
      categoryId: alimentacao.id,
      month,
      year,
      limitAmount: 800,
    },
  });

  console.log('Seed concluído. Login demo: demo@controle.com / demo123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
