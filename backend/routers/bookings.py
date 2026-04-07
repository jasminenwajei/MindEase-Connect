from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas

router = APIRouter(prefix="/bookings", tags=["bookings"])

@router.post("/", response_model=schemas.BookingResponse)
def create_booking(booking: schemas.BookingCreate, db: Session = Depends(get_db)):
    patient = db.query(models.Patient).filter(
        models.Patient.id == booking.patient_id
    ).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    therapist = db.query(models.Therapist).filter(
        models.Therapist.id == booking.therapist_id
    ).first()
    if not therapist:
        raise HTTPException(status_code=404, detail="Therapist not found")

    db_booking = models.Booking(**booking.dict())
    db.add(db_booking)

    # Mark the matching availability slot as booked
    iso_str = booking.appointment_datetime.strftime("%Y-%m-%dT%H:%M:%S")
    slot = db.query(models.Availability).filter(
        models.Availability.therapist_id == booking.therapist_id,
        models.Availability.slot_datetime == iso_str,
        models.Availability.is_booked == False,
    ).first()
    if slot:
        slot.is_booked = True

    db.commit()
    db.refresh(db_booking)
    return db_booking

@router.get("/{patient_id}", response_model=list[schemas.BookingResponse])
def get_patient_bookings(patient_id: int, db: Session = Depends(get_db)):
    return db.query(models.Booking).filter(
        models.Booking.patient_id == patient_id
    ).all()