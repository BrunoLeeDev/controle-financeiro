import ExcelJS from 'exceljs';
import { IReportExporter } from '../../domain/repositories';
import { ReportExportData } from '../../domain/entities';

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export class ExcelReportExporter implements IReportExporter {
  async export(data: ReportExportData) {
    const workbook = new ExcelJS.Workbook();
    const { report, expenses } = data;
    const monthName = MONTHS[report.month - 1];

    const summarySheet = workbook.addWorksheet('Resumo');
    summarySheet.columns = [
      { header: 'Indicador', key: 'indicator', width: 30 },
      { header: 'Valor', key: 'value', width: 20 },
    ];
    summarySheet.addRows([
      { indicator: 'Período', value: `${monthName}/${report.year}` },
      { indicator: 'Total de despesas', value: report.total },
      { indicator: 'Mês anterior', value: report.previousMonthTotal },
      { indicator: 'Quantidade de lançamentos', value: report.expenseCount },
    ]);
    summarySheet.getRow(1).font = { bold: true };

    const categorySheet = workbook.addWorksheet('Por Categoria');
    categorySheet.columns = [
      { header: 'Categoria', key: 'category', width: 25 },
      { header: 'Total (R$)', key: 'total', width: 15 },
      { header: '% do Total', key: 'percentage', width: 12 },
      { header: 'Orçamento', key: 'budget', width: 15 },
      { header: 'Status Orçamento', key: 'status', width: 18 },
    ];
    report.byCategory.forEach((cat) => {
      categorySheet.addRow({
        category: cat.categoryName,
        total: cat.total,
        percentage: `${cat.percentage.toFixed(1)}%`,
        budget: cat.budgetLimit ?? '-',
        status: cat.budgetPercentage !== undefined ? `${cat.budgetPercentage.toFixed(1)}%` : '-',
      });
    });
    categorySheet.getRow(1).font = { bold: true };

    const detailSheet = workbook.addWorksheet('Detalhamento');
    detailSheet.columns = [
      { header: 'Data', key: 'date', width: 12 },
      { header: 'Descrição', key: 'description', width: 30 },
      { header: 'Categoria', key: 'category', width: 20 },
      { header: 'Valor (R$)', key: 'amount', width: 15 },
      { header: 'Origem', key: 'source', width: 12 },
    ];
    expenses.forEach((exp) => {
      detailSheet.addRow({
        date: exp.date.toISOString().split('T')[0],
        description: exp.description,
        category: exp.category?.name ?? '-',
        amount: exp.amount,
        source: exp.source === 'RECURRING' ? 'Recorrente' : 'Manual',
      });
    });
    detailSheet.getRow(1).font = { bold: true };

    const buffer = Buffer.from(await workbook.xlsx.writeBuffer());
    const filename = `relatorio-${report.year}-${String(report.month).padStart(2, '0')}.xlsx`;

    return {
      buffer,
      filename,
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };
  }
}
