# Import FastAPI framework to build the API
from fastapi import FastAPI

# Import the database engine and models to create tables on startup
from database import engine
import models

# Import all routers so their endpoints are registered with the app
from routers import patients, therapists, matching, bookings, availability

# Create all database tables defined in models.py if they don't already exist
models.Base.metadata.create_all(bind=engine)

# Initialise the FastAPI application with a title and version
app = FastAPI(title="MindEase Connect API", version="1.0.0")

# Register each router with the app so their endpoints are accessible
app.include_router(patients.router)
app.include_router(therapists.router)
app.include_router(matching.router)
app.include_router(bookings.router)
app.include_router(availability.router)

# Root endpoint - confirms the API is running
@app.get("/")
def root():
    return {"message": "MindEase Connect API is running"}

# Health check endpoint to verify the server is responsive
@app.get("/health")
def health_check():
    return {"status": "healthy"}