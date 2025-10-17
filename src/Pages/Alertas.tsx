import React, { useState } from "react";
import { base44 } from "../api/base44Client"; 
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../Components/ui/card";
import { Button } from "../Components/ui/button";
import { Badge } from "../Components/ui/badge";
import { Input } from "../Components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../Components/ui/select";
import { AlertTriangle, CheckCircle, Clock, Filter } from "lucide-react";
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

export default function Alertas() {
  const [statusFilter, setStatusFilter] = useState("todos");
  const [criticalityFilter, setCriticalityFilter] = useState("todos");
  const queryClient = useQueryClient();

  const { data: alerts, isLoading } = useQuery<Alert[]>({
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
    initialData: [],
  });

  const updateStatusMutation = useMutation({
    // Tipando os parâmetros da mutation para mais segurança
    mutationFn: ({ id, status }: { id: Alert['id'], status: StatusType }) => base44.entities.Alert.update(id, { 
      status,
      data_fim: status === 'resolvido' ? new Date().toISOString() : null
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allAlerts'] });
    },
  });

  // Tipando os objetos de ícones e cores
  const statusIcons: Record<StatusType, React.ElementType> = {
    ativo: AlertTriangle,
    monitorando: Clock,
    resolvido: CheckCircle
  };

  const statusColors: Record<StatusType, string> = {
    ativo: "bg-red-100 text-red-800 border-red-300",
    monitorando: "bg-yellow-100 text-yellow-800 border-yellow-300",
    resolvido: "bg-green-100 text-green-800 border-green-300"
  };

  const criticalityColors: Record<CriticalityType, string> = {
    baixo: "bg-blue-100 text-blue-800",
    medio: "bg-yellow-100 text-yellow-800",
    alto: "bg-orange-100 text-orange-800",
    critico: "bg-red-100 text-red-800"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-orange-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Histórico de Alertas
          </h1>
          <p className="text-slate-600 mt-2">Gerenciar e monitorar todos os alertas do sistema</p>
        </div>

        {/* Filters */}
        <Card className="shadow-lg border-0">
          <CardContent className="p-6">
            <div className="flex flex-wrap items-center gap-4">
              <Filter className="w-5 h-5 text-slate-500" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Status</SelectItem>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="monitorando">Monitorando</SelectItem>
                  <SelectItem value="resolvido">Resolvido</SelectItem>
                </SelectContent>
              </Select>

              <Select value={criticalityFilter} onValueChange={setCriticalityFilter}>
                <SelectTrigger className="w-48">
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
          </CardContent>
        </Card>

        {/* Alerts Grid */}
        <div className="grid gap-6">
          {isLoading ? (
            <Card className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-32 bg-slate-200 rounded" />
              </CardContent>
            </Card>
          ) : alerts.length === 0 ? (
            <Card className="shadow-lg border-0">
              <CardContent className="p-12 text-center">
                <AlertTriangle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-600 mb-2">Nenhum alerta encontrado</h3>
                <p className="text-slate-500">Não há alertas com os filtros selecionados</p>
              </CardContent>
            </Card>
          ) : (
            alerts.map((alert) => {
              const StatusIcon = statusIcons[alert.status];
              return (
                <Card key={alert.id} className="shadow-lg border-0 hover:shadow-xl transition-all duration-200">
                  <CardHeader className="p-6 border-b">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{alert.titulo}</CardTitle>
                        <div className="flex flex-wrap gap-2">
                          <Badge className={`${statusColors[alert.status]} border`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {alert.status}
                          </Badge>
                          <Badge className={criticalityColors[alert.nivel_criticidade]}>
                            {alert.nivel_criticidade}
                          </Badge>
                          <Badge variant="outline">
                            {alert.tipo.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                      </div>
                      {alert.status !== 'resolvido' && (
                        <div className="flex gap-2">
                          {alert.status === 'ativo' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateStatusMutation.mutate({ id: alert.id, status: 'monitorando' })}
                            >
                              Monitorar
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 hover:text-green-700"
                            onClick={() => updateStatusMutation.mutate({ id: alert.id, status: 'resolvido' })}
                          >
                            Resolver
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="text-slate-700 mb-4">{alert.descricao}</p>
                    
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm font-medium text-slate-500">Localização</p>
                        <p className="text-slate-900">{alert.regiao} - {alert.estado}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-500">Data de Início</p>
                        <p className="text-slate-900">
                          {format(new Date(alert.data_inicio || alert.created_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                    </div>

                    {alert.recomendacoes && (
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <p className="font-medium text-blue-900 mb-2">Recomendações:</p>
                        <p className="text-sm text-blue-700">{alert.recomendacoes}</p>
                      </div>
                    )}

                    {alert.status === 'resolvido' && alert.data_fim && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-700">
                          <CheckCircle className="w-4 h-4 inline mr-1" />
                          Resolvido em {format(new Date(alert.data_fim), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}