import { GenerateRecurringExpensesUseCase } from './RecurringExpenseUseCases';
import { PrismaExpenseRepository, PrismaRecurringExpenseRepository } from '../../../infrastructure/repositories/PrismaRepositories';

describe('GenerateRecurringExpensesUseCase', () => {
  const mockRecurring = {
    findActiveForDay: jest.fn(),
    updateLastGenerated: jest.fn(),
  } as unknown as jest.Mocked<PrismaRecurringExpenseRepository>;

  const mockExpense = {
    existsForRecurringMonth: jest.fn(),
    create: jest.fn(),
  } as unknown as jest.Mocked<PrismaExpenseRepository>;

  const useCase = new GenerateRecurringExpensesUseCase(mockRecurring, mockExpense);

  it('should skip if expense already exists for month', async () => {
    const date = new Date(2026, 5, 15);
    mockRecurring.findActiveForDay.mockResolvedValue([
      {
        id: 'r1',
        userId: 'u1',
        categoryId: 'c1',
        amount: 100,
        description: 'Netflix',
        dayOfMonth: 15,
        active: true,
        lastGeneratedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        category: { id: 'c1', userId: 'u1', name: 'Lazer', color: '#f59e0b', icon: null, createdAt: new Date() },
      },
    ] as Awaited<ReturnType<typeof mockRecurring.findActiveForDay>>);
    mockExpense.existsForRecurringMonth.mockResolvedValue(true);

    const result = await useCase.execute(date);

    expect(result.generated).toBe(0);
    expect(mockExpense.create).not.toHaveBeenCalled();
  });

  it('should generate expense when not exists', async () => {
    const date = new Date(2026, 5, 15);
    mockRecurring.findActiveForDay.mockResolvedValue([
      {
        id: 'r1',
        userId: 'u1',
        categoryId: 'c1',
        amount: 100,
        description: 'Netflix',
        dayOfMonth: 15,
        active: true,
        lastGeneratedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        category: { id: 'c1', userId: 'u1', name: 'Lazer', color: '#f59e0b', icon: null, createdAt: new Date() },
      },
    ] as Awaited<ReturnType<typeof mockRecurring.findActiveForDay>>);
    mockExpense.existsForRecurringMonth.mockResolvedValue(false);
    mockExpense.create.mockResolvedValue({} as never);

    const result = await useCase.execute(date);

    expect(result.generated).toBe(1);
    expect(mockExpense.create).toHaveBeenCalled();
    expect(mockRecurring.updateLastGenerated).toHaveBeenCalledWith('r1', date);
  });
});
