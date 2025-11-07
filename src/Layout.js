import React, { useState, useEffect } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { 
  Map, 
  AlertTriangle, 
  TrendingUp, 
  Database,
  Menu,
  X,
  LogOut,
  Settings,
  Bell,
  ChevronLeft,
  ChevronRight,
  AlertCircle
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './Components/ui/dialog';

const navigationItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Map,
    description: "Visão geral do sistema"
  },
  {
    title: "Alertas",
    url: "/alertas",
    icon: AlertTriangle,
    description: "Monitoramento de alertas"
  },
  {
    title: "Análise Preditiva",
    url: "/analise-preditiva",
    icon: TrendingUp,
    description: "Análise com IA"
  },
  {
    title: "Histórico",
    url: "/historico",
    icon: Database,
    description: "Dados históricos"
  },
];

export default function Layout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notificationCount] = useState(3);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  
  const user = {
    full_name: "Administrador",
    email: "admin@ecomonitor.br",
    avatar: "A"
  };

  const handleLogout = () => {
    setLogoutDialogOpen(true);
  };

  const confirmLogout = () => {
    console.log("Logout realizado");
    setLogoutDialogOpen(false);
  };

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 flex relative overflow-hidden">
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed lg:fixed inset-y-0 left-0 z-50 lg:z-30
        transform transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${sidebarCollapsed ? 'w-20 xl:w-24' : 'w-[280px] xl:w-80'}
        bg-gradient-to-b from-white to-slate-50
        flex flex-col shadow-2xl lg:shadow-lg
        border-r border-slate-200
        h-screen
      `}>
        <div className="p-4 sm:p-6 border-b border-slate-200 bg-gradient-to-br from-emerald-600 via-green-600 to-emerald-700 relative overflow-hidden shrink-0">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full blur-2xl"></div>
          </div>
          
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              {!sidebarCollapsed ? (
                <>
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-xl ring-2 ring-white/30 shrink-0">
                      <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <h1 className="text-xl sm:text-2xl font-bold text-white drop-shadow-lg truncate">EcoMonitor</h1>
                      <p className="text-xs text-emerald-100 font-medium">Brasil</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSidebarCollapsed(true)}
                    className="hidden lg:flex text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-all shrink-0"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="lg:hidden text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-all shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </>
              ) : (
                <>
                  <div className="w-full flex justify-center">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-xl ring-2 ring-white/30">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
              </div>
              </div>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="lg:hidden text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-all shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
            {!sidebarCollapsed && (
              <div className="flex items-center gap-2 text-xs sm:text-sm bg-white/20 backdrop-blur-sm px-2 sm:px-3 py-1.5 rounded-lg inline-block">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shrink-0"></div>
                <span className="text-white font-medium truncate">Sistema Online</span>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 p-3 sm:p-4 space-y-2 overflow-y-auto">
          {!sidebarCollapsed && (
            <div className="mb-3 sm:mb-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-2 sm:px-4 py-2">
                Menu Principal
              </h3>
            </div>
          )}
          
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.url;
            const Icon = item.icon;
            
            return (
                <Link 
                  key={item.title}
                  to={item.url}
                title={sidebarCollapsed ? item.title : ''}
                className={`
                  group relative flex items-center ${sidebarCollapsed ? 'justify-center' : ''} gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3.5 
                  rounded-xl transition-all duration-200
                  ${isActive 
                    ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/30 scale-[1.01] sm:scale-[1.02]' 
                    : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 hover:shadow-md'
                  }
                  transform hover:scale-[1.01] sm:hover:scale-[1.02] active:scale-[0.98]
                `}
              >
                <div className={`
                  p-1.5 sm:p-2 rounded-lg transition-all shrink-0
                  ${isActive 
                    ? 'bg-white/20' 
                    : 'bg-slate-100 group-hover:bg-emerald-100'
                  }
                `}>
                  <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'text-white' : 'text-slate-600'}`} />
                </div>
                
                {!sidebarCollapsed && (
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-xs sm:text-sm truncate">{item.title}</div>
                    <div className={`text-xs hidden sm:block ${
                      isActive ? 'text-emerald-100' : 'text-slate-400 group-hover:text-emerald-600'
                    }`}>
                      {item.description}
                    </div>
                  </div>
                )}
                
                {isActive && !sidebarCollapsed && (
                  <div className="absolute right-2 sm:right-3 w-2 h-2 bg-white rounded-full animate-pulse shrink-0" />
                )}
                </Link>
            );
          })}
            </nav>

        {!sidebarCollapsed && (
          <div className="px-3 sm:px-4 pb-3 sm:pb-4 shrink-0">
            <button className="w-full flex items-center justify-between p-2.5 sm:p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors group">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="p-1.5 sm:p-2 bg-blue-500 text-white rounded-lg shrink-0">
                  <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <div className="text-left min-w-0">
                  <p className="text-xs sm:text-sm font-semibold text-blue-900 truncate">Notificações</p>
                  <p className="text-xs text-blue-600 hidden sm:block">{notificationCount} alertas ativos</p>
                </div>
              </div>
              {notificationCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-full shrink-0">
                  {notificationCount}
                </span>
              )}
            </button>
          </div>
        )}

        <div className="p-3 sm:p-4 border-t border-slate-200 bg-slate-50/50 shrink-0">
          {sidebarCollapsed ? (
            <div className="space-y-2">
              <button className="w-full flex items-center justify-center p-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-all hover:shadow-sm group">
                <Settings className="w-5 h-5 text-slate-700 group-hover:rotate-90 transition-transform duration-500" />
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center p-2 bg-white hover:bg-red-50 border border-red-200 rounded-lg transition-all hover:shadow-sm"
              >
                <LogOut className="w-5 h-5 text-red-600" />
              </button>
              <button
                onClick={() => setSidebarCollapsed(false)}
                className="w-full flex items-center justify-center p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all hover:shadow-sm"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 sm:gap-3 mb-3 p-2.5 sm:p-3 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="relative shrink-0">
                  <div className="w-9 h-9 sm:w-11 sm:h-11 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    {user.avatar}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 text-xs sm:text-sm truncate">{user.full_name}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  </div>
                </div>
              
              <div className="grid grid-cols-2 gap-2">
                <button
                  className="flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-all hover:shadow-sm group"
                >
                  <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:rotate-90 transition-transform duration-500" />
                  <span className="font-medium">Config</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm text-red-600 bg-white hover:bg-red-50 border border-red-200 rounded-lg transition-all hover:shadow-sm"
                >
                  <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="font-medium">Sair</span>
                </button>
              </div>
            </>
          )}
        </div>
      </aside>

      <main className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20 xl:ml-24' : 'lg:ml-[280px] xl:ml-[320px]'}`}>
        <header className="lg:hidden bg-white/80 backdrop-blur-sm border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6 text-slate-700" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-lg font-bold text-slate-900">EcoMonitor</h1>
          </div>
          <div className="relative">
            {notificationCount > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {notificationCount}
              </div>
            )}
            <Bell className="w-6 h-6 text-slate-600" />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>

      {/* Logout Dialog */}
      <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <DialogTitle className="text-center">Sair do Sistema?</DialogTitle>
            <DialogDescription className="text-center text-base">
              Tem certeza que deseja sair? Você precisará fazer login novamente para acessar.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              onClick={() => setLogoutDialogOpen(false)}
              className="flex-1 px-6 py-3 text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-all duration-200"
            >
              Cancelar
            </button>
            <button
              onClick={confirmLogout}
              className="flex-1 px-6 py-3 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-all duration-200 shadow-lg shadow-red-600/20"
            >
              <LogOut className="w-4 h-4 inline-block mr-2" />
              Sair Agora
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}