import { NotFoundError } from '../../../shared/errors/AppError';
import { IBudgetCalculator } from '../../../domain/repositories';
import {
  PrismaBudgetRepository,
  PrismaCategoryRepository,
  PrismaExpenseRepository,
} from '../../../infrastructure/repositories/PrismaRepositories';

export class ListBudgetsUseCase {
  constructor(
    private readonly budgetRepository: PrismaBudgetRepository,
    private readonly expenseRepository: PrismaExpenseRepository,
    private readonly budgetCalculator: IBudgetCalculator,
  ) {}

  async execute(userId: string, month: number, year: number) {
    const budgets = await this.budgetRepository.findAll(userId, month, year);
    const spentByCategory = await this.expenseRepository.sumByCategory(userId, month, year);
    const spentMap = new Map(spentByCategory.map((s) => [s.categoryId, s.total]));
    return this.budgetCalculator.calculateStatus(budgets, spentMap);
  }
}

export class CreateBudgetUseCase {
  constructor(
    private readonly budgetRepository: PrismaBudgetRepository,
    private readonly categoryRepository: PrismaCategoryRepository,
  ) {}

  async execute(
    userId: string,
    input: { categoryId: string; month: number; year: number; limitAmount: number },
  ) {
    const category = await this.categoryRepository.findById(input.categoryId, userId);
    if (!category) throw new NotFoundError('Categoria não encontrada');

    return this.budgetRepository.create({ userId, ...input });
  }
}

export class UpdateBudgetUseCase {
  constructor(private readonly budgetRepository: PrismaBudgetRepository) {}

  async execute(userId: string, id: string, input: { limitAmount: number }) {
    const budget = await this.budgetRepository.findById(id, userId);
    if (!budget) throw new NotFoundError('Orçamento não encontrado');
    return this.budgetRepository.update(id, userId, input);
  }
}

export class DeleteBudgetUseCase {
  constructor(private readonly budgetRepository: PrismaBudgetRepository) {}

  async execute(userId: string, id: string) {
    const budget = await this.budgetRepository.findById(id, userId);
    if (!budget) throw new NotFoundError('Orçamento não encontrado');
    await this.budgetRepository.delete(id, userId);
  }
}
