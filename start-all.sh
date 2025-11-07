#!/bin/bash

# Script para iniciar o frontend React e a API Python simultaneamente

echo "🚀 Iniciando EcoMonitor - Sistema Completo"
echo "=========================================="

# Função para cleanup quando o script for interrompido
cleanup() {
    echo ""
    echo "🛑 Parando todos os serviços..."
    kill $(jobs -p) 2>/dev/null
    exit 0
}

# Capturar Ctrl+C para fazer cleanup
trap cleanup SIGINT

# Verificar se Python está instalado
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 não encontrado. Instale Python3 para continuar."
    exit 1
fi

# Verificar se Node.js está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm não encontrado. Instale Node.js para continuar."
    exit 1
fi

echo "✅ Dependências verificadas"

# Instalar dependências Python se necessário
echo "📦 Verificando dependências Python..."
cd ai_service
if [ ! -d "venv" ]; then
    echo "🔧 Criando ambiente virtual Python..."
    python3 -m venv venv
fi

echo "🔧 Ativando ambiente virtual..."
source venv/bin/activate

echo "📦 Instalando dependências Python..."
pip install -r requirements.txt > /dev/null 2>&1

cd ..

# Verificar dependências Node.js
echo "📦 Verificando dependências Node.js..."
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências Node.js..."
    npm install
fi

echo ""
echo "🎯 Iniciando serviços..."
echo "========================"

# Iniciar API Python em background
echo "🐍 Iniciando API Python (porta 8000)..."
cd ai_service
source venv/bin/activate
python3 -m http.server 8000 --bind 127.0.0.1 &
PYTHON_PID=$!
cd ..

# Aguardar um pouco para a API iniciar
sleep 2

# Iniciar React em background
echo "⚛️  Iniciando React App (porta 3000)..."
npm start &
REACT_PID=$!

echo ""
echo "✅ Serviços iniciados com sucesso!"
echo "=================================="
echo "🌐 Frontend React: http://localhost:3000"
echo "🐍 API Python: http://localhost:8000"
echo ""
echo "💡 Pressione Ctrl+C para parar todos os serviços"
echo ""

# Aguardar indefinidamente (até Ctrl+C)
wait