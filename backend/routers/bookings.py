from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas

router = APIRouter(prefix="/bookings", tags=["bookings"])


@router.get("/patient/{patient_id}/", response_model=list[schemas.BookingWithTherapistResponse])
def get_patient_bookings_with_therapist(patient_id: int, db: Session = Depends(get_db)):
    bookings = db.query(models.Booking).filter(
        models.Booking.patient_id == patient_id
    ).all()
    result = []
    for b in bookings:
        therapist = db.query(models.Therapist).filter(
            models.Therapist.id == b.therapist_id
        ).first()
        # Look up the pre-computed compatibility score for this patient-therapist pair
        score = db.query(models.CompatibilityScore).filter(
            models.CompatibilityScore.patient_id == b.patient_id,
            models.CompatibilityScore.therapist_id == b.therapist_id,
        ).first()
        result.append(schemas.BookingWithTherapistResponse(
            id=b.id,
            patient_id=b.patient_id,
            therapist_id=b.therapist_id,
            therapist_name=therapist.name if therapist else "Unknown",
            appointment_datetime=b.appointment_datetime,
            status=b.status,
            created_at=b.created_at,
            match_percentage=round(score.overall_score * 100) if score else None,
        ))
    return result


@router.patch("/{booking_id}/confirm/", response_model=schemas.BookingResponse)
def confirm_booking(booking_id: int, db: Session = Depends(get_db)):
    booking = db.query(models.Booking).filter(
        models.Booking.id == booking_id
    ).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    booking.status = "confirmed"
    db.commit()
    db.refresh(booking)
    return booking


@router.patch("/{booking_id}/cancel/", response_model=schemas.BookingResponse)
def soft_cancel_booking(booking_id: int, db: Session = Depends(get_db)):
    booking = db.query(models.Booking).filter(
        models.Booking.id == booking_id
    ).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    booking.status = "cancelled"

    # Restore the availability slot so it can be re-booked
    iso_str = booking.appointment_datetime.strftime("%Y-%m-%dT%H:%M:%S")
    slot = db.query(models.Availability).filter(
        models.Availability.therapist_id == booking.therapist_id,
        models.Availability.slot_datetime == iso_str,
        models.Availability.is_booked == True,
    ).first()
    if slot:
        slot.is_booked = False

    db.commit()
    db.refresh(booking)
    return booking


@router.delete("/{booking_id}/", status_code=204)
def delete_booking(booking_id: int, db: Session = Depends(get_db)):
    booking = db.query(models.Booking).filter(
        models.Booking.id == booking_id
    ).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    # Restore the matching availability slot so it becomes bookable again
    iso_str = booking.appointment_datetime.strftime("%Y-%m-%dT%H:%M:%S")
    slot = db.query(models.Availability).filter(
        models.Availability.therapist_id == booking.therapist_id,
        models.Availability.slot_datetime == iso_str,
        models.Availability.is_booked == True,
    ).first()
    if slot:
        slot.is_booked = False

    db.delete(booking)
    db.commit()
    return Response(status_code=204)


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