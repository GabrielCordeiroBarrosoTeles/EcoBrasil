'use client'

import { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  Loader2,
  X,
} from "lucide-react";

import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader } from "../../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { apiClient } from "../../lib/apiClient";
import type { Alert, AlertStatus, MonitoringPoint, RiskLevel } from "../../types/api";
import { MonitorMapModal } from "../../components/alert/MonitorMapModal";

type StatusFilter = "todos" | AlertStatus;
type CriticalityFilter = "todos" | RiskLevel;

const statusConfig: Record<
  AlertStatus,
  { icon: React.ElementType; label: string; color: string }
> = {
  ativo: {
    icon: AlertTriangle,
    label: "Ativo",
    color: "bg-red-100 text-red-700 border-red-300",
  },
  monitorando: {
    icon: Clock,
    label: "Monitorando",
    color: "bg-amber-100 text-amber-700 border-amber-300",
  },
  resolvido: {
    icon: CheckCircle,
    label: "Resolvido",
    color: "bg-emerald-100 text-emerald-700 border-emerald-300",
  },
  em_andamento: {
    icon: Clock,
    label: "Em andamento",
    color: "bg-blue-100 text-blue-700 border-blue-300",
  },
  cancelado: {
    icon: X,
    label: "Cancelado",
    color: "bg-slate-100 text-slate-600 border-slate-300",
  },
};

const criticalityConfig: Record<RiskLevel, { label: string; color: string }> = {
  baixo: { label: "Baixo", color: "bg-blue-500" },
  medio: { label: "Médio", color: "bg-amber-500" },
  alto: { label: "Alto", color: "bg-orange-500" },
  critico: { label: "Crítico", color: "bg-red-600" },
};

export default function Alertas() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");
  const [criticalityFilter, setCriticalityFilter] =
    useState<CriticalityFilter>("todos");
  const [mapModalState, setMapModalState] = useState<{
    open: boolean;
    alert: Alert | null;
    point: MonitoringPoint | null;
    isLoading: boolean;
    error: string | null;
  }>({ open: false, alert: null, point: null, isLoading: false, error: null });
  const [resolveModalState, setResolveModalState] = useState<{
    open: boolean;
    alert: Alert | null;
  }>({ open: false, alert: null });

  const queryClient = useQueryClient();

  const { data: alerts = [], isLoading } = useQuery<Alert[], Error>({
    queryKey: ["alerts", statusFilter, criticalityFilter],
    queryFn: () =>
      apiClient.getAlerts({
        limit: 100,
        status: statusFilter === "todos" ? undefined : statusFilter,
        nivel_criticidade:
          criticalityFilter === "todos" ? undefined : criticalityFilter,
      }),
  });

  const { mutate: updateStatus, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, status }: { id: number; status: AlertStatus }) =>
      apiClient.updateAlertStatus({ id, status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] });
    },
  });

  const hasActiveFilters =
    statusFilter !== "todos" || criticalityFilter !== "todos";

  const filteredAlerts = useMemo(() => alerts, [alerts]);

  const clearFilters = () => {
    setStatusFilter("todos");
    setCriticalityFilter("todos");
  };

  const loadMonitoringPoint = useCallback(
    async (alert: Alert) => {
      if (alert.latitude != null && alert.longitude != null) {
        return null;
      }

      const regionFilter = alert.regiao ?? undefined;
      const points = await apiClient.getMonitoringPoints({
        regiao: regionFilter,
        limit: 20,
      });

      const pointWithCoordinates = points.find(
        (point) => point.latitude != null && point.longitude != null,
      );

      return pointWithCoordinates ?? null;
    },
    [],
  );

  const handleOpenMap = useCallback(
    async (alert: Alert) => {
      setMapModalState({
        open: true,
        alert,
        point: null,
        isLoading: true,
        error: null,
      });

      try {
        const point = await loadMonitoringPoint(alert);
        if (!point && alert.latitude == null && alert.longitude == null) {
          setMapModalState((prev) => ({
            ...prev,
            point: null,
            isLoading: false,
            error:
              "Não encontramos coordenadas para este alerta. Atualize o cadastro ou selecione outro alerta.",
          }));
          return;
        }

        setMapModalState((prev) => ({
          ...prev,
          point,
          isLoading: false,
          error: null,
        }));
      } catch (error) {
        setMapModalState((prev) => ({
          ...prev,
          isLoading: false,
          point: null,
          error: "Falha ao carregar dados geográficos do alerta.",
        }));
      }
    },
    [loadMonitoringPoint],
  );

  const handleCloseMapModal = useCallback(() => {
    setMapModalState({
      open: false,
      alert: null,
      point: null,
      isLoading: false,
      error: null,
    });
  }, []);

  const handleConfirmMonitor = useCallback(() => {
    if (!mapModalState.alert) return;
    updateStatus({ id: mapModalState.alert.id, status: "monitorando" });
    handleCloseMapModal();
  }, [mapModalState.alert, updateStatus, handleCloseMapModal]);

  const handleOpenResolveModal = useCallback((alert: Alert) => {
    setResolveModalState({ open: true, alert });
  }, []);

  const handleCloseResolveModal = useCallback(() => {
    setResolveModalState({ open: false, alert: null });
  }, []);

  const handleConfirmResolve = useCallback(() => {
    if (!resolveModalState.alert) return;
    updateStatus({ id: resolveModalState.alert.id, status: "resolvido" });
    setResolveModalState({ open: false, alert: null });
  }, [resolveModalState.alert, updateStatus]);

  const resolveAlert = resolveModalState.alert;
  const resolveStatusInfo = resolveAlert
    ? statusConfig[resolveAlert.status] ?? statusConfig.ativo
    : null;
  const resolveCriticalityInfo = resolveAlert
    ?
        criticalityConfig[resolveAlert.nivel_criticidade] ??
        criticalityConfig.baixo
    : null;

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
            Alertas
          </h1>
          <p className="text-slate-600 mt-1">
            Gerenciamento e monitoramento de alertas do sistema
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <span className="font-medium">{filteredAlerts.length}</span>
          <span>alertas encontrados</span>
        </div>
      </header>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-slate-500">
              <Filter className="w-5 h-5" />
              <span className="font-medium text-slate-700">Filtros:</span>
            </div>

            <div className="flex-1 min-w-[150px]">
              <Select
                value={statusFilter}
                onValueChange={(value: StatusFilter) => setStatusFilter(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os status</SelectItem>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="monitorando">Monitorando</SelectItem>
                  <SelectItem value="em_andamento">Em andamento</SelectItem>
                  <SelectItem value="resolvido">Resolvido</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[150px]">
              <Select
                value={criticalityFilter}
                onValueChange={(value: CriticalityFilter) =>
                  setCriticalityFilter(value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Criticidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas as criticidades</SelectItem>
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
                Limpar filtros
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <span className="ml-3 text-slate-600">Carregando alertas...</span>
        </div>
      ) : filteredAlerts.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="p-12 text-center">
            <AlertTriangle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-600 mb-2">
              Nenhum alerta encontrado
            </h3>
            <p className="text-slate-500">
              {hasActiveFilters
                ? "Não há alertas com os filtros selecionados"
                : "Não há alertas no sistema no momento"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAlerts.map((alert) => {
            const statusInfo =
              statusConfig[alert.status] ?? statusConfig.ativo;
            const StatusIcon = statusInfo.icon;
            const criticalityInfo =
              criticalityConfig[alert.nivel_criticidade] ??
              criticalityConfig.baixo;

            const startDate =
              alert.data_inicio ?? alert.created_at ?? alert.updated_at;

            return (
              <Card
                key={alert.id}
                className="border-0 shadow-sm hover:shadow-md transition-shadow"
              >
                <CardHeader className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-lg font-bold text-slate-900">
                          {alert.titulo}
                        </h3>
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
                      <p className="text-xs font-medium text-slate-500 uppercase">
                        Localização
                      </p>
                      <p className="text-sm text-slate-900">
                        {alert.regiao}
                        {alert.estado ? ` - ${alert.estado}` : ""}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-slate-500 uppercase">
                        Criado em
                      </p>
                      <p className="text-sm text-slate-900">
                        {startDate
                          ? format(
                              new Date(startDate),
                              "dd/MM/yyyy 'às' HH:mm",
                              { locale: ptBR },
                            )
                          : "Data não disponível"}
                      </p>
                    </div>
                  </div>

                  {alert.recomendacoes && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs font-medium text-blue-900 mb-2">
                        Recomendações:
                      </p>
                      <p className="text-sm text-blue-700">
                        {alert.recomendacoes}
                      </p>
                    </div>
                  )}

                  {alert.status !== "resolvido" && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200">
                      {alert.status === "ativo" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenMap(alert)}
                          disabled={isUpdating}
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
                        onClick={() => handleOpenResolveModal(alert)}
                        disabled={isUpdating}
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

      <Dialog
         open={resolveModalState.open}
         onOpenChange={(open) => {
           if (!open) {
             handleCloseResolveModal()
           }
         }}
       >
        <DialogContent className="w-[calc(100vw-3rem)] max-w-lg sm:w-[calc(100vw-4rem)]">
          <DialogHeader className="space-y-3">
            <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-emerald-700">
              <CheckCircle className="h-5 w-5" />
              Resolver alerta
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-600">
              {resolveAlert
                ? `Deseja marcar o alerta "${resolveAlert.titulo}" como resolvido? Essa ação atualiza o status para todos os usuários e remove o alerta das filas ativas.`
                : "Deseja marcar este alerta como resolvido?"}
            </DialogDescription>
          </DialogHeader>

          {resolveAlert && (
            <div className="space-y-4 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6 shadow-sm">
              <div className="space-y-2 text-slate-900">
                <p className="text-base font-semibold leading-tight">
                  {resolveAlert.titulo}
                </p>
                {resolveAlert.descricao && (
                  <p className="text-sm leading-relaxed text-slate-600">
                    {resolveAlert.descricao}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {resolveStatusInfo && (
                  <Badge className={`${resolveStatusInfo.color} border`}>
                    {resolveStatusInfo.label}
                  </Badge>
                )}
                {resolveCriticalityInfo && (
                  <Badge className={`${resolveCriticalityInfo.color} text-white`}>
                    {resolveCriticalityInfo.label}
                  </Badge>
                )}
              </div>

              <div className="space-y-2 text-xs uppercase tracking-wide text-slate-500">
                <span>Localização</span>
                <p className="text-sm normal-case text-slate-700">
                  {resolveAlert.regiao}
                  {resolveAlert.estado ? ` · ${resolveAlert.estado}` : ""}
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={handleCloseResolveModal}
              className="flex-1 sm:flex-none"
              disabled={isUpdating}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmResolve}
              className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700"
              disabled={isUpdating}
            >
              Confirmar resolução
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <MonitorMapModal
        open={mapModalState.open}
        alert={mapModalState.alert}
        monitoringPoint={mapModalState.point}
        isLoading={mapModalState.isLoading}
        error={mapModalState.error}
        onClose={handleCloseMapModal}
        onConfirm={handleConfirmMonitor}
      />
    </div>
  );
}