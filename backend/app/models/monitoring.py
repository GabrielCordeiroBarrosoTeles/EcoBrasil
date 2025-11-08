from sqlalchemy import Column, Integer, String, Float, DateTime, Enum
from sqlalchemy.sql import func
from ..database import Base
import enum

class RiskLevel(str, enum.Enum):
    baixo = "baixo"
    medio = "medio"
    alto = "alto"
    critico = "critico"

class Region(str, enum.Enum):
    amazonia = "Amazônia"
    cerrado = "Cerrado"
    caatinga = "Caatinga"
    pantanal = "Pantanal"
    mata_atlantica = "Mata Atlântica"

class MonitoringPoint(Base):
    __tablename__ = "monitoring_points"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, index=True)
    regiao = Column(Enum(Region))
    temperatura = Column(Float)
    umidade = Column(Float)
    nivel_fumaca = Column(Float)
    velocidade_vento = Column(Float)
    nivel_risco = Column(Enum(RiskLevel))
    latitude = Column(Float)
    longitude = Column(Float)
    estado = Column(String)
    data_medicao = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String)
    descricao = Column(String)
    nivel_criticidade = Column(Enum(RiskLevel))
    regiao = Column(String)
    probabilidade = Column(Float)
    status = Column(String, default="ativo")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())