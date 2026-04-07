from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    age = Column(Integer)
    therapy_style = Column(String)
    preferred_language = Column(String, default="English")
    availability = Column(String)
    concerns = Column(Text)
    intake_text = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    bookings = relationship("Booking", back_populates="patient")
    compatibility_scores = relationship("CompatibilityScore", back_populates="patient")


class Therapist(Base):
    __tablename__ = "therapists"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    qualifications = Column(String)
    therapy_style = Column(String)
    specialisations = Column(Text)
    availability = Column(String)
    session_price = Column(Float)
    bio = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    bookings = relationship("Booking", back_populates="therapist")
    compatibility_scores = relationship("CompatibilityScore", back_populates="therapist")


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    therapist_id = Column(Integer, ForeignKey("therapists.id"), nullable=False)
    appointment_datetime = Column(DateTime, nullable=False)
    status = Column(String, default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient", back_populates="bookings")
    therapist = relationship("Therapist", back_populates="bookings")


class CompatibilityScore(Base):
    __tablename__ = "compatibility_scores"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    therapist_id = Column(Integer, ForeignKey("therapists.id"), nullable=False)
    overall_score = Column(Float)
    tfidf_score = Column(Float)
    orientation_score = Column(Float)
    specialism_score = Column(Float)
    explanation = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    patient = relationship("Patient", back_populates="compatibility_scores")
    therapist = relationship("Therapist", back_populates="compatibility_scores")