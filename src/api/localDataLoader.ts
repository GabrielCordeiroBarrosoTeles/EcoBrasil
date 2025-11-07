export interface MonitoringPoint {
  id: string | number;
  nome: string;
  regiao: string;
  umidade: number;
  velocidade_vento: number;
  temperatura: number;
  nivel_fumaca: number;
  nivel_risco: string;
  data_medicao: string;
  latitude?: number;
  longitude?: number;
  estado?: string;
}

export interface Alert {
  id: string | number;
  status: string;
  nivel_criticidade: string;
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

const csvMonitoringPoints: MonitoringPoint[] = [
  { id: 1, nome: "Foco #1", regiao: "Cerrado", umidade: 20, velocidade_vento: 9.4, temperatura: 31.4, nivel_fumaca: 30, nivel_risco: "baixo", data_medicao: "2025-03-10T00:00:00Z", estado: "PIAUÍ" },
  { id: 2, nome: "Foco #2", regiao: "Amazônia", umidade: 54, velocidade_vento: 5.9, temperatura: 33.6, nivel_fumaca: 87, nivel_risco: "critico", data_medicao: "2025-03-10T00:00:00Z", estado: "MARANHÃO" },
  { id: 3, nome: "Foco #3", regiao: "Cerrado", umidade: 44, velocidade_vento: 15.8, temperatura: 39.2, nivel_fumaca: 60, nivel_risco: "baixo", data_medicao: "2025-03-10T00:00:00Z", estado: "MARANHÃO" },
  { id: 4, nome: "Foco #4", regiao: "Cerrado", umidade: 50, velocidade_vento: 6.8, temperatura: 31.2, nivel_fumaca: 73, nivel_risco: "baixo", data_medicao: "2025-03-10T00:00:00Z", estado: "TOCANTINS" },
  { id: 5, nome: "Foco #5", regiao: "Pantanal", umidade: 23, velocidade_vento: 8.8, temperatura: 37, nivel_fumaca: 70, nivel_risco: "baixo", data_medicao: "2025-03-10T00:00:00Z", estado: "MATO GROSSO DO SUL" },
  { id: 19, nome: "Foco #19", regiao: "Amazônia", umidade: 21, velocidade_vento: 13.7, temperatura: 40.5, nivel_fumaca: 68, nivel_risco: "critico", data_medicao: "2025-03-10T00:00:00Z", estado: "MARANHÃO" },
  { id: 20, nome: "Foco #20", regiao: "Cerrado", umidade: 53, velocidade_vento: 8.7, temperatura: 31.1, nivel_fumaca: 77, nivel_risco: "baixo", data_medicao: "2025-03-10T00:00:00Z", estado: "GOIÁS" }
];

const csvAlerts: Alert[] = [
  {
    id: 1,
    titulo: "Risco Crítico Detectado - Amazônia",
    status: "ativo",
    nivel_criticidade: "critico",
    tipo: "risco_incendio",
    descricao: "Foco #2 na Amazônia apresenta nível crítico com alta concentração de fumaça (87%).",
    regiao: "Amazônia",
    estado: "MARANHÃO",
    data_inicio: "2025-03-10T00:00:00Z",
    created_date: "2025-03-10T00:00:00Z",
    recomendacoes: "Mobilizar equipes de emergência.",
    data_fim: null,
  },
  {
    id: 2,
    titulo: "Múltiplos Focos - Cerrado",
    status: "monitorando",
    nivel_criticidade: "alto",
    tipo: "multiplos_focos",
    descricao: "Detectados múltiplos focos na região do Cerrado.",
    regiao: "Cerrado",
    estado: "MARANHÃO",
    data_inicio: "2025-03-10T00:00:00Z",
    created_date: "2025-03-10T00:00:00Z",
    recomendacoes: "Aumentar monitoramento.",
    data_fim: null,
  }
];

export const localDataLoader = {
  getMonitoringPoints: (): MonitoringPoint[] => csvMonitoringPoints,
  getAlerts: (): Alert[] => csvAlerts
};