#!/bin/bash

# 🚀 EcoMonitor v2.0 - Script de Inicialização (Backend + Banco)

echo "🌿 Iniciando EcoMonitor v2.0..."

# Verificar se Docker está rodando
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker não está rodando. Inicie o Docker primeiro."
    echo "💡 Dica: Abra o Docker Desktop ou execute 'sudo systemctl start docker'"
    exit 1
fi

# Função para verificar se porta está em uso
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  Porta $1 já está em uso"
        return 1
    fi
    return 0
}

# Verificar portas necessárias
echo "🔍 Verificando portas..."
check_port 8000 || echo "   Backend pode ter conflito na porta 8000"
check_port 5432 || echo "   PostgreSQL pode ter conflito na porta 5432"

# Criar .env se não existir
if [ ! -f .env ]; then
    echo "📝 Criando arquivo .env..."
    cp .env.example .env
fi

# Subir backend + banco
echo "🐳 Iniciando containers..."
if ! docker-compose up -d --remove-orphans; then
    echo "❌ Erro ao iniciar containers"
    echo "📋 Verificando logs..."
    docker-compose logs
    exit 1
fi

# Aguardar serviços ficarem prontos
echo "⏳ Aguardando serviços iniciarem..."
sleep 8

# Verificar se backend está respondendo
echo "🔍 Verificando backend..."
for i in {1..30}; do
    if curl -s http://localhost:8000/health > /dev/null; then
        echo "✅ Backend FastAPI está rodando!"
        backend_ready=true
        break
    fi
    if [ $i -eq 30 ]; then
        echo "❌ Backend não respondeu após 30 tentativas"
        echo "📋 Logs do backend:"
        docker-compose logs backend
        exit 1
    fi
    echo "⏳ Tentativa $i/30..."
    sleep 2
done

if [ "$backend_ready" != true ]; then
    echo "❌ Backend não inicializou corretamente."
    exit 1
fi

echo ""
echo "🎉 EcoMonitor v2.0 iniciado com sucesso!"
echo ""
echo "📡 API Docs: http://localhost:8000/docs"
echo "🗄️  Database: localhost:5432"
echo ""
echo "💻 Frontend Next.js"
echo "   → Execute separadamente: npm run dev"
echo ""
echo "🛑 Para parar backend/banco: docker-compose down --remove-orphans"
echo "📊 Ver logs: docker-compose logs -f"