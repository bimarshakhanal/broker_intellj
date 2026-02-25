from fastapi import APIRouter, HTTPException, Query
from app.services.entity_service import PropertyService
from app.models.schemas import PropertyDetail

router = APIRouter(prefix="/api/properties", tags=["properties"])


@router.get("", response_model=dict)
async def get_properties(page: int = Query(1, ge=1), limit: int = Query(12, ge=1, le=100)):
    """Get paginated list of properties ordered by most recent"""
    try:
        result = PropertyService.get_all_properties(page=page, limit=limit)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/recent", response_model=dict)
async def get_recent_properties(limit: int = Query(20, ge=1, le=100)):
    """Get recent properties (with most recent deals)"""
    try:
        result = PropertyService.get_recent_properties(limit=limit)
        return {"data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{property_url:path}", response_model=dict)
async def get_property_detail(property_url: str):
    """Get detailed information about a property by URL"""
    try:
        # Prepend /buildings/ to match database URL format
        full_url = f"/buildings/{property_url}" if not property_url.startswith('/') else property_url
        if not full_url.startswith('/buildings/'):
            full_url = f"/buildings/{property_url}"
        property_obj = PropertyService.get_property_detail(full_url)
        if not property_obj:
            raise HTTPException(status_code=404, detail="Property not found")
        return {"data": property_obj}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
