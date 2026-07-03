import { Prisma } from '@prisma/client';
import { Category, Expense, ExpenseFilters, ExpenseSource } from '../../domain/entities';
import { IUserRepository } from '../../domain/repositories';
import { prisma } from '../database/prisma';

function toNumber(value: Prisma.Decimal | number): number {
  return typeof value === 'number' ? value : Number(value);
}

export class PrismaUserRepository implements IUserRepository {
  async findByEmail(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    return user;
  }

  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }

  async create(data: { email: string; name: string; passwordHash: string }) {
    const user = await prisma.user.create({ data });
    return { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt };
  }
}

export class PrismaCategoryRepository {
  async findAllByUser(userId: string): Promise<Category[]> {
    return prisma.category.findMany({ where: { userId }, orderBy: { name: 'asc' } });
  }

  async findById(id: string, userId: string): Promise<Category | null> {
    return prisma.category.findFirst({ where: { id, userId } });
  }

  async create(data: { userId: string; name: string; color: string; icon?: string }): Promise<Category> {
    return prisma.category.create({ data });
  }

  async update(id: string, userId: string, data: Partial<Pick<Category, 'name' | 'color' | 'icon'>>) {
    return prisma.category.update({ where: { id, userId }, data });
  }

  async delete(id: string, userId: string): Promise<void> {
    await prisma.category.delete({ where: { id, userId } });
  }
}

function mapExpense(expense: {
  id: string;
  userId: string;
  categoryId: string;
  amount: Prisma.Decimal;
  description: string;
  date: Date;
  source: 'MANUAL' | 'RECURRING';
  recurringExpenseId: string | null;
  createdAt: Date;
  updatedAt: Date;
  category?: Category;
}): Expense {
  return {
    ...expense,
    amount: toNumber(expense.amount),
    source: expense.source as ExpenseSource,
    category: expense.category,
  };
}

export class PrismaExpenseRepository {
  async findAll(userId: string, filters?: ExpenseFilters): Promise<Expense[]> {
    const where: Prisma.ExpenseWhereInput = { userId };

    if (filters?.categoryId) where.categoryId = filters.categoryId;

    if (filters?.month && filters?.year) {
      // [CORRIGIDO] Avança para o dia 1º do próximo mês e usa 'lt' (menor que)
      const start = new Date(filters.year, filters.month - 1, 1);
      const end = new Date(filters.year, filters.month, 1);
      where.date = { gte: start, lt: end };
    } else if (filters?.startDate || filters?.endDate) {
      // [CORRIGIDO] Criação segura do objeto de filtro de data para o TypeScript
      const dateFilter: Prisma.DateTimeFilter = {};
      if (filters.startDate) dateFilter.gte = filters.startDate;
      if (filters.endDate) dateFilter.lte = filters.endDate;
      
      if (Object.keys(dateFilter).length > 0) {
        where.date = dateFilter;
      }
    }

    const expenses = await prisma.expense.findMany({
      where,
      include: { category: true },
      orderBy: { date: 'desc' },
    });

    return expenses.map(mapExpense);
  }

  async findById(id: string, userId: string): Promise<Expense | null> {
    const expense = await prisma.expense.findFirst({
      where: { id, userId },
      include: { category: true },
    });
    return expense ? mapExpense(expense) : null;
  }

  async create(data: Omit<Expense, 'id' | 'createdAt' | 'updatedAt' | 'category'>): Promise<Expense> {
    const expense = await prisma.expense.create({
      data: {
        userId: data.userId,
        categoryId: data.categoryId,
        amount: data.amount,
        description: data.description,
        date: data.date,
        source: data.source,
        recurringExpenseId: data.recurringExpenseId,
      },
      include: { category: true },
    });
    return mapExpense(expense);
  }

  async update(
    id: string,
    userId: string,
    data: Partial<Pick<Expense, 'categoryId' | 'amount' | 'description' | 'date'>>,
  ): Promise<Expense> {
    // [CORRIGIDO] Prisma.update exige um 'where' único. Checamos a existência primeiro.
    const existing = await prisma.expense.findFirst({ where: { id, userId } });
    if (!existing) {
      throw new Error('Expense not found or access denied');
    }

    const expense = await prisma.expense.update({
      where: { id },
      data,
      include: { category: true },
    });
    return mapExpense(expense);
  }

  async delete(id: string, userId: string): Promise<void> {
    // [CORRIGIDO] Usar deleteMany permite passar múltiplos campos (id + userId) sem erro de constraint única
    await prisma.expense.deleteMany({ 
      where: { id, userId } 
    });
  }

  async sumByCategory(userId: string, month: number, year: number) {
    // [CORRIGIDO] Lógica de fechamento do mês
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const result = await prisma.expense.groupBy({
      by: ['categoryId'],
      where: { userId, date: { gte: start, lt: end } }, // [CORRIGIDO] Usa 'lt'
      _sum: { amount: true },
    });

    return result.map((r) => ({
      categoryId: r.categoryId,
      total: toNumber(r._sum.amount ?? 0),
    }));
  }

  async sumTotal(userId: string, month: number, year: number): Promise<number> {
    // [CORRIGIDO] Lógica de fechamento do mês
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const result = await prisma.expense.aggregate({
      where: { userId, date: { gte: start, lt: end } }, // [CORRIGIDO] Usa 'lt'
      _sum: { amount: true },
    });

    return toNumber(result._sum.amount ?? 0);
  }

  async count(userId: string, month: number, year: number): Promise<number> {
    // [CORRIGIDO] Lógica de fechamento do mês
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    return prisma.expense.count({
      where: { userId, date: { gte: start, lt: end } }, // [CORRIGIDO] Usa 'lt'
    });
  }

  async existsForRecurringMonth(recurringExpenseId: string, month: number, year: number): Promise<boolean> {
    // [CORRIGIDO] Lógica de fechamento do mês
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const count = await prisma.expense.count({
      where: {
        recurringExpenseId,
        date: { gte: start, lt: end }, // [CORRIGIDO] Usa 'lt'
      },
    });

    return count > 0;
  }
}

export class PrismaBudgetRepository {
  async findAll(userId: string, month: number, year: number) {
    return prisma.budget.findMany({
      where: { userId, month, year },
      include: { category: true },
    }).then((budgets) =>
      budgets.map((b) => ({
        ...b,
        limitAmount: toNumber(b.limitAmount),
        category: b.category,
      })),
    );
  }

  async findById(id: string, userId: string) {
    const budget = await prisma.budget.findFirst({
      where: { id, userId },
      include: { category: true },
    });
    if (!budget) return null;
    return { ...budget, limitAmount: toNumber(budget.limitAmount), category: budget.category };
  }

  async create(data: { userId: string; categoryId: string; month: number; year: number; limitAmount: number }) {
    const budget = await prisma.budget.create({
      data,
      include: { category: true },
    });
    return { ...budget, limitAmount: toNumber(budget.limitAmount), category: budget.category };
  }

  async update(id: string, userId: string, data: { limitAmount?: number }) {
    const budget = await prisma.budget.update({
      where: { id, userId },
      data,
      include: { category: true },
    });
    return { ...budget, limitAmount: toNumber(budget.limitAmount), category: budget.category };
  }

  async delete(id: string, userId: string): Promise<void> {
    await prisma.budget.delete({ where: { id, userId } });
  }
}

export class PrismaRecurringExpenseRepository {
  async findAllByUser(userId: string) {
    const items = await prisma.recurringExpense.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { dayOfMonth: 'asc' },
    });
    return items.map((item) => ({ ...item, amount: toNumber(item.amount), category: item.category }));
  }

  async findById(id: string, userId: string) {
    const item = await prisma.recurringExpense.findFirst({
      where: { id, userId },
      include: { category: true },
    });
    if (!item) return null;
    return { ...item, amount: toNumber(item.amount), category: item.category };
  }

  async findActiveForDay(dayOfMonth: number) {
    const items = await prisma.recurringExpense.findMany({
      where: { active: true, dayOfMonth },
      include: { category: true },
    });
    return items.map((item) => ({ ...item, amount: toNumber(item.amount), category: item.category }));
  }

  async create(data: {
    userId: string;
    categoryId: string;
    amount: number;
    description: string;
    dayOfMonth: number;
    active: boolean;
  }) {
    const item = await prisma.recurringExpense.create({
      data,
      include: { category: true },
    });
    return { ...item, amount: toNumber(item.amount), category: item.category };
  }

  async update(
    id: string,
    userId: string,
    data: Partial<{ categoryId: string; amount: number; description: string; dayOfMonth: number; active: boolean }>,
  ) {
    const item = await prisma.recurringExpense.update({
      where: { id, userId },
      data,
      include: { category: true },
    });
    return { ...item, amount: toNumber(item.amount), category: item.category };
  }

  async updateLastGenerated(id: string, date: Date): Promise<void> {
    await prisma.recurringExpense.update({
      where: { id },
      data: { lastGeneratedAt: date },
    });
  }

  async delete(id: string, userId: string): Promise<void> {
    await prisma.recurringExpense.delete({ where: { id, userId } });
  }
}
