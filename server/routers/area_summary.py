"""
Area Summary API Router
Provides endpoints for generating comprehensive area summaries
"""
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Dict, Any, Optional
from services.area_summary_service import get_area_summary

router = APIRouter(prefix="/api/area-summary")

class AreaSummaryRequest(BaseModel):
    lat: float
    lon: float
    radius: Optional[int] = 2000  # Default 2km radius

@router.post("/", summary="Generate area summary", response_model=Dict[str, Any])
async def generate_area_summary(request: AreaSummaryRequest):
    """
    Generate a comprehensive summary of an area including:
    - Local attractions and businesses
    - Area characteristics and vibe
    - Busyness analysis
    - AI-generated description with history and recommendations
    """
    try:
        if not (-90 <= request.lat <= 90):
            raise HTTPException(status_code=400, detail="Invalid latitude. Must be between -90 and 90.")
        
        if not (-180 <= request.lon <= 180):
            raise HTTPException(status_code=400, detail="Invalid longitude. Must be between -180 and 180.")
        
        if not (100 <= request.radius <= 5000):
            raise HTTPException(status_code=400, detail="Invalid radius. Must be between 100m and 5000m.")
        
        print(f"[Area Summary API] Generating summary for ({request.lat}, {request.lon}) with radius {request.radius}m")
        
        summary = await get_area_summary(request.lat, request.lon, request.radius)
        
        if "error" in summary:
            raise HTTPException(status_code=500, detail=summary["error"])
        
        return summary
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[Area Summary API] Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/coordinates", summary="Generate area summary from query parameters")
async def generate_area_summary_from_coords(
    lat: float = Query(..., description="Latitude coordinate", ge=-90, le=90),
    lon: float = Query(..., description="Longitude coordinate", ge=-180, le=180),
    radius: int = Query(2000, description="Search radius in meters", ge=100, le=5000)
):
    """
    Generate area summary using query parameters (GET request)
    Useful for simple API calls without request body
    """
    request = AreaSummaryRequest(lat=lat, lon=lon, radius=radius)
    return await generate_area_summary(request)