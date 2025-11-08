export type RiskLevel = "baixo" | "medio" | "alto" | "critico";
export type AlertStatus =
  | "ativo"
  | "monitorando"
  | "resolvido"
  | "em_andamento"
  | "cancelado";

export type RegionName =
  | "Amazônia"
  | "Cerrado"
  | "Caatinga"
  | "Pantanal"
  | "Mata Atlântica";

export type RegionSlug =
  | "amazonia"
  | "cerrado"
  | "caatinga"
  | "pantanal"
  | "mata_atlantica";

export type RegionValue = RegionName | RegionSlug;

export interface MonitoringPoint {
  id: number;
  nome: string;
  regiao: RegionValue;
  temperatura: number;
  umidade: number;
  nivel_fumaca: number;
  velocidade_vento: number;
  nivel_risco: RiskLevel;
  latitude?: number | null;
  longitude?: number | null;
  estado?: string | null;
  data_medicao: string;
  created_at?: string;
}

export interface MonitoringPointFilters {
  skip?: number;
  limit?: number;
  regiao?: RegionSlug | RegionName;
}

export interface MonitoringStats {
  total_pontos: number;
  por_regiao: Record<string, number>;
  por_nivel_risco: Record<RiskLevel, number>;
}

export interface Alert {
  id: number;
  titulo: string;
  descricao: string;
  nivel_criticidade: RiskLevel;
  regiao: RegionValue;
  probabilidade?: number;
  status: AlertStatus;
  created_at: string;
  updated_at?: string | null;
  tipo?: string | null;
  estado?: string | null;
  data_inicio?: string | null;
  recomendacoes?: string | null;
  data_fim?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface AlertFilters {
  skip?: number;
  limit?: number;
  status?: AlertStatus;
  nivel_criticidade?: RiskLevel;
}

export interface MutateAlertStatusPayload {
  id: number;
  status: AlertStatus;
}

export interface FireRiskRequest {
  regiao?: RegionSlug;
  limit?: number;
}

export interface FireRiskResponse {
  probabilidade_incendio: number;
  metodologia: string;
  pontos_analisados: number;
  fwi_medio?: number | null;
  haines_medio?: number | null;
  ensemble_score?: number | null;
}