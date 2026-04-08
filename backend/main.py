# Import FastAPI framework to build the API
from fastapi import FastAPI
from sqlalchemy import text

# Import the database engine and models to create tables on startup
from database import engine
import models

# Import all routers so their endpoints are registered with the app
from routers import patients, therapists, matching, bookings, availability
from routers import auth

# Create all database tables defined in models.py if they don't already exist
models.Base.metadata.create_all(bind=engine)

# Add pin column to existing tables if not already present (SQLite migration)
with engine.connect() as conn:
    for stmt in [
        "ALTER TABLE patients ADD COLUMN pin VARCHAR",
        "ALTER TABLE therapists ADD COLUMN pin VARCHAR",
    ]:
        try:
            conn.execute(text(stmt))
            conn.commit()
        except Exception:
            pass  # Column already exists

# Initialise the FastAPI application with a title and version
app = FastAPI(title="MindEase Connect API", version="1.0.0")

# Register each router with the app so their endpoints are accessible
app.include_router(patients.router)
app.include_router(therapists.router)
app.include_router(matching.router)
app.include_router(bookings.router)
app.include_router(availability.router)
app.include_router(auth.router)

# Root endpoint - confirms the API is running
@app.get("/")
def root():
    return {"message": "MindEase Connect API is running"}

# Health check endpoint to verify the server is responsive
@app.get("/health")
def health_check():
    return {"status": "healthy"}