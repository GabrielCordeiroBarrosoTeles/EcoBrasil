import React, { useState } from "react";
import { base44 } from "../api/base44Client"; 
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../Components/ui/card";
import { Button } from "../Components/ui/button";
import { Badge } from "../Components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../Components/ui/select";
import { AlertTriangle, CheckCircle, Clock, Filter, X, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type StatusType = "ativo" | "monitorando" | "resolvido";
type CriticalityType = "baixo" | "medio" | "alto" | "critico";

interface Alert {
  id: string | number;
  status: StatusType;
  nivel_criticidade: CriticalityType;
  titulo: string;
  tipo: string;
  descricao: string;
  regiao: string;
  estado: string;
  data_inicio: string | null;
  created_date: string;
  recomendacoes: string | null;
  data_fim: string | null;
}

const statusConfig: Record<StatusType, { icon: React.ElementType; label: string; color: string }> = {
  ativo: { icon: AlertTriangle, label: "Ativo", color: "bg-red-100 text-red-700 border-red-300" },
  monitorando: { icon: Clock, label: "Monitorando", color: "bg-amber-100 text-amber-700 border-amber-300" },
  resolvido: { icon: CheckCircle, label: "Resolvido", color: "bg-emerald-100 text-emerald-700 border-emerald-300" }
};

const criticalityConfig: Record<CriticalityType, { label: string; color: string }> = {
  baixo: { label: "Baixo", color: "bg-blue-500" },
  medio: { label: "Médio", color: "bg-amber-500" },
  alto: { label: "Alto", color: "bg-orange-500" },
  critico: { label: "Crítico", color: "bg-red-600" }
};

export default function Alertas() {
  const [statusFilter, setStatusFilter] = useState("todos");
  const [criticalityFilter, setCriticalityFilter] = useState("todos");
  const queryClient = useQueryClient();

  const { data: alerts = [], isLoading } = useQuery<Alert[]>({
    queryKey: ['allAlerts', statusFilter, criticalityFilter],
    queryFn: async () => {
      let fetchedAlerts: Alert[] = await base44.entities.Alert.list('-created_date');
      
      if (statusFilter !== 'todos') {
        fetchedAlerts = fetchedAlerts.filter(a => a.status === statusFilter);
      }
      
      if (criticalityFilter !== 'todos') {
        fetchedAlerts = fetchedAlerts.filter(a => a.nivel_criticidade === criticalityFilter);
      }
      
      return fetchedAlerts;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: Alert['id'], status: StatusType }) => base44.entities.Alert.update(id, { 
      status,
      data_fim: status === 'resolvido' ? new Date().toISOString() : null
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allAlerts'] });
    },
  });

  const hasActiveFilters = statusFilter !== 'todos' || criticalityFilter !== 'todos';
  const clearFilters = () => {
    setStatusFilter('todos');
    setCriticalityFilter('todos');
  };

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Alertas</h1>
          <p className="text-slate-600 mt-1">Gerenciamento e monitoramento de alertas do sistema</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span className="font-medium">{alerts.length}</span>
          <span>alertas encontrados</span>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-slate-500">
              <Filter className="w-5 h-5" />
              <span className="font-medium text-slate-700">Filtros:</span>
            </div>

            <div className="flex-1 min-w-[150px]">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Status</SelectItem>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="monitorando">Monitorando</SelectItem>
                  <SelectItem value="resolvido">Resolvido</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[150px]">
              <Select value={criticalityFilter} onValueChange={setCriticalityFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Criticidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas as Criticidades</SelectItem>
                  <SelectItem value="baixo">Baixo</SelectItem>
                  <SelectItem value="medio">Médio</SelectItem>
                  <SelectItem value="alto">Alto</SelectItem>
                  <SelectItem value="critico">Crítico</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="gap-2"
              >
                <X className="w-4 h-4" />
                Limpar Filtros
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <span className="ml-3 text-slate-600">Carregando alertas...</span>
        </div>
      ) : alerts.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-12 text-center">
            <AlertTriangle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-600 mb-2">Nenhum alerta encontrado</h3>
            <p className="text-slate-500">
              {hasActiveFilters 
                ? "Não há alertas com os filtros selecionados" 
                : "Não há alertas no sistema no momento"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => {
            const statusInfo = statusConfig[alert.status];
            const StatusIcon = statusInfo.icon;
            const criticalityInfo = criticalityConfig[alert.nivel_criticidade];

            return (
              <Card key={alert.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-lg font-bold text-slate-900">{alert.titulo}</h3>
                        <Badge className={`${statusInfo.color} border`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusInfo.label}
                        </Badge>
                        <Badge className={`${criticalityInfo.color} text-white`}>
                          {criticalityInfo.label}
                        </Badge>
                      </div>
                      <p className="text-slate-600">{alert.descricao}</p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6 pt-0 space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-500 uppercase">Localização</p>
                      <p className="text-sm text-slate-900">{alert.regiao} - {alert.estado}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-500 uppercase">Data de Início</p>
                      <p className="text-sm text-slate-900">
                        {format(new Date(alert.data_inicio || alert.created_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  </div>

                  {alert.recomendacoes && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs font-medium text-blue-900 mb-2">Recomendações:</p>
                      <p className="text-sm text-blue-700">{alert.recomendacoes}</p>
                    </div>
                  )}

                  {alert.status === 'resolvido' && alert.data_fim && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                      <p className="text-sm text-emerald-700">
                        Resolvido em {format(new Date(alert.data_fim), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                  )}

                  {alert.status !== 'resolvido' && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200">
                      {alert.status === 'ativo' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateStatusMutation.mutate({ id: alert.id, status: 'monitorando' })}
                          disabled={updateStatusMutation.isPending}
                          className="gap-2"
                        >
                          <Clock className="w-4 h-4" />
                          Monitorar
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-emerald-600 hover:text-emerald-700 border-emerald-300 hover:border-emerald-400"
                        onClick={() => updateStatusMutation.mutate({ id: alert.id, status: 'resolvido' })}
                        disabled={updateStatusMutation.isPending}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Resolver
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}