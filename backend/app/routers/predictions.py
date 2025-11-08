from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models.monitoring import MonitoringPoint as MonitoringPointModel
from ..schemas.monitoring import FireRiskResponse
from ..services.ai_engine import AIEngine

router = APIRouter(prefix="/predictions", tags=["predictions"])

@router.post("/fire-risk", response_model=FireRiskResponse)
async def calculate_fire_risk(
    regiao: Optional[str] = None,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Calcular risco de incêndio para região"""
    try:
        ai_engine = AIEngine()
        
        # Buscar pontos de monitoramento
        query = db.query(MonitoringPointModel)
        if regiao:
            # Validar região
            valid_regions = ['amazonia', 'cerrado', 'caatinga', 'pantanal', 'mata_atlantica']
            if regiao not in valid_regions:
                raise HTTPException(status_code=400, detail=f"Região inválida. Use: {valid_regions}")
            query = query.filter(MonitoringPointModel.regiao == regiao)
        
        points = query.limit(min(limit, 1000)).all()
        
        if not points:
            raise HTTPException(
                status_code=404, 
                detail=f"Nenhum ponto encontrado para região: {regiao}"
            )
        
        # Calcular risco usando AI Engine
        result = await ai_engine.calculate_fire_risk(points)
        
        return FireRiskResponse(**result)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao calcular risco: {str(e)}")

@router.get("/fire-risk/{regiao}", response_model=FireRiskResponse)
async def get_fire_risk_by_region(
    regiao: str,
    db: Session = Depends(get_db)
):
    """Obter risco de incêndio por região específica"""
    try:
        # Validar região
        valid_regions = ['amazonia', 'cerrado', 'caatinga', 'pantanal', 'mata_atlantica']
        if regiao not in valid_regions:
            raise HTTPException(status_code=400, detail=f"Região inválida. Use: {valid_regions}")
        
        ai_engine = AIEngine()
        
        points = db.query(MonitoringPointModel).filter(
            MonitoringPointModel.regiao == regiao
        ).all()
        
        if not points:
            raise HTTPException(
                status_code=404,
                detail=f"Nenhum dado encontrado para região: {regiao}"
            )
        
        result = await ai_engine.calculate_fire_risk(points)
        return FireRiskResponse(**result)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao obter risco por região: {str(e)}")

@router.get("/regions")
async def get_available_regions(db: Session = Depends(get_db)):
    """Listar regiões disponíveis para análise"""
    try:
        regions = db.query(MonitoringPointModel.regiao).distinct().all()
        return {"regioes": [r[0] for r in regions if r[0]]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao obter regiões: {str(e)}")

@router.post("/analyze-custom")
async def analyze_custom_data(points_data: List[dict]):
    """Analisar dados customizados enviados pelo usuário"""
    try:
        if not points_data or len(points_data) == 0:
            raise HTTPException(status_code=400, detail="Dados não fornecidos")
        
        if len(points_data) > 100:
            raise HTTPException(status_code=400, detail="Máximo 100 pontos por análise")
        
        ai_engine = AIEngine()
        result = await ai_engine.calculate_fire_risk(points_data)
        return FireRiskResponse(**result)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao analisar dados customizados: {str(e)}")