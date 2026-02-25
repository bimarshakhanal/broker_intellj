from fastapi import APIRouter, HTTPException, Query
from app.services.entity_service import StoryService

router = APIRouter(prefix="/api/stories", tags=["stories"])


@router.get("", response_model=dict)
async def get_stories(page: int = Query(1, ge=1), limit: int = Query(12, ge=1, le=100)):
    """Get paginated list of stories"""
    try:
        result = StoryService.get_all_stories(page=page, limit=limit)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
