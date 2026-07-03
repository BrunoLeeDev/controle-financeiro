import { ConflictError, NotFoundError, UnauthorizedError } from '../../../shared/errors/AppError';
import { IHashService, ITokenService, IUserRepository } from '../../../domain/repositories';

export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly hashService: IHashService,
  ) {}

  async execute(input: { email: string; name: string; password: string }) {
    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) throw new ConflictError('E-mail já cadastrado');

    const passwordHash = await this.hashService.hash(input.password);
    return this.userRepository.create({
      email: input.email,
      name: input.name,
      passwordHash,
    });
  }
}

export class LoginUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly hashService: IHashService,
    private readonly tokenService: ITokenService,
  ) {}

  async execute(input: { email: string; password: string }) {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) throw new UnauthorizedError('Credenciais inválidas');

    const valid = await this.hashService.compare(input.password, user.passwordHash);
    if (!valid) throw new UnauthorizedError('Credenciais inválidas');

    const accessToken = this.tokenService.sign({ userId: user.id, email: user.email });

    return {
      accessToken,
      user: { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt },
    };
  }
}

export class GetProfileUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundError('Usuário não encontrado');

    return { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt };
  }
}
