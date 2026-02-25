from fastapi import APIRouter, HTTPException, Query
from app.services.entity_service import DealService
from app.models.schemas import DealDetail

router = APIRouter(prefix="/api/deals", tags=["deals"])


@router.get("", response_model=dict)
async def get_deals(page: int = Query(1, ge=1), limit: int = Query(12, ge=1, le=100)):
    """Get paginated list of deals ordered by most recent"""
    try:
        result = DealService.get_all_deals(page=page, limit=limit)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/recent", response_model=dict)
async def get_recent_deals(limit: int = Query(20, ge=1, le=100)):
    """Get recent deals"""
    try:
        result = DealService.get_recent_deals(limit=limit)
        return {"data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{deal_url:path}", response_model=dict)
async def get_deal_detail(deal_url: str):
    """Get detailed information about a deal by URL"""
    try:
        # Ensure leading slash to match database URL format (e.g. /activity/...)
        full_url = deal_url if deal_url.startswith('/') else f"/{deal_url}"
        deal = DealService.get_deal_detail(full_url)
        if not deal:
            raise HTTPException(status_code=404, detail="Deal not found")
        return {"data": deal}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
