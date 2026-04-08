from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from database import get_db
from datetime import datetime as dt
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


@router.get("/booked/{therapist_id}/", response_model=list[schemas.BookedSlotResponse])
def get_booked_slots(therapist_id: int, db: Session = Depends(get_db)):
    slots = db.query(models.Availability).filter(
        models.Availability.therapist_id == therapist_id,
        models.Availability.is_booked == True,
    ).all()
    result = []
    for slot in slots:
        # Find the active booking for this slot (prefer non-cancelled).
        # Parse the slot_datetime string to a Python datetime so SQLAlchemy
        # can compare it correctly against the DateTime column.
        slot_dt_parsed = dt.fromisoformat(slot.slot_datetime)
        booking = db.query(models.Booking).filter(
            models.Booking.therapist_id == therapist_id,
            models.Booking.appointment_datetime == slot_dt_parsed,
        ).order_by(models.Booking.id.desc()).first()
        patient_name = None
        booking_id = None
        booking_status = None
        if booking:
            patient = db.query(models.Patient).filter(
                models.Patient.id == booking.patient_id
            ).first()
            patient_name = patient.name if patient else None
            booking_id = booking.id
            booking_status = booking.status
        result.append(schemas.BookedSlotResponse(
            slot_id=slot.id,
            therapist_id=slot.therapist_id,
            slot_datetime=slot.slot_datetime,
            booking_id=booking_id,
            patient_name=patient_name,
            booking_status=booking_status,
        ))
    return result


@router.get("/{therapist_id}/", response_model=list[schemas.AvailabilitySlot])
def get_available_slots(therapist_id: int, db: Session = Depends(get_db)):
    return db.query(models.Availability).filter(
        models.Availability.therapist_id == therapist_id,
        models.Availability.is_booked == False,
    ).all()


@router.delete("/{slot_id}/", status_code=204)
def delete_slot(slot_id: int, db: Session = Depends(get_db)):
    slot = db.query(models.Availability).filter(
        models.Availability.id == slot_id
    ).first()
    if not slot:
        raise HTTPException(status_code=404, detail="Slot not found")
    if slot.is_booked:
        raise HTTPException(status_code=400, detail="Cannot delete a slot that is already booked")
    db.delete(slot)
    db.commit()
    return Response(status_code=204)
