import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('E-mail inválido'),
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export const categorySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida').optional(),
  icon: z.string().optional(),
});

export const expenseSchema = z.object({
  categoryId: z.string().uuid('Categoria inválida'),
  amount: z.number().positive('Valor deve ser positivo'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida (YYYY-MM-DD)'),
});

export const budgetSchema = z.object({
  categoryId: z.string().uuid('Categoria inválida'),
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2000).max(2100),
  limitAmount: z.number().positive('Limite deve ser positivo'),
});

export const recurringExpenseSchema = z.object({
  categoryId: z.string().uuid('Categoria inválida'),
  amount: z.number().positive('Valor deve ser positivo'),
  description: z.string().min(1, 'Descrição é obrigatória'),
  dayOfMonth: z.number().int().min(1).max(31),
  active: z.boolean().optional(),
});

export const monthYearQuerySchema = z.object({
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2000).max(2100),
});

export const expenseQuerySchema = z.object({
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2000).max(2100).optional(),
  categoryId: z.string().uuid().optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export const exportQuerySchema = monthYearQuerySchema.extend({
  format: z.enum(['excel', 'pdf']),
});

export const idParamSchema = z.object({
  id: z.string().uuid('ID inválido'),
});
