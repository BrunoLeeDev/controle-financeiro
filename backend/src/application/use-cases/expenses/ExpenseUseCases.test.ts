import { CreateExpenseUseCase, DeleteExpenseUseCase } from './ExpenseUseCases';
import { NotFoundError } from '../../../shared/errors/AppError';
import { PrismaCategoryRepository, PrismaExpenseRepository } from '../../../infrastructure/repositories/PrismaRepositories';

describe('ExpenseUseCases', () => {
  const mockExpense = {
    findById: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  } as unknown as jest.Mocked<PrismaExpenseRepository>;

  const mockCategory = {
    findById: jest.fn(),
  } as unknown as jest.Mocked<PrismaCategoryRepository>;

  it('should create expense when category exists', async () => {
    mockCategory.findById.mockResolvedValue({ id: 'c1', userId: 'u1', name: 'Test', color: '#000', icon: null, createdAt: new Date() });
    mockExpense.create.mockResolvedValue({ id: 'e1' } as never);

    const useCase = new CreateExpenseUseCase(mockExpense, mockCategory);
    await useCase.execute('u1', { categoryId: 'c1', amount: 100, description: 'Test', date: '2026-06-01' });

    expect(mockExpense.create).toHaveBeenCalled();
  });

  it('should throw when category not found', async () => {
    mockCategory.findById.mockResolvedValue(null);
    const useCase = new CreateExpenseUseCase(mockExpense, mockCategory);

    await expect(
      useCase.execute('u1', { categoryId: 'c1', amount: 100, description: 'Test', date: '2026-06-01' }),
    ).rejects.toThrow(NotFoundError);
  });

  it('should delete expense', async () => {
    mockExpense.findById.mockResolvedValue({ id: 'e1' } as never);
    const useCase = new DeleteExpenseUseCase(mockExpense);
    await useCase.execute('u1', 'e1');
    expect(mockExpense.delete).toHaveBeenCalledWith('e1', 'u1');
  });
});
