import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recurringApi, categoriesApi } from '../api/services';
import { Button, Card, Input, Loading, PageHeader, Select } from '../components/ui';
import { formatCurrency } from '../utils/format';

export function RecurringPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ categoryId: '', amount: '', description: '', dayOfMonth: '1' });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.list().then((r) => r.data),
  });

  const { data: items, isLoading } = useQuery({
    queryKey: ['recurring'],
    queryFn: () => recurringApi.list().then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: () => recurringApi.create({
      categoryId: form.categoryId,
      amount: parseFloat(form.amount),
      description: form.description,
      dayOfMonth: parseInt(form.dayOfMonth),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring'] });
      setForm({ categoryId: '', amount: '', description: '', dayOfMonth: '1' });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      recurringApi.update(id, { active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['recurring'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => recurringApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['recurring'] }),
  });

  if (isLoading) return <Loading />;

  return (
    <div>
      <PageHeader title="Despesas Recorrentes" subtitle="Lançamentos automáticos mensais" />

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
            <label className="block text-sm font-medium mb-1">Dia do mês</label>
            <Input type="number" min="1" max="31" value={form.dayOfMonth} onChange={(e) => setForm({ ...form, dayOfMonth: e.target.value })} required />
          </div>
          <div className="md:col-span-2">
            <Button type="submit" disabled={createMutation.isPending}>Adicionar</Button>
          </div>
        </form>
      </Card>

      <div className="space-y-3">
        {items?.map((item) => (
          <Card key={item.id} className="flex justify-between items-center">
            <div>
              <p className="font-medium">{item.description}</p>
              <p className="text-sm text-slate-500">
                {formatCurrency(item.amount)} · Dia {item.dayOfMonth} · {item.category?.name}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => toggleMutation.mutate({ id: item.id, active: !item.active })}
                className={`text-sm px-3 py-1 rounded-full ${item.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}
              >
                {item.active ? 'Ativo' : 'Inativo'}
              </button>
              <button onClick={() => deleteMutation.mutate(item.id)} className="text-red-500 text-sm hover:text-red-700">
                Excluir
              </button>
            </div>
          </Card>
        ))}
        {items?.length === 0 && (
          <Card><p className="text-center text-slate-400">Nenhuma despesa recorrente cadastrada</p></Card>
        )}
      </div>
    </div>
  );
}
