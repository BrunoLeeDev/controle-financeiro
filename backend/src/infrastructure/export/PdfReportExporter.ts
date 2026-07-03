import PDFDocument from 'pdfkit';
import { IReportExporter } from '../../domain/repositories';
import { ReportExportData } from '../../domain/entities';

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export class PdfReportExporter implements IReportExporter {
  async export(data: ReportExportData) {
    const { report } = data;
    const monthName = MONTHS[report.month - 1];

    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));

    const pdfPromise = new Promise<Buffer>((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
    });

    doc.fontSize(20).text('Relatório de Despesas', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text(`Período: ${monthName}/${report.year}`);
    doc.text(`Total: R$ ${report.total.toFixed(2)}`);
    doc.text(`Mês anterior: R$ ${report.previousMonthTotal.toFixed(2)}`);
    doc.text(`Lançamentos: ${report.expenseCount}`);
    doc.moveDown();

    doc.fontSize(16).text('Por Categoria');
    doc.moveDown(0.5);
    report.byCategory.forEach((cat) => {
      doc.fontSize(12).text(
        `${cat.categoryName}: R$ ${cat.total.toFixed(2)} (${cat.percentage.toFixed(1)}%)`,
      );
    });

    doc.end();
    const buffer = await pdfPromise;
    const filename = `relatorio-${report.year}-${String(report.month).padStart(2, '0')}.pdf`;

    return {
      buffer,
      filename,
      contentType: 'application/pdf',
    };
  }
}
