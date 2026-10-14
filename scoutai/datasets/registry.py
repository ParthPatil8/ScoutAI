from typing import Dict, List, Type, Optional
from scoutai.datasets.base import BaseDatasetImporter
from scoutai.datasets.uj_aqa_cricket import UJAQACricketVisionImporter
from scoutai.datasets.cricpose360 import CricPose360Importer
from scoutai.datasets.cricshot10 import CricShot10Importer
from scoutai.datasets.batting_shots import CricketBattingShotsImporter
from scoutai.datasets.statistics import CricketStatisticsImporter


class DatasetRegistry:
    """Central registry of dataset importers in ScoutAI."""

    _importers: Dict[str, Type[BaseDatasetImporter]] = {
        "uj-aqa-cricketvision": UJAQACricketVisionImporter,
        "cricpose360": CricPose360Importer,
        "cricshot10": CricShot10Importer,
        "cricket-batting-shots-ipl": CricketBattingShotsImporter,
        "cricket-public-stats": CricketStatisticsImporter,
    }

    @classmethod
    def get_importer(cls, slug: str) -> Optional[BaseDatasetImporter]:
        importer_cls = cls._importers.get(slug.lower().strip())
        if importer_cls:
            return importer_cls()
        return None

    @classmethod
    def list_supported_datasets(cls) -> List[Dict[str, str]]:
        result = []
        for slug, importer_cls in cls._importers.items():
            instance = importer_cls()
            result.append({
                "slug": instance.slug,
                "name": instance.name,
                "description": instance.description,
                "license_type": instance.license_type,
                "paper_citation": instance.paper_citation or "",
                "expected_format": instance.expected_format_description,
            })
        return result

    @classmethod
    def register_custom_importer(cls, slug: str, importer_cls: Type[BaseDatasetImporter]) -> None:
        cls._importers[slug.lower().strip()] = importer_cls
