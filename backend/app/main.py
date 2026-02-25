from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api import people, deals, organizations, properties, stories, debug

app = FastAPI(
    title=settings.API_TITLE,
    version=settings.API_VERSION,
    description="Backend API for Real Estate Dashboard"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(people.router)
app.include_router(deals.router)
app.include_router(organizations.router)
app.include_router(properties.router)
app.include_router(stories.router)
app.include_router(debug.router)


@app.get("/")
async def root():
    """API health check"""
    return {"message": "Real Estate Dashboard API", "version": settings.API_VERSION}


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
