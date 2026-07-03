import {
  Budget,
  BudgetWithStatus,
  Category,
  Expense,
  ExpenseFilters,
  RecurringExpense,
  User,
  UserPublic,
} from '../entities';

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(data: { email: string; name: string; passwordHash: string }): Promise<UserPublic>;
}

export interface ICategoryRepository {
  findAllByUser(userId: string): Promise<Category[]>;
  findById(id: string, userId: string): Promise<Category | null>;
  create(data: { userId: string; name: string; color: string; icon?: string }): Promise<Category>;
  update(id: string, userId: string, data: Partial<Pick<Category, 'name' | 'color' | 'icon'>>): Promise<Category>;
  delete(id: string, userId: string): Promise<void>;
}

export interface IExpenseRepository {
  findAll(userId: string, filters?: ExpenseFilters): Promise<Expense[]>;
  findById(id: string, userId: string): Promise<Expense | null>;
  create(data: Omit<Expense, 'id' | 'createdAt' | 'updatedAt' | 'category'>): Promise<Expense>;
  update(
    id: string,
    userId: string,
    data: Partial<Pick<Expense, 'categoryId' | 'amount' | 'description' | 'date'>>,
  ): Promise<Expense>;
  delete(id: string, userId: string): Promise<void>;
  sumByCategory(userId: string, month: number, year: number): Promise<{ categoryId: string; total: number }[]>;
  sumTotal(userId: string, month: number, year: number): Promise<number>;
  count(userId: string, month: number, year: number): Promise<number>;
  existsForRecurringMonth(recurringExpenseId: string, month: number, year: number): Promise<boolean>;
}

export interface IBudgetRepository {
  findAll(userId: string, month: number, year: number): Promise<Budget[]>;
  findById(id: string, userId: string): Promise<Budget | null>;
  create(data: Omit<Budget, 'id' | 'createdAt' | 'updatedAt' | 'category'>): Promise<Budget>;
  update(id: string, userId: string, data: Partial<Pick<Budget, 'limitAmount'>>): Promise<Budget>;
  delete(id: string, userId: string): Promise<void>;
}

export interface IRecurringExpenseRepository {
  findAllByUser(userId: string): Promise<RecurringExpense[]>;
  findById(id: string, userId: string): Promise<RecurringExpense | null>;
  findActiveForDay(dayOfMonth: number): Promise<RecurringExpense[]>;
  create(data: Omit<RecurringExpense, 'id' | 'createdAt' | 'updatedAt' | 'lastGeneratedAt' | 'category'>): Promise<RecurringExpense>;
  update(
    id: string,
    userId: string,
    data: Partial<Pick<RecurringExpense, 'categoryId' | 'amount' | 'description' | 'dayOfMonth' | 'active'>>,
  ): Promise<RecurringExpense>;
  updateLastGenerated(id: string, date: Date): Promise<void>;
  delete(id: string, userId: string): Promise<void>;
}

export interface IHashService {
  hash(password: string): Promise<string>;
  compare(password: string, hash: string): Promise<boolean>;
}

export interface ITokenService {
  sign(payload: { userId: string; email: string }): string;
  verify(token: string): { userId: string; email: string };
}

export interface IReportExporter {
  export(data: import('../entities').ReportExportData): Promise<{ buffer: Buffer; filename: string; contentType: string }>;
}

export interface IBudgetCalculator {
  calculateStatus(budgets: Budget[], spentByCategory: Map<string, number>): BudgetWithStatus[];
}
