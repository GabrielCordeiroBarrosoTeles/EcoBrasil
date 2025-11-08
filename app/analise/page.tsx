'use client'

import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  AlertTriangle,
  Brain,
  CheckCircle,
  Loader2,
  MapPin,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { apiClient } from "../../lib/apiClient";
import type {
  FireRiskResponse,
  MonitoringPoint,
  RegionSlug,
  RegionValue,
} from "../../types/api";

type AnalysisResult = FireRiskResponse & {
  regiao: RegionSlug;
  generatedAt: string;
};

const REGION_LABEL: Record<RegionSlug, string> = {
  amazonia: "Amazônia",
  cerrado: "Cerrado",
  caatinga: "Caatinga",
  pantanal: "Pantanal",
  mata_atlantica: "Mata Atlântica",
};

const REGION_ALIASES: Record<string, RegionSlug> = {
  amazonia: "amazonia",
  "amazônia": "amazonia",
  cerrado: "cerrado",
  caatinga: "caatinga",
  pantanal: "pantanal",
  "mata atlântica": "mata_atlantica",
  "mata_atlantica": "mata_atlantica",
};

type CriticityLevel = "baixo" | "medio" | "alto" | "critico";

const CRITICITY_STYLE: Record<CriticityLevel, {
  label: string;
  color: string;
  bg: string;
  text: string;
  border: string;
}> = {
  baixo: {
    label: "Baixo",
    color: "bg-emerald-500",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-300",
  },
  medio: {
    label: "Médio",
    color: "bg-amber-500",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-300",
  },
  alto: {
    label: "Alto",
    color: "bg-orange-500",
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-300",
  },
  critico: {
    label: "Crítico",
    color: "bg-red-600",
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-300",
  },
};

function criticityByProbability(probability: number): CriticityLevel {
  if (probability >= 70) return "critico";
  if (probability >= 40) return "alto";
  if (probability >= 25) return "medio";
  return "baixo";
}

function toSlug(value: string | RegionValue): RegionSlug {
  const key = String(value).trim().toLowerCase();
  return REGION_ALIASES[key] ?? "cerrado";
}

export default function AnalisePreditiva() {
  const [selectedRegion, setSelectedRegion] = useState<RegionSlug>("amazonia");
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const { data: monitoringPoints = [] } = useQuery<MonitoringPoint[], Error>({
    queryKey: ["monitoringPoints", "analysis"],
    queryFn: () => apiClient.getMonitoringPoints({ limit: 200 }),
  });

  const { data: availableRegions = [] } = useQuery<string[], Error>({
    queryKey: ["availableRegions"],
    queryFn: () => apiClient.getAvailableRegions(),
  });

  const regionOptions = useMemo(() => {
    if (!availableRegions.length) {
      return Object.keys(REGION_LABEL).map((slug) => ({
        slug: slug as RegionSlug,
        label: REGION_LABEL[slug as RegionSlug],
      }));
    }

    const normalised = new Map<RegionSlug, string>();
    availableRegions.forEach((region) => {
      const slug = toSlug(region);
      normalised.set(slug, REGION_LABEL[slug] ?? region);
    });

    return Array.from(normalised.entries()).map(([slug, label]) => ({
      slug,
      label,
    }));
  }, [availableRegions]);

  useEffect(() => {
    if (!regionOptions.length) return;
    const hasCurrent = regionOptions.some((option) => option.slug === selectedRegion);
    if (!hasCurrent) {
      setSelectedRegion(regionOptions[0].slug);
    }
  }, [regionOptions, selectedRegion]);

  const regionPoints = useMemo(
    () =>
      monitoringPoints.filter(
        (point) => toSlug(point.regiao) === selectedRegion,
      ),
    [monitoringPoints, selectedRegion],
  );

  const hasRegionData = regionPoints.length > 0;

  const runAnalysis = useCallback(async () => {
    setAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      if (!hasRegionData) {
        throw new Error("Nenhum ponto de monitoramento disponível para esta região.");
      }

      const response = await apiClient.calculateFireRisk({
        regiao: selectedRegion,
        limit: 200,
      });

      setResult({
        ...response,
        regiao: selectedRegion,
        generatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Erro na análise preditiva:", err);
      setError(
       err instanceof Error
          ? err.message
          : "Não foi possível executar a análise preditiva. Tente novamente.",
      );
    } finally {
      setAnalyzing(false);
    }
  }, [hasRegionData, selectedRegion]);

  const suggestedActions = useMemo(() => {
    if (!result) return [];

    const actions: string[] = [
      "Reforçar a comunicação preventiva com brigadas locais e moradores.",
      "Monitorar continuamente indicadores meteorológicos e de fumaça.",
      "Preparar equipes de resposta rápida para mobilização em até 24h.",
    ];

    if (result.probabilidade_incendio >= 70) {
      actions.unshift("Ativar plano de contingência para incêndios severos na região.");
    } else if (result.probabilidade_incendio >= 40) {
      actions.unshift("Intensificar patrulhamento aéreo e monitoramento por satélite.");
    }

    return actions;
  }, [result]);

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 space-y-6">
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-purple-600" />
            Análise Preditiva com IA
          </h1>
          <p className="text-slate-600 mt-1">
            Previsão de riscos ambientais baseada em dados e inteligência artificial.
          </p>
        </div>
      </header>

      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            Configurar análise
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="block text-sm font-medium text-slate-700 mb-3">
              Selecione a região para análise:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {regionOptions.map((option) => {
                const isSelected = selectedRegion === option.slug;
                const hasData = monitoringPoints.some(
                  (point) => toSlug(point.regiao) === option.slug,
                );

                return (
                  <button
                    key={option.slug}
                    onClick={() => setSelectedRegion(option.slug)}
                    disabled={!hasData}
                    className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
                      isSelected
                        ? "border-purple-500 bg-purple-50 shadow-md"
                        : hasData
                          ? "border-slate-200 hover:border-purple-300 hover:bg-purple-50"
                          : "border-slate-200 bg-slate-50 opacity-50 cursor-not-allowed"
                    }`}
                  >
                    <MapPin className="w-5 h-5 mx-auto mb-2" />
                    <p className="font-medium text-sm">{option.label}</p>
                    {isSelected && (
                      <CheckCircle className="absolute top-2 right-2 w-4 h-4 text-purple-600" />
                    )}
                    {!hasData && (
                      <span className="text-xs text-slate-400 mt-1 block">
                        Sem dados
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Activity className="w-5 h-5 text-blue-600 mt-1" />
              <div>
                <p className="font-medium text-blue-900">
                  {regionPoints.length} ponto(s) de monitoramento selecionado(s)
                </p>
                <p className="text-sm text-blue-700">
                  Dados mais recentes coletados para a região {REGION_LABEL[selectedRegion]}
                </p>
              </div>
            </div>
            <Button
              onClick={runAnalysis}
              disabled={analyzing || !hasRegionData}
              size="lg"
              className="bg-purple-600 hover:bg-purple-700 text-white gap-2"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <Brain className="w-5 h-5" />
                  Iniciar análise
                </>
              )}
            </Button>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium text-red-900">Erro na análise</p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {analyzing && (
        <Card className="border-0 shadow-md">
          <CardContent className="p-12 text-center">
            <Loader2 className="w-16 h-16 animate-spin text-purple-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-600 mb-2">Analisando dados...</h3>
            <p className="text-slate-500">
              A IA está processando os indicadores ambientais da região selecionada.
            </p>
          </CardContent>
        </Card>
      )}

      {!analyzing && !result && (
        <Card className="border-0 shadow-md">
          <CardContent className="p-12 text-center">
            <Brain className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-600 mb-2">Pronto para começar</h3>
            <p className="text-slate-500">
              Selecione uma região com dados disponíveis e clique em "Iniciar análise" para gerar o relatório preditivo.
            </p>
          </CardContent>
        </Card>
      )}

      {result && (
        <div className="space-y-6">
          <Card className="border-0 shadow-md">
            <CardHeader className="border-b">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  Resultado da análise - {REGION_LABEL[result.regiao]}
                </CardTitle>
                <Badge className="text-sm bg-purple-100 text-purple-700 border border-purple-200">
                  {format(new Date(result.generatedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {(() => {
                const criticityLevel = criticityByProbability(result.probabilidade_incendio);
                const criticityStyle = CRITICITY_STYLE[criticityLevel];

                return (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div
                      className={`p-6 rounded-xl border-2 ${criticityStyle.border} ${criticityStyle.bg}`}
                    >
                      <p className="text-sm font-medium text-slate-600 mb-2">
                        Probabilidade estimada
                      </p>
                      <p className="text-5xl font-bold text-slate-900">
                        {Math.round(result.probabilidade_incendio)}%
                      </p>
                      <p className="text-sm text-slate-500 mt-2">
                        Nas próximas 72 horas
                      </p>
                      <Badge className={`${criticityStyle.color} text-white mt-4`}> 
                        {criticityStyle.label}
                      </Badge>
                    </div>

                    <div className="p-6 rounded-xl border-2 border-blue-200 bg-blue-50">
                      <p className="text-sm font-medium text-slate-600 mb-2">Metodologia aplicada</p>
                      <p className="text-sm text-slate-700 leading-relaxed">
                        {result.metodologia}
                      </p>
                    </div>
                  </div>
                );
              })()}

              <div className="grid md:grid-cols-3 gap-4">
                <Card className="border border-slate-200">
                  <CardContent className="p-4">
                    <p className="text-xs uppercase font-medium text-slate-500">Pontos analisados</p>
                    <p className="text-2xl font-bold text-slate-900">{result.pontos_analisados}</p>
                  </CardContent>
                </Card>
                <Card className="border border-slate-200">
                  <CardContent className="p-4">
                    <p className="text-xs uppercase font-medium text-slate-500">FWI médio</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {result.fwi_medio ? result.fwi_medio.toFixed(1) : "--"}
                    </p>
                  </CardContent>
                </Card>
                <Card className="border border-slate-200">
                  <CardContent className="p-4">
                    <p className="text-xs uppercase font-medium text-slate-500">Índice de instabilidade</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {result.haines_medio ? result.haines_medio.toFixed(1) : "--"}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl">
                <h3 className="font-semibold text-slate-900 mb-3">Recomendações estratégicas</h3>
                <ul className="space-y-2 text-sm text-slate-700">
                  {suggestedActions.map((action, index) => (
                    <li key={index} className="flex gap-3">
                      <span className="w-6 h-6 bg-purple-600 text-white text-xs font-bold rounded-full flex items-center justify-center mt-0.5">
                        {index + 1}
                      </span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

