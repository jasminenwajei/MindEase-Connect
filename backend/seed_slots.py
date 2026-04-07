"""
seed_slots.py
Seeds availability slots for therapists 1 and 2 with realistic future datetimes.
Run from the backend/ directory:  python seed_slots.py
"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from database import SessionLocal, engine
import models

# Ensure the availability table exists
models.Base.metadata.create_all(bind=engine)

SLOTS = [
    # Therapist 1
    {"therapist_id": 1, "slot_datetime": "2026-04-14T09:00:00"},
    {"therapist_id": 1, "slot_datetime": "2026-04-14T11:00:00"},
    {"therapist_id": 1, "slot_datetime": "2026-04-15T14:00:00"},
    {"therapist_id": 1, "slot_datetime": "2026-04-16T10:00:00"},
    {"therapist_id": 1, "slot_datetime": "2026-04-17T15:30:00"},
    {"therapist_id": 1, "slot_datetime": "2026-04-21T09:00:00"},
    {"therapist_id": 1, "slot_datetime": "2026-04-22T13:00:00"},
    {"therapist_id": 1, "slot_datetime": "2026-04-28T11:00:00"},
    # Therapist 2
    {"therapist_id": 2, "slot_datetime": "2026-04-14T10:00:00"},
    {"therapist_id": 2, "slot_datetime": "2026-04-15T09:00:00"},
    {"therapist_id": 2, "slot_datetime": "2026-04-15T16:00:00"},
    {"therapist_id": 2, "slot_datetime": "2026-04-16T14:30:00"},
    {"therapist_id": 2, "slot_datetime": "2026-04-20T10:00:00"},
    {"therapist_id": 2, "slot_datetime": "2026-04-21T11:00:00"},
    {"therapist_id": 2, "slot_datetime": "2026-04-23T15:00:00"},
    {"therapist_id": 2, "slot_datetime": "2026-04-29T09:30:00"},
]

def seed():
    db = SessionLocal()
    try:
        added = 0
        for s in SLOTS:
            exists = db.query(models.Availability).filter(
                models.Availability.therapist_id == s["therapist_id"],
                models.Availability.slot_datetime == s["slot_datetime"],
            ).first()
            if not exists:
                db.add(models.Availability(**s, is_booked=False))
                added += 1
        db.commit()
        print(f"Seeded {added} availability slot(s). Skipped {len(SLOTS) - added} duplicate(s).")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
