export type ExpenseSource = 'MANUAL' | 'RECURRING';

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: Date;
}

export interface UserPublic {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  color: string;
  icon: string | null;
  createdAt: Date;
}

export interface Expense {
  id: string;
  userId: string;
  categoryId: string;
  amount: number;
  description: string;
  date: Date;
  source: ExpenseSource;
  recurringExpenseId: string | null;
  createdAt: Date;
  updatedAt: Date;
  category?: Category;
}

export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  month: number;
  year: number;
  limitAmount: number;
  createdAt: Date;
  updatedAt: Date;
  category?: Category;
}

export interface BudgetWithStatus extends Budget {
  spent: number;
  remaining: number;
  percentage: number;
}

export interface RecurringExpense {
  id: string;
  userId: string;
  categoryId: string;
  amount: number;
  description: string;
  dayOfMonth: number;
  active: boolean;
  lastGeneratedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  category?: Category;
}

export interface ExpenseFilters {
  month?: number;
  year?: number;
  categoryId?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface CategorySummary {
  categoryId: string;
  categoryName: string;
  color: string;
  total: number;
  percentage: number;
  budgetLimit?: number;
  budgetSpent?: number;
  budgetPercentage?: number;
}

export interface MonthlyReport {
  month: number;
  year: number;
  total: number;
  previousMonthTotal: number;
  expenseCount: number;
  byCategory: CategorySummary[];
}

export interface ReportExportData {
  report: MonthlyReport;
  expenses: Expense[];
}
