import { RegisterUserUseCase, LoginUserUseCase } from './RegisterUserUseCase';
import { ConflictError, UnauthorizedError } from '../../../shared/errors/AppError';
import { IUserRepository, IHashService, ITokenService } from '../../../domain/repositories';

describe('RegisterUserUseCase', () => {
  const mockUserRepo: jest.Mocked<IUserRepository> = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
  };

  const mockHash: jest.Mocked<IHashService> = {
    hash: jest.fn(),
    compare: jest.fn(),
  };

  const useCase = new RegisterUserUseCase(mockUserRepo, mockHash);

  beforeEach(() => jest.clearAllMocks());

  it('should register a new user', async () => {
    mockUserRepo.findByEmail.mockResolvedValue(null);
    mockHash.hash.mockResolvedValue('hashed');
    mockUserRepo.create.mockResolvedValue({
      id: '1',
      email: 'test@test.com',
      name: 'Test',
      createdAt: new Date(),
    });

    const result = await useCase.execute({
      email: 'test@test.com',
      name: 'Test',
      password: '123456',
    });

    expect(result.email).toBe('test@test.com');
    expect(mockHash.hash).toHaveBeenCalledWith('123456');
  });

  it('should throw ConflictError if email exists', async () => {
    mockUserRepo.findByEmail.mockResolvedValue({
      id: '1',
      email: 'test@test.com',
      name: 'Test',
      passwordHash: 'hash',
      createdAt: new Date(),
    });

    await expect(
      useCase.execute({ email: 'test@test.com', name: 'Test', password: '123456' }),
    ).rejects.toThrow(ConflictError);
  });
});

describe('LoginUserUseCase', () => {
  const mockUserRepo: jest.Mocked<IUserRepository> = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
  };

  const mockHash: jest.Mocked<IHashService> = {
    hash: jest.fn(),
    compare: jest.fn(),
  };

  const mockToken: jest.Mocked<ITokenService> = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const useCase = new LoginUserUseCase(mockUserRepo, mockHash, mockToken);

  it('should login with valid credentials', async () => {
    mockUserRepo.findByEmail.mockResolvedValue({
      id: '1',
      email: 'test@test.com',
      name: 'Test',
      passwordHash: 'hash',
      createdAt: new Date(),
    });
    mockHash.compare.mockResolvedValue(true);
    mockToken.sign.mockReturnValue('token123');

    const result = await useCase.execute({ email: 'test@test.com', password: '123456' });

    expect(result.accessToken).toBe('token123');
    expect(result.user.email).toBe('test@test.com');
  });

  it('should throw UnauthorizedError with invalid password', async () => {
    mockUserRepo.findByEmail.mockResolvedValue({
      id: '1',
      email: 'test@test.com',
      name: 'Test',
      passwordHash: 'hash',
      createdAt: new Date(),
    });
    mockHash.compare.mockResolvedValue(false);

    await expect(
      useCase.execute({ email: 'test@test.com', password: 'wrong' }),
    ).rejects.toThrow(UnauthorizedError);
  });
});
