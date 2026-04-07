# seed_data.py
# Populates the SQLite database with realistic fake patient and therapist records.
# Designed to exercise all branches of the NLP matching pipeline:
#   - extract_therapy_orientations() keyword matching
#   - extract_specialisms() keyword matching
#   - TF-IDF cosine similarity across varied vocabulary
# Safe to run multiple times — checks email before inserting to avoid duplicates.

import sys
import os

# Add the backend directory to the Python path so we can import local modules
# This allows the script to be run directly from the backend/ folder
sys.path.append(os.path.dirname(__file__))

# Import the SQLAlchemy session factory and the Base used to create tables
from database import SessionLocal, engine, Base

# Import the ORM models so we can create instances to insert into the database
from models import Patient, Therapist

# Create all tables if they don't already exist
# This mirrors what the main app does on startup
Base.metadata.create_all(bind=engine)


# ---------------------------------------------------------------------------
# PATIENT SEED DATA
# ---------------------------------------------------------------------------
# Each patient has:
#   - Realistic intake_text (long-form description of their situation)
#   - concerns field mentioning specific specialism keywords
#   - therapy_style field mentioning orientation keywords
#   - availability as a comma-separated string of day preferences
# The variety ensures each patient will score differently across the 10 therapists.
# ---------------------------------------------------------------------------

PATIENTS = [
    {
        # Patient 1: Anxiety + CBT preference
        # Expected high match: therapists who offer CBT and specialise in anxiety
        "name": "Aiden Clarke",
        "email": "aiden.clarke@example.com",
        "age": 28,
        "therapy_style": "I am really interested in CBT and cognitive behavioural approaches.",
        "preferred_language": "English",
        "availability": "Monday, Wednesday, Friday",
        "concerns": "I struggle with anxiety and constant worry. I experience panic attacks.",
        "intake_text": (
            "I have been dealing with generalised anxiety for about three years now. "
            "It started when I changed jobs and has slowly got worse. I find myself "
            "worrying constantly about things I cannot control — work performance, "
            "social situations, even small daily tasks. I often have panic attacks in "
            "the morning before work. I have read about cognitive behavioural therapy "
            "and feel that a structured, skills-based approach would suit me best. "
            "I want to understand the thought patterns behind my anxiety and learn "
            "practical coping techniques to challenge unhelpful beliefs."
        ),
    },
    {
        # Patient 2: Trauma and PTSD, wants psychodynamic work
        # Expected high match: therapists specialising in trauma with psychodynamic style
        "name": "Brianna Osei",
        "email": "brianna.osei@example.com",
        "age": 34,
        "therapy_style": "I am open to psychodynamic or psychoanalytic therapy.",
        "preferred_language": "English",
        "availability": "Tuesday, Thursday",
        "concerns": "I have trauma from past abuse and am experiencing PTSD symptoms.",
        "intake_text": (
            "I experienced emotional and physical abuse during my childhood and for "
            "a long time I suppressed those memories. Recently, flashbacks have been "
            "returning and I am struggling to feel safe in day-to-day life. I have "
            "been diagnosed with PTSD following a clinical assessment. I feel like "
            "I need to understand the deeper roots of my reactions — why certain "
            "situations trigger me so strongly. I am drawn to psychodynamic or "
            "psychoanalytic therapy because I want to explore my past in depth "
            "rather than just managing surface symptoms. I also have difficulties "
            "with relationships because I struggle to trust people."
        ),
    },
    {
        # Patient 3: Stress and anxiety, wants mindfulness-based approaches
        # Expected high match: therapists offering mindfulness and specialising in anxiety/stress
        "name": "Callum Reid",
        "email": "callum.reid@example.com",
        "age": 22,
        "therapy_style": "I am interested in mindfulness and mindfulness-based approaches like MBSR.",
        "preferred_language": "English",
        "availability": "Wednesday, Saturday",
        "concerns": "High stress and anxiety from university pressure and perfectionism.",
        "intake_text": (
            "I am in my final year of university and the stress has become "
            "overwhelming. I have always been a perfectionist and the pressure "
            "of deadlines, exams and future career uncertainty has led to almost "
            "constant anxiety. I cannot sleep well, I find it hard to concentrate, "
            "and I feel like my mind is always racing. A friend recommended "
            "mindfulness-based stress reduction after trying it themselves, and "
            "I think a mindfulness based approach would help me learn to slow down "
            "and observe my thoughts without getting caught up in them. I want to "
            "build resilience and improve my self-worth and confidence."
        ),
    },
    {
        # Patient 4: Grief and bereavement after loss of a parent
        # Expected high match: therapists who specialise in grief and loss
        "name": "Diana Mensah",
        "email": "diana.mensah@example.com",
        "age": 45,
        "therapy_style": "I would prefer a person-centred or humanistic therapist.",
        "preferred_language": "English",
        "availability": "Monday, Thursday, Saturday",
        "concerns": "Grief and bereavement following the loss of my mother last year.",
        "intake_text": (
            "My mother passed away fourteen months ago after a long illness. I was "
            "her primary carer and I feel like I did not have time to grieve properly "
            "because I was so focused on caring for her. Now that she is gone I am "
            "experiencing waves of deep sadness, mourning and sometimes guilt about "
            "things I said or did not say. I find myself isolating from friends and "
            "family. I would like a therapist who uses a person-centred or humanistic "
            "approach — someone who will listen without judgement and help me work "
            "through this grief at my own pace. I am not looking for someone who "
            "will tell me what to do, but someone who can sit with me in my loss."
        ),
    },
    {
        # Patient 5: Eating disorder and low self-esteem, interested in DBT
        # Expected high match: therapists offering DBT and specialising in eating disorders
        "name": "Ethan Park",
        "email": "ethan.park@example.com",
        "age": 19,
        "therapy_style": "I have heard DBT and dialectical behaviour therapy can help with emotional regulation.",
        "preferred_language": "English",
        "availability": "Tuesday, Friday",
        "concerns": "Binge eating and poor self-esteem and negative self-image.",
        "intake_text": (
            "I have been struggling with binge eating since I was about fifteen. "
            "It tends to happen when I feel emotionally overwhelmed — I use food "
            "as a way to cope with difficult feelings. Afterwards I feel a deep "
            "sense of shame and my self esteem is very low. I have tried dieting "
            "many times but the cycle always returns. I think the problem is "
            "emotional, not just about food. I researched dialectical behaviour "
            "therapy and feel it could help me with emotional regulation and "
            "building distress tolerance skills. I want to improve my relationship "
            "with food and develop a healthier self worth and self image."
        ),
    },
    {
        # Patient 6: Identity and LGBTQ+ concerns, wants affirmative integrative therapy
        # Expected high match: therapists specialising in identity and LGBTQ+ with integrative style
        "name": "Freya Lindqvist",
        "email": "freya.lindqvist@example.com",
        "age": 25,
        "therapy_style": "I would like an integrative or holistic therapist who is LGBTQ+ affirming.",
        "preferred_language": "English",
        "availability": "Monday, Wednesday",
        "concerns": "Exploring my gender identity and sexuality. Cultural background adds complexity.",
        "intake_text": (
            "I am currently navigating questions about my gender identity and "
            "sexuality. I come from a culturally conservative background and the "
            "tension between my identity and my family's expectations has caused "
            "significant emotional distress. I have also experienced some anxiety "
            "around disclosing my identity to people at work and university. "
            "I am looking for a therapist who takes a holistic or integrative "
            "approach and who specifically has experience working with LGBTQ+ "
            "clients. I want someone who understands how cultural background "
            "intersects with identity, and can help me work through the grief "
            "and self-worth issues that come with navigating this process."
        ),
    },
    {
        # Patient 7: OCD with intrusive thoughts, strongly prefers CBT
        # Expected high match: therapists specialising in OCD and CBT
        "name": "George Thornton",
        "email": "george.thornton@example.com",
        "age": 31,
        "therapy_style": "I specifically want CBT as it is the recommended treatment for OCD.",
        "preferred_language": "English",
        "availability": "Wednesday, Friday, Saturday",
        "concerns": "OCD with obsessive compulsive patterns and intrusive thoughts.",
        "intake_text": (
            "I was formally diagnosed with OCD two years ago. I experience "
            "intrusive thoughts on a daily basis which cause me intense anxiety. "
            "I perform compulsive checking rituals to try to relieve the distress "
            "but they only provide temporary relief before the cycle starts again. "
            "I have researched cognitive behavioural therapy extensively and know "
            "that CBT with exposure and response prevention is the gold standard "
            "treatment for OCD. I want a therapist who is experienced in treating "
            "obsessive compulsive disorder with a clear cognitive behavioural "
            "framework. I am also anxious in social situations and worry about "
            "what other people think of me."
        ),
    },
    {
        # Patient 8: Relationship difficulties and couples issues, wants systemic therapy
        # Expected high match: therapists specialising in relationships with systemic/person-centred style
        "name": "Hannah Brooks",
        "email": "hannah.brooks@example.com",
        "age": 38,
        "therapy_style": "I am open to systemic family therapy or person-centred approaches.",
        "preferred_language": "English",
        "availability": "Thursday, Sunday",
        "concerns": "Relationship difficulties, divorce proceedings, and family conflict.",
        "intake_text": (
            "My husband and I are in the process of a difficult divorce after "
            "twelve years of marriage. We have two children and the family "
            "conflict has been deeply distressing for all of us. On a personal "
            "level I am struggling with feelings of failure, loss of identity "
            "and uncertainty about the future. I also need help managing the "
            "co-parenting relationship because communication between us has "
            "completely broken down. I am interested in either person-centred "
            "or systemic therapy — something that helps me understand the "
            "relationship dynamics and how family systems affect individual "
            "wellbeing. I also have some underlying depression and low mood "
            "that I would like to address."
        ),
    },
    {
        # Patient 9: Depression, low mood, wants structured evidence-based help
        # Expected high match: therapists specialising in depression
        "name": "Isaac Ferreira",
        "email": "isaac.ferreira@example.com",
        "age": 41,
        "therapy_style": "I am open to CBT or integrative approaches for depression.",
        "preferred_language": "English",
        "availability": "Tuesday, Thursday, Saturday",
        "concerns": "Depression, persistent low mood, and lack of motivation and sadness.",
        "intake_text": (
            "I have been experiencing episodes of depression on and off for "
            "about ten years. The current episode has lasted roughly eight months "
            "and is the worst I have experienced. I have persistent low mood, "
            "very little motivation, disturbed sleep, and difficulty finding "
            "pleasure in things I used to enjoy. I have been prescribed "
            "antidepressants by my GP but I want to complement this with "
            "talking therapy. I am looking for an evidence-based approach — "
            "either cognitive behavioural therapy or an integrative method that "
            "combines different techniques. I want to understand the patterns "
            "of thinking that keep me in a depressed state and build practical "
            "strategies for managing my mood."
        ),
    },
    {
        # Patient 10: Addiction and substance misuse, mixed concerns
        # Expected varied scores — tests the algorithm with a less common specialism
        "name": "Jasmine Wolfe",
        "email": "jasmine.wolfe@example.com",
        "age": 29,
        "therapy_style": "I am open to any approach — I have not had therapy before.",
        "preferred_language": "English",
        "availability": "Monday, Friday",
        "concerns": "Alcohol dependency and addiction. I also have anxiety and low self-esteem.",
        "intake_text": (
            "I have been dependent on alcohol for about four years. It started "
            "as social drinking but gradually increased until I was drinking "
            "every day to manage anxiety and stress. I recently completed a "
            "detox programme and am now sober but I know I need ongoing support "
            "to stay that way. I have never had therapy before and am not sure "
            "what approach would suit me. I know my substance use is linked to "
            "anxiety and low self worth, so I want a therapist who can address "
            "both the addiction and the underlying emotional difficulties. "
            "I am motivated to change and want to build a healthier life."
        ),
    },
]


# ---------------------------------------------------------------------------
# THERAPIST SEED DATA
# ---------------------------------------------------------------------------
# Each therapist has:
#   - A detailed bio describing their approach using orientation keywords
#   - specialisations field listing clinical areas using specialism keywords
#   - therapy_style field for additional orientation keyword hits
#   - Varied session prices and availability for realism
# The combination of bio + specialisations + therapy_style is what the
# matching algorithm uses to build the therapist's combined text (see scorer.py).
# ---------------------------------------------------------------------------

THERAPISTS = [
    {
        # Therapist 1: CBT specialist for anxiety and depression
        # Strong match for Patient 1 (anxiety/CBT) and Patient 9 (depression/CBT)
        "name": "Dr. Sarah Mitchell",
        "email": "sarah.mitchell@therapists.example.com",
        "qualifications": "DClinPsy, BSc Psychology (Hons), BABCP Accredited",
        "therapy_style": (
            "I work primarily using cognitive behavioural therapy (CBT), "
            "a structured evidence-based approach that focuses on the links "
            "between thoughts, feelings and behaviours."
        ),
        "specialisations": (
            "Anxiety, panic disorder, depression, low mood, stress, worry. "
            "I have extensive experience helping clients understand and "
            "challenge unhelpful thinking patterns."
        ),
        "availability": "Monday, Tuesday, Wednesday, Thursday",
        "session_price": 70.0,
        "bio": (
            "I am a chartered clinical psychologist with over twelve years of "
            "experience working with adults experiencing anxiety disorders and "
            "depression. My practice is grounded in cognitive behavioural therapy "
            "because the research evidence for CBT is robust, and I find it gives "
            "clients practical tools they can use between sessions. I use thought "
            "records, behavioural experiments and activity scheduling to help "
            "people break out of the cycles that keep anxiety and depressed mood "
            "in place. I also incorporate psychoeducation so that clients really "
            "understand what is happening in their minds and bodies. I am warm, "
            "direct and collaborative — I see therapy as a partnership."
        ),
    },
    {
        # Therapist 2: Psychodynamic therapist for trauma and relationships
        # Strong match for Patient 2 (trauma/psychodynamic) and Patient 8 (relationships)
        "name": "Dr. James Okoye",
        "email": "james.okoye@therapists.example.com",
        "qualifications": "PhD Counselling Psychology, MSc Psychodynamic Studies, UKCP Registered",
        "therapy_style": (
            "I use a psychodynamic and psychoanalytic approach, exploring how "
            "early experiences and unconscious processes shape present-day "
            "relationships and emotional responses."
        ),
        "specialisations": (
            "Trauma, PTSD, post traumatic stress, abuse, relationship difficulties, "
            "attachment issues. I work with the deeper roots of emotional pain."
        ),
        "availability": "Tuesday, Wednesday, Thursday, Friday",
        "session_price": 85.0,
        "bio": (
            "I have been practising psychodynamic therapy for fifteen years, "
            "working with individuals who have experienced significant trauma "
            "and relational difficulties. My psychoanalytic training helps me "
            "understand how unconscious patterns formed in childhood continue to "
            "influence the way we relate to ourselves and others in adult life. "
            "I create a safe, consistent therapeutic relationship in which clients "
            "can begin to process abuse, assault, and other traumatic experiences "
            "at their own pace. I also work extensively with relationship and "
            "family dynamics, helping individuals understand the systemic patterns "
            "they have grown up with. I believe that insight and the therapeutic "
            "relationship itself are powerful agents of change."
        ),
    },
    {
        # Therapist 3: Mindfulness specialist for stress and anxiety
        # Strong match for Patient 3 (stress/mindfulness) and Patient 10 (anxiety)
        "name": "Dr. Priya Sharma",
        "email": "priya.sharma@therapists.example.com",
        "qualifications": "MSc Clinical Psychology, MBCT Trained, BPS Chartered Psychologist",
        "therapy_style": (
            "I specialise in mindfulness-based cognitive therapy (MBCT) and "
            "mindfulness-based stress reduction (MBSR), integrating formal "
            "meditation practice with psychological understanding."
        ),
        "specialisations": (
            "Anxiety, stress, worry, panic, burnout, perfectionism. "
            "I also help clients build self-esteem, confidence and self-worth "
            "through compassion-focused mindfulness practice."
        ),
        "availability": "Monday, Wednesday, Friday, Saturday",
        "session_price": 65.0,
        "bio": (
            "I am a clinical psychologist and certified mindfulness instructor "
            "with a passion for helping people develop a kinder relationship with "
            "their own minds. My work draws on mindfulness based stress reduction "
            "and mindfulness based cognitive therapy — both well-researched "
            "approaches that teach clients to observe thoughts and feelings with "
            "curiosity rather than getting caught up in them. This is particularly "
            "effective for anxiety, stress and worry where the mind tends to spiral. "
            "I work with students, professionals and carers who are experiencing "
            "burnout and find that mindfulness helps them reconnect with a sense "
            "of calm and self worth. I teach both formal meditation and informal "
            "mindfulness practices that can be used in daily life."
        ),
    },
    {
        # Therapist 4: Person-centred therapist for grief and loss
        # Strong match for Patient 4 (grief/person-centred)
        "name": "Dr. Emma Clarke",
        "email": "emma.clarke@therapists.example.com",
        "qualifications": "MA Counselling and Psychotherapy, BACP Accredited, NCS Registered",
        "therapy_style": (
            "I work in a person-centred and humanistic way, providing a warm, "
            "non-judgmental space where clients can explore their feelings freely."
        ),
        "specialisations": (
            "Grief, bereavement, loss, mourning. I also support clients through "
            "major life transitions, relationship endings and depression."
        ),
        "availability": "Monday, Thursday, Saturday, Sunday",
        "session_price": 55.0,
        "bio": (
            "I have worked as a person-centred counsellor for over a decade, "
            "primarily supporting clients through bereavement, grief and loss. "
            "I believe deeply in the humanistic principle that each person has "
            "an innate capacity for healing when given the right conditions — "
            "unconditional positive regard, empathy and congruence. When someone "
            "has lost a loved one, they often do not need to be told what to do "
            "or given a structured programme. They need a safe space to sit with "
            "their grief and be truly heard. I accompany clients through mourning "
            "at their own pace, without rushing or minimising their experience. "
            "I also work with people experiencing low mood and sadness connected "
            "to significant loss or life transitions."
        ),
    },
    {
        # Therapist 5: DBT therapist specialising in eating disorders
        # Strong match for Patient 5 (eating disorder/DBT)
        "name": "Dr. Michael Torres",
        "email": "michael.torres@therapists.example.com",
        "qualifications": "DClinPsy, Intensive DBT Training (Linehan-Certified Programme), HCPC Registered",
        "therapy_style": (
            "I use dialectical behaviour therapy (DBT) and dialectical behavioural "
            "approaches as my primary framework, helping clients build skills in "
            "emotional regulation, distress tolerance and mindfulness."
        ),
        "specialisations": (
            "Eating disorders, binge eating, anorexia, bulimia. Self-esteem, "
            "self-worth and negative self-image. Emotional dysregulation."
        ),
        "availability": "Tuesday, Thursday, Friday",
        "session_price": 80.0,
        "bio": (
            "I am a clinical psychologist who has spent the last eight years "
            "specialising in eating disorders and the emotional regulation "
            "difficulties that underlie them. I am intensively trained in "
            "dialectical behaviour therapy, which was originally developed by "
            "Marsha Linehan and has strong evidence for conditions involving "
            "emotional dysregulation, including binge eating and bulimia. "
            "I help clients understand the function that disordered eating serves "
            "— often it is a way of managing overwhelming emotions — and then "
            "build a toolkit of healthier coping strategies. I also address the "
            "self-esteem and self-image issues that almost always accompany "
            "eating disorders. I take a non-diet, weight-neutral approach and "
            "prioritise psychological wellbeing over weight outcomes."
        ),
    },
    {
        # Therapist 6: Integrative therapist for identity and LGBTQ+ clients
        # Strong match for Patient 6 (identity/LGBTQ+/integrative)
        "name": "Dr. Fatima Hassan",
        "email": "fatima.hassan@therapists.example.com",
        "qualifications": "MSc Integrative Psychotherapy, PG Dip Gender and Sexuality Studies, UKCP Registered",
        "therapy_style": (
            "I use an integrative and holistic approach, drawing on a range of "
            "therapeutic models tailored to each individual. I am a committed "
            "LGBTQ+ affirming practitioner."
        ),
        "specialisations": (
            "Identity, LGBTQ+ issues, gender, sexuality, cultural identity. "
            "Anxiety related to disclosure and coming out. Grief and self-worth "
            "in the context of identity exploration."
        ),
        "availability": "Monday, Wednesday, Thursday",
        "session_price": 60.0,
        "bio": (
            "I am an integrative psychotherapist with a particular focus on "
            "identity, gender and sexuality. My holistic approach draws on "
            "person-centred, psychodynamic and CBT frameworks depending on what "
            "each client needs. I have specialist training in LGBTQ+ affirmative "
            "therapy and extensive experience supporting clients who are navigating "
            "questions of gender identity and sexuality, particularly within "
            "cultural contexts where these identities may not be accepted. "
            "I understand the grief, anxiety and self-worth challenges that come "
            "with coming out or exploring identity when family expectations conflict "
            "with who you are. I work in an eclectic way, believing that no single "
            "model fits every person, and I always adapt my approach to the "
            "individual sitting in front of me."
        ),
    },
    {
        # Therapist 7: CBT with OCD specialism, also does mindfulness
        # Strong match for Patient 7 (OCD/CBT) and some overlap with Patient 1
        "name": "Dr. Tom Whitfield",
        "email": "tom.whitfield@therapists.example.com",
        "qualifications": "DClinPsy, OCD Specialist Training (OCD-UK), MBCT Certificate, BABCP Accredited",
        "therapy_style": (
            "I use cognitive behavioural therapy (CBT) with exposure and response "
            "prevention as my primary method for OCD. I also integrate mindfulness "
            "and acceptance-based strategies to help clients relate differently "
            "to intrusive thoughts."
        ),
        "specialisations": (
            "OCD, obsessive compulsive disorder, intrusive thoughts, anxiety, "
            "panic disorder, social anxiety, worry and stress."
        ),
        "availability": "Monday, Wednesday, Friday, Saturday",
        "session_price": 75.0,
        "bio": (
            "I am an accredited CBT therapist with a specialist focus on obsessive "
            "compulsive disorder. I have worked with OCD in NHS and private settings "
            "for nine years and have completed advanced training in exposure and "
            "response prevention therapy, which is the cognitive behavioural "
            "treatment with the strongest evidence base for OCD. I understand how "
            "distressing and debilitating intrusive thoughts can be, and I work in "
            "a compassionate, non-shaming way that helps clients gradually reduce "
            "compulsive rituals and tolerate uncertainty. I also use mindfulness "
            "based techniques alongside CBT to help clients observe their thoughts "
            "without reacting to them. Beyond OCD, I work with anxiety disorders "
            "including social anxiety and generalised anxiety disorder."
        ),
    },
    {
        # Therapist 8: Trauma specialist with EMDR, psychodynamic background
        # Strong match for Patient 2 (trauma/PTSD)
        "name": "Dr. Aisha Patel",
        "email": "aisha.patel@therapists.example.com",
        "qualifications": "MSc Trauma-Informed Practice, EMDR Practitioner (EMDR UK), BACP Senior Accredited",
        "therapy_style": (
            "I use EMDR (eye movement desensitisation and reprocessing) and "
            "trauma-informed psychodynamic approaches to help clients process "
            "traumatic memories safely."
        ),
        "specialisations": (
            "Trauma, PTSD, post traumatic stress disorder, abuse, assault, "
            "childhood trauma. Complex trauma and dissociation."
        ),
        "availability": "Tuesday, Thursday, Friday",
        "session_price": 90.0,
        "bio": (
            "I am a trauma specialist with over a decade of experience working "
            "with survivors of abuse, assault and post traumatic stress. I am an "
            "accredited EMDR practitioner and use eye movement desensitisation "
            "and reprocessing therapy to help clients process traumatic memories "
            "that have become stuck in the nervous system. My psychodynamic "
            "background means I also understand how early trauma shapes attachment "
            "and relational patterns across a lifetime. I work at a pace that "
            "the client controls, always prioritising safety and stabilisation "
            "before moving into trauma processing. I also have experience of "
            "complex PTSD and dissociation, conditions that require a particularly "
            "careful, phased approach to treatment."
        ),
    },
    {
        # Therapist 9: Person-centred integrative therapist for relationships and couples
        # Strong match for Patient 8 (relationships/family/systemic)
        "name": "Dr. Luke Brennan",
        "email": "luke.brennan@therapists.example.com",
        "qualifications": "MA Counselling Psychology, Systemic Family Therapy Training, BACP Accredited",
        "therapy_style": (
            "I work in a person-centred and integrative way with a particular "
            "interest in systemic and family therapy approaches that explore "
            "relational patterns and family systems."
        ),
        "specialisations": (
            "Relationship difficulties, couples therapy, marriage counselling, "
            "divorce, separation, family conflict and co-parenting. "
            "Identity and life transitions."
        ),
        "availability": "Monday, Thursday, Sunday",
        "session_price": 70.0,
        "bio": (
            "I am a counselling psychologist and systemic therapist with a "
            "focus on relationships and family dynamics. I trained in systemic "
            "family therapy alongside my core person-centred approach, which "
            "gives me a way of understanding how the patterns in our family of "
            "origin shape the relationships we form as adults. I work with "
            "individuals navigating relationship breakdown, divorce and "
            "separation, helping them understand what happened in the "
            "relationship without blame, and rebuild their sense of self "
            "afterwards. I also see couples together where both partners are "
            "willing to engage. My integrative approach means I draw on "
            "different models depending on what each client brings — I find "
            "a humanistic foundation of empathy and person-centred listening "
            "is always the starting point."
        ),
    },
    {
        # Therapist 10: CBT + DBT for depression and eating disorders
        # Strong match for Patient 9 (depression) and Patient 5 (eating disorder)
        "name": "Dr. Rachel Nguyen",
        "email": "rachel.nguyen@therapists.example.com",
        "qualifications": "DClinPsy, DBT Foundation Training, Cognitive Therapy Certificate, HCPC Registered",
        "therapy_style": (
            "I use cognitive behavioural therapy (CBT) as my primary approach "
            "and integrate dialectical behaviour therapy (DBT) skills training "
            "for clients who need support with emotional regulation."
        ),
        "specialisations": (
            "Depression, low mood, persistent depressive disorder, sadness. "
            "Eating disorders, binge eating, disordered eating, body image. "
            "Anxiety and self-esteem."
        ),
        "availability": "Tuesday, Wednesday, Friday, Saturday",
        "session_price": 75.0,
        "bio": (
            "I am a clinical psychologist with specialist training in both "
            "cognitive behavioural therapy and dialectical behaviour therapy. "
            "I work primarily with adults experiencing depression and eating "
            "disorders, two conditions that very often co-occur. My CBT work "
            "with depression focuses on identifying and challenging the negative "
            "thought patterns and behavioural patterns — reduced activity, "
            "withdrawal, avoidance — that maintain low mood. Where emotional "
            "dysregulation is a significant factor, I incorporate DBT skills "
            "training to help clients build emotional regulation and distress "
            "tolerance. For eating disorders, I address both the cognitive "
            "distortions around food and body image and the underlying self-esteem "
            "deficits that drive disordered eating. I also work with anxiety "
            "and help clients develop confidence and self worth."
        ),
    },
]


def seed_database():
    """
    Main seeding function.
    Opens a database session, iterates through the patient and therapist data,
    checks for existing records by email, and inserts new ones.
    Prints a status message for each record processed.
    """

    # Open a new database session
    db = SessionLocal()

    try:
        # ------------------------------------------------------------------
        # Insert patients
        # ------------------------------------------------------------------
        print("\n--- Seeding Patients ---")

        for patient_data in PATIENTS:
            # Check whether a patient with this email already exists in the database
            # This prevents duplicate records if the script is run more than once
            existing = db.query(Patient).filter(Patient.email == patient_data["email"]).first()

            if existing:
                # Skip this record and notify the user
                print(f"  [SKIP] Patient already exists: {patient_data['name']} ({patient_data['email']})")
            else:
                # Create a new Patient ORM object from the dictionary data
                new_patient = Patient(
                    name=patient_data["name"],
                    email=patient_data["email"],
                    age=patient_data["age"],
                    therapy_style=patient_data["therapy_style"],
                    preferred_language=patient_data["preferred_language"],
                    availability=patient_data["availability"],
                    concerns=patient_data["concerns"],
                    intake_text=patient_data["intake_text"],
                )

                # Add the new patient to the session (staged for commit)
                db.add(new_patient)

                # Commit this individual record so we can report it immediately
                db.commit()

                # Confirm the insertion to the user
                print(f"  [ADDED] Patient: {patient_data['name']} ({patient_data['email']})")

        # ------------------------------------------------------------------
        # Insert therapists
        # ------------------------------------------------------------------
        print("\n--- Seeding Therapists ---")

        for therapist_data in THERAPISTS:
            # Check whether a therapist with this email already exists
            existing = db.query(Therapist).filter(Therapist.email == therapist_data["email"]).first()

            if existing:
                print(f"  [SKIP] Therapist already exists: {therapist_data['name']} ({therapist_data['email']})")
            else:
                # Create a new Therapist ORM object from the dictionary data
                new_therapist = Therapist(
                    name=therapist_data["name"],
                    email=therapist_data["email"],
                    qualifications=therapist_data["qualifications"],
                    therapy_style=therapist_data["therapy_style"],
                    specialisations=therapist_data["specialisations"],
                    availability=therapist_data["availability"],
                    session_price=therapist_data["session_price"],
                    bio=therapist_data["bio"],
                )

                # Add and commit the new therapist
                db.add(new_therapist)
                db.commit()

                print(f"  [ADDED] Therapist: {therapist_data['name']} ({therapist_data['email']})")

        # ------------------------------------------------------------------
        # Final summary
        # ------------------------------------------------------------------
        # Count the total records now in the database for a final report
        total_patients = db.query(Patient).count()
        total_therapists = db.query(Therapist).count()

        print(f"\n--- Seeding Complete ---")
        print(f"  Total patients in database:   {total_patients}")
        print(f"  Total therapists in database: {total_therapists}")
        print()

    except Exception as e:
        # Roll back the session if anything went wrong to keep the database clean
        db.rollback()
        print(f"\n[ERROR] Seeding failed: {e}")
        raise

    finally:
        # Always close the session to release the database connection
        db.close()


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------
# This block only runs when the script is executed directly (not when imported).
# It calls the seeding function and handles any unexpected errors gracefully.
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    print("Starting MindEase Connect database seeding...")
    seed_database()
    print("Done.")
