from fastapi import WebSocket, WebSocketDisconnect
from typing import Dict, List
import json

class ConnectionManager:
    """Manages WebSocket connections for real-time updates."""
    
    def __init__(self):
        # Store active connections by type
        self.active_connections: Dict[str, List[WebSocket]] = {
            "queue": [],      # Queue status updates
            "slots": [],      # Slot availability updates
            "admin": []       # Admin dashboard updates
        }
        # Store user-specific connections
        self.user_connections: Dict[int, WebSocket] = {}
    
    async def connect(self, websocket: WebSocket, connection_type: str = "queue"):
        """Accept a new WebSocket connection."""
        await websocket.accept()
        if connection_type in self.active_connections:
            self.active_connections[connection_type].append(websocket)
    
    def disconnect(self, websocket: WebSocket, connection_type: str = "queue"):
        """Remove a WebSocket connection."""
        if connection_type in self.active_connections:
            if websocket in self.active_connections[connection_type]:
                self.active_connections[connection_type].remove(websocket)
    
    async def connect_user(self, websocket: WebSocket, user_id: int):
        """Connect a specific user for personalized updates."""
        await websocket.accept()
        self.user_connections[user_id] = websocket
    
    def disconnect_user(self, user_id: int):
        """Disconnect a specific user."""
        if user_id in self.user_connections:
            del self.user_connections[user_id]
    
    async def send_personal_message(self, message: dict, user_id: int):
        """Send a message to a specific user."""
        if user_id in self.user_connections:
            websocket = self.user_connections[user_id]
            try:
                await websocket.send_json(message)
            except:
                self.disconnect_user(user_id)
    
    async def broadcast(self, message: dict, connection_type: str = "queue"):
        """Broadcast a message to all connections of a specific type."""
        if connection_type not in self.active_connections:
            return
        
        disconnected = []
        for connection in self.active_connections[connection_type]:
            try:
                await connection.send_json(message)
            except:
                disconnected.append(connection)
        
        # Clean up disconnected clients
        for connection in disconnected:
            self.disconnect(connection, connection_type)
    
    async def broadcast_queue_update(self, slot_id: int, queue_data: dict):
        """Broadcast queue status update."""
        message = {
            "type": "queue_update",
            "slot_id": slot_id,
            "data": queue_data
        }
        await self.broadcast(message, "queue")
    
    async def broadcast_slot_update(self, slot_id: int, slot_data: dict):
        """Broadcast slot availability update."""
        message = {
            "type": "slot_update",
            "slot_id": slot_id,
            "data": slot_data
        }
        await self.broadcast(message, "slots")
    
    async def broadcast_admin_update(self, metric_type: str, data: dict):
        """Broadcast admin dashboard update."""
        message = {
            "type": "admin_update",
            "metric_type": metric_type,
            "data": data
        }
        await self.broadcast(message, "admin")
    
    async def notify_appointment_update(
        self,
        user_id: int,
        appointment_id: int,
        status: str,
        queue_position: int = None
    ):
        """Notify user about their appointment update."""
        message = {
            "type": "appointment_update",
            "appointment_id": appointment_id,
            "status": status,
            "queue_position": queue_position
        }
        await self.send_personal_message(message, user_id)

# Global connection manager instance
manager = ConnectionManager()
