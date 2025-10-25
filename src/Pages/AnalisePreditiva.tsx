import React, { useState } from "react";
import { base44 } from "../api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../Components/ui/card";
import { Button } from "../Components/ui/button";
import { Badge } from "../Components/ui/badge";
import { 
  Brain, 
  AlertTriangle, 
  MapPin, 
  Calendar, 
  Loader2,
  TrendingUp,
  CheckCircle,
  Sparkles,
  Activity
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface MonitoringPoint {
  nome: string;
  regiao: string;
  umidade: number;
  velocidade_vento: number;
  temperatura: number;
  nivel_fumaca: number;
  nivel_risco: "baixo" | "medio" | "alto" | "critico";
}

interface PredictionResult {
  analise_riscos?: string;
  probabilidade_incendio?: number;
  areas_preocupacao?: {
    area: string;
    nivel_risco: "baixo" | "medio" | "alto" | "critico";
    motivo: string;
  }[];
  recomendacoes?: string[];
  nivel_criticidade?: "baixo" | "medio" | "alto" | "critico";
  regiao: string;
  data_analise: string;
}

const biomas = [
  "Amazônia", 
  "Cerrado", 
  "Mata Atlântica", 
  "Caatinga", 
  "Pantanal", 
  "Pampa"
];

const criticityConfig = {
  baixo: { label: "Baixo", color: "bg-emerald-500", bgColor: "bg-emerald-50", textColor: "text-emerald-700", borderColor: "border-emerald-300" },
  medio: { label: "Médio", color: "bg-amber-500", bgColor: "bg-amber-50", textColor: "text-amber-700", borderColor: "border-amber-300" },
  alto: { label: "Alto", color: "bg-orange-500", bgColor: "bg-orange-50", textColor: "text-orange-700", borderColor: "border-orange-300" },
  critico: { label: "Crítico", color: "bg-red-600", bgColor: "bg-red-50", textColor: "text-red-700", borderColor: "border-red-300" }
};

export default function AnalisePreditiva() {
  const [analyzing, setAnalyzing] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [selectedRegion, setSelectedRegion] = useState("Amazônia");
  const [error, setError] = useState<string | null>(null);

  const { data: monitoringPoints = [] } = useQuery<MonitoringPoint[]>({
    queryKey: ['monitoringPoints'],
    queryFn: () => base44.entities.MonitoringPoint.list('-data_medicao', 50),
  });

  const runPredictiveAnalysis = async () => {
    setAnalyzing(true);
    setPrediction(null);
    setError(null);
    
    try {
      const regionPoints = (monitoringPoints || []).filter(p => p.regiao === selectedRegion);
      
      if (regionPoints.length === 0) {
        setError("Nenhum ponto de monitoramento encontrado para esta região.");
        setAnalyzing(false);
        return;
      }

      const contextData = regionPoints.map(p => ({
        nome: p.nome,
        temperatura: p.temperatura,
        nivel_fumaca: p.nivel_fumaca,
        umidade: p.umidade,
        velocidade_vento: p.velocidade_vento,
        nivel_risco: p.nivel_risco
      }));

      const prompt = `
Você é um especialista em análise ambiental e previsão de riscos de incêndios florestais no Brasil.

Analise os seguintes dados de monitoramento da região ${selectedRegion}:

${JSON.stringify(contextData, null, 2)}

Com base nesses dados, forneça um objeto JSON com as seguintes chaves:
1. "analise_riscos": Uma análise detalhada dos riscos atuais.
2. "probabilidade_incendio": Previsão de probabilidade (um número de 0 a 100) de incêndios nas próximas 72 horas.
3. "areas_preocupacao": Um array de objetos, onde cada objeto contém "area", "nivel_risco" e "motivo".
4. "recomendacoes": Um array de strings com recomendações específicas para prevenção e resposta.
5. "nivel_criticidade": O nível de criticidade geral (uma string: "baixo", "medio", "alto", ou "critico").

Responda APENAS com o objeto JSON solicitado, sem nenhum texto, explicação ou formatação adicional.
`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            analise_riscos: { type: "string" },
            probabilidade_incendio: { type: "number" },
            areas_preocupacao: { 
              type: "array", 
              items: { 
                type: "object",
                properties: {
                  area: { type: "string" },
                  nivel_risco: { type: "string" },
                  motivo: { type: "string" }
                }
              }
            },
            recomendacoes: { 
              type: "array", 
              items: { type: "string" }
            },
            nivel_criticidade: { 
              type: "string",
              enum: ["baixo", "medio", "alto", "critico"]
            }
          }
        }
      });

      setPrediction({
        ...result,
        regiao: selectedRegion,
        data_analise: new Date().toISOString()
      });

    } catch (err: any) {
      console.error("Erro na análise preditiva:", err);
      setError(err.message || "Erro ao executar análise preditiva. Tente novamente.");
    } finally {
      setAnalyzing(false);
    }
  };

  const hasRegionData = monitoringPoints.some(p => p.regiao === selectedRegion);

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-purple-600" />
            Análise Preditiva com IA
          </h1>
          <p className="text-slate-600 mt-1">Previsão de riscos ambientais baseada em inteligência artificial</p>
        </div>
      </div>

      {/* Configuration Panel */}
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            Configurar Análise
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Selecione a região para análise:
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {biomas.map((bioma) => {
                const isSelected = selectedRegion === bioma;
                const hasData = monitoringPoints.some(p => p.regiao === bioma);
                
                return (
                  <button
                    key={bioma}
                    onClick={() => setSelectedRegion(bioma)}
                    disabled={!hasData}
                    className={`
                      relative p-4 rounded-xl border-2 transition-all duration-200
                      ${isSelected 
                        ? 'border-purple-500 bg-purple-50 shadow-md' 
                        : hasData 
                          ? 'border-slate-200 hover:border-purple-300 hover:bg-purple-50' 
                          : 'border-slate-200 bg-slate-50 opacity-50 cursor-not-allowed'
                      }
                    `}
                  >
                    <MapPin className="w-5 h-5 mx-auto mb-2" />
                    <p className="font-medium text-sm">{bioma}</p>
                    {isSelected && (
                      <CheckCircle className="absolute top-2 right-2 w-4 h-4 text-purple-600" />
                    )}
                    {!hasData && (
                      <span className="text-xs text-slate-400 mt-1 block">Sem dados</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">
                  {monitoringPoints.filter(p => p.regiao === selectedRegion).length} ponto(s) de monitoramento
                </p>
                <p className="text-sm text-blue-700">Dados disponíveis para análise</p>
              </div>
            </div>
            <Button
              onClick={runPredictiveAnalysis}
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
                  Iniciar Análise Preditiva
                </>
              )}
            </Button>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-medium text-red-900">Erro na Análise</p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {prediction ? (
        <div className="space-y-6">
          {/* Summary Card */}
          <Card className="border-0 shadow-md">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  Resultado da Análise - {prediction.regiao}
                </CardTitle>
                <Badge className={`${criticityConfig[prediction.nivel_criticidade || 'baixo'].color} text-white px-3 py-1`}>
                  {criticityConfig[prediction.nivel_criticidade || 'baixo'].label}
                </Badge>
              </div>
              <p className="text-sm text-slate-500 mt-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {format(new Date(prediction.data_analise), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </p>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border-2 border-red-200">
                  <h3 className="font-bold text-lg text-red-900 mb-2">Probabilidade de Incêndio</h3>
                  <p className="text-5xl font-bold text-red-600">{prediction.probabilidade_incendio || 0}%</p>
                  <p className="text-sm text-red-700 mt-2">nas próximas 72 horas</p>
                </div>

                <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200">
                  <h3 className="font-bold text-lg text-blue-900 mb-3">Análise de Riscos</h3>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    {prediction.analise_riscos || 'Análise indisponível.'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Areas of Concern */}
          {prediction.areas_preocupacao && prediction.areas_preocupacao.length > 0 && (
            <Card className="border-0 shadow-md">
              <CardHeader className="bg-orange-50 border-b border-orange-200">
                <CardTitle className="flex items-center gap-2 text-orange-900">
                  <AlertTriangle className="w-5 h-5" />
                  Áreas de Maior Preocupação
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {prediction.areas_preocupacao.map((area, index) => {
                    const config = criticityConfig[area.nivel_risco];
                    return (
                      <div key={index} className="p-4 bg-white border-2 border-slate-200 rounded-xl hover:shadow-md transition-all">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-bold text-slate-900">{area.area}</h4>
                          <Badge className={`${config.color} text-white`}>
                            {config.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600">{area.motivo}</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {prediction.recomendacoes && prediction.recomendacoes.length > 0 && (
            <Card className="border-0 shadow-md">
              <CardHeader className="bg-emerald-50 border-b border-emerald-200">
                <CardTitle className="flex items-center gap-2 text-emerald-900">
                  <Brain className="w-5 h-5" />
                  Recomendações de Ação
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-3">
                  {prediction.recomendacoes.map((rec, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-sm font-bold">{index + 1}</span>
                      </div>
                      <p className="text-slate-700 flex-1">{rec}</p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        !analyzing && (
          <Card className="border-0 shadow-md">
            <CardContent className="p-12 text-center">
              <Brain className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-600 mb-2">Pronto para Análise</h3>
              <p className="text-slate-500">
                Selecione uma região e inicie a análise preditiva para obter insights detalhados sobre riscos ambientais
              </p>
            </CardContent>
          </Card>
        )
      )}

      {analyzing && (
        <Card className="border-0 shadow-md">
          <CardContent className="p-12 text-center">
            <Loader2 className="w-16 h-16 animate-spin text-purple-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-600 mb-2">Analisando dados...</h3>
            <p className="text-slate-500">A IA está processando as informações para gerar insights detalhados</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}