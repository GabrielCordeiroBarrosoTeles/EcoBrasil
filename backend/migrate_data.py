#!/usr/bin/env python3
"""
Script para migrar dados do CSV antigo para PostgreSQL
"""

import os
from datetime import datetime, timedelta, timezone
import random

import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.models.monitoring import MonitoringPoint, Alert, Base
from dotenv import load_dotenv

load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://ecouser:ecopass@localhost:5432/ecomonitor")

REGION_MAPPING = {
    "amazônia": "amazonia",
    "amazonia": "amazonia",
    "cerrado": "cerrado",
    "caatinga": "caatinga",
    "pantanal": "pantanal",
    "mata atlântica": "mata_atlantica",
    "mata atlantica": "mata_atlantica",
}

VALID_RISK_LEVELS = {"baixo", "medio", "alto", "critico"}


def normalise_region(value: str) -> str:
    if not value:
        return "cerrado"
    key = value.strip().lower()
    return REGION_MAPPING.get(key, "cerrado")


def normalise_risk(value: str) -> str:
    if not value:
        return "baixo"
    risk = value.strip().lower()
    return risk if risk in VALID_RISK_LEVELS else "baixo"


def normalise_coordinate(value: str | float | int | None, max_abs: float) -> float | None:
    if value is None or value == "" or (isinstance(value, float) and pd.isna(value)):
        return None

    try:
        coord = float(value)
    except (TypeError, ValueError):
        return None

    if abs(coord) <= max_abs:
        return coord

    scale = 10.0
    while abs(coord / scale) > max_abs and scale < 10_000_000:
        scale *= 10.0

    coord /= scale
    if abs(coord) > max_abs:
        return None

    return round(coord, 6)


def parse_datetime(raw: str | float | int | None) -> datetime:
    if isinstance(raw, datetime):
        return raw
    if isinstance(raw, (float, int)):
        return datetime.fromtimestamp(raw, tz=timezone.utc)
    if raw:
        try:
            return datetime.fromisoformat(str(raw)).astimezone(timezone.utc)
        except ValueError:
            pass
    return datetime.now(timezone.utc)


def migrate_csv_to_postgres() -> None:
    """Migra dados dos CSVs para PostgreSQL."""

    engine = create_engine(DATABASE_URL)
    Base.metadata.create_all(bind=engine)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    session = SessionLocal()

    try:
        # Limpar dados antigos para evitar duplicidades
        session.query(Alert).delete()
        session.query(MonitoringPoint).delete()
        session.commit()

        monitoring_csv = os.path.join(os.path.dirname(__file__), "..", "database", "seeds", "monitoringpoint_rows.csv")
        alerts_csv = os.path.join(os.path.dirname(__file__), "..", "database", "seeds", "alert_rows.csv")

        if not os.path.exists(monitoring_csv):
            raise FileNotFoundError(f"Arquivo {monitoring_csv} não encontrado")

        df_points = pd.read_csv(monitoring_csv)
        total_points = len(df_points)

        # Reduzir volume para dados mais manejáveis
        sample_size = min(total_points, 8000)
        df_points = df_points.sample(n=sample_size, random_state=42).reset_index(drop=True)

        # Normalizações
        df_points["nivel_risco"] = df_points["nivel_risco"].astype(str).str.lower().str.strip()
        df_points["regiao"] = df_points["regiao"].astype(str).str.strip()
        df_points["nome"] = df_points["nome"].astype(str).str.strip()
        df_points["estado"] = df_points.get("estado", "").astype(str).str.strip()

        inserted_points = 0
        base_date = datetime.now(timezone.utc)

        for idx, row in df_points.iterrows():
            risk = normalise_risk(row.get("nivel_risco"))
            region = normalise_region(row.get("regiao"))

            measurement_date = parse_datetime(row.get("data_medicao"))
            # Espalhar registros nos últimos 180 dias
            random_offset = timedelta(days=random.randint(0, 180), hours=random.randint(0, 23))
            measurement_date = base_date - random_offset
            created_at = measurement_date + timedelta(hours=random.randint(0, 6))

            point = MonitoringPoint(
                nome=row.get("nome", f"Ponto #{idx}"),
                regiao=region,
                temperatura=float(row.get("temperatura", 0) or 0),
                umidade=float(row.get("umidade", 0) or 0),
                nivel_fumaca=float(row.get("nivel_fumaca", 0) or 0),
                velocidade_vento=float(row.get("velocidade_vento", 0) or 0),
                nivel_risco=risk,
                latitude=normalise_coordinate(row.get("latitude"), 90.0),
                longitude=normalise_coordinate(row.get("longitude"), 180.0),
                estado=row.get("estado") or None,
                data_medicao=measurement_date,
                created_at=created_at,
            )
            session.add(point)
            inserted_points += 1

        session.commit()
        print(f"✅ {inserted_points} registros de pontos migrados com sucesso!")

        if os.path.exists(alerts_csv):
            df_alerts = pd.read_csv(alerts_csv).fillna("")
        else:
            df_alerts = pd.DataFrame()

        inserted_alerts = 0
        alert_records: list[dict] = []

        if not df_alerts.empty:
            for row in df_alerts.itertuples(index=False):
                alert_records.append(
                    {
                        "titulo": getattr(row, "titulo", "Alerta sem título") or "Alerta sem título",
                        "descricao": getattr(row, "descricao", "") or "Descrição não informada.",
                        "regiao": str(getattr(row, "regiao", "Indefinido") or "Indefinido"),
                        "nivel_criticidade": normalise_risk(getattr(row, "nivel_criticidade", "baixo")),
                        "status": str(getattr(row, "status", "ativo") or "ativo").strip().lower(),
                        "created_at": parse_datetime(getattr(row, "created_at", "")),
                        "probabilidade": float(getattr(row, "probabilidade", 0) or random.randint(25, 90)),
                    }
                )

        sample_alerts = [
            {
                "titulo": "Risco Elevado - Cerrado",
                "descricao": "Umidade crítica e temperaturas acima da média exigem monitoramento intensivo.",
                "regiao": "Cerrado",
                "nivel_criticidade": "alto",
                "status": "ativo",
                "created_at": base_date - timedelta(hours=12),
                "probabilidade": 78,
            },
            {
                "titulo": "Monitorando focos na Amazônia",
                "descricao": "Imagens de satélite detectaram aumento de fumaça em municípios do norte.",
                "regiao": "Amazônia",
                "nivel_criticidade": "medio",
                "status": "monitorando",
                "created_at": base_date - timedelta(days=2),
                "probabilidade": 55,
            },
            {
                "titulo": "Risco crítico no Pantanal",
                "descricao": "Ventos fortes e vegetação seca aumentam chance de propagação rápida.",
                "regiao": "Pantanal",
                "nivel_criticidade": "critico",
                "status": "ativo",
                "created_at": base_date - timedelta(days=1, hours=6),
                "probabilidade": 88,
            },
            {
                "titulo": "Incidente resolvido - Caatinga",
                "descricao": "Equipes em solo controlaram queimada próxima à reserva estadual.",
                "regiao": "Caatinga",
                "nivel_criticidade": "alto",
                "status": "resolvido",
                "created_at": base_date - timedelta(days=5),
                "probabilidade": 62,
            },
            {
                "titulo": "Vigilância reforçada - Mata Atlântica",
                "descricao": "Comunidades costeiras receberam alerta preventivo para restrição de queimadas.",
                "regiao": "Mata Atlântica",
                "nivel_criticidade": "medio",
                "status": "monitorando",
                "created_at": base_date - timedelta(days=3, hours=4),
                "probabilidade": 48,
            },
        ]

        needed_samples = max(0, 5 - len(alert_records))
        alert_records.extend(sample_alerts[:needed_samples])

        for record in alert_records:
            status = record["status"]
            if status not in {"ativo", "monitorando", "resolvido", "em_andamento", "cancelado"}:
                status = "ativo"

            alert = Alert(
                titulo=record["titulo"],
                descricao=record["descricao"],
                nivel_criticidade=record["nivel_criticidade"],
                regiao=record["regiao"],
                probabilidade=float(record["probabilidade"]),
                status=status,
                created_at=record["created_at"],
            )
            session.add(alert)
            inserted_alerts += 1

        session.commit()
        print(f"✅ {inserted_alerts} alertas migrados com sucesso!")

    except Exception as exc:  # pragma: no cover
        session.rollback()
        print(f"❌ Erro na migração: {exc}")
        raise
    finally:
        session.close()


if __name__ == "__main__":
    migrate_csv_to_postgres()