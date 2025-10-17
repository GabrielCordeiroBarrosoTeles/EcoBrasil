import React, { useState } from "react";
import { base44 } from "../api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "../Components/ui/card";
import { Button } from "../Components/ui/button";
import { Badge } from "../Components/ui/badge";
import { TrendingUp, Brain, AlertTriangle, MapPin, Calendar, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// --- DEFINIÇÃO DOS TIPOS ---
interface MonitoringPoint {
  nome: string;
  regiao: string;
  umidade: number;
  velocidade_vento: number;
  temperatura: number;
  nivel_fumaca: number;
  nivel_risco: "baixo" | "medio" | "alto" | "critico";
}

type CriticalityType = "baixo" | "medio" | "alto" | "critico";

// Propriedades da resposta da IA tornadas opcionais para segurança
interface PredictionResult {
  analise_riscos?: string;
  probabilidade_incendio?: number;
  areas_preocupacao?: {
    area: string;
    nivel_risco: CriticalityType;
    motivo: string;
  }[];
  recomendacoes?: string[];
  nivel_criticidade?: CriticalityType;
  regiao: string;
  data_analise: string;
}
// --- FIM DA DEFINIÇÃO DOS TIPOS ---

export default function AnalisePreditiva() {
  const [analyzing, setAnalyzing] = useState(false);
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [selectedRegion, setSelectedRegion] = useState("Amazônia");

  const { data: monitoringPoints } = useQuery<MonitoringPoint[]>({
    queryKey: ['monitoringPoints'],
    queryFn: () => base44.entities.MonitoringPoint.list('-data_medicao', 50),
    initialData: [],
  });

  const runPredictiveAnalysis = async () => {
    setAnalyzing(true);
    setPrediction(null);
    try {
      const regionPoints = (monitoringPoints || []).filter(p => p.regiao === selectedRegion);
      
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

    } catch (error) {
      console.error("Erro na análise preditiva:", error);
    }
    setAnalyzing(false);
  };

  const biomas = ["Amazônia", "Cerrado", "Mata Atlântica", "Caatinga", "Pantanal", "Pampa"];

  const criticityColors: Record<string, string> = {
    baixo: "bg-green-100 text-green-800 border-green-300",
    medio: "bg-yellow-100 text-yellow-800 border-yellow-300",
    alto: "bg-orange-100 text-orange-800 border-orange-300",
    critico: "bg-red-100 text-red-800 border-red-300"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Análise Preditiva com IA
            </h1>
            <p className="text-slate-600 mt-2">Previsão de riscos ambientais baseada em inteligência artificial</p>
          </div>
        </div>

        {/* Analysis Panel */}
        <Card className="shadow-xl border-0">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-6">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Brain className="w-6 h-6" />
              Configurar Análise
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Selecione a Região para Análise:
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {biomas.map((bioma) => (
                    <button
                      key={bioma}
                      onClick={() => setSelectedRegion(bioma)}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                        selectedRegion === bioma
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
                          : 'border-slate-200 hover:border-purple-300 hover:bg-slate-50'
                      }`}
                    >
                      <MapPin className="w-5 h-5 mx-auto mb-2" />
                      <p className="font-medium text-sm">{bioma}</p>
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={runPredictiveAnalysis}
                disabled={analyzing}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white py-6 text-lg"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Analisando dados com IA...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-5 h-5 mr-2" />
                    Iniciar Análise Preditiva
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {prediction && (
          <div className="space-y-6">
            {/* Summary Card */}
            <Card className="shadow-xl border-0">
              <CardHeader className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                    Resultado da Análise - {prediction.regiao}
                  </CardTitle>
                  <Badge className={`${criticityColors[prediction.nivel_criticidade || 'baixo']} border-2 text-base px-4 py-2`}>
                    {prediction.nivel_criticidade?.toUpperCase() || 'N/A'}
                  </Badge>
                </div>
                <p className="text-sm text-slate-500 mt-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  {format(new Date(prediction.data_analise), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-red-50 to-orange-50 p-6 rounded-xl border-2 border-red-200">
                    <h3 className="font-bold text-lg text-red-900 mb-2">Probabilidade de Incêndio</h3>
                    <p className="text-5xl font-bold text-red-600">{prediction.probabilidade_incendio || 0}%</p>
                    <p className="text-sm text-red-700 mt-2">nas próximas 72 horas</p>
                  </div>

                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl border-2 border-blue-200">
                    <h3 className="font-bold text-lg text-blue-900 mb-3">Análise de Riscos</h3>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {prediction.analise_riscos || 'Análise indisponível.'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Areas of Concern */}
            <Card className="shadow-xl border-0">
              <CardHeader className="p-6 bg-orange-50 border-b">
                <CardTitle className="flex items-center gap-2 text-orange-900">
                  <AlertTriangle className="w-6 h-6" />
                  Áreas de Maior Preocupação
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {prediction.areas_preocupacao?.map((area, index) => (
                    <div key={index} className="p-4 bg-white border-2 border-slate-200 rounded-xl hover:shadow-md transition-all duration-200">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-bold text-slate-900">{area.area}</h4>
                        <Badge className={criticityColors[area.nivel_risco]}>
                          {area.nivel_risco}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600">{area.motivo}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card className="shadow-xl border-0">
              <CardHeader className="p-6 bg-green-50 border-b">
                <CardTitle className="flex items-center gap-2 text-green-900">
                  <Brain className="w-6 h-6" />
                  Recomendações de Ação
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ul className="space-y-3">
                  {prediction.recomendacoes?.map((rec, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-sm font-bold">{index + 1}</span>
                      </div>
                      <p className="text-slate-700 flex-1">{rec}</p>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}

        {!prediction && !analyzing && (
          <Card className="shadow-xl border-0">
            <CardContent className="p-12 text-center">
              <Brain className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-600 mb-2">
                Pronto para Análise
              </h3>
              <p className="text-slate-500">
                Selecione uma região e inicie a análise preditiva para obter insights detalhados sobre riscos ambientais
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}