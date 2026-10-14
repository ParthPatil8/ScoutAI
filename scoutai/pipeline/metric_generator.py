from typing import List, Dict, Any, Tuple
from scoutai.pipeline.interfaces import BiomechanicalOutput, RecognizedAction
from scoutai.models.enums import MetricCategory, MetricOrigin


class CricketMetricGenerator:
    """Transforms raw biomechanical kinematics into standardized, interpretable performance metrics."""

    def generate_metrics(
        self,
        bio_output: BiomechanicalOutput,
        assessment_type: str,
        player_context: Dict[str, Any],
    ) -> Tuple[List[Dict[str, Any]], float]:
        """Returns a list of metric dictionaries and an interpretable overall provisional technique score."""
        metrics: List[Dict[str, Any]] = []

        is_batting = "BATTING" in assessment_type.upper()
        is_bowling = "BOWLING" in assessment_type.upper()

        category = MetricCategory.BATTING if is_batting else (
            MetricCategory.BOWLING if is_bowling else MetricCategory.FIELDING
        )

        for name, value in bio_output.features.items():
            unit = bio_output.units.get(name, "")
            conf = bio_output.confidences.get(name, 0.90)
            method = bio_output.methodologies.get(name, "Automated 2D kinematic pose estimation")

            # Benchmark percentile estimation based on standard cricket biomechanics distribution
            percentile = self._estimate_percentile(name, value)
            interpretation = self._generate_interpretation(name, value, unit)

            metrics.append({
                "metric_name": name,
                "category": category,
                "value": float(value),
                "unit": unit,
                "confidence": float(conf),
                "benchmark_percentile": percentile,
                "origin": MetricOrigin.AUTO_DETECTED,
                "is_provisional": True,  # Monocular non-calibrated assessment is provisional
                "methodology": method,
                "interpretation": interpretation,
            })

        overall_score = self._compute_provisional_score(bio_output.features, assessment_type)
        return metrics, overall_score

    def _estimate_percentile(self, metric_name: str, value: float) -> float:
        """Estimate cohort percentile based on standard biomechanical references."""
        if metric_name == "front_knee_flexion_angle":
            # Ideal: 135 - 150 deg for front foot drive
            return 85.0 if 135.0 <= value <= 150.0 else (65.0 if 120.0 <= value <= 160.0 else 45.0)
        elif metric_name == "front_foot_stride_ratio":
            # Ideal: 0.65 - 0.85
            return 88.0 if 0.65 <= value <= 0.85 else (60.0 if 0.50 <= value <= 0.95 else 35.0)
        elif metric_name == "head_over_ball_alignment_score":
            return round(value * 95.0, 1)
        elif metric_name == "backlift_angle":
            # Ideal: 25 - 45 deg
            return 82.0 if 25.0 <= value <= 45.0 else 55.0
        elif metric_name == "bowling_elbow_extension_angle":
            # Legal if <= 15.0 deg
            return 90.0 if value <= 12.0 else (75.0 if value <= 15.0 else 20.0)
        elif metric_name == "front_knee_brace_angle":
            # Fast bowling ideal: 165 - 180 deg
            return 92.0 if value >= 165.0 else (70.0 if value >= 150.0 else 45.0)
        return 70.0

    def _generate_interpretation(self, metric_name: str, value: float, unit: str) -> str:
        if metric_name == "front_knee_flexion_angle":
            if 135.0 <= value <= 150.0:
                return f"Optimal knee bend ({value}{unit}) creating stable low center of gravity at impact."
            return f"Front knee angle ({value}{unit}) deviates slightly from recommended 135-150 deg range."
        elif metric_name == "front_foot_stride_ratio":
            if 0.65 <= value <= 0.85:
                return f"Well-proportioned stride ratio ({value}) ensures balanced forward weight transfer."
            elif value < 0.65:
                return f"Under-striding detected ({value}). May restrict reach and full bat extension."
            return f"Over-striding detected ({value}). May cause head to drop behind the ball trajectory."
        elif metric_name == "head_over_ball_alignment_score":
            if value >= 0.80:
                return f"Excellent head alignment ({value:.2f}). Eyes level directly over the point of contact."
            return f"Head alignment score ({value:.2f}) indicates slight head tilt away from delivery line."
        elif metric_name == "bowling_elbow_extension_angle":
            if value <= 15.0:
                return f"Compliant delivery action: {value}{unit} extension is within ICC 15-degree threshold."
            return f"Caution: elbow extension of {value}{unit} exceeds standard ICC 15-degree guideline."
        elif metric_name == "front_knee_brace_angle":
            if value >= 165.0:
                return f"Strong lead knee brace ({value}{unit}) facilitates efficient kinetic energy transfer."
            return f"Soft front knee ({value}{unit}) at delivery foot contact; potential loss of release pace."
        return f"Calculated value {value} {unit} tracked via monocular pose estimation."

    def _compute_provisional_score(self, features: Dict[str, float], assessment_type: str) -> float:
        """Transparent, interpretable composite scoring formula.
        
        Returns score from 0.0 to 100.0.
        """
        if not features:
            return 50.0

        if "BOWLING" in assessment_type.upper():
            score = 60.0
            # Knee brace
            brace = features.get("front_knee_brace_angle", 150.0)
            if brace >= 165.0:
                score += 20.0
            elif brace >= 150.0:
                score += 10.0
            
            # Elbow extension legality
            elbow_ext = features.get("bowling_elbow_extension_angle", 10.0)
            if elbow_ext <= 12.0:
                score += 20.0
            elif elbow_ext <= 15.0:
                score += 10.0
            else:
                score -= 25.0  # Illegal action penalty
            return round(max(10.0, min(98.0, score)), 1)
        else:
            # Batting technique
            base_score = 50.0
            # Alignment: up to +20
            alignment = features.get("head_over_ball_alignment_score", 0.70)
            base_score += alignment * 20.0
            
            # Stride ratio: up to +15
            stride = features.get("front_foot_stride_ratio", 0.70)
            if 0.65 <= stride <= 0.85:
                base_score += 15.0
            elif 0.50 <= stride <= 0.95:
                base_score += 8.0
            
            # Knee flexion: up to +15
            knee = features.get("front_knee_flexion_angle", 140.0)
            if 135.0 <= knee <= 150.0:
                base_score += 15.0
            elif 120.0 <= knee <= 160.0:
                base_score += 7.0
            
            return round(max(20.0, min(96.0, base_score)), 1)
