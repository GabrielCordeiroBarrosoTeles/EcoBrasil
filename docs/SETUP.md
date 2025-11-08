# 🚀 Setup Completo - EcoMonitor v2.0

## ⚡ Execução Rápida (Recomendado)

```bash
# 1. Clonar e entrar no projeto
git clone <repo-url>
cd EcoBrasil

# 2. Iniciar tudo com Docker
docker-compose up -d

# 3. Acessar aplicação
# Frontend: http://localhost:3000
# API Docs: http://localhost:8000/docs
```

---

## 🛠️ Desenvolvimento Local

### **Backend (FastAPI)**
```bash
cd backend

# Instalar dependências
pip install -r requirements.txt

# Configurar ambiente
cp .env.example .env

# Iniciar servidor
python run.py
# ou
uvicorn app.main:app --reload --port 8000
```

### **Frontend (React)**
```bash
# Instalar dependências
npm install

# Configurar ambiente
cp .env.example .env

# Iniciar desenvolvimento
npm start
```

### **Database (PostgreSQL)**
```bash
# Subir apenas o banco
docker-compose up db -d

# Migrar dados (se necessário)
cd backend
python migrate_data.py
```

---

## 📡 Testando a API

### **1. Documentação Interativa**
Acesse: http://localhost:8000/docs

### **2. Endpoints Principais**

#### **Monitoramento**
```bash
# Listar pontos
curl http://localhost:8000/api/v1/monitoring/points

# Estatísticas
curl http://localhost:8000/api/v1/monitoring/stats
```

#### **Predições**
```bash
# Calcular risco de incêndio
curl -X POST http://localhost:8000/api/v1/predictions/fire-risk \
  -H "Content-Type: application/json" \
  -d '{"regiao": "Cerrado", "limit": 100}'
```

#### **Alertas**
```bash
# Listar alertas ativos
curl http://localhost:8000/api/v1/alerts/?status=ativo
```

---

## 🔧 Comandos Úteis

### **Docker**
```bash
# Subir tudo
docker-compose up -d

# Ver logs
docker-compose logs -f backend

# Parar tudo
docker-compose down

# Rebuild
docker-compose up --build
```

### **Database**
```bash
# Conectar ao PostgreSQL
docker exec -it ecobrasil_db_1 psql -U ecouser -d ecomonitor

# Backup
docker exec ecobrasil_db_1 pg_dump -U ecouser ecomonitor > backup.sql

# Restore
docker exec -i ecobrasil_db_1 psql -U ecouser ecomonitor < backup.sql
```

---

## 🎯 Estrutura Final

```
EcoBrasil/
├── backend/              # FastAPI Backend
├── src/                  # React Frontend  
├── public/               # Assets estáticos
├── database/             # Scripts DB
├── docker-compose.yml    # Orquestração
└── README.md            # Documentação
```

**✅ Arquitetura limpa, moderna e profissional!** 🔥