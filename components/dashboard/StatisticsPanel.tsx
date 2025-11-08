import React from "react";
import { Card, CardContent } from "../ui/card";
import { Activity, AlertTriangle, Thermometer, Cloud } from "lucide-react";

// Define o formato de um Ponto de Monitoramento
interface MonitoringPoint {
  temperatura: number;
  nivel_fumaca: number;
  nivel_risco: "baixo" | "medio" | "alto" | "critico";
}

// Define o formato de um Alerta
interface Alert {
  status: 'ativo' | 'inativo';
}

// Define o formato das props que o componente StatisticsPanel recebe
interface StatisticsPanelProps {
  monitoringPoints: MonitoringPoint[];
  alerts: Alert[];
  loading: boolean;
}

// --- COMPONENTE COM A TIPAGEM APLICADA ---
export default function StatisticsPanel({ monitoringPoints, alerts, loading }: StatisticsPanelProps) {
  const avgTemperature = monitoringPoints.length > 0
    ? (monitoringPoints.reduce((sum, p) => sum + (p.temperatura || 0), 0) / monitoringPoints.length).toFixed(1)
    : 0;

  const avgSmoke = monitoringPoints.length > 0
    ? (monitoringPoints.reduce((sum, p) => sum + (p.nivel_fumaca || 0), 0) / monitoringPoints.length).toFixed(1)
    : 0;

  const criticalPoints = monitoringPoints.filter(p => p.nivel_risco === 'critico' || p.nivel_risco === 'alto').length;
  const activeAlerts = alerts.filter(a => a.status === 'ativo').length;

  const stats = [
    {
      title: "Pontos Monitorados",
      value: monitoringPoints.length,
      icon: Activity,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Alertas Ativos",
      value: activeAlerts,
      icon: AlertTriangle,
      color: "from-orange-500 to-red-600",
      bgColor: "bg-orange-50"
    },
    {
      title: "Temperatura Média",
      value: `${avgTemperature}°C`,
      icon: Thermometer,
      color: "from-red-500 to-pink-600",
      bgColor: "bg-red-50"
    },
    {
      title: "Nível Médio de Fumaça",
      value: `${avgSmoke}%`,
      icon: Cloud,
      color: "from-slate-500 to-slate-600",
      bgColor: "bg-slate-50"
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-24 bg-slate-200 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <Card key={index} className="relative overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} rounded-full opacity-10 transform translate-x-8 -translate-y-8`} />
          <CardContent className="p-6 relative">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 bg-gradient-to-br ${stat.color} bg-clip-text text-transparent`} style={{WebkitTextFillColor: 'transparent', backgroundClip: 'text'}} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}