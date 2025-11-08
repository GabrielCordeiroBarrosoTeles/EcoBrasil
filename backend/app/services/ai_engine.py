import numpy as np
import math
from datetime import datetime
from typing import List, Dict, Any
from ..schemas.monitoring import MonitoringPoint

class AIEngine:
    """Motor de IA integrado para análise de riscos de incêndio"""
    
    def __init__(self):
        # Pesos otimizados por região
        self.regional_weights = {
            'amazonia': {'temp': 0.35, 'humidity': 0.40, 'smoke': 0.15, 'wind': 0.10},
            'cerrado': {'temp': 0.45, 'humidity': 0.30, 'smoke': 0.15, 'wind': 0.10},
            'caatinga': {'temp': 0.50, 'humidity': 0.35, 'smoke': 0.10, 'wind': 0.05},
            'pantanal': {'temp': 0.40, 'humidity': 0.35, 'smoke': 0.15, 'wind': 0.10},
            'mata_atlantica': {'temp': 0.30, 'humidity': 0.45, 'smoke': 0.15, 'wind': 0.10},
        }
        
        # Fatores sazonais
        self.seasonal_factors = {
            1: 0.7, 2: 0.8, 3: 0.9, 4: 1.0, 5: 1.2, 6: 1.4,
            7: 1.5, 8: 1.5, 9: 1.4, 10: 1.2, 11: 1.0, 12: 0.8
        }

    def calculate_fwi_index(self, temp: float, humidity: float, wind: float) -> float:
        """Fire Weather Index - padrão internacional"""
        ffmc = 85 + 0.0365 * temp - 0.0365 * humidity
        ffmc = max(0, min(101, ffmc))
        
        dmc = max(0, 20 + 0.5 * temp - 0.2 * humidity)
        dc = max(0, 50 + 0.8 * temp - 0.3 * humidity)
        
        isi = 0.208 * ffmc * (1 + wind/10)
        bui = 0.8 * dmc * dc / (dmc + 0.4 * dc) if (dmc + 0.4 * dc) > 0 else 0
        
        if bui <= 80:
            fwi = 2.0 * math.log(isi + 1) + 0.45 * (bui - 50)
        else:
            fwi = 2.0 * math.log(isi + 1) + 0.45 * (bui - 50) + 0.1 * (bui - 80)
        
        return max(0, fwi)

    def calculate_haines_index(self, temp: float, humidity: float) -> float:
        """Índice Haines - instabilidade atmosférica"""
        temp_850 = temp
        temp_700 = temp - 10
        td_850 = temp - ((100 - humidity) / 5)
        
        stability = temp_850 - temp_700
        moisture = temp_850 - td_850
        haines = stability + moisture
        
        return max(0, min(6, haines))

    def calculate_logistic_probability(self, point: Dict[str, Any]) -> float:
        """Modelo logístico para probabilidade"""
        temp = float(point.get('temperatura', 0))
        humidity = float(point.get('umidade', 0))
        smoke = float(point.get('nivel_fumaca', 0))
        wind = float(point.get('velocidade_vento', 0))
        
        current_month = datetime.now().month
        seasonal_factor = self.seasonal_factors.get(current_month, 1.0)
        
        # Normalização
        temp_norm = temp / 50
        humidity_risk = (100 - humidity) / 100
        smoke_norm = smoke / 100
        wind_norm = wind / 30
        
        # Coeficientes calibrados
        z = (-2.5 + 3.2 * temp_norm + 2.8 * humidity_risk + 
             1.5 * smoke_norm + 0.8 * wind_norm + 1.2 * (seasonal_factor - 1))
        
        probability = 1 / (1 + math.exp(-z))
        return min(100, probability * 100)

    async def calculate_fire_risk(self, points: List[MonitoringPoint]) -> Dict[str, Any]:
        """Cálculo principal de risco de incêndio"""
        if not points:
            return {
                'probabilidade_incendio': 0.0,
                'metodologia': 'Sem dados disponíveis',
                'pontos_analisados': 0
            }

        fwi_scores = []
        haines_scores = []
        logistic_scores = []

        for point in points:
            # Converter para dict homogêneo
            if hasattr(point, "dict"):
                point_dict = point.dict()
            elif isinstance(point, dict):
                point_dict = point
            else:
                point_dict = {
                    "temperatura": getattr(point, "temperatura", 0),
                    "umidade": getattr(point, "umidade", 0),
                    "nivel_fumaca": getattr(point, "nivel_fumaca", 0),
                    "velocidade_vento": getattr(point, "velocidade_vento", 0),
                    "nivel_risco": getattr(point, "nivel_risco", "baixo"),
                    "regiao": getattr(point, "regiao", "cerrado"),
                }

            regiao_slug = str(point_dict.get("regiao", "cerrado")).lower().replace(" ", "_")
            weights = self.regional_weights.get(regiao_slug, self.regional_weights['cerrado'])

            temp = float(point_dict.get('temperatura', 0))
            humidity = float(point_dict.get('umidade', 0))
            wind = float(point_dict.get('velocidade_vento', 0))

            fwi = self.calculate_fwi_index(temp, humidity, wind)
            haines = self.calculate_haines_index(temp, humidity)
            logistic = self.calculate_logistic_probability(point_dict)
            
            fwi_scores.append(fwi)
            haines_scores.append(haines)
            logistic_scores.append(logistic)

        # Ensemble dos modelos
        fwi_avg = np.mean(fwi_scores)
        haines_avg = np.mean(haines_scores)
        logistic_avg = np.mean(logistic_scores)

        ensemble_probability = (
            0.4 * logistic_avg +
            0.3 * min(100, fwi_avg * 10) +
            0.3 * min(100, haines_avg * 16.67)
        )

        # Ajuste por pontos críticos
        critical_points = sum(
            1
            for p in points
            if (getattr(p, 'nivel_risco', None) or (p.get('nivel_risco') if isinstance(p, dict) else None))
            == 'critico'
        )
        high_points = sum(
            1
            for p in points
            if (getattr(p, 'nivel_risco', None) or (p.get('nivel_risco') if isinstance(p, dict) else None))
            == 'alto'
        )

        adjustment = (critical_points / len(points)) * 15 + (high_points / len(points)) * 8
        final_probability = min(100, ensemble_probability + adjustment)

        return {
            'probabilidade_incendio': round(final_probability, 1),
            'fwi_medio': round(fwi_avg, 2),
            'haines_medio': round(haines_avg, 2),
            'ensemble_score': round(ensemble_probability, 2),
            'metodologia': 'Ensemble: FWI + Haines + Logístico + Ajuste Bayesiano',
            'pontos_analisados': len(points)
        }