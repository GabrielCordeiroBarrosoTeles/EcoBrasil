# EcoMonitor — Pitch Deck das Telas

> Estrutura pensada para apresentação executiva (reuniões comerciais, demos rápidas ou comitês). Cada seção equivale a um slide.

---

## Slide 1 — Visão Geral

- **O desafio**: governos e empresas precisam antecipar incêndios florestais para direcionar recursos e evitar perdas.
- **Nossa proposta**: plataforma “end-to-end” que combina monitoramento em tempo real, predição via IA e insights acionáveis.
- **Tech stack**: Next.js 14 (frontend), FastAPI (backend), PostgreSQL (dados), motor de IA próprio (FWI + Haines + logística).
- **Por que importa**: decisões em minutos, não em horas; redução de custos operacionais e tempo de resposta de campo.

---

## Slide 2 — Jornada do Usuário (Layout Global)

- **Barra lateral inteligente**: navegação clara entre os módulos (Dashboard → Alertas → IA → Histórico).
- **Experiência omnicanal**: menu recolhível e versão mobile que mantém o acesso ao vivo em campo.
- **Governança**: modal de confirmação para ações críticas (logout, resoluções) e status “Sistema Online” em tempo real.
- **Usuário no centro**: identidade visual consistente, atalhos rápidos e contagem de notificações priorizando atenção.

---

## Slide 3 — Dashboard (Situação Atual)

- **Objetivo**: oferecer “pulse check” imediato sobre clima, risco e alertas em produção.
- **KPIs principais**:
  - Temperatura média dos pontos (trend analisado com `useMemo`)
  - Total de alertas ativos – integramos `alertSummary` do backend
  - Pontos críticos em monitoramento
  - Regiões cobertas (indicador de cobertura operacional)
- **Insights visuais**:
  - `AreaChart` correlacionando temperatura × fumaça (últimas amostras)
  - `BarChart` de alertas por região para priorização de recursos
- **Confiabilidade**: mensagens específicas quando a API falha (fallback) e spinners para latência controlada.

---

## Slide 4 — Gestão de Alertas (Operação)

- **Para quem**: equipes de resposta, centros de operação e coordenação com brigadistas.
- **Recursos-chave**:
  - Filtros combinados (status + criticidade) para ajustar a fila operacional
  - Cards ricos com descrição, região, recomendações e timeline
  - Workflow de status (`ativo` → `monitorando` → `resolvido`) com mutation otimista
- **Monitoramento geográfico**:
  - Modal exclusivo com Google Maps embutido para checar coordenadas e contexto
  - Falhas tratadas (“sem coordenadas”) com mensagens guiadas
- **Governança**:
  - Confirmação customizada antes de “Resolver” um alerta, evitando mudanças acidentais
  - Invalidação automática da cache para manter lista sempre atualizada

---

## Slide 5 — Análise Preditiva com IA

- **Objetivo**: transformar dados ambientais em previsão acionável para os próximos 3 dias.
- **Fluxo do usuário**:
  1. Seleciona região (botões dinâmicos baseados em dados disponíveis)
  2. IA processa indicadores meteorológicos sem sair da tela (`runAnalysis`)
  3. Recebe probabilidade, classificação de criticidade e metodologia aplicada
- **O que a IA entrega**:
  - Probabilidade calculada a partir do ensemble FWI + Haines + regressão logística
  - Métricas auxiliares (FWI médio, Haines médio, pontos analisados)
  - Recomendações adaptadas ao nível de risco (comunicação, patrulha, contingência)
- **Experiência humana**: estados de loading, mensagens de erro amigáveis e histórico (timestamp) para auditoria.

---

## Slide 6 — Histórico & Tendências

- **Função estratégica**: entender comportamento climático e eficiência das ações ao longo do tempo.
- **Filtros temporais**: 7, 30, 90 dias ou período completo — com recalculo instantâneo das séries.
- **Métricas destacadas**:
  - Total de registros válidos
  - Temperatura média no período
  - Tendência térmica (indicador ↑/↓/→ com porcentagem)
  - Alertas ativos registrados no intervalo
- **Visualizações**:
  - Séries temporais (temperatura × fumaça) com seleções de até 30 amostras
  - Distribuição de risco e histogramas de alertas por região, para planejamento de recursos
- **Resultado**: evidencia onde a política de prevenção funciona e quais regiões exigem reforço.

---

## Slide 7 — Inteligência por trás das telas

- **Motor de IA** (`backend/app/services/ai_engine.py`):
  - Calcula FWI com FFMC/DMC/DC, Haines com gradiente térmico e regressão logística sazonal
  - Pondera modelos (0.4/0.3/0.3) e adiciona ajuste bayesiano por densidade de pontos críticos
- **Ingestão de dados** (`backend/migrate_data.py`):
  - Normaliza coordenadas, distribui timestamps para 180 dias e gera alertas sintéticos por região
- **Camada de API** (`lib/apiClient.ts`):
  - Abstrai chamadas REST (`getMonitoringPoints`, `getAlerts`, `calculateFireRisk`, etc.) com tipagem TypeScript
- **Sustentação**:
  - Docker Compose com FastAPI + PostgreSQL
  - Scripts `start.sh` / `stop.sh` para orquestração simplificada em demos e ambientes de teste

---

## Slide 8 — Próximos Passos (Call to Action)

- **Para clientes governamentais**: integrar fontes meteorológicas adicionais ou satélite em tempo real.
- **Para utilities/private**: acoplar alertas automáticos (SMS, e-mail, integração com sistemas de despacho).
- **Roadmap técnico**:
  - Feature flag para cenários simulados (“what-if”)
  - Painel de calibração dos pesos regionais direto no frontend
- **Pronto para prova de conceito**:
  - Ambiente containerizado
  - Script de migração gera dados realistas para demonstração imediata
  - Documentação atualizada (`README.md`) e este guia para storytelling

---

### Contatos

- Demonstração técnica, integrações e customizações: equipe EcoMonitor  
- Repositório: `github.com/<org>/EcoBrasil`  
- Documentação técnica detalhada: `README.md` e código-fonte comentado

