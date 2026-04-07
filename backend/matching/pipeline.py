# Import spaCy for natural language processing
import spacy

# Load the small English language model downloaded during setup
# This model handles tokenisation, lemmatisation and part-of-speech tagging
# Declare nlp as None initially - model will be loaded on first use
# This prevents slow startup time when the server launches
nlp = None

def get_nlp():
    """
    Lazy loader for the spaCy model.
    Loads the model only once on first use rather than at import time.
    This significantly improves server startup speed.
    """
    global nlp
    if nlp is None:
        nlp = spacy.load("en_core_web_sm")
    return nlp

def preprocess_text(text: str) -> str:
    """
    Stage 1: Text Preprocessing
    Takes raw text from patient intake forms or therapist bios
    and cleans it for use in the TF-IDF vectoriser.

    Steps:
    - Tokenise the text using spaCy
    - Remove stopwords (common words like 'the', 'and', 'is')
    - Remove punctuation and whitespace tokens
    - Lemmatise each token (reduce to root form e.g. 'anxious' -> 'anxiety')
    - Return cleaned tokens as a single string
    """

    # Process the text through the spaCy NLP pipeline
    doc = nlp(text.lower())

    # Filter out stopwords, punctuation and whitespace
    # Then lemmatise each remaining token to its root form
    cleaned_tokens = [
        token.lemma_
        for token in doc
        if not token.is_stop        # remove common stopwords
        and not token.is_punct      # remove punctuation
        and not token.is_space      # remove whitespace tokens
        and len(token.lemma_) > 2   # remove very short tokens
    ]

    # Join the cleaned tokens back into a single string for vectorisation
    return " ".join(cleaned_tokens)


def extract_therapy_orientations(text: str) -> list:
    """
    Stage 3 helper: Orientation Extraction
    Searches text for known therapy orientation keywords.
    Used to compare patient preferences against therapist approaches.

    Returns a list of matched orientations found in the text.
    """

    # Define known therapy orientations and their common variations
    orientations = {
        "cbt": ["cbt", "cognitive behavioural", "cognitive behavioral", "cognitive behaviour"],
        "psychodynamic": ["psychodynamic", "psychoanalytic", "psychoanalysis"],
        "person_centred": ["person centred", "person-centred", "person centered", "humanistic"],
        "mindfulness": ["mindfulness", "mindfulness based", "mbsr", "mbct"],
        "integrative": ["integrative", "eclectic", "holistic"],
        "dbt": ["dbt", "dialectical behaviour", "dialectical behavioral"],
        "emdr": ["emdr", "eye movement desensitisation", "eye movement desensitization"],
        "systemic": ["systemic", "family therapy", "family systems"]
    }

    # Convert text to lowercase for case-insensitive matching
    text_lower = text.lower()

    # Check which orientations appear in the text
    matched = [
        orientation
        for orientation, keywords in orientations.items()
        if any(keyword in text_lower for keyword in keywords)
    ]

    return matched


def extract_specialisms(text: str) -> list:
    """
    Stage 4 helper: Specialism Extraction
    Searches text for known mental health specialisms.
    Used to match patient concerns against therapist expertise.

    Returns a list of matched specialisms found in the text.
    """

    # Define known specialisms and their common variations
    specialisms = {
        "anxiety": ["anxiety", "anxious", "panic", "worry", "stress"],
        "depression": ["depression", "depressed", "low mood", "sadness"],
        "trauma": ["trauma", "ptsd", "post traumatic", "abuse", "assault"],
        "relationships": ["relationship", "couples", "marriage", "family", "divorce"],
        "addiction": ["addiction", "substance", "alcohol", "drugs", "dependency"],
        "eating_disorders": ["eating disorder", "anorexia", "bulimia", "binge eating"],
        "ocd": ["ocd", "obsessive compulsive", "intrusive thoughts"],
        "grief": ["grief", "bereavement", "loss", "mourning"],
        "self_esteem": ["self esteem", "confidence", "self worth", "self image"],
        "identity": ["identity", "lgbtq", "gender", "sexuality", "cultural"]
    }

    # Convert text to lowercase for case-insensitive matching
    text_lower = text.lower()

    # Check which specialisms appear in the text
    matched = [
        specialism
        for specialism, keywords in specialisms.items()
        if any(keyword in text_lower for keyword in keywords)
    ]

    return matched