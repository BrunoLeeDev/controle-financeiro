import { CreateCategoryUseCase, DeleteCategoryUseCase } from './CategoryUseCases';
import { NotFoundError } from '../../../shared/errors/AppError';
import { PrismaCategoryRepository } from '../../../infrastructure/repositories/PrismaRepositories';

describe('CategoryUseCases', () => {
  const mockCategory = {
    findById: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  } as unknown as jest.Mocked<PrismaCategoryRepository>;

  it('should create category', async () => {
    mockCategory.create.mockResolvedValue({ id: 'c1', userId: 'u1', name: 'Test', color: '#6366f1', icon: null, createdAt: new Date() });
    const useCase = new CreateCategoryUseCase(mockCategory);
    const result = await useCase.execute('u1', { name: 'Test' });
    expect(result.name).toBe('Test');
  });

  it('should delete category when found', async () => {
    mockCategory.findById.mockResolvedValue({ id: 'c1', userId: 'u1', name: 'Test', color: '#6366f1', icon: null, createdAt: new Date() });
    const useCase = new DeleteCategoryUseCase(mockCategory);
    await useCase.execute('u1', 'c1');
    expect(mockCategory.delete).toHaveBeenCalledWith('c1', 'u1');
  });

  it('should throw when category not found on delete', async () => {
    mockCategory.findById.mockResolvedValue(null);
    const useCase = new DeleteCategoryUseCase(mockCategory);
    await expect(useCase.execute('u1', 'c1')).rejects.toThrow(NotFoundError);
  });
});
