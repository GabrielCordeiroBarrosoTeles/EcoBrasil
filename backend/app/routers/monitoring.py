from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from ..database import get_db
from ..models.monitoring import MonitoringPoint as MonitoringPointModel
from ..schemas.monitoring import MonitoringPoint, MonitoringPointCreate

router = APIRouter(prefix="/monitoring", tags=["monitoring"])

@router.get("/points", response_model=List[MonitoringPoint])
async def get_monitoring_points(
    skip: int = 0,
    limit: int = 100,
    regiao: str = None,
    db: Session = Depends(get_db)
):
    """Buscar pontos de monitoramento"""
    try:
        query = db.query(MonitoringPointModel)
        
        if regiao:
            query = query.filter(MonitoringPointModel.regiao == regiao)
        
        points = query.offset(skip).limit(min(limit, 1000)).all()
        return points
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar pontos: {str(e)}")

@router.get("/points/{point_id}", response_model=MonitoringPoint)
async def get_monitoring_point(point_id: int, db: Session = Depends(get_db)):
    """Buscar ponto específico"""
    try:
        point = db.query(MonitoringPointModel).filter(MonitoringPointModel.id == point_id).first()
        if not point:
            raise HTTPException(status_code=404, detail="Ponto não encontrado")
        return point
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar ponto: {str(e)}")

@router.post("/points", response_model=MonitoringPoint)
async def create_monitoring_point(
    point: MonitoringPointCreate,
    db: Session = Depends(get_db)
):
    """Criar novo ponto de monitoramento"""
    db_point = MonitoringPointModel(**point.dict())
    db.add(db_point)
    db.commit()
    db.refresh(db_point)
    return db_point

@router.get("/stats")
async def get_monitoring_stats(db: Session = Depends(get_db)):
    """Estatísticas gerais de monitoramento"""
    try:
        total_points = db.query(MonitoringPointModel).count()
        
        # Contagem por região
        regions = db.query(MonitoringPointModel.regiao, 
                          func.count(MonitoringPointModel.id)).group_by(MonitoringPointModel.regiao).all()
        
        # Contagem por nível de risco
        risk_levels = db.query(MonitoringPointModel.nivel_risco,
                              func.count(MonitoringPointModel.id)).group_by(MonitoringPointModel.nivel_risco).all()
        
        return {
            "total_pontos": total_points,
            "por_regiao": dict(regions),
            "por_nivel_risco": dict(risk_levels)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao obter estatísticas: {str(e)}")