#!/bin/bash

# 🛑 EcoMonitor v2.0 - Script para Parar Backend + Banco

echo "🛑 Parando EcoMonitor v2.0..."

# Parar containers do compose atual
docker-compose down --remove-orphans

echo "✅ Backend e banco foram parados com sucesso!"
echo ""
echo "💡 Para reiniciar: ./start.sh"