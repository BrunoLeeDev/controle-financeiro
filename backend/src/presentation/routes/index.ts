import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { container } from '../../infrastructure/container';
import { authMiddleware, asyncHandler, validate } from '../middlewares';
import {
  registerSchema,
  loginSchema,
  categorySchema,
  expenseSchema,
  budgetSchema,
  recurringExpenseSchema,
  monthYearQuerySchema,
  expenseQuerySchema,
  exportQuerySchema,
  idParamSchema,
} from '../../shared/validators/schemas';

const router = Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Cadastrar usuário
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, name, password]
 *             properties:
 *               email: { type: string, format: email }
 *               name: { type: string }
 *               password: { type: string, minLength: 6 }
 *     responses:
 *       201:
 *         description: Usuário criado
 */
router.post(
  '/auth/register',
  validate(registerSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const user = await container.auth.register.execute(req.body);
    res.status(201).json(user);
  }),
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login
 */
router.post(
  '/auth/login',
  validate(loginSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const result = await container.auth.login.execute(req.body);
    res.json(result);
  }),
);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Perfil do usuário autenticado
 *     security:
 *       - BearerAuth: []
 */
router.get(
  '/auth/me',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const user = await container.auth.getProfile.execute(req.userId!);
    res.json(user);
  }),
);

router.get(
  '/categories',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const categories = await container.categories.list.execute(req.userId!);
    res.json(categories);
  }),
);

router.post(
  '/categories',
  authMiddleware,
  validate(categorySchema),
  asyncHandler(async (req: Request, res: Response) => {
    const category = await container.categories.create.execute(req.userId!, req.body);
    res.status(201).json(category);
  }),
);

router.put(
  '/categories/:id',
  authMiddleware,
  validate(idParamSchema, 'params'),
  validate(categorySchema.partial()),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const category = await container.categories.update.execute(req.userId!, id, req.body);
    res.json(category);
  }),
);

router.delete(
  '/categories/:id',
  authMiddleware,
  validate(idParamSchema, 'params'),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    await container.categories.delete.execute(req.userId!, id);
    res.status(204).send();
  }),
);

router.get(
  '/expenses',
  authMiddleware,
  validate(expenseQuerySchema, 'query'),
  asyncHandler(async (req: Request, res: Response) => {
    const { startDate, endDate, ...rest } = req.query as Record<string, unknown>;
    const filters = {
      ...rest,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    };
    const expenses = await container.expenses.list.execute(req.userId!, filters);
    res.json(expenses);
  }),
);

router.post(
  '/expenses',
  authMiddleware,
  validate(expenseSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const expense = await container.expenses.create.execute(req.userId!, req.body);
    res.status(201).json(expense);
  }),
);

router.put(
  '/expenses/:id',
  authMiddleware,
  validate(idParamSchema, 'params'),
  validate(expenseSchema.partial()),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const expense = await container.expenses.update.execute(req.userId!, id, req.body);
    res.json(expense);
  }),
);

router.delete(
  '/expenses/:id',
  authMiddleware,
  validate(idParamSchema, 'params'),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    await container.expenses.delete.execute(req.userId!, id);
    res.status(204).send();
  }),
);

router.get(
  '/budgets',
  authMiddleware,
  validate(monthYearQuerySchema, 'query'),
  asyncHandler(async (req: Request, res: Response) => {
    const { month, year } = req.query as unknown as { month: number; year: number };
    const budgets = await container.budgets.list.execute(req.userId!, month, year);
    res.json(budgets);
  }),
);

router.post(
  '/budgets',
  authMiddleware,
  validate(budgetSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const budget = await container.budgets.create.execute(req.userId!, req.body);
    res.status(201).json(budget);
  }),
);

router.put(
  '/budgets/:id',
  authMiddleware,
  validate(idParamSchema, 'params'),
  validate(z.object({ limitAmount: z.number().positive('Limite deve ser positivo') })),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const budget = await container.budgets.update.execute(req.userId!, id, req.body);
    res.json(budget);
  }),
);

router.delete(
  '/budgets/:id',
  authMiddleware,
  validate(idParamSchema, 'params'),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    await container.budgets.delete.execute(req.userId!, id);
    res.status(204).send();
  }),
);

router.get(
  '/recurring-expenses',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const items = await container.recurring.list.execute(req.userId!);
    res.json(items);
  }),
);

router.post(
  '/recurring-expenses',
  authMiddleware,
  validate(recurringExpenseSchema),
  asyncHandler(async (req: Request, res: Response) => {
    const item = await container.recurring.create.execute(req.userId!, req.body);
    res.status(201).json(item);
  }),
);

router.put(
  '/recurring-expenses/:id',
  authMiddleware,
  validate(idParamSchema, 'params'),
  validate(recurringExpenseSchema.partial()),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    const item = await container.recurring.update.execute(req.userId!, id, req.body);
    res.json(item);
  }),
);

router.delete(
  '/recurring-expenses/:id',
  authMiddleware,
  validate(idParamSchema, 'params'),
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params as { id: string };
    await container.recurring.delete.execute(req.userId!, id);
    res.status(204).send();
  }),
);

router.get(
  '/reports/summary',
  authMiddleware,
  validate(monthYearQuerySchema, 'query'),
  asyncHandler(async (req: Request, res: Response) => {
    const { month, year } = req.query as unknown as { month: number; year: number };
    const report = await container.reports.summary.execute(req.userId!, month, year);
    res.json(report);
  }),
);

router.get(
  '/reports/export',
  authMiddleware,
  validate(exportQuerySchema, 'query'),
  asyncHandler(async (req: Request, res: Response) => {
    const { month, year, format } = req.query as unknown as { month: number; year: number; format: 'excel' | 'pdf' };
    const result = await container.reports.export.execute(req.userId!, month, year, format);
    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.send(result.buffer);
  }),
);

export default router;
