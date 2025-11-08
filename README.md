# 🌿 EcoMonitor: Sistema Preditivo de Riscos Ambientais

## 📋 Sobre o Projeto

O **EcoMonitor** é uma plataforma web moderna para monitoramento, análise e previsão de riscos de incêndios florestais no Brasil. Utiliza dados geoespaciais reais (INPE) integrados com Inteligência Artificial para análises preditivas precisas.

### ✨ Funcionalidades

- 🔥 **Análise Preditiva de Incêndios** - Probabilidade de incêndio nas próximas 72h
- 📊 **Dashboard Interativo** - Visualização em tempo real de estatísticas
- 🗺️ **Mapas Geoespaciais** - Localização e intensidade dos focos
- 📈 **Histórico de Alertas** - Análise de tendências e padrões
- 🤖 **IA Avançada** - Ensemble de modelos científicos (FWI + Haines + Logístico)

---

## 📋 Pré-requisitos

<details>
<summary><strong>🖥️ O que precisa estar instalado na máquina</strong></summary>

### **Obrigatório:**

- **Docker Desktop** (v20.10+)

  - Windows: [Download Docker Desktop](https://www.docker.com/products/docker-desktop/)
  - macOS: [Download Docker Desktop](https://www.docker.com/products/docker-desktop/)
  - Linux: `sudo apt install docker.io docker-compose`

- **Node.js** (v16+)

  - [Download Node.js](https://nodejs.org/)
  - Verificar: `node --version`

- **Git**
  - Windows: [Download Git](https://git-scm.com/)
  - macOS: `brew install git`
  - Linux: `sudo apt install git`

### **Opcional (para desenvolvimento):**

- **Python** (v3.11+) - apenas se quiser rodar backend local
- **PostgreSQL** - apenas se não usar Docker
- **VS Code** - editor recomendado

</details>

<details>
<summary><strong>🔧 Instalação e Configuração</strong></summary>

### **1. Clonar o Repositório**

```bash
git clone <url-do-repositorio>
cd EcoBrasil
```

### **2. Verificar Pré-requisitos**

```bash
# Verificar Docker
docker --version
docker-compose --version

# Verificar Node.js
node --version
npm --version
```

### **3. Instalar Dependências**

```bash
# Instalar dependências do frontend
npm install
```

### **4. Configurar Ambiente**

```bash
# Criar arquivo de configuração
cp .env.example .env
```

### **5. Inicializar Docker**

- **Windows/macOS**: Abrir Docker Desktop
- **Linux**: `sudo systemctl start docker`

</details>

<details>
<summary><strong>🚀 Executar o Sistema</strong></summary>

### **Método 1 - Script Automático (Recomendado)**

```bash
./start.sh
```

### **Método 2 - Docker Compose**

```bash
docker-compose up -d
```

### **Método 3 - NPM**

```bash
npm run dev
```

### **Verificar se está funcionando:**

- ✅ Frontend: http://localhost:3000
- ✅ API: http://localhost:8000/docs
- ✅ Health: http://localhost:8000/health

</details>

<details>
<summary><strong>🛠️ Solução de Problemas</strong></summary>

### **Docker não inicia:**

```bash
# Verificar se Docker está rodando
docker info

# Reiniciar Docker (Linux)
sudo systemctl restart docker
```

### **Porta em uso:**

```bash
# Ver o que está usando a porta
lsof -i :3000
lsof -i :8000

# Matar processo
kill -9 <PID>
```

### **Erro de permissão (Linux):**

```bash
# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER
# Fazer logout/login
```

### **Limpar containers:**

```bash
docker-compose down
docker system prune -f
```

</details>

## 🚀 Execução Rápida

<details>
<summary><strong>✅ Como subir tudo (frontend + backend + banco)</strong></summary>

1. **Instale as dependências do frontend (uma vez):**
   ```bash
   npm install
   ```
2. **Suba o backend FastAPI + PostgreSQL (Docker):**
   ```bash
   ./start.sh
   ```
   - API disponível em `http://localhost:8000`
   - Banco exposto em `localhost:5432`
3. **(Opcional, primeira vez)** popular o banco com dados históricos:
   ```bash
   docker-compose exec backend python migrate_data.py
   ```
4. **Rode o frontend Next.js em modo dev:**
   ```bash
   npm run dev
   ```
   - Interface disponível em `http://localhost:3000`

Para desligar:

```bash
docker-compose down --remove-orphans
```

</details>

<details>
<summary><strong>🧭 Fluxo do Sistema (Mermaid)</strong></summary>

```mermaid
flowchart LR
    U[Usuário no Browser] -->|HTTP (Next.js)| F[Frontend
Next 14]
    F -->|REST /api/v1| B[Backend
FastAPI]
    B -->|SQLAlchemy| DB[(PostgreSQL)]
    B -->|Dados de monitoramento| AI[AIEngine]
    AI --> DB
    AI --> B
    B -->|JSON| F
```

</details>

<details>
<summary><strong>🧮 Metodologia da Análise Preditiva</strong></summary>

A probabilidade final de incêndio é calculada via ensemble de três modelos:

1. **Fire Weather Index (FWI):**
   \[
   \text{FWI} = 2.0 \cdot \ln(\text{ISI} + 1) + 0.45 \cdot (\text{BUI} - 50)
   \]

   - ISI (Initial Spread Index) depende da velocidade do vento.
   - BUI (Build-Up Index) combina umidade e temperatura (via FFMC, DMC, DC).

2. **Índice Haines:**
   \[
   H = (T*{850} - T*{700}) + (T*{850} - T*{d,850})
   \]
   Mede instabilidade atmosférica em níveis médios.

3. **Modelo logístico sazonal:**
   \[
   z = -2.5 + 3.2\frac{T}{50} + 2.8 (1-\frac{U}{100}) + 1.5\frac{F}{100} + 0.8\frac{V}{30} + 1.2 (S - 1)
   \]
   \[
   P\_{log} = \frac{1}{1 + e^{-z}} \times 100
   \]
   Onde:

   - \(T\): temperatura (°C)
   - \(U\): umidade relativa (%)
   - \(F\): nível de fumaça (%)
   - \(V\): velocidade do vento (km/h)
   - \(S\): fator sazonal (mês atual)

4. **Ensemble + ajuste por criticidade:**
   \[
   P*{final} = \min\Big(100,\;0.4 P*{log} + 0.3 (10\cdot FWI) + 0.3 (16.67\cdot H) + \Delta\Big)
   \]
   \[
   \Delta = 15 \cdot \frac{N*{crit}}{N*{total}} + 8 \cdot \frac{N*{alto}}{N*{total}}
   \]

Esses valores alimentam o relatório da página “Análise Preditiva” e os painéis do dashboard.

</details>

---

## 🏗️ Arquitetura

### **Stack Tecnológico**

- **Frontend**: React.js + TypeScript + Tailwind CSS
- **Backend**: FastAPI + Python + SQLAlchemy
- **Database**: PostgreSQL
- **IA**: NumPy + SciPy (modelos científicos)
- **Deploy**: Docker + Docker Compose

### **Arquitetura Limpa**

```
Frontend (React) ←→ Backend (FastAPI) ←→ Database (PostgreSQL)
                         ↓
                    AI Engine (Python)
```

---

## 🧮 Fórmula Matemática da IA

### **Ensemble de Modelos Científicos**

#### **1. Fire Weather Index (FWI) - Padrão Internacional**

```
FWI = 2.0 × ln(ISI + 1) + 0.45 × (BUI - 50)
```

#### **2. Índice Haines (Instabilidade Atmosférica)**

```
Haines = (T₈₅₀ - T₇₀₀) + (T₈₅₀ - Td₈₅₀)
```

#### **3. Modelo Logístico (Probabilidade)**

```
P(incêndio) = 1 / (1 + e^(-z))
z = β₀ + β₁×Temp + β₂×Umidade + β₃×Fumaça + β₄×Vento + β₅×Sazonalidade
```

#### **Combinação Final (Ensemble)**

```
Probabilidade = 0.4×Logístico + 0.3×FWI + 0.3×Haines + Ajuste_Bayesiano
```

---

## 📡 API Endpoints

### **Monitoramento**

- `GET /api/v1/monitoring/points` - Listar pontos de monitoramento
- `GET /api/v1/monitoring/stats` - Estatísticas gerais

### **Predições**

- `POST /api/v1/predictions/fire-risk` - Calcular risco de incêndio
- `GET /api/v1/predictions/fire-risk/{regiao}` - Risco por região

### **Alertas**

- `GET /api/v1/alerts/` - Listar alertas
- `PUT /api/v1/alerts/{id}/status` - Atualizar status

### **Documentação**

- `GET /docs` - Swagger UI (documentação interativa)

---

## 🗄️ Estrutura do Projeto

```
EcoBrasil/
├── src/                      # React Frontend
├── backend/                  # FastAPI Backend
├── public/                   # Assets estáticos
├── docs/                     # Documentação
├── start.sh                  # Script de inicialização
├── docker-compose.yml        # Orquestração
└── README.md                # Este arquivo
```

---

## 🎯 Performance

- ⚡ **Processamento Vetorizado** (NumPy)
- 🚀 **API Assíncrona** (FastAPI)
- 📊 **Cálculos Otimizados** (6-10x mais rápido)
- 🔄 **Cache Inteligente**

---

## 📄 Licença

MIT License - Veja [LICENSE](LICENSE) para detalhes.

---

**EcoMonitor v2.0 - Arquitetura Moderna e IA Avançada** 🔥
