import React from "react";
import { base44 } from "../api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from '../Components/ui/card';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { 
  Database, 
  TrendingUp, 
  Calendar, 
  AlertTriangle, 
  Thermometer, 
  Activity,
  Shield,
  MapPin
} from "lucide-react";

interface MonitoringPoint {
  temperatura: number;
  nivel_fumaca: number;
  nivel_risco: "baixo" | "medio" | "alto" | "critico";
  regiao: string;
  estado: string;
}

interface Alert {
  regiao: string;
  status: string;
  nivel_criticidade: string;
}

export default function Dashboard() {
  const { data: monitoringPoints = [], isLoading: loadingPoints, isError: errorPoints } = useQuery<MonitoringPoint[]>({
    queryKey: ['monitoringPoints'],
    queryFn: () => base44.entities.MonitoringPoint.list('-data_medicao', 100),
  });

  const { data: alerts = [], isLoading: loadingAlerts, isError: errorAlerts } = useQuery<Alert[]>({
    queryKey: ['alerts'],
    queryFn: () => base44.entities.Alert.list('-created_date', 50),
  });

  // Calcular estatísticas
  const avgTemp = monitoringPoints.length > 0
    ? (monitoringPoints.reduce((sum, p) => sum + p.temperatura, 0) / monitoringPoints.length).toFixed(1)
    : '0';

  const criticalPoints = monitoringPoints.filter(p => 
    p.nivel_risco === 'critico' || p.nivel_risco === 'alto'
  ).length;

  const activeAlerts = alerts.filter(a => a.status === 'ativo').length;

  const regions = Array.from(new Set(monitoringPoints.map(p => p.regiao)));

  // Preparar dados para gráficos
  const temperatureData = monitoringPoints
    .slice(0, 20)
    .reverse()
    .map((point, index) => ({
      name: `P${index + 1}`,
      temperatura: point.temperatura,
      fumaca: point.nivel_fumaca
    }));

  const riskData = [
    { name: 'Baixo', value: monitoringPoints.filter(p => p.nivel_risco === 'baixo').length, color: '#10b981' },
    { name: 'Médio', value: monitoringPoints.filter(p => p.nivel_risco === 'medio').length, color: '#f59e0b' },
    { name: 'Alto', value: monitoringPoints.filter(p => p.nivel_risco === 'alto').length, color: '#ef4444' },
    { name: 'Crítico', value: monitoringPoints.filter(p => p.nivel_risco === 'critico').length, color: '#991b1b' }
  ].filter(item => item.value > 0);

  const regionAlerts = alerts.reduce((acc, alert) => {
    acc[alert.regiao] = (acc[alert.regiao] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const regionData = Object.entries(regionAlerts).map(([name, value]) => ({ name, value }));

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 mt-1">Visão geral do sistema de monitoramento</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <MapPin className="w-4 h-4" />
          <span>{regions.length} regiões monitoradas</span>
        </div>
      </div>

      {/* Connection Error Banner */}
      {(errorPoints || errorAlerts || (monitoringPoints.length === 0 && !loadingPoints && !loadingAlerts)) && (
        <Card className="border-2 border-orange-300 bg-orange-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-orange-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-orange-900 mb-1">Problema de Conectividade</h3>
                <p className="text-sm text-orange-700">
                  Não foi possível conectar ao banco de dados do Supabase. Verifique sua conexão com a internet ou entre em contato com o suporte.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <Thermometer className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900">{avgTemp}°C</p>
            <p className="text-sm text-slate-600 mt-1">Temperatura média</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900">{activeAlerts}</p>
            <p className="text-sm text-slate-600 mt-1">Alertas ativos</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-amber-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900">{criticalPoints}</p>
            <p className="text-sm text-slate-600 mt-1">Pontos críticos</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900">{monitoringPoints.length}</p>
            <p className="text-sm text-slate-600 mt-1">Total monitorado</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Tendência */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
            Tendência de Temperatura e Fumaça
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={temperatureData}>
              <defs>
                <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorFumaca" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#64748b" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#64748b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '2px solid #e2e8f0',
                  borderRadius: '12px'
                }}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="temperatura" 
                stroke="#ef4444" 
                strokeWidth={2}
                fill="url(#colorTemp)"
                name="Temperatura (°C)"
              />
              <Area 
                type="monotone" 
                dataKey="fumaca" 
                stroke="#64748b" 
                strokeWidth={2}
                fill="url(#colorFumaca)"
                name="Fumaça (%)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Distribuição de Risco */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Database className="w-6 h-6 text-blue-600" />
              Distribuição de Níveis de Risco
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {riskData.map((item) => (
                <div key={item.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: item.color }} />
                      <span className="font-medium text-slate-700">{item.name}</span>
                    </div>
                    <span className="text-slate-500">{item.value} pontos</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className="h-full transition-all duration-500 rounded-full"
                      style={{ 
                        width: `${monitoringPoints.length > 0 ? (item.value / monitoringPoints.length) * 100 : 0}%`,
                        backgroundColor: item.color 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Alertas por Região */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
              Alertas por Região
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={regionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '2px solid #e2e8f0',
                    borderRadius: '12px'
                  }}
                />
                <Bar 
                  dataKey="value" 
                  fill="url(#colorGradient)" 
                  radius={[8, 8, 0, 0]}
                  name="Alertas"
                />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}