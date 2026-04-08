from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
import models

router = APIRouter(prefix="/auth", tags=["auth"])


class LoginRequest(BaseModel):
    email: str
    pin: str
    role: str  # "patient" | "therapist"


class LoginResponse(BaseModel):
    user_id: int
    role: str
    name: str


@router.post("/login/", response_model=LoginResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    if request.role == "patient":
        user = db.query(models.Patient).filter(
            models.Patient.email == request.email
        ).first()
    elif request.role == "therapist":
        user = db.query(models.Therapist).filter(
            models.Therapist.email == request.email
        ).first()
    else:
        raise HTTPException(status_code=400, detail="Role must be 'patient' or 'therapist'")

    if not user or user.pin != request.pin:
        raise HTTPException(status_code=401, detail="Invalid email or PIN")

    return LoginResponse(user_id=user.id, role=request.role, name=user.name)
