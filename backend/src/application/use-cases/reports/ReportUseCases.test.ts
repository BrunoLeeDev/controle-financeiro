import { GetMonthlyReportUseCase, ExportReportUseCase } from './ReportUseCases';
import { IReportExporter } from '../../../domain/repositories';
import { PrismaBudgetRepository, PrismaCategoryRepository, PrismaExpenseRepository } from '../../../infrastructure/repositories/PrismaRepositories';

describe('GetMonthlyReportUseCase', () => {
  const mockExpense = {
    sumTotal: jest.fn(),
    count: jest.fn(),
    sumByCategory: jest.fn(),
    findAll: jest.fn(),
  } as unknown as jest.Mocked<PrismaExpenseRepository>;

  const mockCategory = {
    findAllByUser: jest.fn(),
  } as unknown as jest.Mocked<PrismaCategoryRepository>;

  const mockBudget = {
    findAll: jest.fn(),
  } as unknown as jest.Mocked<PrismaBudgetRepository>;

  const useCase = new GetMonthlyReportUseCase(mockExpense, mockCategory, mockBudget);

  it('should build monthly report with category breakdown', async () => {
    mockExpense.sumTotal.mockResolvedValueOnce(500).mockResolvedValueOnce(400);
    mockExpense.count.mockResolvedValue(3);
    mockExpense.sumByCategory.mockResolvedValue([{ categoryId: 'c1', total: 500 }]);
    mockCategory.findAllByUser.mockResolvedValue([
      { id: 'c1', userId: 'u1', name: 'Alimentação', color: '#ef4444', icon: null, createdAt: new Date() },
    ]);
    mockBudget.findAll.mockResolvedValue([
      {
        id: 'b1', userId: 'u1', categoryId: 'c1', month: 6, year: 2026,
        limitAmount: 800, createdAt: new Date(), updatedAt: new Date(),
        category: { id: 'c1', userId: 'u1', name: 'Alimentação', color: '#ef4444', icon: null, createdAt: new Date() },
      },
    ]);

    const report = await useCase.execute('u1', 6, 2026);

    expect(report.total).toBe(500);
    expect(report.previousMonthTotal).toBe(400);
    expect(report.byCategory[0].categoryName).toBe('Alimentação');
    expect(report.byCategory[0].budgetPercentage).toBe(62.5);
  });
});

describe('ExportReportUseCase', () => {
  it('should delegate to excel exporter', async () => {
    const mockReport = { execute: jest.fn().mockResolvedValue({ month: 6, year: 2026, total: 100, previousMonthTotal: 0, expenseCount: 1, byCategory: [] }) };
    const mockExpense = { findAll: jest.fn().mockResolvedValue([]) } as unknown as jest.Mocked<PrismaExpenseRepository>;
    const mockExcel: jest.Mocked<IReportExporter> = { export: jest.fn().mockResolvedValue({ buffer: Buffer.from(''), filename: 'test.xlsx', contentType: 'application/xlsx' }) };
    const mockPdf: jest.Mocked<IReportExporter> = { export: jest.fn() };

    const useCase = new ExportReportUseCase(mockReport as never, mockExpense, mockExcel, mockPdf);
    await useCase.execute('u1', 6, 2026, 'excel');

    expect(mockExcel.export).toHaveBeenCalled();
    expect(mockPdf.export).not.toHaveBeenCalled();
  });
});
