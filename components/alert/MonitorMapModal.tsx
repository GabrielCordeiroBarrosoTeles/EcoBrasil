'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"
import { Button } from "../ui/button"
import type { Alert, MonitoringPoint } from "../../types/api"
import { Badge } from "../ui/badge"
import { AlertTriangle, MapPin, Navigation } from "lucide-react"
import { cn } from "../../lib/utils"

const GOOGLE_MAPS_URL = (lat: number, lng: number) =>
  `https://www.google.com/maps?q=${lat},${lng}`

const GOOGLE_MAPS_EMBED_URL = (lat: number, lng: number, zoom = 8) =>
  `https://www.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed`

type MonitorMapModalProps = {
  open: boolean
  alert: Alert | null
  monitoringPoint: MonitoringPoint | null
  isLoading: boolean
  error?: string | null
  onClose: () => void
  onConfirm: () => void
}

function GoogleMapsPreview({
  latitude,
  longitude,
  title,
  className,
}: {
  latitude: number
  longitude: number
  title?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl",
        className,
      )}
    >
      <div className="pointer-events-none absolute left-4 top-4 z-10 flex items-center gap-2 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600 shadow-sm">
        <Navigation className="h-3.5 w-3.5 text-emerald-600" />
        Google Maps
      </div>
      <iframe
        title={title ?? "Google Maps"}
        src={GOOGLE_MAPS_EMBED_URL(latitude, longitude, 9)}
        loading="lazy"
        className="h-full w-full border-0"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
    </div>
  )
}

export function MonitorMapModal({
  open,
  alert,
  monitoringPoint,
  isLoading,
  error,
  onClose,
  onConfirm,
}: MonitorMapModalProps) {
  const latitude = monitoringPoint?.latitude ?? alert?.latitude ?? null
  const longitude = monitoringPoint?.longitude ?? alert?.longitude ?? null

  const hasCoordinates = latitude != null && longitude != null
  const criticalityLabel = alert?.nivel_criticidade
    ? {
        baixo: "Baixo",
        medio: "Médio",
        alto: "Alto",
        critico: "Crítico",
      }[alert.nivel_criticidade]
    : undefined
  const statusLabel = alert?.status
    ? {
        ativo: "Ativo",
        monitorando: "Monitorando",
        resolvido: "Resolvido",
        em_andamento: "Em andamento",
        cancelado: "Cancelado",
      }[alert.status] ?? alert.status
    : undefined

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => !value && onClose()}
      containerClassName="w-full max-w-7xl"
    >
      <DialogContent className="w-full max-w-7xl overflow-y-auto rounded-3xl p-0 sm:w-[calc(100vw-2rem)] sm:max-h-[calc(100vh-4rem)]">
        <DialogHeader className="space-y-2 px-6 pt-6 lg:px-10">
          <DialogTitle className="flex items-center justify-between text-base font-semibold">
            <span>Visualizar localização do alerta</span>
            {alert && (
              <Badge variant="outline" className="text-xs uppercase tracking-wide">
                {criticalityLabel ?? alert.nivel_criticidade}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Confirme o ponto geográfico que será monitorado. Utilize o mapa para validar a localização antes de alterar o status do alerta.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 px-6 pb-6 lg:px-10">
          <div className="flex flex-col gap-4">
            {isLoading ? (
              <div className="flex h-[360px] items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50/80 p-8 text-sm text-slate-500 sm:h-[440px] lg:h-[540px]">
                Carregando coordenadas do alerta...
              </div>
            ) : error ? (
              <div className="flex h-[360px] items-start gap-3 rounded-3xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 sm:h-[440px] lg:h-[540px]">
                <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            ) : hasCoordinates ? (
              <GoogleMapsPreview
                latitude={latitude}
                longitude={longitude}
                title={alert?.titulo}
                className="h-[360px] sm:h-[440px] lg:h-[540px]"
              />
            ) : (
              <div className="flex h-[360px] items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50/80 p-8 text-center text-sm text-slate-500 sm:h-[440px] lg:h-[540px]">
                Não encontramos coordenadas para este alerta. Atualize o cadastro ou selecione outro alerta com posição definida.
              </div>
            )}
          </div>

          {alert && (
            <div className="space-y-4">
              <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 shadow-sm">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap items-center gap-3 text-slate-900">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-base font-semibold leading-tight">
                        {alert.titulo}
                      </p>
                      {alert.estado && (
                        <span className="text-xs uppercase tracking-wide text-slate-400">
                          {alert.estado}
                        </span>
                      )}
                    </div>
                  </div>

                  {alert.descricao && (
                    <p className="text-sm leading-relaxed text-slate-600">
                      {alert.descricao}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-2">
                    {statusLabel && (
                      <Badge className="rounded-full border px-3 py-1 text-xs font-semibold tracking-wide">
                        {statusLabel}
                      </Badge>
                    )}
                    {criticalityLabel && (
                      <Badge className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold tracking-wide text-red-600">
                        {criticalityLabel}
                      </Badge>
                    )}
                  </div>

                  <dl className="grid gap-4 text-sm sm:grid-cols-2">
                    {typeof alert.probabilidade === "number" && (
                      <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-100">
                        <dt className="text-xs uppercase tracking-wide text-slate-400">
                          Probabilidade
                        </dt>
                        <dd className="mt-1 text-lg font-semibold text-slate-900">
                          {alert.probabilidade.toFixed(0)}%
                        </dd>
                      </div>
                    )}
                    <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-100">
                      <dt className="text-xs uppercase tracking-wide text-slate-400">
                        Localização
                      </dt>
                      <dd className="mt-1 text-sm font-medium text-slate-800">
                        {alert.regiao}
                      </dd>
                    </div>
                    {hasCoordinates && (
                      <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-100 sm:col-span-2">
                        <dt className="text-xs uppercase tracking-wide text-slate-400">
                          Coordenadas
                        </dt>
                        <dd className="mt-1 text-sm font-medium text-slate-800">
                          Lat: {latitude?.toFixed(4)} · Lng: {longitude?.toFixed(4)}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>

              {hasCoordinates && (
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => window.open(GOOGLE_MAPS_URL(latitude, longitude), "_blank")}
                >
                  <Navigation className="h-4 w-4" />
                  Abrir no Google Maps
                </Button>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col gap-2 border-t border-slate-100 px-6 pb-6 pt-4 sm:flex-row sm:justify-end lg:px-10 lg:pb-8">
          <Button variant="outline" onClick={onClose} className="flex-1 sm:flex-none">
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            disabled={!hasCoordinates || isLoading}
            className="flex-1 sm:flex-none"
          >
            Confirmar monitoramento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

