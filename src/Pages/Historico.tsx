import React, { useState } from "react";
import { base44 } from "../api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../Components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from "recharts";
import { Database, TrendingUp, Calendar, Thermometer, AlertTriangle, Activity } from "lucide-react";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MonitoringPoint {
  temperatura: number;
  nivel_fumaca: number;
  nivel_risco: "baixo" | "medio" | "alto" | "critico";
  data_medicao: string;
  regiao: string;
}

interface Alert {
  regiao: string;
  status: string;
  nivel_criticidade: string;
}

export default function Historico() {
  const [selectedPeriod, setSelectedPeriod] = useState<'7' | '30' | '90' | 'all'>('30');
  
  const { data: monitoringPoints = [], isLoading } = useQuery<MonitoringPoint[]>({
    queryKey: ['historicalData'],
    queryFn: () => base44.entities.MonitoringPoint.list('-data_medicao', 100),
  });

  const { data: alerts = [] } = useQuery<Alert[]>({
    queryKey: ['historicalAlerts'],
    queryFn: () => base44.entities.Alert.list('-created_date', 50),
  });

  // Filtrar dados por período
  const getFilteredData = () => {
    if (selectedPeriod === 'all') return monitoringPoints;
    
    const daysAgo = parseInt(selectedPeriod);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
    
    return monitoringPoints.filter(point => {
      const pointDate = new Date(point.data_medicao);
      return pointDate >= cutoffDate;
    });
  };

  const filteredPoints = getFilteredData();

  // Preparar dados para gráficos
  const temperatureData = filteredPoints
    .slice(0, 30)
    .reverse()
    .map((point, index) => ({
      name: format(new Date(point.data_medicao), "dd/MM", { locale: ptBR }),
      temperatura: point.temperatura,
      fumaca: point.nivel_fumaca
    }));

  const riskData = [
    { name: 'Baixo', value: filteredPoints.filter(p => p.nivel_risco === 'baixo').length, color: '#10b981' },
    { name: 'Médio', value: filteredPoints.filter(p => p.nivel_risco === 'medio').length, color: '#f59e0b' },
    { name: 'Alto', value: filteredPoints.filter(p => p.nivel_risco === 'alto').length, color: '#ef4444' },
    { name: 'Crítico', value: filteredPoints.filter(p => p.nivel_risco === 'critico').length, color: '#991b1b' }
  ].filter(item => item.value > 0);

  const regionAlerts = alerts.reduce((acc, alert) => {
    acc[alert.regiao] = (acc[alert.regiao] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const regionData = Object.entries(regionAlerts).map(([name, value]) => ({ name, value }));

  // Análise de tendência
  const calculateTrend = (points: MonitoringPoint[]) => {
    if (points.length < 2) return { direction: 'stable', percentage: 0 };
    
    const recent = points.slice(0, Math.floor(points.length / 2));
    const older = points.slice(Math.floor(points.length / 2));
    
    const recentAvg = recent.reduce((sum, p) => sum + p.temperatura, 0) / recent.length;
    const olderAvg = older.reduce((sum, p) => sum + p.temperatura, 0) / older.length;
    
    const percentage = ((recentAvg - olderAvg) / olderAvg) * 100;
    
    if (percentage > 5) return { direction: 'up', percentage: percentage.toFixed(1) };
    if (percentage < -5) return { direction: 'down', percentage: Math.abs(percentage).toFixed(1) };
    return { direction: 'stable', percentage: percentage.toFixed(1) };
  };

  const trend = calculateTrend(filteredPoints);

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Dados Históricos</h1>
          <p className="text-slate-600 mt-1">Análise de tendências e estatísticas ao longo do tempo</p>
        </div>
        
        {/* Filtro de Período */}
        <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
          <Calendar className="w-5 h-5 text-slate-500" />
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as '7' | '30' | '90' | 'all')}
            className="bg-transparent border-none outline-none text-sm font-medium text-slate-700 cursor-pointer"
          >
            <option value="7">Últimos 7 dias</option>
            <option value="30">Últimos 30 dias</option>
            <option value="90">Últimos 90 dias</option>
            <option value="all">Todo o período</option>
          </select>
        </div>
      </div>

      {/* Estatísticas Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600 mb-1">Total de Registros</p>
                <p className="text-3xl font-bold text-slate-900">{filteredPoints.length}</p>
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
                <p className="text-sm text-slate-600 mb-1">Temperatura Média</p>
                <p className="text-3xl font-bold text-slate-900">
                  {filteredPoints.length > 0 
                    ? (filteredPoints.reduce((sum, p) => sum + p.temperatura, 0) / filteredPoints.length).toFixed(1)
                    : '0'}°C
                </p>
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
                <p className="text-sm text-slate-600 mb-1">Tendência</p>
                <div className="flex items-center gap-2">
                  <p className={`text-2xl font-bold ${trend.direction === 'up' ? 'text-red-600' : trend.direction === 'down' ? 'text-green-600' : 'text-slate-400'}`}>
                    {trend.direction === 'up' ? '↑' : trend.direction === 'down' ? '↓' : '→'}
                  </p>
                  <p className="text-2xl font-bold text-slate-900">{trend.percentage}%</p>
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
                <p className="text-sm text-slate-600 mb-1">Alertas Ativos</p>
                <p className="text-3xl font-bold text-slate-900">
                  {alerts.filter(a => a.status === 'ativo').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Tendência */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Activity className="w-6 h-6 text-emerald-600" />
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
                        width: `${filteredPoints.length > 0 ? (item.value / filteredPoints.length) * 100 : 0}%`,
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