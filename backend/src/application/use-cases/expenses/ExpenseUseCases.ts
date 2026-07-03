import { NotFoundError } from '../../../shared/errors/AppError';
import { ExpenseFilters } from '../../../domain/entities';
import {
  PrismaCategoryRepository,
  PrismaExpenseRepository,
} from '../../../infrastructure/repositories/PrismaRepositories';

export class ListExpensesUseCase {
  constructor(private readonly expenseRepository: PrismaExpenseRepository) {}

  execute(userId: string, filters?: ExpenseFilters) {
    return this.expenseRepository.findAll(userId, filters);
  }
}

export class CreateExpenseUseCase {
  constructor(
    private readonly expenseRepository: PrismaExpenseRepository,
    private readonly categoryRepository: PrismaCategoryRepository,
  ) {}

  async execute(
    userId: string,
    input: { categoryId: string; amount: number; description: string; date: string },
  ) {
    const category = await this.categoryRepository.findById(input.categoryId, userId);
    if (!category) throw new NotFoundError('Categoria não encontrada');

    return this.expenseRepository.create({
      userId,
      categoryId: input.categoryId,
      amount: input.amount,
      description: input.description,
      date: new Date(input.date),
      source: 'MANUAL',
      recurringExpenseId: null,
    });
  }
}

export class UpdateExpenseUseCase {
  constructor(private readonly expenseRepository: PrismaExpenseRepository) {}

  async execute(
    userId: string,
    id: string,
    input: Partial<{ categoryId: string; amount: number; description: string; date: string }>,
  ) {
    const expense = await this.expenseRepository.findById(id, userId);
    if (!expense) throw new NotFoundError('Despesa não encontrada');

    return this.expenseRepository.update(id, userId, {
      ...input,
      date: input.date ? new Date(input.date) : undefined,
    });
  }
}

export class DeleteExpenseUseCase {
  constructor(private readonly expenseRepository: PrismaExpenseRepository) {}

  async execute(userId: string, id: string) {
    const expense = await this.expenseRepository.findById(id, userId);
    if (!expense) throw new NotFoundError('Despesa não encontrada');
    await this.expenseRepository.delete(id, userId);
  }
}
