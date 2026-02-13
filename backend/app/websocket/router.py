from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Query
from backend.app.websocket.manager import manager
from backend.core.security import decode_access_token
from sqlalchemy.orm import Session
from backend.db.database import get_db
from backend.db.models import User
import json

router = APIRouter()

@router.websocket("/queue")
async def websocket_queue_updates(websocket: WebSocket):
    """WebSocket endpoint for real-time queue updates."""
    await manager.connect(websocket, "queue")
    try:
        while True:
            # Keep connection alive and listen for client messages
            data = await websocket.receive_text()
            # Echo back for heartbeat
            await websocket.send_json({"type": "heartbeat", "status": "connected"})
    except WebSocketDisconnect:
        manager.disconnect(websocket, "queue")

@router.websocket("/slots")
async def websocket_slot_updates(websocket: WebSocket):
    """WebSocket endpoint for real-time slot availability updates."""
    await manager.connect(websocket, "slots")
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_json({"type": "heartbeat", "status": "connected"})
    except WebSocketDisconnect:
        manager.disconnect(websocket, "slots")

@router.websocket("/admin")
async def websocket_admin_updates(websocket: WebSocket):
    """WebSocket endpoint for real-time admin dashboard updates."""
    await manager.connect(websocket, "admin")
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_json({"type": "heartbeat", "status": "connected"})
    except WebSocketDisconnect:
        manager.disconnect(websocket, "admin")

@router.websocket("/user/{user_id}")
async def websocket_user_updates(
    websocket: WebSocket,
    user_id: int
):
    """WebSocket endpoint for personalized user updates."""
    # In production, verify user_id matches authenticated user
    await manager.connect_user(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_json({"type": "heartbeat", "status": "connected"})
    except WebSocketDisconnect:
        manager.disconnect_user(user_id)
