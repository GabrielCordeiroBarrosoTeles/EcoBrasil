# 🔥 IA de Análise de Riscos de Incêndios Florestais

Serviço de IA em Python otimizado com **NumPy**, **SciPy** e **PyTorch** para cálculo de probabilidade de incêndio baseado em dados meteorológicos.

## 🧠 Sistema de "Mente" (Modelos Salvos)

A IA salva seus **pesos treinados** em arquivos `.pt` (PyTorch) na pasta `mentes/`.

### Características:
- ✅ **Persistência de Pesos**: Pesos otimizados salvos após cada treinamento
- ✅ **Versionamento**: Cada modelo tem versão e data de treinamento
- ✅ **Carregamento Automático**: IA carrega automaticamente o último modelo treinado
- ✅ **Metadados**: Armazena informações sobre o treinamento (pontos analisados, performance, etc.)

### Arquivos Salvos:
```
ai_service/mentes/
└── fire_risk_model.pt  # Modelo treinado com pesos e metadados
```

## 🚀 Performance

### Otimizações Implementadas:
- ✅ **Processamento Vetorizado (NumPy)**: Operações em lote substituem loops individuais
- ✅ **Análise Estatística (SciPy)**: Uso de percentis, desvio padrão e mediana
- ✅ **Correção Bayesiana**: Ajuste inteligente baseado em distribuição de riscos
- ✅ **Processamento em Memória**: Arrays NumPy para alta performance

### Ganho de Performance:
- **Antes**: ~2-3 segundos para 41.000 pontos
- **Agora**: ~0.3-0.5 segundos para 41.000 pontos
- **Speedup**: ~6-10x mais rápido

## 📦 Instalação

```bash
# Instalar dependências
pip install -r requirements.txt
```

## 🧮 Fórmula de Cálculo

A IA utiliza cálculo vetorizado para o índice de risco:

**Índice de Risco = (Temperatura × (1 - Umidade/100) × Nível de Fumaça × Velocidade do Vento) × Peso de Risco**

### Pesos Atribuídos:
- **Temperatura**: 0.4 (peso alto - fator crítico)
- **Umidade**: 0.3 (invertida - baixa umidade aumenta risco)
- **Nível de Fumaça**: 0.2 (concentração de partículas)
- **Velocidade do Vento**: 0.1 (potencial de propagação)

### Normalização Vetorizada:
```python
temp_norm = np.clip(temps / 50, 0, 1)           # 0-50°C → 0-1
humidity_risk = 1 - (humidities / 100)          # Invertida
smoke_norm = smokes / 100                       # 0-100% → 0-1
wind_norm = np.clip(winds / 30, 0, 1)          # 0-30 km/h → 0-1
```

## 📊 Estatísticas Calculadas

O sistema retorna:
- **Média Aritmética**: Tendência central
- **Mediana**: Valor que divide ao meio
- **Desvio Padrão**: Dispersão dos dados
- **Percentil 75**: Identificação de outliers
- **Ajuste Bayesiano**: Baseado em proporção de pontos críticos

## 🔄 Execução

```bash
# Executar cálculo básico
python3 main.py

# Integração com Cohere
python3 integration.py
```

## 📁 Estrutura de Dados CSV

O CSV deve conter as seguintes colunas:
- `nome`: Nome do ponto de monitoramento
- `temperatura`: Temperatura em °C
- `umidade`: Umidade em %
- `nivel_fumaca`: Nível de fumaça em %
- `velocidade_vento`: Velocidade do vento em km/h
- `nivel_risco`: Nível de risco (baixo, medio, alto, critico)

## 🧪 Teste de Performance

```python
import time

# Dados de teste (10.000 pontos)
data = [create_test_point() for _ in range(10000)]

# Medir tempo
start = time.time()
result = calculator.calculate_fire_probability(data)
end = time.time()

print(f"Processado {len(data)} pontos em {end-start:.3f}s")
```

## 📈 Resultado de Exemplo

```json
{
  "probabilidade_incendio": 72.2,
  "indice_medio": 65.91,
  "indice_mediano": 66.12,
  "desvio_padrao": 12.45,
  "percentil_75": 77.80,
  "pontos_analisados": 41620,
  "pontos_criticos": 1240,
  "pontos_alto_risco": 8520
}
```

## 🔧 Tecnologias

- **NumPy**: Computação numérica vetorizada
- **SciPy**: Algoritmos estatísticos avançados
- **Python 3.9+**: Linguagem base

## 📝 Licença

MIT
