import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesApi, expensesApi } from '../api/services';
import { Button, Card, Input, Loading, PageHeader, Select } from '../components/ui';
import { formatCurrency, formatDate, getCurrentMonthYear } from '../utils/format';

export function ExpensesPage() {
  const { month, year } = getCurrentMonthYear();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ categoryId: '', amount: '', description: '', date: new Date().toISOString().split('T')[0] });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.list().then((r) => r.data),
  });

  const { data: expenses, isLoading } = useQuery({
    queryKey: ['expenses', month, year],
    queryFn: () => expensesApi.list({ month, year }).then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: () => expensesApi.create({
      categoryId: form.categoryId,
      amount: parseFloat(form.amount),
      description: form.description,
      date: form.date,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['report'] });
      setShowForm(false);
      setForm({ categoryId: '', amount: '', description: '', date: new Date().toISOString().split('T')[0] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => expensesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['report'] });
    },
  });

  if (isLoading) return <Loading />;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <PageHeader title="Despesas" subtitle="Gerencie seus lançamentos" />
        <Button onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancelar' : 'Nova Despesa'}</Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <form
            onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <div>
              <label className="block text-sm font-medium mb-1">Categoria</label>
              <Select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} required>
                <option value="">Selecione...</option>
                {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Valor</label>
              <Input type="number" step="0.01" min="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Descrição</label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Data</label>
              <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" disabled={createMutation.isPending}>Salvar</Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-slate-500">
                <th className="pb-3">Data</th>
                <th className="pb-3">Descrição</th>
                <th className="pb-3">Categoria</th>
                <th className="pb-3">Valor</th>
                <th className="pb-3">Origem</th>
                <th className="pb-3"></th>
              </tr>
            </thead>
            <tbody>
              {expenses?.map((exp) => (
                <tr key={exp.id} className="border-b last:border-0">
                  <td className="py-3">{formatDate(exp.date)}</td>
                  <td className="py-3">{exp.description}</td>
                  <td className="py-3">
                    <span className="inline-flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: exp.category?.color }} />
                      {exp.category?.name}
                    </span>
                  </td>
                  <td className="py-3 font-medium">{formatCurrency(exp.amount)}</td>
                  <td className="py-3 text-slate-500">{exp.source === 'RECURRING' ? 'Recorrente' : 'Manual'}</td>
                  <td className="py-3">
                    <button
                      onClick={() => deleteMutation.mutate(exp.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
              {expenses?.length === 0 && (
                <tr><td colSpan={6} className="py-8 text-center text-slate-400">Nenhuma despesa encontrada</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
