import asyncio
from datetime import datetime
from fastapi import WebSocket, WebSocketDisconnect
from typing import Set, List, Dict
from app.db.models import User, GroupUser, GroupMessage, Group
from app.db.model_dependencies import GroupMemberStatus, MessageType
from log.log_config.service_logger import info_logger, err_logger

# 全局连接管理：用户ID -> WebSocket连接
active_connections: Dict[int, WebSocket] = {}
# 群聊关联：群ID -> 在线用户ID集合
group_online_users: Dict[int, Set[int]] = {}
# 并发安全锁
lock = asyncio.Lock()


async def save_group_message(
    group_id: int,
    user_id: int,
    content: str,
    message_type: MessageType = MessageType.TEXT
) -> None:
    """
    保存群消息到数据库
    :param group_id: 群组id
    :param user_id: 用户id
    :param content: 消息内容
    :param message_type: 消息类型
    :return:
    """
    await GroupMessage.create(
        group_id=group_id,
        user_id=user_id,
        content=content,
        message_type=message_type
    )


async def check_group_member(
    group_id: int,
    user_id: int
) -> bool:
    """校验用户是否为群成员（非黑名单/申请中）"""
    member = await GroupUser.filter(
        group_id=group_id,
        user_id=user_id,
        status__in=[GroupMemberStatus.MEMBER, GroupMemberStatus.ADMIN, GroupMemberStatus.OWNER]
    ).first()
    return bool(member)


async def clean_user_connection(user_id: int) -> None:
    """清理用户连接和群关联"""
    async with lock:
        if user_id in active_connections:
            del active_connections[user_id]
        # 从所有群聊中移除该用户
        for group_id in group_online_users:
            if user_id in group_online_users[group_id]:
                group_online_users[group_id].remove(user_id)
                # 群聊无在线用户时删除记录
                if not group_online_users[group_id]:
                    del group_online_users[group_id]
                    
                    
async def broadcast_group_message(group_id: int, message: dict[str, str]) -> None:
    """推送消息到群内所有在线用户"""
    async with lock:
        online_user_ids = group_online_users.get(group_id, set())
    
    for user_id in online_user_ids:
        websocket = active_connections.get(user_id)
        if websocket:
            try:
                await websocket.send_json(message)
            except Exception as e:
                info_logger.error(f'failed to broadcast message: {e} | params: group_id={group_id}; user_id={user_id}; message={message}')
                continue


async def group_chat_service(
    user_id: int,
    group_uids: List[str],
    websocket: WebSocket
) -> None:
    """
    为指定用户创建长连接
    
    :param user_id: 用户id
    :param group_uids: 要为用户建立连接的群聊列表
    :param websocket:
    
    :return:
    """
    user = await User.get(id=user_id)
    try:
        # 1.记录用户连接
        async with lock:
            active_connections[user_id] = websocket

        # 2.接收前端发送的群聊ID列表（用户进入的群）
        if not group_uids:
            raise WebSocketDisconnect(code=1003)
        groups = await Group.filter(uid__in=group_uids).values('id')
        group_ids = [group['id'] for group in groups]
        
        # 3.校验该用户在这些群中，并关联群聊与在线用户
        user_groups = await GroupUser.filter(
            user_id=user_id,
            status__in=[GroupMemberStatus.MEMBER, GroupMemberStatus.ADMIN, GroupMemberStatus.OWNER]
        ).values('group_id')
        user_group_ids = {group['group_id'] for group in user_groups}
        async with lock:
            for group_id in group_ids:
                if group_id not in user_group_ids:
                    info_logger.warning(f'user {user_id} trying to chat in group {group_id} but not a member')
                    continue
                if group_id not in group_online_users:
                    group_online_users[group_id] = set()
                group_online_users[group_id].add(user_id)

        # 4. 循环接收前端消息
        while True:
            data = await websocket.receive_json()

            # 处理用户发送群消息
            group_uid = data.get("group_uid")
            content = data.get("content")
            msg_type_enum = MessageType(data.get("message_type", 0))

            # 保存消息到数据库
            await save_group_message(group_id, user_id, content, msg_type_enum)

            # 构造推送消息（含用户/群/内容信息）
            push_msg = {
                "type": "group_msg",
                "group_uid": group_uid,
                "user_name": user.name,
                "content": content,
                "message_type": msg_type_enum.value,
                "timestamp": datetime.now()
            }

            # 广播给群内在线用户
            await broadcast_group_message(group_id, push_msg)

    except WebSocketDisconnect:
        info_logger.info(f'user disconnected in chatting | params: user_id={user_id}; group_uids={group_uids}')
    except Exception as e:
        err_logger.error(f'error while user chatting: {e} | params: user_id={user_id}; group_uids={group_uids}')
    finally:
        # 清理连接和群关联
        if user_id:
            await clean_user_connection(user_id)
            