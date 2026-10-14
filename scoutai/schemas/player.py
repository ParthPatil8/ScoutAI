from typing import Optional, List
from datetime import date, datetime
from pydantic import BaseModel, Field, ConfigDict
from scoutai.models.enums import CricketRole, BattingHand, BowlingStyle


class PlayerProfileBase(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    display_name: Optional[str] = Field(None, max_length=200)
    date_of_birth: Optional[date] = None
    primary_role: CricketRole = CricketRole.BATSMAN
    secondary_role: Optional[CricketRole] = None
    batting_hand: BattingHand = BattingHand.RIGHT_HAND
    bowling_style: BowlingStyle = BowlingStyle.NONE
    height_cm: Optional[float] = Field(None, ge=100, le=250)
    weight_kg: Optional[float] = Field(None, ge=30, le=160)
    nationality: str = Field("India", max_length=100)
    current_team: Optional[str] = Field(None, max_length=150)
    scout_notes: Optional[str] = None
    is_synthetic: bool = False


class PlayerProfileCreate(PlayerProfileBase):
    pass


class PlayerProfileUpdate(BaseModel):
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    display_name: Optional[str] = Field(None, max_length=200)
    date_of_birth: Optional[date] = None
    primary_role: Optional[CricketRole] = None
    secondary_role: Optional[CricketRole] = None
    batting_hand: Optional[BattingHand] = None
    bowling_style: Optional[BowlingStyle] = None
    height_cm: Optional[float] = Field(None, ge=100, le=250)
    weight_kg: Optional[float] = Field(None, ge=30, le=160)
    nationality: Optional[str] = Field(None, max_length=100)
    current_team: Optional[str] = Field(None, max_length=150)
    scout_notes: Optional[str] = None


class PlayerProfileResponse(PlayerProfileBase):
    id: str
    display_name: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PlayerListResponse(BaseModel):
    total: int
    items: List[PlayerProfileResponse]
