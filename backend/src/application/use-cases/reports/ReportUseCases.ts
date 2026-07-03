import { IReportExporter } from '../../../domain/repositories';
import { MonthlyReport, ReportExportData } from '../../../domain/entities';
import {
  PrismaBudgetRepository,
  PrismaCategoryRepository,
  PrismaExpenseRepository,
} from '../../../infrastructure/repositories/PrismaRepositories';

export class GetMonthlyReportUseCase {
  constructor(
    private readonly expenseRepository: PrismaExpenseRepository,
    private readonly categoryRepository: PrismaCategoryRepository,
    private readonly budgetRepository: PrismaBudgetRepository,
  ) {}

  async execute(userId: string, month: number, year: number): Promise<MonthlyReport> {
    const [total, expenseCount, byCategoryRaw, categories, budgets] = await Promise.all([
      this.expenseRepository.sumTotal(userId, month, year),
      this.expenseRepository.count(userId, month, year),
      this.expenseRepository.sumByCategory(userId, month, year),
      this.categoryRepository.findAllByUser(userId),
      this.budgetRepository.findAll(userId, month, year),
    ]);

    const prevMonth = month === 1 ? 12 : month - 1;
    const prevYear = month === 1 ? year - 1 : year;
    const previousMonthTotal = await this.expenseRepository.sumTotal(userId, prevMonth, prevYear);

    const categoryMap = new Map(categories.map((c) => [c.id, c]));
    const budgetMap = new Map(budgets.map((b) => [b.categoryId, b]));

    const byCategory = byCategoryRaw.map((item) => {
      const category = categoryMap.get(item.categoryId);
      const budget = budgetMap.get(item.categoryId);
      const percentage = total > 0 ? (item.total / total) * 100 : 0;
      const budgetPercentage = budget && budget.limitAmount > 0
        ? (item.total / budget.limitAmount) * 100
        : undefined;

      return {
        categoryId: item.categoryId,
        categoryName: category?.name ?? 'Desconhecida',
        color: category?.color ?? '#6366f1',
        total: item.total,
        percentage: Math.round(percentage * 100) / 100,
        budgetLimit: budget ? budget.limitAmount : undefined,
        budgetSpent: budget ? item.total : undefined,
        budgetPercentage: budgetPercentage !== undefined
          ? Math.round(budgetPercentage * 100) / 100
          : undefined,
      };
    });

    return {
      month,
      year,
      total,
      previousMonthTotal,
      expenseCount,
      byCategory,
    };
  }
}

export class ExportReportUseCase {
  constructor(
    private readonly getMonthlyReportUseCase: GetMonthlyReportUseCase,
    private readonly expenseRepository: PrismaExpenseRepository,
    private readonly excelExporter: IReportExporter,
    private readonly pdfExporter: IReportExporter,
  ) {}

  async execute(userId: string, month: number, year: number, format: 'excel' | 'pdf') {
    const report = await this.getMonthlyReportUseCase.execute(userId, month, year);
    const expenses = await this.expenseRepository.findAll(userId, { month, year });

    const data: ReportExportData = { report, expenses };
    const exporter = format === 'excel' ? this.excelExporter : this.pdfExporter;
    return exporter.export(data);
  }
}
