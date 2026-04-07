from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas

router = APIRouter(prefix="/availability", tags=["availability"])


@router.post("/", response_model=schemas.AvailabilitySlot)
def create_slot(slot: schemas.AvailabilityCreate, db: Session = Depends(get_db)):
    therapist = db.query(models.Therapist).filter(
        models.Therapist.id == slot.therapist_id
    ).first()
    if not therapist:
        raise HTTPException(status_code=404, detail="Therapist not found")

    db_slot = models.Availability(
        therapist_id=slot.therapist_id,
        slot_datetime=slot.slot_datetime,
        is_booked=False,
    )
    db.add(db_slot)
    db.commit()
    db.refresh(db_slot)
    return db_slot


@router.get("/booked/{therapist_id}/", response_model=list[schemas.AvailabilitySlot])
def get_booked_slots(therapist_id: int, db: Session = Depends(get_db)):
    return db.query(models.Availability).filter(
        models.Availability.therapist_id == therapist_id,
        models.Availability.is_booked == True,
    ).all()


@router.get("/{therapist_id}/", response_model=list[schemas.AvailabilitySlot])
def get_available_slots(therapist_id: int, db: Session = Depends(get_db)):
    return db.query(models.Availability).filter(
        models.Availability.therapist_id == therapist_id,
        models.Availability.is_booked == False,
    ).all()
