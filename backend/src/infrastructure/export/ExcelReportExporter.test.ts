import { ExcelReportExporter } from './ExcelReportExporter';

describe('ExcelReportExporter', () => {
  it('should generate xlsx buffer with correct content type', async () => {
    const exporter = new ExcelReportExporter();
    const result = await exporter.export({
      report: {
        month: 6,
        year: 2026,
        total: 500,
        previousMonthTotal: 400,
        expenseCount: 2,
        byCategory: [{
          categoryId: 'c1',
          categoryName: 'Alimentação',
          color: '#ef4444',
          total: 500,
          percentage: 100,
        }],
      },
      expenses: [{
        id: 'e1',
        userId: 'u1',
        categoryId: 'c1',
        amount: 500,
        description: 'Mercado',
        date: new Date('2026-06-10'),
        source: 'MANUAL',
        recurringExpenseId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        category: { id: 'c1', userId: 'u1', name: 'Alimentação', color: '#ef4444', icon: null, createdAt: new Date() },
      }],
    });

    expect(result.contentType).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    expect(result.filename).toBe('relatorio-2026-06.xlsx');
    expect(result.buffer.length).toBeGreaterThan(0);
  });
});
