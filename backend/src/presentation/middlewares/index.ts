import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { AppError, ValidationError } from '../../shared/errors/AppError';
import { container } from '../../infrastructure/container';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(new AppError('Token não fornecido', 401, 'UNAUTHORIZED'));
  }

  try {
    const token = header.slice(7);
    const payload = container.tokenService.verify(token);
    req.userId = payload.userId;
    next();
  } catch (error) {
    next(error);
  }
}

export function validate(schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const message = result.error.errors.map((e) => e.message).join(', ');
      return next(new ValidationError(message));
    }

    if (source === 'body') {
      // O req.body permite reatribuição direta na maioria dos parsers
      req.body = result.data;
    } else {
      // Para query e params, precisamos mutar o objeto existente em vez de substituí-lo.
      // 1. Limpamos as chaves antigas (garante que chaves não validadas pelo Zod sejam removidas)
      Object.keys(req[source]).forEach((key) => delete req[source][key]);
      
      // 2. Injetamos os dados validados (e possivelmente transformados pelo Zod)
      Object.assign(req[source], result.data);
    }

    next();
  };
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
    });
  }

  console.error(err);
  return res.status(500).json({
    error: 'Erro interno do servidor',
    code: 'INTERNAL_ERROR',
  });
}

export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}
