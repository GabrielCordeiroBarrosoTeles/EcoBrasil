import React from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { 
  Map, 
  AlertTriangle, 
  TrendingUp, 
  Database,
  Flame,
  CloudRain,
  LogOut
} from "lucide-react";

const navigationItems = [
  {
    title: "Dashboard",
    url: "/", // Rota da página inicial
    icon: Map,
  },
  {
    title: "Análise Preditiva",
    url: "/analise-preditiva",
    icon: TrendingUp,
  },
  {
    title: "Alertas",
    url: "/alertas",
    icon: AlertTriangle,
  },
  {
    title: "Dados Históricos",
    url: "/historico",
    icon: Database,
  },
];

const Sidebar = ({ children }) => <div className="w-64 flex-shrink-0">{children}</div>;

export default function Layout() {
  const location = useLocation();
  
  const user = {
    full_name: "Usuário Teste",
    email: "usuario@teste.com"
  };

  const handleLogout = () => {
    // No futuro, aqui iria a lógica de logout
    alert("Função de Logout");
  };

  return (
    <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 to-blue-50">
      {}
      <Sidebar>
        <div className="border-r border-slate-200 bg-white/95 backdrop-blur h-full flex flex-col">
          {/* Header da Sidebar */}
          <div className="border-b border-slate-200 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-lg">EcoMonitor</h2>
                <p className="text-xs text-slate-500">Sistema de Monitoramento</p>
              </div>
            </div>
          </div>
          
          {/* Conteúdo da Sidebar (Navegação) */}
          <div className="p-3 flex-1">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2">Navegação</h3>
            <nav>
              {navigationItems.map((item) => (
                <Link 
                  key={item.title}
                  to={item.url}
                  className={`flex items-center gap-3 px-4 py-3 hover:bg-green-50 hover:text-green-700 transition-all duration-200 rounded-xl mb-1 ${
                    location.pathname === item.url ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md' : ''
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.title}</span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Footer da Sidebar */}
          <div className="border-t border-slate-200 p-4">
            {user && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {user.full_name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 text-sm truncate">{user.full_name}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                >
                  <LogOut className="w-4 h-4" />
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </Sidebar>

      <main className="flex-1 flex flex-col">
        {}
        {}
        <div className="flex-1 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}