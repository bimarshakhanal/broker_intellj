from fastapi import APIRouter, HTTPException, Query
from app.services.entity_service import OrganizationService
from app.models.schemas import OrganizationDetail

router = APIRouter(prefix="/api/organizations", tags=["organizations"])


@router.get("", response_model=dict)
async def get_organizations(page: int = Query(1, ge=1), limit: int = Query(12, ge=1, le=100)):
    """Get paginated list of organizations"""
    try:
        result = OrganizationService.get_all_organizations(page=page, limit=limit)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/recent", response_model=dict)
async def get_recent_organizations(limit: int = Query(20, ge=1, le=100)):
    """Get recent organizations"""
    try:
        result = OrganizationService.get_recent_organizations(limit=limit)
        return {"data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{organization_url:path}", response_model=dict)
async def get_organization_detail(organization_url: str):
    """Get detailed information about an organization by URL"""
    try:
        # Prepend /organizations to match database URL format
        full_url = f"/organizations/{organization_url}"
        organization = OrganizationService.get_organization_detail(full_url)
        if not organization:
            raise HTTPException(status_code=404, detail="Organization not found")
        return {"data": organization}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
