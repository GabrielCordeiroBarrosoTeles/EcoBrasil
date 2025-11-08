from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from ..database import get_db
from ..models.monitoring import Alert as AlertModel
from ..schemas.monitoring import Alert, AlertCreate

router = APIRouter(prefix="/alerts", tags=["alerts"])

@router.get("/", response_model=List[Alert])
async def get_alerts(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    nivel_criticidade: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Buscar alertas com filtros opcionais"""
    try:
        query = db.query(AlertModel)
        
        if status:
            query = query.filter(AlertModel.status == status)
        
        if nivel_criticidade:
            query = query.filter(AlertModel.nivel_criticidade == nivel_criticidade)
        
        alerts = query.offset(skip).limit(min(limit, 1000)).all()
        return alerts
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar alertas: {str(e)}")

@router.get("/{alert_id}", response_model=Alert)
async def get_alert(alert_id: int, db: Session = Depends(get_db)):
    """Buscar alerta específico"""
    alert = db.query(AlertModel).filter(AlertModel.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alerta não encontrado")
    return alert

@router.post("/", response_model=Alert)
async def create_alert(alert: AlertCreate, db: Session = Depends(get_db)):
    """Criar novo alerta"""
    db_alert = AlertModel(**alert.dict())
    db.add(db_alert)
    db.commit()
    db.refresh(db_alert)
    return db_alert

@router.put("/{alert_id}/status")
async def update_alert_status(
    alert_id: int,
    status: str,
    db: Session = Depends(get_db)
):
    """Atualizar status do alerta"""
    try:
        alert = db.query(AlertModel).filter(AlertModel.id == alert_id).first()
        if not alert:
            raise HTTPException(status_code=404, detail="Alerta não encontrado")
        
        # Validar status
        valid_statuses = ["ativo", "resolvido", "em_andamento", "cancelado"]
        if status not in valid_statuses:
            raise HTTPException(status_code=400, detail=f"Status inválido. Use: {valid_statuses}")
        
        alert.status = status
        db.commit()
        return {"message": "Status atualizado com sucesso"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Erro ao atualizar status: {str(e)}")

@router.get("/stats/summary")
async def get_alerts_summary(db: Session = Depends(get_db)):
    """Resumo estatístico dos alertas"""
    try:
        total_alerts = db.query(AlertModel).count()
        active_alerts = db.query(AlertModel).filter(AlertModel.status == "ativo").count()
        
        # Por nível de criticidade
        criticality_stats = db.query(
            AlertModel.nivel_criticidade,
            func.count(AlertModel.id)
        ).group_by(AlertModel.nivel_criticidade).all()
        
        return {
            "total_alertas": total_alerts,
            "alertas_ativos": active_alerts,
            "por_criticidade": dict(criticality_stats)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao obter resumo: {str(e)}")