
// --- Tipos e Dados para Alertas ---

type StatusType = "ativo" | "monitorando" | "resolvido";
type CriticalityType = "baixo" | "medio" | "alto" | "critico";

export interface Alert {
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

export const mockAlerts: Alert[] = [
  {
    id: 1,
    titulo: "Risco de Incêndio Elevado na Chapada Diamantina",
    status: "ativo",
    nivel_criticidade: "alto",
    tipo: "risco_incendio",
    descricao: "Sensores detectaram alta temperatura e baixa umidade na região central da Chapada Diamantina, indicando um risco elevado de incêndios florestais.",
    regiao: "Chapada Diamantina",
    estado: "Bahia",
    data_inicio: new Date("2025-10-13T14:00:00Z").toISOString(),
    created_date: new Date("2025-10-13T14:00:00Z").toISOString(),
    recomendacoes: "Emitir alerta para brigadistas locais e proibir fogueiras na área.",
    data_fim: null,
  },
  {
    id: 2,
    titulo: "Monitoramento de Queimada na Amazônia",
    status: "monitorando",
    nivel_criticidade: "critico",
    tipo: "queimada_detectada",
    descricao: "Foco de queimada detectado por satélite a 50km de Manaus. Equipes estão em deslocamento.",
    regiao: "Amazônia",
    estado: "Amazonas",
    data_inicio: new Date("2025-10-14T09:30:00Z").toISOString(),
    created_date: new Date("2025-10-14T09:30:00Z").toISOString(),
    recomendacoes: "Acompanhar imagens de satélite e aguardar relatório da equipe de campo.",
    data_fim: null,
  },
  {
    id: 3,
    titulo: "Alerta de Desmatamento Resolvido",
    status: "resolvido",
    nivel_criticidade: "medio",
    tipo: "desmatamento_ilegal",
    descricao: "Atividade de desmatamento ilegal foi contida por fiscais do IBAMA.",
    regiao: "Sul do Pará",
    estado: "Pará",
    data_inicio: new Date("2025-10-10T11:00:00Z").toISOString(),
    created_date: new Date("2025-10-10T11:00:00Z").toISOString(),
    recomendacoes: "N/A",
    data_fim: new Date("2025-10-12T18:00:00Z").toISOString(),
  },
];


// --- Tipos e Dados para Pontos de Monitoramento ---

export interface MonitoringPoint {
  id: string | number;
  nome: string;
  regiao: "Amazônia" | "Cerrado" | "Mata Atlântica" | "Caatinga" | "Pantanal" | "Pampa";
  umidade: number;
  velocidade_vento: number;
  temperatura: number;
  nivel_fumaca: number;
  nivel_risco: "baixo" | "medio" | "alto" | "critico";
  data_medicao: string;
}

export const mockMonitoringPoints: MonitoringPoint[] = [
  { id: 101, nome: "Estação Alpha", regiao: "Amazônia", umidade: 85, velocidade_vento: 5, temperatura: 38.5, nivel_fumaca: 45, nivel_risco: "alto", data_medicao: new Date().toISOString() },
  { id: 102, nome: "Ponto Cerrado-1", regiao: "Cerrado", umidade: 40, velocidade_vento: 15, temperatura: 29.1, nivel_fumaca: 12, nivel_risco: "baixo", data_medicao: new Date(Date.now() - 3600 * 1000 * 2).toISOString() },
  { id: 103, nome: "Base Pantanal Sul", regiao: "Pantanal", umidade: 60, velocidade_vento: 8, temperatura: 42.0, nivel_fumaca: 60, nivel_risco: "critico", data_medicao: new Date(Date.now() - 3600 * 1000 * 5).toISOString() },
  { id: 104, nome: "Torre Mata Atlântica", regiao: "Mata Atlântica", umidade: 75, velocidade_vento: 12, temperatura: 35.7, nivel_fumaca: 30, nivel_risco: "medio", data_medicao: new Date(Date.now() - 3600 * 1000 * 8).toISOString() },
  { id: 105, nome: "Sensor Caatinga", regiao: "Caatinga", umidade: 25, velocidade_vento: 20, temperatura: 33.2, nivel_fumaca: 25, nivel_risco: "medio", data_medicao: new Date(Date.now() - 3600 * 1000 * 12).toISOString() },
];