from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session

from scoutai.models.player import PlayerProfile
from scoutai.models.metric import PerformanceMetric
from scoutai.models.scouting import PlayerBenchmark, PlayerComparisonLog
from scoutai.models.enums import CricketRole, BenchmarkLevel
from scoutai.schemas.scouting import (
    PlayerComparisonRequest,
    PlayerComparisonResponse,
    ComparisonMetricItem,
)


class AnalyticsService:
    @staticmethod
    def list_benchmarks(
        db: Session,
        role: Optional[CricketRole] = None,
        level: Optional[BenchmarkLevel] = None,
    ) -> List[PlayerBenchmark]:
        query = db.query(PlayerBenchmark)
        if role:
            query = query.filter(PlayerBenchmark.role == role)
        if level:
            query = query.filter(PlayerBenchmark.level == level)
        return query.all()

    @staticmethod
    def compare_player(db: Session, req: PlayerComparisonRequest) -> PlayerComparisonResponse:
        primary_player = db.query(PlayerProfile).filter_by(id=req.player_id).first()
        if not primary_player:
            raise ValueError(f"Primary player {req.player_id} not found.")

        target_player = None
        if req.target_player_id:
            target_player = db.query(PlayerProfile).filter_by(id=req.target_player_id).first()

        bench_level = req.benchmark_level or BenchmarkLevel.ACADEMY

        # Get latest metrics for primary player
        primary_metrics = (
            db.query(PerformanceMetric)
            .filter_by(player_id=primary_player.id)
            .order_by(PerformanceMetric.created_at.desc())
            .all()
        )
        primary_metric_map = {m.metric_name: m for m in primary_metrics}

        target_metric_map = {}
        if target_player:
            target_metrics = (
                db.query(PerformanceMetric)
                .filter_by(player_id=target_player.id)
                .order_by(PerformanceMetric.created_at.desc())
                .all()
            )
            target_metric_map = {m.metric_name: m for m in target_metrics}

        # Fetch benchmarks for primary player's role
        benchmarks = (
            db.query(PlayerBenchmark)
            .filter_by(role=primary_player.primary_role, level=bench_level)
            .all()
        )
        benchmark_map = {b.metric_name: b for b in benchmarks}

        items: List[ComparisonMetricItem] = []
        priorities: List[str] = []

        all_metric_names = set(primary_metric_map.keys()) | set(benchmark_map.keys())

        for m_name in all_metric_names:
            p_metric = primary_metric_map.get(m_name)
            t_metric = target_metric_map.get(m_name)
            b_mark = benchmark_map.get(m_name)

            p_val = p_metric.value if p_metric else 0.0
            unit = p_metric.unit if p_metric else (b_mark.unit if b_mark else "")
            cat = p_metric.category.value if p_metric else "GENERAL"
            t_val = t_metric.value if t_metric else None
            median = b_mark.p50 if b_mark else None

            # Calculate gap against benchmark median or target player
            ref_val = t_val if t_val is not None else median
            gap = round(p_val - ref_val, 2) if ref_val is not None else 0.0

            # Rank status
            status = "AVERAGE"
            if b_mark:
                if p_val >= b_mark.p90:
                    status = "ELITE"
                elif p_val >= b_mark.p75:
                    status = "ABOVE_AVERAGE"
                elif p_val <= b_mark.p25:
                    status = "BELOW_AVERAGE"
                    priorities.append(f"Improve {m_name.replace('_', ' ')} (currently {p_val}{unit}, below cohort p25)")

            items.append(
                ComparisonMetricItem(
                    metric_name=m_name,
                    category=cat,
                    unit=unit,
                    player_value=p_val,
                    target_value=t_val,
                    benchmark_median=median,
                    percentile_rank=p_metric.benchmark_percentile if p_metric else 50.0,
                    gap=gap,
                    status=status,
                )
            )

        verdict = (
            f"Comparison generated against {target_player.display_name if target_player else bench_level.value} "
            f"benchmark. {primary_player.display_name} exhibits strong athletic metrics with "
            f"{len(priorities)} identified development focus area(s)."
        )

        # Log comparison to DB
        comp_log = PlayerComparisonLog(
            primary_player_id=primary_player.id,
            target_player_id=target_player.id if target_player else None,
            benchmark_level=bench_level.value,
            comparison_summary={
                "metrics_analyzed": len(items),
                "verdict": verdict,
                "priorities": priorities,
            },
        )
        db.add(comp_log)
        db.commit()

        return PlayerComparisonResponse(
            primary_player={
                "id": primary_player.id,
                "name": primary_player.display_name,
                "role": primary_player.primary_role.value,
            },
            comparison_target={
                "type": "PLAYER" if target_player else "BENCHMARK",
                "name": target_player.display_name if target_player else bench_level.value,
            },
            compared_at=datetime.now(timezone.utc),
            metrics=items,
            scout_verdict=verdict,
            coaching_priority_areas=priorities if priorities else ["Maintain current technical stability"],
        )
