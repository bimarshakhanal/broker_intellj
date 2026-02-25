from fastapi import APIRouter
from app.database import db

router = APIRouter(prefix="/api/debug", tags=["debug"])


@router.get("/deal-properties")
async def get_deal_properties():
    """Debug endpoint to see what properties are available on Deal nodes"""
    session = db.get_session()
    try:
        result = session.run("""
            MATCH (d:Deal)
            WITH d, keys(d) as props
            RETURN props, d
            LIMIT 5
        """)
        
        samples = []
        for record in result:
            node = record['d']
            samples.append({
                "available_keys": record['props'],
                "sample_data": dict(node)
            })
        
        return {"samples": samples}
    finally:
        session.close()
