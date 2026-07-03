import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { reportsApi } from '../api/services';
import { Button, Card, Loading, PageHeader, Select } from '../components/ui';
import { formatCurrency, getCurrentMonthYear, MONTHS } from '../utils/format';

export function ReportsPage() {
  const current = getCurrentMonthYear();
  const [month, setMonth] = useState(current.month);
  const [year, setYear] = useState(current.year);
  const [exporting, setExporting] = useState<'excel' | 'pdf' | null>(null);

  const { data: report, isLoading } = useQuery({
    queryKey: ['report', month, year],
    queryFn: () => reportsApi.summary(month, year).then((r) => r.data),
  });

  const handleExport = async (format: 'excel' | 'pdf') => {
    setExporting(format);
    try {
      await reportsApi.export(format, month, year);
    } finally {
      setExporting(null);
    }
  };

  if (isLoading) return <Loading />;

  const chartData = report?.byCategory.map((c) => ({
    name: c.categoryName,
    total: c.total,
  })) ?? [];

  return (
    <div>
      <PageHeader title="Relatórios" subtitle="Análise e exportação de despesas" />

      <Card className="mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium mb-1">Mês</label>
            <Select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
              {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Ano</label>
            <Select value={year} onChange={(e) => setYear(Number(e.target.value))}>
              {[2024, 2025, 2026, 2027].map((y) => <option key={y} value={y}>{y}</option>)}
            </Select>
          </div>
          <Button onClick={() => handleExport('excel')} disabled={exporting !== null}>
            {exporting === 'excel' ? 'Exportando...' : 'Exportar Excel'}
          </Button>
          <Button onClick={() => handleExport('pdf')} disabled={exporting !== null} className="bg-slate-700 hover:bg-slate-800">
            {exporting === 'pdf' ? 'Exportando...' : 'Exportar PDF'}
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <p className="text-sm text-slate-500">Total</p>
          <p className="text-2xl font-bold">{formatCurrency(report?.total ?? 0)}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Mês anterior</p>
          <p className="text-2xl font-bold">{formatCurrency(report?.previousMonthTotal ?? 0)}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Variação</p>
          <p className="text-2xl font-bold">
            {report && report.previousMonthTotal > 0
              ? `${(((report.total - report.previousMonthTotal) / report.previousMonthTotal) * 100).toFixed(1)}%`
              : '-'}
          </p>
        </Card>
      </div>

      {chartData.length > 0 && (
        <Card>
          <h3 className="font-semibold mb-4">Gastos por Categoria</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
}
