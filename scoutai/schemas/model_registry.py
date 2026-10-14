from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class MLModelRegistryBase(BaseModel):
    model_identifier: str = Field(..., max_length=100)
    name: str = Field(..., max_length=150)
    task_type: str = Field(..., max_length=80)
    version: str = Field(..., max_length=50)
    architecture: str = Field(..., max_length=100)
    framework: str = Field("PyTorch/OpenCV", max_length=50)
    input_spec: Optional[Dict[str, Any]] = None
    output_spec: Optional[Dict[str, Any]] = None
    license: str = Field("MIT/Apache-2.0", max_length=100)
    is_active: bool = True


class MLModelRegistryCreate(MLModelRegistryBase):
    pass


class MLModelRegistryResponse(MLModelRegistryBase):
    id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
