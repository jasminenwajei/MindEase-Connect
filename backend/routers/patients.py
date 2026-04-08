from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas

router = APIRouter(prefix="/patients", tags=["patients"])

@router.post("/", response_model=schemas.PatientResponse)
def register_patient(patient: schemas.PatientCreate, db: Session = Depends(get_db)):
    existing = db.query(models.Patient).filter(
        models.Patient.email == patient.email
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    db_patient = models.Patient(**patient.dict())
    db.add(db_patient)
    db.commit()
    db.refresh(db_patient)
    return db_patient

@router.get("/", response_model=list[schemas.PatientResponse])
def get_all_patients(db: Session = Depends(get_db)):
    return db.query(models.Patient).all()

@router.get("/{patient_id}", response_model=schemas.PatientResponse)
def get_patient(patient_id: int, db: Session = Depends(get_db)):
    patient = db.query(models.Patient).filter(
        models.Patient.id == patient_id
    ).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient

@router.get("/{patient_id}/profile/", response_model=schemas.PatientProfileResponse)
def get_patient_profile(patient_id: int, db: Session = Depends(get_db)):
    patient = db.query(models.Patient).filter(
        models.Patient.id == patient_id
    ).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    scores = (
        db.query(models.CompatibilityScore)
        .filter(models.CompatibilityScore.patient_id == patient_id)
        .order_by(models.CompatibilityScore.overall_score.desc())
        .all()
    )

    matched_therapists = []
    for score in scores:
        therapist = db.query(models.Therapist).filter(
            models.Therapist.id == score.therapist_id
        ).first()
        if therapist:
            matched_therapists.append(schemas.MatchedTherapistSummary(
                therapist_id=therapist.id,
                name=therapist.name,
                specialisations=therapist.specialisations,
                match_percentage=round(score.overall_score * 100),
            ))

    return schemas.PatientProfileResponse(
        id=patient.id,
        name=patient.name,
        email=patient.email,
        age=patient.age,
        therapy_style=patient.therapy_style,
        preferred_language=patient.preferred_language,
        availability=patient.availability,
        concerns=patient.concerns,
        intake_text=patient.intake_text,
        matched_therapists=matched_therapists,
    )

@router.patch("/{patient_id}/preferences/", response_model=schemas.PatientProfileResponse)
def update_patient_preferences(patient_id: int, update: schemas.PatientPreferencesUpdate, db: Session = Depends(get_db)):
    patient = db.query(models.Patient).filter(models.Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    if update.therapy_style is not None:
        patient.therapy_style = update.therapy_style
    if update.availability is not None:
        patient.availability = update.availability
    if update.intake_text is not None:
        patient.intake_text = update.intake_text

    db.commit()
    db.refresh(patient)

    scores = (
        db.query(models.CompatibilityScore)
        .filter(models.CompatibilityScore.patient_id == patient_id)
        .order_by(models.CompatibilityScore.overall_score.desc())
        .all()
    )
    matched_therapists = []
    for score in scores:
        therapist = db.query(models.Therapist).filter(models.Therapist.id == score.therapist_id).first()
        if therapist:
            matched_therapists.append(schemas.MatchedTherapistSummary(
                therapist_id=therapist.id,
                name=therapist.name,
                specialisations=therapist.specialisations,
                match_percentage=round(score.overall_score * 100),
            ))

    return schemas.PatientProfileResponse(
        id=patient.id,
        name=patient.name,
        email=patient.email,
        age=patient.age,
        therapy_style=patient.therapy_style,
        preferred_language=patient.preferred_language,
        availability=patient.availability,
        concerns=patient.concerns,
        intake_text=patient.intake_text,
        matched_therapists=matched_therapists,
    )