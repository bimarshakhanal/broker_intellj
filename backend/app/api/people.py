from fastapi import APIRouter, HTTPException, Query
from app.services.entity_service import PersonService
from app.models.schemas import PersonDetail, PaginatedResponse

router = APIRouter(prefix="/api/people", tags=["people"])


@router.get("", response_model=PaginatedResponse)
async def get_people(page: int = Query(1, ge=1), limit: int = Query(12, ge=1, le=100)):
    """Get paginated list of people"""
    try:
        result = PersonService.get_all_people(page=page, limit=limit)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/recent", response_model=dict)
async def get_recent_people(limit: int = Query(20, ge=1, le=100)):
    """Get people with most recent deals"""
    try:
        result = PersonService.get_people_with_recent_deals(limit=limit)
        return {"data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{person_url:path}", response_model=dict)
async def get_person_detail(person_url: str):
    """Get detailed information about a person by URL"""
    try:
        # Prepend /people to match database URL format
        full_url = f"/people/{person_url}"
        person = PersonService.get_person_detail(full_url)
        if not person:
            raise HTTPException(status_code=404, detail="Person not found")
        return {"data": person}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
