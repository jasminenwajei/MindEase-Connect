# Import FastAPI components for routing and dependency injection
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

# Import database session dependency
from database import get_db

# Import database models and response schemas
import models
import schemas

# Import the main matching function from the algorithm module
from matching.scorer import run_matching

# Create the router with a URL prefix and tag for the Swagger docs
router = APIRouter(prefix="/matches", tags=["matching"])


@router.get("/{patient_id}", response_model=schemas.MatchResponse)
def get_matches(patient_id: int, db: Session = Depends(get_db)):
    """
    GET /matches/{patient_id}

    Retrieves all therapists from the database and runs the full
    NLP matching pipeline to return a ranked list of compatible therapists
    for the given patient.
    """

    # Check the patient exists in the database
    patient = db.query(models.Patient).filter(
        models.Patient.id == patient_id
    ).first()

    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # Retrieve all registered therapists from the database
    therapists = db.query(models.Therapist).all()

    if not therapists:
        raise HTTPException(status_code=404, detail="No therapists registered yet")

    # Run the matching algorithm and get ranked results
    match_results = run_matching(patient, therapists)

    # Save each compatibility score to the database for later analysis
    # This is important for the results and evaluation chapter of the report
    for result in match_results:
        # Check if a score already exists for this patient-therapist pair
        existing = db.query(models.CompatibilityScore).filter(
            models.CompatibilityScore.patient_id == patient_id,
            models.CompatibilityScore.therapist_id == result["therapist_id"]
        ).first()

        if existing:
            # Update the existing score
            existing.overall_score = result["overall_score"]
            existing.tfidf_score = result["tfidf_score"]
            existing.orientation_score = result["orientation_score"]
            existing.specialism_score = result["specialism_score"]
            existing.explanation = result["explanation"]
        else:
            # Create a new score record
            score = models.CompatibilityScore(
                patient_id=patient_id,
                therapist_id=result["therapist_id"],
                overall_score=result["overall_score"],
                tfidf_score=result["tfidf_score"],
                orientation_score=result["orientation_score"],
                specialism_score=result["specialism_score"],
                explanation=result["explanation"]
            )
            db.add(score)

    # Commit all score records to the database
    db.commit()

    # Return the ranked match results to the client
    return schemas.MatchResponse(
        patient_id=patient_id,
        matches=[schemas.MatchResult(**r) for r in match_results]
    )