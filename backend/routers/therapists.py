from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from database import get_db
import models
import schemas

router = APIRouter(prefix="/therapists", tags=["therapists"])

@router.post("/", response_model=schemas.TherapistResponse)
def register_therapist(therapist: schemas.TherapistCreate, db: Session = Depends(get_db)):
    existing = db.query(models.Therapist).filter(
        models.Therapist.email == therapist.email
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    db_therapist = models.Therapist(**therapist.dict())
    db.add(db_therapist)
    db.commit()
    db.refresh(db_therapist)
    return db_therapist

@router.get("/", response_model=list[schemas.TherapistResponse])
def get_all_therapists(db: Session = Depends(get_db)):
    return db.query(models.Therapist).all()

@router.get("/{therapist_id}", response_model=schemas.TherapistResponse)
def get_therapist(therapist_id: int, db: Session = Depends(get_db)):
    therapist = db.query(models.Therapist).filter(
        models.Therapist.id == therapist_id
    ).first()
    if not therapist:
        raise HTTPException(status_code=404, detail="Therapist not found")
    return therapist

@router.get("/{therapist_id}/profile/", response_model=schemas.TherapistProfileResponse)
def get_therapist_profile(therapist_id: int, db: Session = Depends(get_db)):
    therapist = db.query(models.Therapist).filter(
        models.Therapist.id == therapist_id
    ).first()
    if not therapist:
        raise HTTPException(status_code=404, detail="Therapist not found")

    now = datetime.now(timezone.utc)
    confirmed_count = db.query(models.Booking).filter(
        models.Booking.therapist_id == therapist_id,
        models.Booking.status == "confirmed",
        models.Booking.appointment_datetime > now,
    ).count()

    return schemas.TherapistProfileResponse(
        id=therapist.id,
        name=therapist.name,
        email=therapist.email,
        specialisations=therapist.specialisations,
        therapy_style=therapist.therapy_style,
        session_price=therapist.session_price,
        upcoming_confirmed_bookings=confirmed_count,
    )

@router.patch("/{therapist_id}/price/", response_model=schemas.TherapistResponse)
def update_therapist_price(therapist_id: int, update: schemas.TherapistPriceUpdate, db: Session = Depends(get_db)):
    therapist = db.query(models.Therapist).filter(models.Therapist.id == therapist_id).first()
    if not therapist:
        raise HTTPException(status_code=404, detail="Therapist not found")

    therapist.session_price = update.session_price
    db.commit()
    db.refresh(therapist)
    return therapist