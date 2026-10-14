from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any


@dataclass
class Keypoint:
    name: str
    x: float
    y: float
    z: Optional[float] = None
    confidence: float = 1.0


@dataclass
class PoseFrame:
    frame_number: int
    timestamp_sec: float
    keypoints: Dict[str, Keypoint]
    bounding_box: Optional[Dict[str, float]] = None
    overall_confidence: float = 1.0


@dataclass
class ActionPhase:
    phase_name: str
    start_frame: int
    end_frame: int


@dataclass
class RecognizedAction:
    action_category: str  # BATTING_SHOT, BOWLING_ACTION, FIELDING
    action_label: str     # e.g., COVER_DRIVE, OUTSWING, PULL_SHOT
    start_frame: int
    end_frame: int
    confidence: float
    phases: Dict[str, List[int]] = field(default_factory=dict)


@dataclass
class BiomechanicalOutput:
    features: Dict[str, float]               # name -> value
    units: Dict[str, str]                    # name -> unit
    confidences: Dict[str, float]            # name -> confidence
    methodologies: Dict[str, str]            # name -> description of calculation
    frame_references: Dict[str, int]         # name -> key frame index
    raw_trajectories: Dict[str, Any] = field(default_factory=dict)


class PoseEstimatorInterface(ABC):
    @abstractmethod
    def estimate_pose(
        self,
        video_path: Optional[str] = None,
        precomputed_keypoints: Optional[List[Dict[str, Any]]] = None,
        max_frames: int = 150,
    ) -> List[PoseFrame]:
        """Extract frame-by-frame skeletal keypoints."""
        pass


class ActionRecognizerInterface(ABC):
    @abstractmethod
    def recognize_actions(
        self,
        pose_frames: List[PoseFrame],
        assessment_type: str = "BATTING_TECHNIQUE",
    ) -> List[RecognizedAction]:
        """Detect action classes and temporal phases from pose trajectory."""
        pass


class BiomechanicsExtractorInterface(ABC):
    @abstractmethod
    def extract_features(
        self,
        pose_frames: List[PoseFrame],
        actions: List[RecognizedAction],
        player_context: Optional[Dict[str, Any]] = None,
    ) -> BiomechanicalOutput:
        """Calculate joint angles, stride lengths, and velocity metrics."""
        pass
