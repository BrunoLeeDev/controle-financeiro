import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../../shared/errors/AppError';
import { ITokenService } from '../../domain/repositories';

export class JwtTokenService implements ITokenService {
  constructor(
    private readonly secret: string,
    private readonly expiresIn: string,
  ) {}

  sign(payload: { userId: string; email: string }): string {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn } as jwt.SignOptions);
  }

  verify(token: string): { userId: string; email: string } {
    try {
      const decoded = jwt.verify(token, this.secret) as { userId: string; email: string };
      return decoded;
    } catch {
      throw new UnauthorizedError('Token inválido ou expirado');
    }
  }
}
