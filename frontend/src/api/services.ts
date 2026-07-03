import { api } from './client';
import type {
  Budget,
  Category,
  Expense,
  LoginResponse,
  MonthlyReport,
  RecurringExpense,
  User,
} from './types';

export const authApi = {
  register: (data: { email: string; name: string; password: string }) =>
    api.post<User>('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post<LoginResponse>('/auth/login', data),
  me: () => api.get<User>('/auth/me'),
};

export const categoriesApi = {
  list: () => api.get<Category[]>('/categories'),
  create: (data: { name: string; color?: string; icon?: string }) =>
    api.post<Category>('/categories', data),
  update: (id: string, data: Partial<{ name: string; color: string; icon: string }>) =>
    api.put<Category>(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
};

export const expensesApi = {
  list: (params?: Record<string, string | number>) =>
    api.get<Expense[]>('/expenses', { params }),
  create: (data: { categoryId: string; amount: number; description: string; date: string }) =>
    api.post<Expense>('/expenses', data),
  update: (id: string, data: Partial<{ categoryId: string; amount: number; description: string; date: string }>) =>
    api.put<Expense>(`/expenses/${id}`, data),
  delete: (id: string) => api.delete(`/expenses/${id}`),
};

export const budgetsApi = {
  list: (month: number, year: number) =>
    api.get<Budget[]>('/budgets', { params: { month, year } }),
  create: (data: { categoryId: string; month: number; year: number; limitAmount: number }) =>
    api.post<Budget>('/budgets', data),
  update: (id: string, data: { limitAmount: number }) =>
    api.put<Budget>(`/budgets/${id}`, data),
  delete: (id: string) => api.delete(`/budgets/${id}`),
};

export const recurringApi = {
  list: () => api.get<RecurringExpense[]>('/recurring-expenses'),
  create: (data: { categoryId: string; amount: number; description: string; dayOfMonth: number; active?: boolean }) =>
    api.post<RecurringExpense>('/recurring-expenses', data),
  update: (id: string, data: Partial<{ categoryId: string; amount: number; description: string; dayOfMonth: number; active: boolean }>) =>
    api.put<RecurringExpense>(`/recurring-expenses/${id}`, data),
  delete: (id: string) => api.delete(`/recurring-expenses/${id}`),
};

export const reportsApi = {
  summary: (month: number, year: number) =>
    api.get<MonthlyReport>('/reports/summary', { params: { month, year } }),
  export: async (format: 'excel' | 'pdf', month: number, year: number) => {
    const response = await api.get('/reports/export', {
      params: { format, month, year },
      responseType: 'blob',
    });
    const ext = format === 'excel' ? 'xlsx' : 'pdf';
    const url = window.URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio-${year}-${String(month).padStart(2, '0')}.${ext}`;
    link.click();
    window.URL.revokeObjectURL(url);
  },
};
