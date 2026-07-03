import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/expenses', label: 'Despesas' },
  { to: '/categories', label: 'Categorias' },
  { to: '/budgets', label: 'Orçamentos' },
  { to: '/recurring', label: 'Recorrentes' },
  { to: '/reports', label: 'Relatórios' },
];

export function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-xl font-bold">Controle Financeiro</h1>
          <p className="text-sm text-slate-400 mt-1">{user?.name}</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `block px-4 py-2 rounded-lg transition-colors ${
                  isActive ? 'bg-primary-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={logout}
          className="m-4 px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
        >
          Sair
        </button>
      </aside>
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
