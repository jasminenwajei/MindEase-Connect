# Import scikit-learn tools for TF-IDF vectorisation and cosine similarity
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Import numpy for numerical operations
import numpy as np

# Import the preprocessing functions from the pipeline module
from matching.pipeline import (
    preprocess_text,
    extract_therapy_orientations,
    extract_specialisms
)

# Define the weights for each scoring stage
# These must add up to 1.0 and reflect the relative importance of each factor
# Based on research showing therapeutic alliance is the strongest predictor of outcomes
WEIGHTS = {
    "tfidf": 0.40,         # Text similarity between patient needs and therapist profile
    "orientation": 0.35,   # Alignment of therapy approach/style
    "specialism": 0.25     # Match between patient concerns and therapist expertise
}


def compute_tfidf_score(patient_text: str, therapist_text: str) -> float:
    """
    Stage 2: TF-IDF Vectorisation and Cosine Similarity

    Converts preprocessed patient and therapist text into TF-IDF vectors
    then measures how similar they are using cosine similarity.

    TF-IDF (Term Frequency-Inverse Document Frequency) gives higher weight
    to words that appear often in one document but rarely across all documents,
    making it useful for identifying meaningful keywords.

    Returns a similarity score between 0.0 (no similarity) and 1.0 (identical).
    """

    # Preprocess both texts to remove stopwords and lemmatise
    cleaned_patient = preprocess_text(patient_text)
    cleaned_therapist = preprocess_text(therapist_text)

    # If either text is empty after preprocessing, return zero score
    if not cleaned_patient or not cleaned_therapist:
        return 0.0

    # Initialise the TF-IDF vectoriser
    vectoriser = TfidfVectorizer()

    # Fit the vectoriser on both texts and transform them into vectors
    # The vectoriser learns the vocabulary from both documents together
    tfidf_matrix = vectoriser.fit_transform([cleaned_patient, cleaned_therapist])

    # Compute cosine similarity between the two vectors
    # cosine_similarity returns a 2D matrix so we extract [0][1] for the score
    similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])

    # Return the similarity score as a float rounded to 4 decimal places
    return round(float(similarity[0][0]), 4)


def compute_orientation_score(patient_text: str, therapist_text: str) -> float:
    """
    Stage 3: Orientation Alignment Scoring

    Extracts therapy orientations mentioned in patient preferences
    and therapist profiles, then calculates the proportion that overlap.

    For example, if a patient mentions CBT and the therapist offers CBT,
    this contributes positively to the score.

    Returns a score between 0.0 and 1.0.
    """

    # Extract orientations mentioned in each text
    patient_orientations = set(extract_therapy_orientations(patient_text))
    therapist_orientations = set(extract_therapy_orientations(therapist_text))

    # If neither text mentions any orientation, return a neutral mid score
    # This avoids penalising patients who haven't specified a preference
    if not patient_orientations and not therapist_orientations:
        return 0.5

    # If only the patient mentions orientations but therapist doesn't match any
    if not therapist_orientations:
        return 0.0

    # If patient hasn't specified a preference, any therapist orientation is acceptable
    if not patient_orientations:
        return 0.5

    # Calculate the proportion of patient preferences matched by the therapist
    # Using Jaccard similarity: intersection / union
    intersection = patient_orientations & therapist_orientations
    union = patient_orientations | therapist_orientations

    return round(len(intersection) / len(union), 4)


def compute_specialism_score(patient_text: str, therapist_text: str) -> float:
    """
    Stage 4: Specialism Relevance Scoring

    Extracts mental health specialisms from patient concerns and therapist expertise,
    then calculates how well the therapist's specialisms match the patient's needs.

    Returns a score between 0.0 and 1.0.
    """

    # Extract specialisms from each text
    patient_specialisms = set(extract_specialisms(patient_text))
    therapist_specialisms = set(extract_specialisms(therapist_text))

    # If patient hasn't mentioned specific concerns, return neutral score
    if not patient_specialisms:
        return 0.5

    # If therapist profile mentions no specialisms
    if not therapist_specialisms:
        return 0.0

    # Calculate proportion of patient needs covered by therapist specialisms
    matched = patient_specialisms & therapist_specialisms
    return round(len(matched) / len(patient_specialisms), 4)


def compute_composite_score(
    tfidf_score: float,
    orientation_score: float,
    specialism_score: float
) -> float:
    """
    Combines the three individual scores into a single weighted composite score.

    Uses the weights defined at the top of this file.
    Final score is between 0.0 and 1.0, where higher means better match.
    """

    # Multiply each score by its weight and sum them together
    composite = (
        (tfidf_score * WEIGHTS["tfidf"]) +
        (orientation_score * WEIGHTS["orientation"]) +
        (specialism_score * WEIGHTS["specialism"])
    )

    return round(composite, 4)


def generate_explanation(
    tfidf_score: float,
    orientation_score: float,
    specialism_score: float,
    patient_text: str,
    therapist_text: str
) -> str:
    """
    Generates a human-readable explanation of why a therapist was matched.
    This satisfies the transparency requirement from the ethical design principles
    outlined in Chapter 3 of the report.
    """

    # Build explanation parts based on score thresholds
    explanation_parts = []

    # Explain TF-IDF similarity
    if tfidf_score >= 0.5:
        explanation_parts.append("strong alignment between your needs and this therapist's approach")
    elif tfidf_score >= 0.3:
        explanation_parts.append("moderate alignment between your needs and this therapist's approach")
    else:
        explanation_parts.append("limited text-based similarity")

    # Explain orientation match
    patient_orientations = extract_therapy_orientations(patient_text)
    therapist_orientations = extract_therapy_orientations(therapist_text)
    shared_orientations = set(patient_orientations) & set(therapist_orientations)

    if shared_orientations:
        # Format orientation names for display
        formatted = [o.replace("_", " ").upper() for o in shared_orientations]
        explanation_parts.append(
            f"shared therapy orientation in {', '.join(formatted)}"
        )

    # Explain specialism match
    patient_specialisms = extract_specialisms(patient_text)
    therapist_specialisms = extract_specialisms(therapist_text)
    shared_specialisms = set(patient_specialisms) & set(therapist_specialisms)

    if shared_specialisms:
        formatted = [s.replace("_", " ") for s in shared_specialisms]
        explanation_parts.append(
            f"therapist specialises in {', '.join(formatted)}"
        )

    # Combine explanation parts into a readable sentence
    if explanation_parts:
        return "Matched based on: " + "; ".join(explanation_parts) + "."
    else:
        return "Matched based on general compatibility."


def run_matching(patient, therapists: list) -> list:
    """
    Main matching function called by the API endpoint.

    Takes a patient object and a list of therapist objects from the database,
    runs all four scoring stages for each therapist, and returns a ranked list
    of matches sorted by composite score (highest first).
    """

    # Build the patient's combined text from intake form fields
    # Combining multiple fields gives the NLP pipeline more context to work with
    patient_text = f"""
        {patient.intake_text or ''}
        {patient.concerns or ''}
        {patient.therapy_style or ''}
    """.strip()

    # Store results for all therapists
    results = []

    for therapist in therapists:
        # Build the therapist's combined text from their profile fields
        therapist_text = f"""
            {therapist.bio or ''}
            {therapist.specialisations or ''}
            {therapist.therapy_style or ''}
        """.strip()

        # Run each stage of the pipeline
        tfidf_score = compute_tfidf_score(patient_text, therapist_text)
        orientation_score = compute_orientation_score(patient_text, therapist_text)
        specialism_score = compute_specialism_score(patient_text, therapist_text)

        # Compute the final weighted composite score
        overall_score = compute_composite_score(tfidf_score, orientation_score, specialism_score)

        # Generate a human-readable explanation for this match
        explanation = generate_explanation(
            tfidf_score,
            orientation_score,
            specialism_score,
            patient_text,
            therapist_text
        )

        # Append this therapist's result to the list
        results.append({
            "therapist_id": therapist.id,
            "therapist_name": therapist.name,
            "overall_score": overall_score,
            "tfidf_score": tfidf_score,
            "orientation_score": orientation_score,
            "specialism_score": specialism_score,
            "explanation": explanation
        })

    # Sort results by overall score, highest first
    results.sort(key=lambda x: x["overall_score"], reverse=True)

    return results