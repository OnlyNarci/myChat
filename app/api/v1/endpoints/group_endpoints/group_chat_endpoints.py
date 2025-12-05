from fastapi import WebSocket, Depends
from app.core.security import get_current_user_id
from app.api.v1.endpoints.group_endpoints import group_router
from app.services.group_services.group_chat_services import group_chat_service


@group_router.websocket("/{group_uid}/chat")
async def group_chat_endpoint(
    websocket: WebSocket,
    group_uids: list[str],
    user_id: int = Depends(get_current_user_id)
):
    await websocket.accept()
    await group_chat_service(
        user_id=user_id,
        group_uids=group_uids,
        websocket=websocket,
    )
    
    