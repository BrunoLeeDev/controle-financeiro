import { NotFoundError } from '../../../shared/errors/AppError';
import {
  PrismaCategoryRepository,
  PrismaExpenseRepository,
  PrismaRecurringExpenseRepository,
} from '../../../infrastructure/repositories/PrismaRepositories';

export class ListRecurringExpensesUseCase {
  constructor(private readonly recurringRepository: PrismaRecurringExpenseRepository) {}

  execute(userId: string) {
    return this.recurringRepository.findAllByUser(userId);
  }
}

export class CreateRecurringExpenseUseCase {
  constructor(
    private readonly recurringRepository: PrismaRecurringExpenseRepository,
    private readonly categoryRepository: PrismaCategoryRepository,
  ) {}

  async execute(
    userId: string,
    input: { categoryId: string; amount: number; description: string; dayOfMonth: number; active?: boolean },
  ) {
    const category = await this.categoryRepository.findById(input.categoryId, userId);
    if (!category) throw new NotFoundError('Categoria não encontrada');

    return this.recurringRepository.create({
      userId,
      categoryId: input.categoryId,
      amount: input.amount,
      description: input.description,
      dayOfMonth: input.dayOfMonth,
      active: input.active ?? true,
    });
  }
}

export class UpdateRecurringExpenseUseCase {
  constructor(private readonly recurringRepository: PrismaRecurringExpenseRepository) {}

  async execute(
    userId: string,
    id: string,
    input: Partial<{ categoryId: string; amount: number; description: string; dayOfMonth: number; active: boolean }>,
  ) {
    const item = await this.recurringRepository.findById(id, userId);
    if (!item) throw new NotFoundError('Despesa recorrente não encontrada');
    return this.recurringRepository.update(id, userId, input);
  }
}

export class DeleteRecurringExpenseUseCase {
  constructor(private readonly recurringRepository: PrismaRecurringExpenseRepository) {}

  async execute(userId: string, id: string) {
    const item = await this.recurringRepository.findById(id, userId);
    if (!item) throw new NotFoundError('Despesa recorrente não encontrada');
    await this.recurringRepository.delete(id, userId);
  }
}

export class GenerateRecurringExpensesUseCase {
  constructor(
    private readonly recurringRepository: PrismaRecurringExpenseRepository,
    private readonly expenseRepository: PrismaExpenseRepository,
  ) {}

  async execute(referenceDate: Date = new Date()) {
    const dayOfMonth = referenceDate.getDate();
    const month = referenceDate.getMonth() + 1;
    const year = referenceDate.getFullYear();

    const recurringItems = await this.recurringRepository.findActiveForDay(dayOfMonth);
    let generated = 0;

    for (const item of recurringItems) {
      const exists = await this.expenseRepository.existsForRecurringMonth(item.id, month, year);
      if (exists) continue;

      await this.expenseRepository.create({
        userId: item.userId,
        categoryId: item.categoryId,
        amount: item.amount,
        description: item.description,
        date: referenceDate,
        source: 'RECURRING',
        recurringExpenseId: item.id,
      });

      await this.recurringRepository.updateLastGenerated(item.id, referenceDate);
      generated++;
    }

    return { generated };
  }
}
