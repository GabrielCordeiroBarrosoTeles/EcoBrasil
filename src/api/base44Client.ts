import { createClient } from '@supabase/supabase-js';

console.log("Chave da Cohere lida do .env:", process.env.REACT_APP_COHERE_API_KEY);


const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY!;
const cohereApiKey = process.env.REACT_APP_COHERE_API_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface InvokeLLMOptions {
  prompt: string;
  add_context_from_internet: boolean;
  response_json_schema: any;
}

export const base44 = {
  entities: {
    Alert: {
      list: async (sort = '-created_at', limit = 50) => {
        const { data, error } = await supabase.from('alert').select('*').order('created_at', { ascending: false }).limit(limit);
        if (error) { console.error("Erro do Supabase (Alerts):", error); throw error; }
        return data.map(item => ({ ...item, created_date: item.created_at }));
      },
      update: async (id: string | number, updateData: any) => {
        const { data, error } = await supabase.from('alert').update(updateData).eq('id', id);
        if (error) { console.error("Erro do Supabase (Update Alert):", error); throw error; }
        return data;
      }
    },
    MonitoringPoint: {
      list: async (sort = '-data_medicao', limit = 100) => {
        const { data, error } = await supabase.from('monitoringpoint').select('*').order('data_medicao', { ascending: false }).limit(limit);
        if (error) { console.error("Erro do Supabase (MonitoringPoints):", error); throw error; }
        return data;
      }
    }
  },

  integrations: {
    Core: {
      InvokeLLM: async (options: InvokeLLMOptions) => {
        console.log("REAL AI (Cohere): Enviando prompt para análise...");
        
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
          console.error("Erro detalhado da API Cohere:", errorBody);
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
          console.error("Erro ao converter resposta da Cohere para JSON:", e);
          console.error("Resposta recebida da IA:", text);
          throw new Error("A resposta da Cohere não estava em formato JSON válido.");
        }
      }
    }
  }
};