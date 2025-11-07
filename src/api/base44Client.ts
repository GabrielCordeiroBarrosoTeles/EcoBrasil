import { createClient } from '@supabase/supabase-js';

console.log("=== Base44Client Configuração ===");
console.log("Chave da Cohere lida do .env:", process.env.REACT_APP_COHERE_API_KEY ? "Configurada" : "NÃO ENCONTRADA");
console.log("Supabase URL:", process.env.REACT_APP_SUPABASE_URL);

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY!;
const cohereApiKey = process.env.REACT_APP_COHERE_API_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ ERRO: Variáveis de ambiente do Supabase não configuradas!");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface InvokeLLMOptions {
  prompt: string;
  add_context_from_internet: boolean;
  response_json_schema: any;
}

// Dados locais para fallback
const localAlerts = [
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

const localMonitoringPoints = [
  { id: 1, nome: "Foco #1", regiao: "Cerrado", umidade: 20, velocidade_vento: 9.4, temperatura: 31.4, nivel_fumaca: 30, nivel_risco: "baixo", data_medicao: "2025-03-10T00:00:00Z", estado: "PIAUÍ" },
  { id: 2, nome: "Foco #2", regiao: "Amazônia", umidade: 54, velocidade_vento: 5.9, temperatura: 33.6, nivel_fumaca: 87, nivel_risco: "critico", data_medicao: "2025-03-10T00:00:00Z", estado: "MARANHÃO" },
  { id: 3, nome: "Foco #3", regiao: "Cerrado", umidade: 44, velocidade_vento: 15.8, temperatura: 39.2, nivel_fumaca: 60, nivel_risco: "baixo", data_medicao: "2025-03-10T00:00:00Z", estado: "MARANHÃO" },
  { id: 4, nome: "Foco #4", regiao: "Cerrado", umidade: 50, velocidade_vento: 6.8, temperatura: 31.2, nivel_fumaca: 73, nivel_risco: "baixo", data_medicao: "2025-03-10T00:00:00Z", estado: "TOCANTINS" },
  { id: 5, nome: "Foco #5", regiao: "Pantanal", umidade: 23, velocidade_vento: 8.8, temperatura: 37, nivel_fumaca: 70, nivel_risco: "baixo", data_medicao: "2025-03-10T00:00:00Z", estado: "MATO GROSSO DO SUL" }
];

// Helper function to handle network errors
const handleNetworkError = (error: any, context: string, fallbackData: any[]) => {
  console.error(`❌ Erro na requisição (${context}):`, error);
  
  if (error?.message?.includes('Failed to fetch') || error?.code === 'ERR_NAME_NOT_RESOLVED' || error?.message?.includes('NetworkError')) {
    console.warn("🔴 Problema de conectividade com o Supabase. Usando dados locais...");
    return { data: fallbackData, error: 'CONNECTION_ERROR', usingLocalData: true };
  }
  
  throw error;
};

export const base44 = {
  entities: {
    Alert: {
      list: async (sort = '-created_at', limit = 50) => {
        console.log("🔍 Buscando Alertas...");
        try {
          const { data, error } = await supabase.from('alert').select('*').order('created_at', { ascending: false }).limit(limit);
          if (error) { 
            console.error("❌ Erro do Supabase (Alerts):", error); 
            throw error; 
          }
          console.log("✅ Alertas encontrados:", data?.length || 0);
          return data?.map(item => ({ ...item, created_date: item.created_at })) || [];
        } catch (error: any) {
          const result = handleNetworkError(error, 'Alertas', localAlerts);
          if (result.usingLocalData) {
            console.log("📱 Usando dados locais de alertas");
          }
          return result.data;
        }
      },
      update: async (id: string | number, updateData: any) => {
        const { data, error } = await supabase.from('alert').update(updateData).eq('id', id);
        if (error) { console.error("Erro do Supabase (Update Alert):", error); throw error; }
        return data;
      }
    },
    MonitoringPoint: {
      list: async (sort = '-data_medicao', limit = 100) => {
        console.log("🔍 Buscando MonitoringPoints...");
        try {
          const { data, error } = await supabase.from('monitoringpoint').select('*').order('data_medicao', { ascending: false }).limit(limit);
          if (error) { 
            console.error("❌ Erro do Supabase (MonitoringPoints):", error); 
            throw error; 
          }
          console.log("✅ MonitoringPoints encontrados:", data?.length || 0);
          console.log("📊 Primeiros dados:", data?.slice(0, 2));
          return data || [];
        } catch (error: any) {
          const result = handleNetworkError(error, 'MonitoringPoints', localMonitoringPoints);
          if (result.usingLocalData) {
            console.log("📱 Usando dados locais de pontos de monitoramento");
          }
          return result.data;
        }
      }
    }
  },

  integrations: {
    Core: {
      InvokeLLM: async (options: InvokeLLMOptions) => {
        console.log("🤖 REAL AI (Cohere): Enviando prompt para análise...");
        
        const COHERE_URL = 'https://api.cohere.ai/v1/chat';

        const fullPrompt = options.prompt + "\n\nResponda APENAS com o objeto JSON solicitado, sem nenhum texto, explicação ou formatação adicional. O JSON deve começar com `{` e terminar com `}`.";

        const requestBody = {
          model: "command-a-03-2025",
          message: fullPrompt,
        };

        const response = await fetch(COHERE_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${cohereApiKey}`
          },
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          const errorBody = await response.json();
          console.error("❌ Erro detalhado da API Cohere:", errorBody);
          throw new Error(`Erro na API Cohere: ${response.statusText}`);
        }

        const data = await response.json();
        const text = data.text; 
        
        try {
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (!jsonMatch) {
            throw new Error("Nenhum objeto JSON encontrado na resposta da IA.");
          }
          return JSON.parse(jsonMatch[0]);
        } catch (e) {
          console.error("❌ Erro ao converter resposta da Cohere para JSON:", e);
          console.error("Resposta recebida da IA:", text);
          throw new Error("A resposta da Cohere não estava em formato JSON válido.");
        }
      }
    }
  }
};