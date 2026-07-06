# MindEase Connect

An AI-powered mobile application that matches patients with mental health practitioners based on therapy preferences, availability, and compatibility.

---

## Overview

MindEase Connect addresses the friction in finding an appropriate therapist by automating the matching process. Patients complete a structured intake profile — specifying therapy style preferences, availability, and goals — and the system surfaces their top three most compatible practitioners using NLP-based similarity scoring.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile | React Native (Expo) |
| Backend API | FastAPI (Python 3.11) |
| Database | SQLite via SQLAlchemy |
| NLP / Matching | spaCy, scikit-learn (TF-IDF) |
| Auth | Email + PIN (role-based: Patient / Practitioner) |

---

## Project Structure

```
mindease-connect/
├── backend/
│   ├── main.py              # FastAPI app entry point
│   ├── models.py            # SQLAlchemy ORM models
│   ├── matching.py          # TF-IDF matching logic
│   ├── seed_therapists.py   # Demo data seed script
│   └── requirements.txt
├── mobile/
│   ├── App.js
│   ├── screens/
│   │   ├── LoginScreen.js
│   │   ├── PatientProfile.js
│   │   ├── PractitionerProfile.js
│   │   └── MatchResults.js
│   └── package.json
└── README.md
```

---

## Getting Started

### Prerequisites

- Python 3.11 (via Homebrew venv recommended)
- Node.js + npm
- Expo CLI (`npm install -g expo-cli`)

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Seed Demo Data

```bash
python seed_therapists.py
```

### Mobile App

```bash
cd mobile
npm install
npx expo start
```

Update the API base URL in the mobile app to match your machine's local IP (e.g. `http://192.168.1.149:8000`).

---

## Features

- **Email + PIN authentication** with Patient / Practitioner role selection
- **Structured patient intake** — therapy style preferences (CBT, Person-Centred, Psychodynamic, Mindfulness-Based, DBT, Integrative, Open to Any), availability day picker
- **Practitioner profiles** with editable specialisms and availability slots
- **AI-powered matching** — TF-IDF + spaCy cosine similarity returns top three compatible practitioners
- **Profile editing** for both patient and practitioner roles

---

## Authentication Note

This is a prototype. PINs and emails are stored in plain text and are not hashed. This implementation is not suitable for production use.

---


