from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
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