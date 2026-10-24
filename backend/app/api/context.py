from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from app.services.context_service import aggregate_context, ContextConfigRequest
from app.collectors.browser import browser_collector, BrowserTab

router = APIRouter(prefix="/api/context", tags=["Context"])

@router.post("/aggregate")
def get_aggregated_context(config: ContextConfigRequest):
    """Fetches aggregated, sanitized context from enabled sources."""
    try:
        return aggregate_context(config)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Context aggregation failed: {str(e)}")

@router.post("/browser/tabs")
def submit_browser_tabs(tabs: List[BrowserTab]):
    """Receives active browser tabs from extension or manual entry."""
    browser_collector.update_tabs(tabs)
    return {"status": "success", "count": len(tabs)}

@router.get("/browser/tabs")
def list_browser_tabs():
    """Lists current registered browser tabs."""
    return browser_collector.collect()
