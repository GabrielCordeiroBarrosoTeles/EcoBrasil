from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from enum import Enum

class RiskLevel(str, Enum):
    baixo = "baixo"
    medio = "medio"
    alto = "alto"
    critico = "critico"

class Region(str, Enum):
    amazonia = "Amazônia"
    cerrado = "Cerrado"
    caatinga = "Caatinga"
    pantanal = "Pantanal"
    mata_atlantica = "Mata Atlântica"

class MonitoringPointBase(BaseModel):
    nome: str
    regiao: Region
    temperatura: float
    umidade: float
    nivel_fumaca: float
    velocidade_vento: float
    nivel_risco: RiskLevel
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    estado: Optional[str] = None

class MonitoringPointCreate(MonitoringPointBase):
    pass

class MonitoringPoint(MonitoringPointBase):
    id: int
    data_medicao: datetime
    created_at: datetime

    class Config:
        from_attributes = True

class AlertBase(BaseModel):
    titulo: str
    descricao: str
    nivel_criticidade: RiskLevel
    regiao: str
    probabilidade: float

class AlertCreate(AlertBase):
    pass

class Alert(AlertBase):
    id: int
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class FireRiskResponse(BaseModel):
    probabilidade_incendio: float
    metodologia: str
    pontos_analisados: int
    fwi_medio: Optional[float] = None
    haines_medio: Optional[float] = None
    ensemble_score: Optional[float] = None