import { ListBudgetsUseCase } from './BudgetUseCases';
import { BudgetCalculatorService } from '../../../infrastructure/services/BudgetCalculatorService';
import { PrismaBudgetRepository, PrismaExpenseRepository } from '../../../infrastructure/repositories/PrismaRepositories';

describe('ListBudgetsUseCase', () => {
  it('should return budgets with status', async () => {
    const mockBudget = {
      findAll: jest.fn().mockResolvedValue([{
        id: 'b1', userId: 'u1', categoryId: 'c1', month: 6, year: 2026,
        limitAmount: 1000, createdAt: new Date(), updatedAt: new Date(),
        category: { id: 'c1', userId: 'u1', name: 'Test', color: '#000', icon: null, createdAt: new Date() },
      }]),
    } as unknown as jest.Mocked<PrismaBudgetRepository>;

    const mockExpense = {
      sumByCategory: jest.fn().mockResolvedValue([{ categoryId: 'c1', total: 500 }]),
    } as unknown as jest.Mocked<PrismaExpenseRepository>;

    const useCase = new ListBudgetsUseCase(mockBudget, mockExpense, new BudgetCalculatorService());
    const result = await useCase.execute('u1', 6, 2026);

    expect(result[0].spent).toBe(500);
    expect(result[0].percentage).toBe(50);
  });
});
