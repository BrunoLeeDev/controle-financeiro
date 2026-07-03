import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesApi } from '../api/services';
import { Button, Card, Input, Loading, PageHeader } from '../components/ui';

const COLORS = ['#ef4444', '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#6366f1'];

export function CategoriesPage() {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.list().then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: () => categoriesApi.create({ name, color }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setName('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoriesApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });

  if (isLoading) return <Loading />;

  return (
    <div>
      <PageHeader title="Categorias" subtitle="Organize suas despesas por categoria" />

      <Card className="mb-6">
        <form
          onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }}
          className="flex flex-wrap gap-4 items-end"
        >
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium mb-1">Nome</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Cor</label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full border-2 ${color === c ? 'border-slate-900' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <Button type="submit" disabled={createMutation.isPending}>Adicionar</Button>
        </form>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories?.map((cat) => (
          <Card key={cat.id} className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="w-4 h-4 rounded-full" style={{ backgroundColor: cat.color }} />
              <span className="font-medium">{cat.name}</span>
            </div>
            <button
              onClick={() => deleteMutation.mutate(cat.id)}
              className="text-red-500 hover:text-red-700 text-sm"
            >
              Excluir
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}
