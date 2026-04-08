"""
seed_therapists.py
Populates the database with 9 realistic therapist profiles designed to produce
strong compatibility matches across a range of common patient concerns.

Each therapist has:
  - Rich bio and specialisations text containing NLP-detectable keywords
  - therapy_style stored as a comma-separated list of orientation labels
  - At least 3 availability slots in May–July 2026
  - A demo login (therapist1@demo.com … therapist9@demo.com, PIN 1234)

Safe to run multiple times — skips any therapist whose email already exists.

Run from the backend/ directory:
    python seed_therapists.py
"""

import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from database import SessionLocal, engine, Base
from models import Therapist, Availability

Base.metadata.create_all(bind=engine)


# ---------------------------------------------------------------------------
# THERAPIST PROFILES
# ---------------------------------------------------------------------------
# therapy_style is stored as a comma-separated string of orientation labels
# using the same values shown in the patient dropdown.  The bio text
# deliberately includes the full keyword phrases (e.g. "cognitive behavioural
# therapy", "person-centred") so the NLP pipeline can detect them via keyword
# matching in extract_therapy_orientations() and via TF-IDF similarity.
# ---------------------------------------------------------------------------

THERAPISTS = [
    {
        # 1 — Anxiety & Depression specialist
        # Specialisms detected: anxiety, depression
        # Orientations detected: cbt, integrative
        "email": "therapist1@demo.com",
        "pin": "1234",
        "name": "Dr. Amara Okafor",
        "qualifications": "DClinPsy, BABCP Accredited, BPS Chartered Psychologist",
        "therapy_style": "CBT,Integrative",
        "specialisations": (
            "Anxiety, generalised anxiety disorder, panic attacks, worry, stress. "
            "Depression, low mood, persistent depressive disorder, sadness. "
            "I help clients understand and challenge unhelpful thinking patterns "
            "that maintain anxiety and depressed mood."
        ),
        "session_price": 75.0,
        "bio": (
            "I am a chartered clinical psychologist with eleven years of experience "
            "working with adults experiencing anxiety and depression. My practice is "
            "rooted in cognitive behavioural therapy — an evidence-based approach "
            "that helps clients identify the connections between thoughts, feelings "
            "and behaviours. I use thought records, behavioural experiments and "
            "activity scheduling to break the cycles that keep anxiety and low mood "
            "in place. Where CBT alone is not enough, I draw on integrative and "
            "holistic techniques, including acceptance-based strategies, to build a "
            "personalised treatment plan. I am warm, collaborative and practical — "
            "I want clients to leave each session with tools they can use immediately."
        ),
        "slots": [
            "2026-05-06T09:00:00",
            "2026-05-13T11:00:00",
            "2026-06-03T10:00:00",
            "2026-06-17T14:00:00",
            "2026-07-01T09:30:00",
        ],
    },
    {
        # 2 — Relationship & Family therapist
        # Specialisms detected: relationships, depression
        # Orientations detected: person_centred, integrative, psychodynamic, systemic
        "email": "therapist2@demo.com",
        "pin": "1234",
        "name": "Daniel Whitmore",
        "qualifications": "MA Counselling Psychology, Systemic Family Therapy Diploma, BACP Accredited",
        "therapy_style": "Person-Centred,Integrative,Psychodynamic",
        "specialisations": (
            "Relationship difficulties, couples therapy, marriage counselling, "
            "divorce, separation, co-parenting, family conflict. "
            "I also support individuals through depression and low mood "
            "connected to relationship breakdown and major life transitions."
        ),
        "session_price": 70.0,
        "bio": (
            "I am a counselling psychologist and systemic therapist who has spent "
            "fifteen years helping individuals and couples navigate relationship "
            "difficulties, divorce, and family conflict. My training in systemic "
            "family therapy gives me a lens for understanding how the patterns we "
            "grew up with in our families of origin shape the relationships we form "
            "as adults. I work primarily in a person-centred way, providing a "
            "non-judgemental space in which clients feel genuinely heard. I also "
            "draw on psychodynamic and integrative approaches where deeper "
            "exploration of attachment and unconscious patterns is helpful. "
            "For couples, I work to improve communication, reduce conflict and "
            "help partners understand each other's emotional needs. For individuals, "
            "I focus on rebuilding identity and self-worth after relationship loss."
        ),
        "slots": [
            "2026-05-07T10:00:00",
            "2026-05-21T14:00:00",
            "2026-06-04T09:00:00",
            "2026-07-02T11:00:00",
        ],
    },
    {
        # 3 — LGBTQ+ Identity & Sexuality specialist
        # Specialisms detected: identity, anxiety
        # Orientations detected: integrative, person_centred
        "email": "therapist3@demo.com",
        "pin": "1234",
        "name": "Dr. Sophia Reyes",
        "qualifications": "MSc Integrative Psychotherapy, PG Dip Gender and Sexuality Studies, UKCP Registered",
        "therapy_style": "Integrative,Person-Centred",
        "specialisations": (
            "LGBTQ+ identity, gender identity, sexuality, coming out, cultural identity. "
            "Anxiety related to disclosure and family rejection. "
            "Grief and self-worth challenges arising from identity exploration. "
            "Intersectionality and the impact of cultural background on mental health."
        ),
        "session_price": 65.0,
        "bio": (
            "I am an integrative psychotherapist with a specialist focus on LGBTQ+ "
            "identity, gender and sexuality. I am a committed LGBTQ+ affirming "
            "practitioner and I understand deeply how cultural background intersects "
            "with the experience of exploring one's identity. My holistic approach "
            "draws on person-centred listening, psychodynamic exploration and "
            "integrative techniques tailored to each individual. I have extensive "
            "experience supporting clients who are navigating coming out, gender "
            "transition, and the grief and anxiety that can arise when family or "
            "community expectations conflict with who you are. I create a warm, "
            "affirming space in which all aspects of identity are welcomed without "
            "judgement. I also work with the self-worth and confidence challenges "
            "that frequently accompany identity exploration."
        ),
        "slots": [
            "2026-05-05T13:00:00",
            "2026-05-19T10:00:00",
            "2026-06-09T14:30:00",
            "2026-07-07T09:00:00",
        ],
    },
    {
        # 4 — Trauma & PTSD specialist
        # Specialisms detected: trauma
        # Orientations detected: psychodynamic, emdr, integrative
        "email": "therapist4@demo.com",
        "pin": "1234",
        "name": "Marcus Reid",
        "qualifications": "MSc Trauma-Informed Practice, EMDR Practitioner (EMDR UK), BACP Senior Accredited",
        "therapy_style": "Psychodynamic,Integrative",
        "specialisations": (
            "Trauma, PTSD, post traumatic stress disorder, complex trauma, "
            "childhood abuse, sexual assault, emotional abuse. "
            "Dissociation and flashbacks. Attachment difficulties arising from "
            "traumatic early experiences."
        ),
        "session_price": 90.0,
        "bio": (
            "I am a trauma specialist with twelve years of experience working with "
            "survivors of abuse, assault and post traumatic stress. I use EMDR — "
            "eye movement desensitisation and reprocessing — alongside a trauma-"
            "informed psychodynamic approach to help clients safely process "
            "traumatic memories that have become stuck. EMDR has strong research "
            "evidence for PTSD and allows clients to reprocess distressing "
            "experiences without having to talk about them in detail. My "
            "psychodynamic background means I understand how early trauma shapes "
            "attachment and how that plays out in adult relationships. I always "
            "prioritise safety and stabilisation before moving into trauma "
            "processing, working at a pace the client controls. I use integrative "
            "techniques to support grounding, regulation and resilience between "
            "sessions. I have particular experience with complex PTSD and with "
            "the specific impact of childhood abuse on identity and self-worth."
        ),
        "slots": [
            "2026-05-12T09:00:00",
            "2026-05-26T15:00:00",
            "2026-06-11T10:00:00",
            "2026-07-14T11:00:00",
        ],
    },
    {
        # 5 — Grief & Bereavement counsellor
        # Specialisms detected: grief, depression
        # Orientations detected: person_centred, psychodynamic
        "email": "therapist5@demo.com",
        "pin": "1234",
        "name": "Dr. Catherine Lawson",
        "qualifications": "MA Counselling and Psychotherapy, BACP Accredited, NCS Registered",
        "therapy_style": "Person-Centred,Psychodynamic",
        "specialisations": (
            "Grief, bereavement, loss, mourning, death of a loved one. "
            "Anticipatory grief and supporting carers. "
            "Depression and low mood connected to loss and major life transitions. "
            "Complicated grief and prolonged bereavement."
        ),
        "session_price": 60.0,
        "bio": (
            "I have worked as a person-centred counsellor for over twelve years, "
            "specialising in grief, bereavement and loss. I believe in the "
            "humanistic principle that each person has an innate capacity for "
            "healing when given the right therapeutic conditions — unconditional "
            "positive regard, genuine empathy and an authentic relationship. "
            "When someone is in mourning, they do not need to be given a programme "
            "or told to grieve in a particular way. They need a safe space in which "
            "to be truly heard and to sit with the full weight of their loss. "
            "I accompany clients through bereavement at their own pace, without "
            "minimising or rushing their experience. I also draw on psychodynamic "
            "thinking when it helps to explore how earlier losses or attachment "
            "patterns are shaping the grief. Beyond grief work, I support people "
            "experiencing depression and sadness following significant loss."
        ),
        "slots": [
            "2026-05-14T10:00:00",
            "2026-06-02T13:00:00",
            "2026-06-25T09:00:00",
            "2026-07-09T14:00:00",
        ],
    },
    {
        # 6 — Eating Disorders & Body Image specialist
        # Specialisms detected: eating_disorders, self_esteem
        # Orientations detected: cbt, dbt
        "email": "therapist6@demo.com",
        "pin": "1234",
        "name": "Dr. Yusuf Mahmoud",
        "qualifications": "DClinPsy, Intensive DBT Training (Linehan Institute), Eating Disorders Certificate, HCPC Registered",
        "therapy_style": "CBT,DBT",
        "specialisations": (
            "Eating disorders, anorexia nervosa, bulimia nervosa, binge eating, "
            "disordered eating, body image, negative self-image. "
            "Self-esteem and self-worth difficulties. "
            "Emotional dysregulation underlying disordered eating behaviours."
        ),
        "session_price": 85.0,
        "bio": (
            "I am a clinical psychologist who has spent ten years specialising in "
            "eating disorders and the emotional regulation difficulties that underlie "
            "them. I use dialectical behaviour therapy as my primary framework — "
            "DBT was developed specifically to address the emotional dysregulation "
            "that drives conditions such as binge eating, bulimia and anorexia. "
            "I help clients understand the function that disordered eating serves "
            "— often it is a strategy for managing overwhelming feelings — and then "
            "build a toolkit of healthier coping strategies through DBT skills "
            "including distress tolerance and emotion regulation. I also use "
            "cognitive behavioural therapy to address the distorted cognitions "
            "around food, weight and body image that maintain eating disorders. "
            "I take a weight-neutral, non-diet approach that prioritises "
            "psychological wellbeing and improved self-esteem over weight outcomes. "
            "I also address the self-worth and self-image issues that almost always "
            "accompany eating disorder recovery."
        ),
        "slots": [
            "2026-05-08T11:00:00",
            "2026-05-22T14:00:00",
            "2026-06-12T09:30:00",
            "2026-07-03T10:00:00",
        ],
    },
    {
        # 7 — Work Stress & Burnout specialist
        # Specialisms detected: anxiety, depression
        # Orientations detected: mindfulness, cbt, integrative
        "email": "therapist7@demo.com",
        "pin": "1234",
        "name": "Rachel Thornton",
        "qualifications": "MSc Occupational Psychology, MBCT Trained, MBSR Teacher, BPS Chartered",
        "therapy_style": "Mindfulness-Based,CBT,Integrative",
        "specialisations": (
            "Work-related stress, burnout, occupational exhaustion, high-pressure "
            "careers and workplace anxiety. Worry, panic, and perfectionism. "
            "Depression and low mood arising from chronic work stress. "
            "Work-life balance and boundary setting."
        ),
        "session_price": 80.0,
        "bio": (
            "I am a chartered occupational psychologist and certified mindfulness "
            "instructor with a particular focus on work stress and burnout. I have "
            "worked with professionals across medicine, law, finance and education "
            "who are experiencing exhaustion, anxiety and low mood as a result of "
            "high-pressure careers. My approach combines mindfulness based stress "
            "reduction and mindfulness based cognitive therapy with elements of "
            "cognitive behavioural therapy. MBSR teaches clients to observe stress "
            "responses with curiosity rather than being overwhelmed by them, while "
            "CBT helps identify the unhelpful thinking patterns — perfectionism, "
            "catastrophising, overcommitment — that fuel burnout. I also draw on "
            "integrative and holistic techniques to help clients reconnect with "
            "their values and rebuild a sustainable sense of self-worth. I work "
            "with the full picture of burnout, including sleep difficulties, "
            "depressive symptoms and the anxiety and worry that accompany it."
        ),
        "slots": [
            "2026-05-07T08:00:00",
            "2026-05-28T17:00:00",
            "2026-06-18T08:00:00",
            "2026-07-16T17:00:00",
        ],
    },
    {
        # 8 — Young Adults & University Students specialist
        # Specialisms detected: anxiety, depression, self_esteem
        # Orientations detected: person_centred, cbt, mindfulness
        "email": "therapist8@demo.com",
        "pin": "1234",
        "name": "Dr. Liam Chakraborty",
        "qualifications": "DClinPsy, Certificate in Working with Young Adults, BABCP Accredited, BPS Chartered",
        "therapy_style": "Person-Centred,CBT,Mindfulness-Based",
        "specialisations": (
            "Anxiety, exam stress, academic pressure, perfectionism and worry "
            "in young adults and university students. Depression and low mood. "
            "Self-esteem, confidence and self-worth difficulties. "
            "Identity and transition challenges in emerging adulthood."
        ),
        "session_price": 55.0,
        "bio": (
            "I am a clinical psychologist with a specialist interest in working "
            "with young adults and university students. The transition into higher "
            "education and adult life brings enormous pressure — academic demands, "
            "financial stress, social anxiety, questions of identity and an "
            "uncertain future — and I have spent eight years helping young people "
            "navigate this period. I use a person-centred foundation that ensures "
            "clients feel genuinely heard and valued, combined with practical "
            "cognitive behavioural therapy tools that help challenge the unhelpful "
            "thought patterns driving anxiety, worry and low mood. Where stress "
            "and perfectionism are central, I incorporate mindfulness based "
            "techniques — particularly mindfulness based cognitive therapy — to "
            "help clients slow down and observe their thoughts without being "
            "overwhelmed. I am particularly attuned to the self-esteem and "
            "self-worth challenges that so often accompany the student experience, "
            "and I work to help clients build a more compassionate relationship "
            "with themselves. I offer flexible session times to suit student "
            "schedules."
        ),
        "slots": [
            "2026-05-06T17:00:00",
            "2026-05-20T16:00:00",
            "2026-06-10T17:00:00",
            "2026-07-08T16:00:00",
        ],
    },
    {
        # 9 — OCD & Anxiety disorders specialist (bonus profile)
        # Specialisms detected: ocd, anxiety, self_esteem
        # Orientations detected: cbt, mindfulness
        "email": "therapist9@demo.com",
        "pin": "1234",
        "name": "Niamh O'Brien",
        "qualifications": "DClinPsy, OCD Specialist Training (OCD-UK), MBCT Certificate, BABCP Accredited",
        "therapy_style": "CBT,Mindfulness-Based",
        "specialisations": (
            "OCD, obsessive compulsive disorder, intrusive thoughts, compulsive "
            "rituals and checking behaviours. Generalised anxiety disorder, "
            "social anxiety, panic disorder and worry. Self-esteem and confidence "
            "in the context of anxiety disorders."
        ),
        "session_price": 75.0,
        "bio": (
            "I am an accredited CBT therapist with specialist training in "
            "obsessive compulsive disorder and anxiety disorders. I have worked "
            "with OCD in NHS and private practice for nine years, using exposure "
            "and response prevention — the cognitive behavioural treatment with "
            "the strongest evidence base for OCD. I understand how distressing "
            "and isolating intrusive thoughts and compulsive rituals can be, and "
            "I work in a compassionate, non-shaming way to help clients gradually "
            "reduce their compulsions and tolerate uncertainty. I also integrate "
            "mindfulness based techniques to help clients observe their thoughts "
            "without reacting to them — a powerful complement to CBT for OCD. "
            "Beyond OCD, I work with generalised anxiety disorder, social anxiety "
            "and panic disorder. I pay close attention to the self-esteem and "
            "confidence damage that anxiety disorders often leave behind, and I "
            "build work on self-worth into my treatment plans."
        ),
        "slots": [
            "2026-05-13T10:00:00",
            "2026-06-03T14:00:00",
            "2026-06-24T09:00:00",
            "2026-07-15T11:00:00",
        ],
    },
]


def seed_therapists():
    """
    Inserts therapist profiles and their availability slots.
    Skips any therapist whose email already exists in the database.
    Prints a running status log and a final summary.
    """
    db = SessionLocal()

    created_therapists = 0
    skipped_therapists = 0
    created_slots = 0

    try:
        print("\n--- Seeding Therapists ---")

        for data in THERAPISTS:
            existing = db.query(Therapist).filter(
                Therapist.email == data["email"]
            ).first()

            if existing:
                print(
                    f"  [SKIP] {data['name']} already exists "
                    f"({data['email']})"
                )
                skipped_therapists += 1
                continue

            therapist = Therapist(
                name=data["name"],
                email=data["email"],
                pin=data["pin"],
                qualifications=data["qualifications"],
                therapy_style=data["therapy_style"],
                specialisations=data["specialisations"],
                availability="",          # general day availability stored as day picker CSV
                session_price=data["session_price"],
                bio=data["bio"],
            )
            db.add(therapist)
            db.flush()   # write to get the auto-generated id before committing

            # Add availability slots for this therapist
            for slot_dt in data["slots"]:
                db.add(Availability(
                    therapist_id=therapist.id,
                    slot_datetime=slot_dt,
                    is_booked=False,
                ))
                created_slots += 1

            db.commit()
            created_therapists += 1
            print(
                f"  [ADDED] {data['name']} ({data['email']}) "
                f"— {len(data['slots'])} slot(s)"
            )

        # Final counts
        total_therapists = db.query(Therapist).count()
        total_slots = db.query(Availability).count()

        print("\n--- Seeding Complete ---")
        print(f"  Therapists created:  {created_therapists}")
        print(f"  Therapists skipped:  {skipped_therapists}")
        print(f"  Slots created:       {created_slots}")
        print(f"  Total therapists in database: {total_therapists}")
        print(f"  Total slots in database:      {total_slots}")
        print()

    except Exception as exc:
        db.rollback()
        print(f"\n[ERROR] Seeding failed: {exc}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("Starting MindEase Connect therapist seeding...")
    seed_therapists()
    print("Done.")
