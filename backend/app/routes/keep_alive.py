import asyncio
import logging
from fastapi import APIRouter

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/ping")
async def ping():
    """Simple ping endpoint to keep the service awake"""
    return {"status": "alive", "message": "pong"}

@router.post("/keep-alive")
async def keep_alive():
    """Endpoint to prevent service from sleeping"""
    return {"status": "kept_alive", "message": "Service is active"}
