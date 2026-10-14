from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_

from scoutai.models.player import PlayerProfile
from scoutai.models.enums import CricketRole
from scoutai.schemas.player import PlayerProfileCreate, PlayerProfileUpdate


class PlayerService:
    @staticmethod
    def get_player(db: Session, player_id: str) -> Optional[PlayerProfile]:
        return db.query(PlayerProfile).filter(PlayerProfile.id == player_id).first()

    @staticmethod
    def list_players(
        db: Session,
        role: Optional[CricketRole] = None,
        search: Optional[str] = None,
        is_synthetic: Optional[bool] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> Tuple[List[PlayerProfile], int]:
        query = db.query(PlayerProfile)
        
        if role:
            query = query.filter(PlayerProfile.primary_role == role)
        if is_synthetic is not None:
            query = query.filter(PlayerProfile.is_synthetic == is_synthetic)
        if search:
            search_fmt = f"%{search}%"
            query = query.filter(
                or_(
                    PlayerProfile.first_name.ilike(search_fmt),
                    PlayerProfile.last_name.ilike(search_fmt),
                    PlayerProfile.display_name.ilike(search_fmt),
                    PlayerProfile.current_team.ilike(search_fmt),
                )
            )
            
        total = query.count()
        items = query.order_by(PlayerProfile.created_at.desc()).offset(skip).limit(limit).all()
        return items, total

    @staticmethod
    def create_player(db: Session, data: PlayerProfileCreate) -> PlayerProfile:
        display_name = data.display_name or f"{data.first_name} {data.last_name}"
        player = PlayerProfile(
            first_name=data.first_name,
            last_name=data.last_name,
            display_name=display_name,
            date_of_birth=data.date_of_birth,
            primary_role=data.primary_role,
            secondary_role=data.secondary_role,
            batting_hand=data.batting_hand,
            bowling_style=data.bowling_style,
            height_cm=data.height_cm,
            weight_kg=data.weight_kg,
            nationality=data.nationality,
            current_team=data.current_team,
            scout_notes=data.scout_notes,
            is_synthetic=data.is_synthetic,
        )
        db.add(player)
        db.commit()
        db.refresh(player)
        return player

    @staticmethod
    def update_player(db: Session, player_id: str, data: PlayerProfileUpdate) -> Optional[PlayerProfile]:
        player = db.query(PlayerProfile).filter(PlayerProfile.id == player_id).first()
        if not player:
            return None
        
        update_dict = data.model_dump(exclude_unset=True)
        for key, val in update_dict.items():
            setattr(player, key, val)
            
        if "first_name" in update_dict or "last_name" in update_dict:
            if not data.display_name:
                player.display_name = f"{player.first_name} {player.last_name}"

        db.commit()
        db.refresh(player)
        return player

    @staticmethod
    def delete_player(db: Session, player_id: str) -> bool:
        player = db.query(PlayerProfile).filter(PlayerProfile.id == player_id).first()
        if not player:
            return False
        db.delete(player)
        db.commit()
        return True
