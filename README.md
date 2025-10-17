# EcoMonitor: Sistema Preditivo de Riscos Ambientais com IA


## ❯ Sobre o Projeto

O EcoMonitor é uma plataforma web desenvolvida para o monitoramento, análise e previsão de riscos ambientais, com um foco inicial em focos de queimadas no Brasil. A aplicação utiliza dados geoespaciais reais (fornecidos pelo INPE) e os integra com uma Inteligência Artificial para gerar análises preditivas, oferecendo uma ferramenta poderosa de suporte à decisão para analistas ambientais e equipas de resposta.

Este projeto foi construído como um protótipo funcional completo, demonstrando uma arquitetura moderna de frontend, integração com serviços de BaaS (Backend-as-a-Service) e a utilização de APIs de Modelos de Linguagem Grandes (LLMs) para processamento de dados complexos.

---

## ✨ Funcionalidades Principais

* **Dashboard Interativo:** Visualização rápida de estatísticas chave, tendências de temperatura e fumaça, e distribuição de níveis de risco através de gráficos dinâmicos.
* **Análise Preditiva com IA:** Utiliza uma API de IA (Cohere) para analisar dados de uma região específica e gerar previsões de probabilidade de incêndio, identificar áreas de preocupação e sugerir ações de mitigação.
* **Histórico de Alertas:** Uma interface completa para visualizar, filtrar (por status e criticidade) e gerir todos os alertas gerados pelo sistema.
* **Visualização de Dados Históricos:** Gráficos detalhados que permitem a análise de tendências de dados de monitoramento ao longo do tempo.
* **Arquitetura Flexível:** O sistema foi desenhado para alternar facilmente entre uma API de simulação (mock local) para desenvolvimento offline e APIs reais (Supabase, Cohere) para produção.

---

## 🚀 Tecnologias Utilizadas

Este projeto foi construído com as seguintes tecnologias:

* **Frontend:** React.js, TypeScript
* **Estilização:** Tailwind CSS, shadcn/ui
* **Visualização de Dados:** Recharts, Leaflet.js
* **Gestão de Dados e Estado:** TanStack Query (React Query)
* **Backend (BaaS):** Supabase (Banco de Dados PostgreSQL)
* **Inteligência Artificial:** Cohere API
* **Ambiente de Desenvolvimento:** Node.js, Create React App, Git, GitHub

---

## ⚙️ Como Executar o Projeto

Siga os passos abaixo para configurar e executar o projeto localmente.

### Pré-requisitos

* [Node.js](https://nodejs.org/en/) (v18.x ou superior)
* [npm](https://www.npmjs.com/) ou [Yarn](https://yarnpkg.com/)

### Instalação

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/seu-usuario/seu-repositorio.git](https://github.com/seu-usuario/seu-repositorio.git)
    cd seu-repositorio
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure as Variáveis de Ambiente:**
    * Crie uma cópia do ficheiro `.env.example` e renomeie-a para `.env`.
        ```bash
        cp .env.example .env
        ```
    * Abra o novo ficheiro `.env` e preencha as chaves de API necessárias:
        ```env
        # Chaves da API do Supabase
        REACT_APP_SUPABASE_URL=SUA_URL_DO_SUPABASE_AQUI
        REACT_APP_SUPABASE_ANON_KEY=SUA_CHAVE_ANON_DO_SUPABASE_AQUI

        # Chave da API da IA (Cohere)
        REACT_APP_COHERE_API_KEY=SUA_CHAVE_DA_COHERE_AQUI
        ```

4.  **Inicie a Aplicação:**
    ```bash
    npm start
    ```
    A aplicação estará disponível em `http://localhost:3000`.

---



