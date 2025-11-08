'use client'

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  AlertTriangle,
  Calendar,
  Database,
  Thermometer,
  TrendingUp,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { addDays, isAfter, parseISO } from "date-fns";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { apiClient } from "../../lib/apiClient";
import type { Alert, MonitoringPoint, RiskLevel } from "../../types/api";

type PeriodFilter = "7" | "30" | "90" | "all";

const RISK_LABEL: Record<RiskLevel, string> = {
  baixo: "Baixo",
  medio: "Médio",
  alto: "Alto",
  critico: "Crítico",
};

const RISK_COLOR: Record<RiskLevel, string> = {
  baixo: "#10b981",
  medio: "#f59e0b",
  alto: "#ef4444",
  critico: "#991b1b",
};

export default function Historico() {
  const [period, setPeriod] = useState<PeriodFilter>("30");

  const {
    data: monitoringPoints = [],
    isLoading,
  } = useQuery<MonitoringPoint[], Error>({
    queryKey: ["historicalPoints"],
    queryFn: () => apiClient.getMonitoringPoints({ limit: 300 }),
  });

  const { data: alerts = [] } = useQuery<Alert[], Error>({
    queryKey: ["historicalAlerts"],
    queryFn: () => apiClient.getAlerts({ limit: 200 }),
  });

  const cutoffDate = useMemo(() => {
    if (period === "all") {
      return null;
    }
    const days = Number(period);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return addDays(today, -days);
  }, [period]);

  const filteredPoints = useMemo(() => {
    if (!cutoffDate) return monitoringPoints;

    return monitoringPoints.filter((point) => {
      const rawDate = point.data_medicao ?? point.created_at;
      if (!rawDate) return false;
      const pointDate = typeof rawDate === "string" ? parseISO(rawDate) : new Date(rawDate);
      return isAfter(pointDate, cutoffDate) || pointDate.getTime() === cutoffDate.getTime();
    });
  }, [monitoringPoints, cutoffDate]);

  const filteredAlerts = useMemo(() => {
    if (!cutoffDate) return alerts;

    return alerts.filter((alert) => {
      const rawDate = alert.created_at ?? alert.data_inicio ?? alert.created_date;
      if (!rawDate) return false;
      const alertDate = typeof rawDate === "string" ? parseISO(rawDate) : new Date(rawDate);
      return isAfter(alertDate, cutoffDate) || alertDate.getTime() === cutoffDate.getTime();
    });
  }, [alerts, cutoffDate]);

  const temperatureSeries = useMemo(() => {
    const sorted = [...filteredPoints].sort(
      (a, b) =>
        new Date(a.data_medicao ?? a.created_at ?? 0).getTime() -
        new Date(b.data_medicao ?? b.created_at ?? 0).getTime(),
    );

    return sorted.slice(-30).map((point) => ({
      name: format(new Date(point.data_medicao ?? point.created_at ?? Date.now()), "dd/MM", { locale: ptBR }),
      temperatura: point.temperatura,
      fumaca: point.nivel_fumaca,
    }));
  }, [filteredPoints]);

  const riskDistribution = useMemo(() => {
    const totals: Record<RiskLevel, number> = {
      baixo: 0,
      medio: 0,
      alto: 0,
      critico: 0,
    };

    filteredPoints.forEach((point) => {
      totals[point.nivel_risco] += 1;
    });

    return (Object.keys(totals) as RiskLevel[])
      .map((level) => ({
        name: RISK_LABEL[level],
        value: totals[level],
        color: RISK_COLOR[level],
      }))
      .filter((item) => item.value > 0);
  }, [filteredPoints]);

  const alertsByRegion = useMemo(() => {
    const reducer = filteredAlerts.reduce<Record<string, number>>((acc, alert) => {
      const region = String(alert.regiao ?? "Indefinido");
      acc[region] = (acc[region] ?? 0) + 1;
      return acc;
    }, {});

    return Object.entries(reducer).map(([name, value]) => ({ name, value }));
  }, [filteredAlerts]);

  const averageTemperature = useMemo(() => {
    if (!filteredPoints.length) return 0;
    const total = filteredPoints.reduce(
      (sum, point) => sum + point.temperatura,
      0,
    );
    return Number((total / filteredPoints.length).toFixed(1));
  }, [filteredPoints]);

  const trendIndicator = useMemo(() => {
    if (filteredPoints.length < 10) {
      return { direction: "stable", percentage: 0 };
    }

    const middle = Math.floor(filteredPoints.length / 2);
    const older = filteredPoints.slice(0, middle);
    const recent = filteredPoints.slice(middle);

    const avg = (points: MonitoringPoint[]) =>
      points.reduce((sum, point) => sum + point.temperatura, 0) / points.length;

    const olderAvg = avg(older);
    const recentAvg = avg(recent);
    const percentage = olderAvg === 0 ? 0 : ((recentAvg - olderAvg) / olderAvg) * 100;

    if (percentage > 5) return { direction: "up", percentage: Number(percentage.toFixed(1)) };
    if (percentage < -5) return { direction: "down", percentage: Number(Math.abs(percentage).toFixed(1)) };
    return { direction: "stable", percentage: Number(Math.abs(percentage).toFixed(1)) };
  }, [filteredPoints]);

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 space-y-6">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
            Dados históricos
          </h1>
          <p className="text-slate-600 mt-1">
            Tendências e estatísticas consolidada dos pontos monitorados
          </p>
        </div>

        <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
          <Calendar className="w-5 h-5 text-slate-500" />
          <select
            value={period}
            onChange={(event) => setPeriod(event.target.value as PeriodFilter)}
            className="bg-transparent border-none outline-none text-sm font-medium text-slate-700 cursor-pointer"
          >
            <option value="7">Últimos 7 dias</option>
            <option value="30">Últimos 30 dias</option>
            <option value="90">Últimos 90 dias</option>
            <option value="all">Todo o período</option>
          </select>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total de registros</p>
                <p className="text-3xl font-bold text-slate-900">
                  {filteredPoints.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Database className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Temperatura média</p>
                <p className="text-3xl font-bold text-slate-900">{averageTemperature}°C</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <Thermometer className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Tendência térmica</p>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-2xl font-bold ${
                      trendIndicator.direction === "up"
                        ? "text-red-600"
                        : trendIndicator.direction === "down"
                          ? "text-emerald-600"
                          : "text-slate-400"
                    }`}
                  >
                    {trendIndicator.direction === "up"
                      ? "↑"
                      : trendIndicator.direction === "down"
                        ? "↓"
                        : "→"}
                  </span>
                  <p className="text-2xl font-bold text-slate-900">
                    {trendIndicator.percentage}%
                  </p>
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Alertas ativos</p>
                <p className="text-3xl font-bold text-slate-900">
                  {filteredAlerts.filter((alert) => alert.status === "ativo").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Activity className="w-6 h-6 text-emerald-600" />
            Evolução de temperatura e fumaça
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[380px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={temperatureSeries}>
              <defs>
                <linearGradient id="histTemp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="histFumaca" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#64748b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#64748b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "2px solid #e2e8f0",
                  borderRadius: "12px",
                }}
              />
              <Area
                type="monotone"
                dataKey="temperatura"
                stroke="#ef4444"
                strokeWidth={2}
                fill="url(#histTemp)"
                name="Temperatura (°C)"
              />
              <Area
                type="monotone"
                dataKey="fumaca"
                stroke="#64748b"
                strokeWidth={2}
                fill="url(#histFumaca)"
                name="Fumaça (%)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <section className="grid md:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Database className="w-6 h-6 text-blue-600" />
              Distribuição de risco no período
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {riskDistribution.map((item) => (
              <div key={item.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium text-slate-700">{item.name}</span>
                  </div>
                  <span className="text-slate-500">{item.value} pontos</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full transition-all duration-500 rounded-full"
                    style={{
                      width: `${
                        filteredPoints.length
                          ? (item.value / filteredPoints.length) * 100
                          : 0
                      }%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
              Alertas registrados por região
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={alertsByRegion}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "2px solid #e2e8f0",
                    borderRadius: "12px",
                  }}
                />
                <Bar
                  dataKey="value"
                  fill="url(#histAlerts)"
                  radius={[8, 8, 0, 0]}
                  name="Alertas"
                />
                <defs>
                  <linearGradient id="histAlerts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.85} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.85} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>

      {isLoading && (
        <p className="text-sm text-slate-500">Carregando dados históricos...</p>
      )}
    </div>
  );
}

