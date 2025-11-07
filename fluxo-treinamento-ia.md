# Fluxo de Treinamento da IA - Sistema de Monitoramento de Incêndios

## Diagrama do Processo Automatizado

```mermaid
graph TD
    A[⏰ Ciclo 10min] --> B[📥 Download CSV]
    B --> C[🔧 Organizar dados]
    C --> D[📊 Processar dados]
    D --> E[🧠 Treinar IA]
    E --> F[💾 Salvar .pt]
    F --> G[📈 Atualizar dashboard]
    G --> H[🗑️ Apagar CSV]
    H --> A
    
    style A fill:#FF6B6B,color:#fff
    style B fill:#4ECDC4,color:#fff
    style C fill:#FF9F43,color:#fff
    style D fill:#45B7D1,color:#fff
    style E fill:#96CEB4,color:#fff
    style F fill:#FFEAA7,color:#000
    style G fill:#DDA0DD,color:#fff
    style H fill:#FFB347,color:#fff
```

## Resumo do Fluxo

🔄 **Ciclo Automatizado de 10 minutos:**
1. 📥 Baixa dados CSV de incêndios
2. 🔧 Organiza dados via programa
3. 📊 Processa e limpa os dados
4. 🧠 Treina modelo neural
5. 💾 Salva pesos em arquivo `.pt`
6. 📈 Atualiza dashboard
7. 🗑️ Remove CSVs para economizar espaço
8. ⏰ Repete o ciclo

## Benefícios
- ✅ **Totalmente automatizado**
- 🚀 **Dados sempre atualizados**
- 💡 **IA em constante aprendizado**
- 🎯 **Dashboard em tempo real**