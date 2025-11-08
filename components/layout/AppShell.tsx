'use client'

import { ReactNode, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Bell,
  ChevronLeft,
  ChevronRight,
  Database,
  LogOut,
  Map,
  Menu,
  Settings,
  TrendingUp,
  X,
} from "lucide-react";

import { cn } from "../../lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

type NavigationItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
};

const navigationItems: NavigationItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Map,
    description: "Visão geral do sistema",
  },
  {
    title: "Alertas",
    href: "/alertas",
    icon: AlertTriangle,
    description: "Monitoramento de alertas",
  },
  {
    title: "Análise Preditiva",
    href: "/analise",
    icon: TrendingUp,
    description: "Análise com IA",
  },
  {
    title: "Histórico",
    href: "/historico",
    icon: Database,
    description: "Dados históricos",
  },
];

const user = {
  fullName: "Administrador",
  email: "admin@ecomonitor.br",
  initials: "A",
};

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const notificationCount = 3;

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const activeHref = useMemo(() => {
    if (!pathname) return "/dashboard";
    const match = navigationItems.find((item) => pathname.startsWith(item.href));
    return match ? match.href : "/dashboard";
  }, [pathname]);

  return (
    <div className="flex min-h-screen bg-slate-50">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-screen flex-col border-r border-slate-200 bg-gradient-to-b from-white to-slate-50 shadow-2xl transition-all duration-300 ease-in-out lg:z-30",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          sidebarCollapsed ? "w-20 xl:w-24" : "w-[260px] lg:w-[280px] xl:w-[320px]",
        )}
      >
        <div className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-br from-emerald-600 via-green-600 to-emerald-700 p-5">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-white blur-2xl" />
            <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-white blur-3xl" />
          </div>

          <div className="relative flex items-center justify-between">
            {!sidebarCollapsed ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md text-white shadow-xl ring-2 ring-white/30">
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white drop-shadow">EcoMonitor</h1>
                    <p className="text-xs font-medium text-emerald-100">Brasil</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSidebarCollapsed(true)}
                    className="hidden rounded-lg p-2 text-white/80 transition hover:bg-white/20 hover:text-white lg:flex"
                    aria-label="Recolher barra lateral"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="rounded-lg p-2 text-white/80 transition hover:bg-white/20 hover:text-white lg:hidden"
                    aria-label="Fechar barra lateral"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex w-full justify-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md text-white shadow-xl ring-2 ring-white/30">
                    <svg
                      className="h-7 w-7"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="rounded-lg p-2 text-white/80 transition hover:bg-white/20 hover:text-white lg:hidden"
                  aria-label="Fechar barra lateral"
                >
                  <X className="h-5 w-5" />
                </button>
              </>
            )}
          </div>

          {!sidebarCollapsed && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white/20 px-3 py-1.5 text-xs font-medium text-white backdrop-blur">
              <div className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
              Sistema Online
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          {!sidebarCollapsed && (
            <div className="mb-4 px-2 text-xs font-bold uppercase tracking-wide text-slate-500">
              Menu principal
            </div>
          )}

          <div className="space-y-2">
            {navigationItems.map((item) => {
              const isActive = activeHref === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all",
                    sidebarCollapsed && "justify-center",
                    isActive
                      ? "scale-[1.02] bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/30"
                      : "text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 hover:shadow",
                  )}
                  title={sidebarCollapsed ? item.title : undefined}
                >
                  <span
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg transition",
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-700",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </span>

                  {!sidebarCollapsed && (
                    <span className="flex-1">
                      <span className="block text-sm font-semibold">{item.title}</span>
                      <span
                        className={cn(
                          "mt-0.5 block text-xs transition",
                          isActive ? "text-emerald-100" : "text-slate-400 group-hover:text-emerald-600",
                        )}
                      >
                        {item.description}
                      </span>
                    </span>
                  )}

                  {isActive && !sidebarCollapsed && (
                    <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-slate-200 bg-slate-50/60 p-4">
          {!sidebarCollapsed ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                <div className="relative">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white text-lg font-bold shadow-lg">
                    {user.initials}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{user.fullName}</p>
                  <p className="truncate text-xs text-slate-500">{user.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-medium">
                <button className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-700 shadow-sm transition hover:bg-slate-50">
                  <Settings className="h-4 w-4" />
                  Config
                </button>
                <button
                  onClick={() => setLogoutDialogOpen(true)}
                  className="flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-3 py-2 text-red-600 shadow-sm transition hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50">
                <Settings className="h-5 w-5" />
              </button>
              <button
                onClick={() => setLogoutDialogOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-red-200 bg-white text-red-600 shadow-sm transition hover:bg-red-50"
              >
                <LogOut className="h-5 w-5" />
              </button>
              <button
                onClick={() => setSidebarCollapsed(false)}
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm transition hover:bg-emerald-700"
                aria-label="Expandir barra lateral"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </aside>

      <div
        className={cn(
          "flex min-h-screen flex-1 flex-col transition-all duration-300",
          sidebarCollapsed ? "lg:ml-20 xl:ml-24" : "lg:ml-[260px] lg:w-[calc(100%-260px)] xl:ml-[320px]",
        )}
      >
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/80 px-4 py-3 backdrop-blur lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-slate-600 transition hover:bg-slate-100"
            aria-label="Abrir menu lateral"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 text-white">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-lg font-bold text-slate-900">EcoMonitor</h1>
          </div>
          <div className="relative">
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white">
                {notificationCount}
              </span>
            )}
            <Bell className="h-6 w-6 text-slate-600" />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>

      <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <DialogTitle className="text-center text-xl">Sair do sistema?</DialogTitle>
            <DialogDescription className="text-center text-base">
              Tem certeza que deseja sair? Você precisará fazer login novamente para acessar o painel.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              onClick={() => setLogoutDialogOpen(false)}
              className="flex-1 rounded-lg bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
            >
              Cancelar
            </button>
            <button
              onClick={() => setLogoutDialogOpen(false)}
              className="flex-1 rounded-lg bg-red-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-red-500/30 transition hover:bg-red-700"
            >
              <LogOut className="mr-2 inline-block h-4 w-4" />
              Sair agora
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

