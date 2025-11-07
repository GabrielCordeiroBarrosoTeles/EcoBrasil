#!/bin/bash

# Script para iniciar EcoMonitor com MySQL local

echo "🐳 Iniciando EcoMonitor com MySQL"
echo "=================================="

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não encontrado. Instale Docker para continuar."
    exit 1
fi

# Verificar se docker-compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose não encontrado. Instale docker-compose para continuar."
    exit 1
fi

echo "✅ Docker verificado"

# Função para cleanup
cleanup() {
    echo ""
    echo "🛑 Parando todos os serviços..."
    docker-compose down
    kill $(jobs -p) 2>/dev/null
    exit 0
}

trap cleanup SIGINT

# Iniciar MySQL com Docker
echo "🐳 Iniciando MySQL com Docker..."
docker-compose up -d mysql

# Aguardar MySQL inicializar
echo "⏳ Aguardando MySQL inicializar..."
sleep 10

# Verificar se MySQL está rodando
echo "🔍 Verificando MySQL..."
if docker-compose ps mysql | grep -q "Up"; then
    echo "✅ MySQL iniciado com sucesso"
else
    echo "❌ Erro ao iniciar MySQL"
    exit 1
fi

# Instalar dependências da API se necessário
echo "📦 Verificando dependências da API..."
cd api-server
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências da API..."
    npm install
fi
cd ..

# Iniciar API Node.js
echo "🚀 Iniciando API Node.js..."
cd api-server
npm start &
API_PID=$!
cd ..

# Aguardar API inicializar
sleep 3

# Iniciar React
echo "⚛️  Iniciando React App..."
npm start &
REACT_PID=$!

echo ""
echo "✅ Todos os serviços iniciados!"
echo "==============================="
echo "🐳 MySQL: localhost:3306"
echo "🔧 phpMyAdmin: http://localhost:8080"
echo "🚀 API Node.js: http://localhost:3001"
echo "⚛️  React App: http://localhost:3000"
echo ""
echo "📊 Credenciais MySQL:"
echo "   Usuário: ecouser"
echo "   Senha: ecopass123"
echo "   Database: ecomonitor"
echo ""
echo "💡 Pressione Ctrl+C para parar todos os serviços"

# Aguardar indefinidamente
wait