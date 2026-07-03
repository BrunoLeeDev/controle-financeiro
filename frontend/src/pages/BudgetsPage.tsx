import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { budgetsApi, categoriesApi } from '../api/services';
import { Button, Card, Input, Loading, PageHeader, Select } from '../components/ui';
import { formatCurrency, getCurrentMonthYear, MONTHS } from '../utils/format';

export function BudgetsPage() {
  const { month, year } = getCurrentMonthYear();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ categoryId: '', limitAmount: '' });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.list().then((r) => r.data),
  });

  const { data: budgets, isLoading } = useQuery({
    queryKey: ['budgets', month, year],
    queryFn: () => budgetsApi.list(month, year).then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: () => budgetsApi.create({
      categoryId: form.categoryId,
      month,
      year,
      limitAmount: parseFloat(form.limitAmount),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      setForm({ categoryId: '', limitAmount: '' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => budgetsApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['budgets'] }),
  });

  if (isLoading) return <Loading />;

  return (
    <div>
      <PageHeader title="Orçamentos" subtitle={`${MONTHS[month - 1]} ${year}`} />

      <Card className="mb-6">
        <form
          onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }}
          className="flex flex-wrap gap-4 items-end"
        >
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium mb-1">Categoria</label>
            <Select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} required>
              <option value="">Selecione...</option>
              {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </div>
          <div className="w-40">
            <label className="block text-sm font-medium mb-1">Limite (R$)</label>
            <Input type="number" step="0.01" min="0.01" value={form.limitAmount} onChange={(e) => setForm({ ...form, limitAmount: e.target.value })} required />
          </div>
          <Button type="submit" disabled={createMutation.isPending}>Definir Orçamento</Button>
        </form>
      </Card>

      <div className="space-y-4">
        {budgets?.map((b) => {
          const barColor = b.percentage >= 100 ? 'bg-red-500' : b.percentage >= 80 ? 'bg-amber-500' : 'bg-green-500';
          return (
            <Card key={b.id}>
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: b.category?.color }} />
                  <span className="font-medium">{b.category?.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-slate-500">
                    {formatCurrency(b.spent)} / {formatCurrency(b.limitAmount)}
                  </span>
                  <button onClick={() => deleteMutation.mutate(b.id)} className="text-red-500 text-sm hover:text-red-700">
                    Excluir
                  </button>
                </div>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${barColor}`}
                  style={{ width: `${Math.min(b.percentage, 100)}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">{b.percentage.toFixed(0)}% utilizado</p>
            </Card>
          );
        })}
        {budgets?.length === 0 && (
          <Card><p className="text-center text-slate-400">Nenhum orçamento definido para este mês</p></Card>
        )}
      </div>
    </div>
  );
}
