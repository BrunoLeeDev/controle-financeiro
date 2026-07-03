import { PdfReportExporter } from './PdfReportExporter';

describe('PdfReportExporter', () => {
  it('should generate pdf buffer', async () => {
    const exporter = new PdfReportExporter();
    const result = await exporter.export({
      report: {
        month: 6,
        year: 2026,
        total: 500,
        previousMonthTotal: 400,
        expenseCount: 2,
        byCategory: [{ categoryId: 'c1', categoryName: 'Test', color: '#000', total: 500, percentage: 100 }],
      },
      expenses: [],
    });

    expect(result.contentType).toBe('application/pdf');
    expect(result.buffer.length).toBeGreaterThan(0);
  });
});
