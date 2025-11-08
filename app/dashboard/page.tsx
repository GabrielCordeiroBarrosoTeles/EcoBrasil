'use client'

import { useQuery } from '@tanstack/react-query'
import {
  Activity,
  AlertTriangle,
  Database,
  MapPin,
  Shield,
  Thermometer,
  TrendingUp
} from 'lucide-react'
import { useMemo } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { apiClient } from '../../lib/apiClient'
import type { Alert, MonitoringPoint, MonitoringStats, RiskLevel } from '../../types/api'

const RISK_LABEL: Record<RiskLevel, string> = {
  baixo: 'Baixo',
  medio: 'Médio',
  alto: 'Alto',
  critico: 'Crítico'
}

const RISK_COLOR: Record<RiskLevel, string> = {
  baixo: '#10b981',
  medio: '#f59e0b',
  alto: '#ef4444',
  critico: '#991b1b'
}

const RISK_ORDER: RiskLevel[] = ['baixo', 'medio', 'alto', 'critico']

export default function Dashboard() {
  const {
    data: monitoringPoints = [],
    isLoading: loadingPoints,
    isError: errorPoints
  } = useQuery<MonitoringPoint[], Error>({
    queryKey: ['monitoringPoints'],
    queryFn: () => apiClient.getMonitoringPoints({ limit: 200 })
  })

  const {
    data: alerts = [],
    isLoading: loadingAlerts,
    isError: errorAlerts
  } = useQuery<Alert[], Error>({
    queryKey: ['alerts'],
    queryFn: () => apiClient.getAlerts({ limit: 200 })
  })

  const { data: monitoringStats } = useQuery<MonitoringStats, Error>({
    queryKey: ['monitoringStats'],
    queryFn: () => apiClient.getMonitoringStats()
  })

  const { data: alertSummary } = useQuery({
    queryKey: ['alertSummary'],
    queryFn: () => apiClient.getAlertSummary()
  })

  const avgTemperature = useMemo(() => {
    if (!monitoringPoints.length) return 0
    const total = monitoringPoints.reduce((sum, point) => sum + point.temperatura, 0)
    return Number((total / monitoringPoints.length).toFixed(1))
  }, [monitoringPoints])

  const criticalPoints = useMemo(
    () =>
      monitoringPoints.filter((point) => ['alto', 'critico'].includes(point.nivel_risco)).length,
    [monitoringPoints]
  )

  const activeAlerts = useMemo(() => {
    if (alertSummary) {
      return alertSummary.alertas_ativos
    }
    return alerts.filter((alert) => alert.status === 'ativo').length
  }, [alerts, alertSummary])

  const regionsMonitored = useMemo(
    () => new Set(monitoringPoints.map((point) => point.regiao)).size,
    [monitoringPoints]
  )

  const temperatureSeries = useMemo(() => {
    if (!monitoringPoints.length) return [] as Array<Record<string, number | string>>

    const sorted = [...monitoringPoints].sort(
      (a, b) => new Date(b.data_medicao).getTime() - new Date(a.data_medicao).getTime()
    )

    return sorted
      .slice(0, 30)
      .reverse()
      .map((point, index) => ({
        name: `P${index + 1}`,
        temperatura: point.temperatura,
        fumaca: point.nivel_fumaca
      }))
  }, [monitoringPoints])

  const riskDistribution = useMemo(() => {
    const totals: Record<RiskLevel, number> = {
      baixo: 0,
      medio: 0,
      alto: 0,
      critico: 0
    }

    if (monitoringStats?.por_nivel_risco) {
      for (const level of RISK_ORDER) {
        totals[level] = monitoringStats.por_nivel_risco[level] ?? 0
      }
    } else {
      monitoringPoints.forEach((point) => {
        totals[point.nivel_risco] += 1
      })
    }

    return RISK_ORDER.map((level) => ({
      name: RISK_LABEL[level],
      value: totals[level],
      color: RISK_COLOR[level]
    })).filter((item) => item.value > 0)
  }, [monitoringPoints, monitoringStats])

  const regionAlertData = useMemo(() => {
    const accumulator = alerts.reduce<Record<string, number>>((acc, alert) => {
      const key = String(alert.regiao)
      acc[key] = (acc[key] ?? 0) + 1
      return acc
    }, {})

    return Object.entries(accumulator).map(([name, value]) => ({
      name,
      value
    }))
  }, [alerts])

  const loading = loadingPoints || loadingAlerts

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 mt-1">
            Visão geral do sistema de monitoramento em tempo real
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <MapPin className="w-4 h-4" />
          <span>{regionsMonitored} regiões monitoradas</span>
        </div>
      </header>

      {(errorPoints || errorAlerts || (!monitoringPoints.length && !loading)) && (
        <Card className="border-2 border-orange-300 bg-orange-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-orange-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-orange-900 mb-1">Problema ao conectar aos dados</h3>
                <p className="text-sm text-orange-700">
                  Não foi possível carregar os dados de monitoramento ou alertas. Verifique a API
                  backend e tente novamente.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <Thermometer className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900">{avgTemperature}°C</p>
            <p className="text-sm text-slate-600 mt-1">Temperatura média</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
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
            <div className="flex items-center justify-between mb-3">
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
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-3xl font-bold text-slate-900">
              {monitoringStats?.total_pontos ?? monitoringPoints.length}
            </p>
            <p className="text-sm text-slate-600 mt-1">Total monitorado</p>
          </CardContent>
        </Card>
      </section>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
            Tendência de temperatura e fumaça
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[380px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={temperatureSeries}>
              <defs>
                <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorFumaca" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#64748b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#64748b" stopOpacity={0} />
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

      <section className="grid md:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Database className="w-6 h-6 text-blue-600" />
              Distribuição de níveis de risco
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
                        monitoringPoints.length ? (item.value / monitoringPoints.length) * 100 : 0
                      }%`,
                      backgroundColor: item.color
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
              Alertas por região
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionAlertData}>
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
                  fill="url(#alertGradient)"
                  radius={[8, 8, 0, 0]}
                  name="Alertas"
                />
                <defs>
                  <linearGradient id="alertGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.85} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.85} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
