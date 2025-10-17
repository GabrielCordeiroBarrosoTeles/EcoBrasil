import React from "react";
import { base44 } from "../api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from '../Components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Database, TrendingUp, Calendar } from "lucide-react";

// --- DEFINIÇÃO DOS TIPOS (ESSENCIAL PARA CORRIGIR ERROS) ---
interface MonitoringPoint {
  temperatura: number;
  nivel_fumaca: number;
  nivel_risco: "baixo" | "medio" | "alto" | "critico";
}

interface Alert {
  regiao: string;
}

export default function Dashboard() {
  const { data: monitoringPoints } = useQuery<MonitoringPoint[]>({
    queryKey: ['historicalData'],
    queryFn: () => base44.entities.MonitoringPoint.list('-data_medicao', 100),
    initialData: [],
  });

  const { data: alerts } = useQuery<Alert[]>({
    queryKey: ['historicalAlerts'],
    queryFn: () => base44.entities.Alert.list('-created_date', 50),
    initialData: [],
  });

  // Função para renderizar o label do gráfico de pizza de forma segura
  const renderCustomLabel = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent, name } = props;

    if (percent === undefined || percent === 0) return null;

    const RADIAN = Math.PI / 180;
    // Posição do label um pouco para fora do centro da fatia para melhor visualização
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="font-bold text-sm pointer-events-none">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const temperatureData = (monitoringPoints || [])
    .slice(0, 30)
    .reverse()
    .map((point, index) => ({
      name: `Ponto ${index + 1}`,
      temperatura: point.temperatura,
      fumaca: point.nivel_fumaca
    }));

  const riskData = [
    { name: 'Baixo', value: (monitoringPoints || []).filter(p => p.nivel_risco === 'baixo').length, color: '#10b981' },
    { name: 'Médio', value: (monitoringPoints || []).filter(p => p.nivel_risco === 'medio').length, color: '#f59e0b' },
    { name: 'Alto', value: (monitoringPoints || []).filter(p => p.nivel_risco === 'alto').length, color: '#ef4444' },
    { name: 'Crítico', value: (monitoringPoints || []).filter(p => p.nivel_risco === 'critico').length, color: '#991b1b' }
  ].filter(item => item.value > 0);

  const regionAlerts = (alerts || []).reduce((acc, alert) => {
    acc[alert.regiao] = (acc[alert.regiao] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const regionData = Object.entries(regionAlerts).map(([name, value]) => ({ name, value }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Dashboard de Análises
          </h1>
          <p className="text-slate-600 mt-2">Visão geral de tendências e estatísticas</p>
        </div>

        {/* Temperature Trend */}
        <Card className="shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-red-500 to-orange-600 text-white p-6">
            <CardTitle className="flex items-center gap-2 text-xl">
              <TrendingUp className="w-6 h-6" />
              Tendência de Temperatura e Fumaça (Últimos 30 Pontos)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={temperatureData}>
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
                <Line 
                  type="monotone" 
                  dataKey="temperatura" 
                  stroke="#ef4444" 
                  strokeWidth={3}
                  name="Temperatura (°C)"
                  dot={{ fill: '#ef4444', r: 5 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="fumaca" 
                  stroke="#64748b" 
                  strokeWidth={3}
                  name="Nível de Fumaça (%)"
                  dot={{ fill: '#64748b', r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Risk Distribution */}
          <Card className="shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white p-6">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Database className="w-6 h-6" />
                Distribuição de Níveis de Risco
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={riskData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomLabel}
                    outerRadius={110}
                    innerRadius={60}
                    paddingAngle={5}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {riskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Alerts by Region */}
          <Card className="shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Calendar className="w-6 h-6" />
                Alertas por Região
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
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
                    name="Número de Alertas"
                  />
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Summary Statistics */}
        <Card className="shadow-xl border-0">
          <CardHeader className="p-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white">
            <CardTitle className="text-xl">Estatísticas Gerais</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-slate-900">{(monitoringPoints || []).length}</p>
                <p className="text-sm text-slate-600 mt-1">Medições Registradas</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-slate-900">{(alerts || []).length}</p>
                <p className="text-sm text-slate-600 mt-1">Total de Alertas</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-slate-900">
                  {(monitoringPoints || []).length > 0 
                    ? ((monitoringPoints || []).reduce((sum, p) => sum + p.temperatura, 0) / monitoringPoints.length).toFixed(1)
                    : 0}°C
                </p>
                <p className="text-sm text-slate-600 mt-1">Temperatura Média</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-slate-900">
                  {(monitoringPoints || []).filter(p => p.nivel_risco === 'critico' || p.nivel_risco === 'alto').length}
                </p>
                <p className="text-sm text-slate-600 mt-1">Pontos de Alto Risco</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}