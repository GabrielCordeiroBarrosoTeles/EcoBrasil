#!/usr/bin/env python3
"""
Script para executar o backend FastAPI
"""

import uvicorn
import os

if __name__ == "__main__":
    # Configurações
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    reload = os.getenv("RELOAD", "true").lower() == "true"
    
    print("🚀 Iniciando EcoMonitor Backend v2.0")
    print(f"📡 API: http://{host}:{port}")
    print(f"📚 Docs: http://{host}:{port}/docs")
    
    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=reload
    )