from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class PatientCreate(BaseModel):
    name: str
    email: str
    pin: str
    age: Optional[int] = None
    therapy_style: Optional[str] = None
    preferred_language: Optional[str] = "English"
    availability: Optional[str] = None
    concerns: Optional[str] = None
    intake_text: str

class PatientResponse(BaseModel):
    id: int
    name: str
    email: str
    therapy_style: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class TherapistCreate(BaseModel):
    name: str
    email: str
    pin: str
    qualifications: Optional[str] = None
    therapy_style: Optional[str] = None
    specialisations: Optional[str] = None
    availability: Optional[str] = None
    session_price: Optional[float] = None
    bio: str

class TherapistResponse(BaseModel):
    id: int
    name: str
    email: str
    therapy_style: Optional[str] = None
    specialisations: Optional[str] = None
    session_price: Optional[float] = None
    created_at: datetime

    class Config:
        from_attributes = True


class MatchResult(BaseModel):
    therapist_id: int
    therapist_name: str
    specialisations: Optional[str] = None
    overall_score: float
    tfidf_score: float
    orientation_score: float
    specialism_score: float
    explanation: str

class MatchResponse(BaseModel):
    patient_id: int
    matches: list[MatchResult]


class AvailabilityCreate(BaseModel):
    therapist_id: int
    slot_datetime: str  # ISO 8601 string e.g. "2026-05-01T10:00:00"

class AvailabilitySlot(BaseModel):
    id: int
    therapist_id: int
    slot_datetime: str
    is_booked: bool

    class Config:
        from_attributes = True

class BookedSlotResponse(BaseModel):
    """Enriched booked-slot used by the therapist dashboard.
    Joins availability slot data with booking and patient info."""
    slot_id: int
    therapist_id: int
    slot_datetime: str
    booking_id: Optional[int] = None
    patient_name: Optional[str] = None
    booking_status: Optional[str] = None


class BookingCreate(BaseModel):
    patient_id: int
    therapist_id: int
    appointment_datetime: datetime

class BookingResponse(BaseModel):
    id: int
    patient_id: int
    therapist_id: int
    appointment_datetime: datetime
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class BookingWithTherapistResponse(BaseModel):
    id: int
    patient_id: int
    therapist_id: int
    therapist_name: str
    appointment_datetime: datetime
    status: str
    created_at: datetime
    match_percentage: Optional[float] = None


class MatchedTherapistSummary(BaseModel):
    therapist_id: int
    name: str
    specialisations: Optional[str] = None
    match_percentage: int


class PatientProfileResponse(BaseModel):
    id: int
    name: str
    email: str
    age: Optional[int] = None
    therapy_style: Optional[str] = None
    preferred_language: Optional[str] = None
    availability: Optional[str] = None
    concerns: Optional[str] = None
    intake_text: Optional[str] = None
    matched_therapists: list[MatchedTherapistSummary]

    class Config:
        from_attributes = True


class PatientPreferencesUpdate(BaseModel):
    therapy_style: Optional[str] = None
    availability: Optional[str] = None
    intake_text: Optional[str] = None


class TherapistProfileResponse(BaseModel):
    id: int
    name: str
    email: str
    specialisations: Optional[str] = None
    therapy_style: Optional[str] = None
    session_price: Optional[float] = None
    upcoming_confirmed_bookings: int

    class Config:
        from_attributes = True


class TherapistPriceUpdate(BaseModel):
    session_price: float