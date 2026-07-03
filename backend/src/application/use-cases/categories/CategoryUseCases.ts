import { NotFoundError } from '../../../shared/errors/AppError';
import { PrismaCategoryRepository } from '../../../infrastructure/repositories/PrismaRepositories';

export class ListCategoriesUseCase {
  constructor(private readonly categoryRepository: PrismaCategoryRepository) {}

  execute(userId: string) {
    return this.categoryRepository.findAllByUser(userId);
  }
}

export class CreateCategoryUseCase {
  constructor(private readonly categoryRepository: PrismaCategoryRepository) {}

  execute(userId: string, input: { name: string; color?: string; icon?: string }) {
    return this.categoryRepository.create({
      userId,
      name: input.name,
      color: input.color ?? '#6366f1',
      icon: input.icon,
    });
  }
}

export class UpdateCategoryUseCase {
  constructor(private readonly categoryRepository: PrismaCategoryRepository) {}

  async execute(userId: string, id: string, input: { name?: string; color?: string; icon?: string }) {
    const category = await this.categoryRepository.findById(id, userId);
    if (!category) throw new NotFoundError('Categoria não encontrada');
    return this.categoryRepository.update(id, userId, input);
  }
}

export class DeleteCategoryUseCase {
  constructor(private readonly categoryRepository: PrismaCategoryRepository) {}

  async execute(userId: string, id: string) {
    const category = await this.categoryRepository.findById(id, userId);
    if (!category) throw new NotFoundError('Categoria não encontrada');
    await this.categoryRepository.delete(id, userId);
  }
}
