import { PrismaUserRepository, PrismaCategoryRepository, PrismaExpenseRepository, PrismaBudgetRepository, PrismaRecurringExpenseRepository } from './repositories/PrismaRepositories';
import { BcryptHashService } from './services/BcryptHashService';
import { JwtTokenService } from './services/JwtTokenService';
import { BudgetCalculatorService } from './services/BudgetCalculatorService';
import { ExcelReportExporter } from './export/ExcelReportExporter';
import { PdfReportExporter } from './export/PdfReportExporter';
import { RegisterUserUseCase, LoginUserUseCase, GetProfileUseCase } from '../application/use-cases/auth/RegisterUserUseCase';
import { ListCategoriesUseCase, CreateCategoryUseCase, UpdateCategoryUseCase, DeleteCategoryUseCase } from '../application/use-cases/categories/CategoryUseCases';
import { ListExpensesUseCase, CreateExpenseUseCase, UpdateExpenseUseCase, DeleteExpenseUseCase } from '../application/use-cases/expenses/ExpenseUseCases';
import { ListBudgetsUseCase, CreateBudgetUseCase, UpdateBudgetUseCase, DeleteBudgetUseCase } from '../application/use-cases/budgets/BudgetUseCases';
import { ListRecurringExpensesUseCase, CreateRecurringExpenseUseCase, UpdateRecurringExpenseUseCase, DeleteRecurringExpenseUseCase, GenerateRecurringExpensesUseCase } from '../application/use-cases/recurring/RecurringExpenseUseCases';
import { GetMonthlyReportUseCase, ExportReportUseCase } from '../application/use-cases/reports/ReportUseCases';

const userRepository = new PrismaUserRepository();
const categoryRepository = new PrismaCategoryRepository();
const expenseRepository = new PrismaExpenseRepository();
const budgetRepository = new PrismaBudgetRepository();
const recurringRepository = new PrismaRecurringExpenseRepository();

const hashService = new BcryptHashService();
const tokenService = new JwtTokenService(
  process.env.JWT_SECRET ?? 'dev-secret',
  process.env.JWT_EXPIRES_IN ?? '24h',
);
const budgetCalculator = new BudgetCalculatorService();
const excelExporter = new ExcelReportExporter();
const pdfExporter = new PdfReportExporter();

const getMonthlyReportUseCase = new GetMonthlyReportUseCase(
  expenseRepository,
  categoryRepository,
  budgetRepository,
);

export const container = {
  auth: {
    register: new RegisterUserUseCase(userRepository, hashService),
    login: new LoginUserUseCase(userRepository, hashService, tokenService),
    getProfile: new GetProfileUseCase(userRepository),
  },
  categories: {
    list: new ListCategoriesUseCase(categoryRepository),
    create: new CreateCategoryUseCase(categoryRepository),
    update: new UpdateCategoryUseCase(categoryRepository),
    delete: new DeleteCategoryUseCase(categoryRepository),
  },
  expenses: {
    list: new ListExpensesUseCase(expenseRepository),
    create: new CreateExpenseUseCase(expenseRepository, categoryRepository),
    update: new UpdateExpenseUseCase(expenseRepository),
    delete: new DeleteExpenseUseCase(expenseRepository),
  },
  budgets: {
    list: new ListBudgetsUseCase(budgetRepository, expenseRepository, budgetCalculator),
    create: new CreateBudgetUseCase(budgetRepository, categoryRepository),
    update: new UpdateBudgetUseCase(budgetRepository),
    delete: new DeleteBudgetUseCase(budgetRepository),
  },
  recurring: {
    list: new ListRecurringExpensesUseCase(recurringRepository),
    create: new CreateRecurringExpenseUseCase(recurringRepository, categoryRepository),
    update: new UpdateRecurringExpenseUseCase(recurringRepository),
    delete: new DeleteRecurringExpenseUseCase(recurringRepository),
    generate: new GenerateRecurringExpensesUseCase(recurringRepository, expenseRepository),
  },
  reports: {
    summary: getMonthlyReportUseCase,
    export: new ExportReportUseCase(getMonthlyReportUseCase, expenseRepository, excelExporter, pdfExporter),
  },
  tokenService,
};
