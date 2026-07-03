import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { reportsApi, budgetsApi } from '../api/services';
import { Card, Loading, PageHeader } from '../components/ui';
import { formatCurrency, getCurrentMonthYear, MONTHS } from '../utils/format';

export function DashboardPage() {
  const { month, year } = getCurrentMonthYear();

  const { data: report, isLoading } = useQuery({
    queryKey: ['report', month, year],
    queryFn: () => reportsApi.summary(month, year).then((r) => r.data),
  });

  const { data: budgets } = useQuery({
    queryKey: ['budgets', month, year],
    queryFn: () => budgetsApi.list(month, year).then((r) => r.data),
  });

  if (isLoading) return <Loading />;

  const chartData = report?.byCategory.map((c) => ({
    name: c.categoryName,
    value: c.total,
    color: c.color,
  })) ?? [];

  const alerts = budgets?.filter((b) => b.percentage >= 80) ?? [];

  return (
    <div>
      <PageHeader title="Dashboard" subtitle={`${MONTHS[month - 1]} ${year}`} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <p className="text-sm text-slate-500">Total do mês</p>
          <p className="text-3xl font-bold text-slate-900">{formatCurrency(report?.total ?? 0)}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Mês anterior</p>
          <p className="text-3xl font-bold text-slate-900">{formatCurrency(report?.previousMonthTotal ?? 0)}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Lançamentos</p>
          <p className="text-3xl font-bold text-slate-900">{report?.expenseCount ?? 0}</p>
        </Card>
      </div>

      {alerts.length > 0 && (
        <Card className="mb-8 border-amber-200 bg-amber-50">
          <h3 className="font-semibold text-amber-800 mb-3">Alertas de Orçamento</h3>
          <div className="space-y-2">
            {alerts.map((b) => (
              <div key={b.id} className="flex justify-between text-sm">
                <span>{b.category?.name}</span>
                <span className={b.percentage >= 100 ? 'text-red-600 font-medium' : 'text-amber-700'}>
                  {b.percentage.toFixed(0)}% ({formatCurrency(b.spent)} / {formatCurrency(b.limitAmount)})
                </span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {chartData.length > 0 && (
        <Card>
          <h3 className="font-semibold mb-4">Despesas por Categoria</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
}
