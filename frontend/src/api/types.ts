export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  color: string;
  icon: string | null;
  createdAt: string;
}

export interface Expense {
  id: string;
  userId: string;
  categoryId: string;
  amount: number;
  description: string;
  date: string;
  source: 'MANUAL' | 'RECURRING';
  recurringExpenseId: string | null;
  category?: Category;
}

export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  month: number;
  year: number;
  limitAmount: number;
  spent: number;
  remaining: number;
  percentage: number;
  category?: Category;
}

export interface RecurringExpense {
  id: string;
  userId: string;
  categoryId: string;
  amount: number;
  description: string;
  dayOfMonth: number;
  active: boolean;
  lastGeneratedAt: string | null;
  category?: Category;
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

export interface LoginResponse {
  accessToken: string;
  user: User;
}
