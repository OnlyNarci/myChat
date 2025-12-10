from typing import Dict, List
from tortoise.expressions import Q
from tortoise.exceptions import DoesNotExist
from app.db.models import User, UserUser, UserMessage, FriendshipStatus, MessageType
from app.schemas.auth_schemas import UserParams


async def confirm_friendship_service(
    user_request_id: int,
    user_accept_uid: str,
) -> bool:
    """
    确认两名用户是已通过的好友（status=1）

    :param user_request_id: user A id（不区分申请方和接受方）
    :param user_accept_uid: user B uid

    :return: True 代表两名用户是已确认的好友
    """
    # 1.查询user_accept的id
    try:
        user_accept = await User.get(uid=user_accept_uid)
    except DoesNotExist:
        return False
    
    # 2.用Q对象合并双向查询，同时判断status=1
    try:
        await UserUser.get(
            Q(user_request_id=user_request_id, user_accept_id=user_accept.id) |
            Q(user_request_id=user_accept.id, user_accept_id=user_request_id),
            status=FriendshipStatus.CONFIRM
        )
        return True
    except DoesNotExist:
        return False


async def request_friendship_service(
    user_request_id: int,
    user_accept_uid: str,
    request_message: str
) -> str:
    """
    发起好友请求

    :param user_request_id: 申请者 id
    :param user_accept_uid: 目标用户 uid
    :param request_message: 请求时附带的消息

    :return: 操作反馈信息
    """
    # 1.查询user_accept的id
    try:
        user_accept = await User.get(uid=user_accept_uid)
    except DoesNotExist:
        return "User accept does not exist"
    
    # 2.确认不是自己
    if user_accept.id == user_request_id:
        return "can not request self"
    
    # 3.确认两人还不是好友关系
    friendship = await UserUser.filter(
        Q(user_request_id=user_request_id, user_accept_id=user_accept.id) |
        Q(user_request_id=user_accept.id, user_accept_id=user_request_id),
    ).select_for_update().first()
    if not friendship:
        await UserUser.create(
            user_request_id=user_request_id,
            user_accept_id=user_accept.id,
        )
        await UserMessage.create(
            user_send_id=user_request_id,
            user_receive_id=user_accept.id,
            message_type=MessageType.NOTICE,
            content=request_message,
        )
        return 'success in sending request'
    
    # 4.friendship存在，根据status返回不同消息，其中当当前玩家已经收到来自目标玩家的请求时会直接同意请求
    match friendship.status:
        case FriendshipStatus.WAITING:
            if friendship.user_request.id == user_request_id:
                return 'waiting for accept'
            else:
                friendship.status = FriendshipStatus.CONFIRM
                await friendship.save()
                return 'got request before, now is accepted'
        case FriendshipStatus.CONFIRM:
            return 'friendship is confirm'
        case FriendshipStatus.BLACK_LIST:
            return 'black list member can not request'


async def handle_friend_request_service(
    user_accept_id: int,
    user_request_uid: str,
    is_accept: bool,
) -> str:
    """
    接受 / 拒绝好友请求

    :param user_accept_id: 接受方 id
    :param user_request_uid: 发起方 uid
    :param is_accept: True 代表接收，False 代表拒绝

    :return: 操作结果反馈字符串
    """
    # 1.查询user_request的id
    try:
        user_request = await User.get(uid=user_request_uid)
    except DoesNotExist:
        return "User A does not exist"
    
    # 2.确认 a 已经向 b 发起了好友请求
    friendship = await UserUser.filter(
        user_request_id=user_request.id,
        user_accept_id=user_accept_id
    ).select_for_update().select_related('user_request').first()
    if not friendship:
        return "got no friend request from user A"
    
    # 3.处理好友请求条目状态
    if friendship.status == FriendshipStatus.CONFIRM:
        return 'friendship has confirm'
    else:
        if is_accept:
            # 修改好友关系为确认
            friendship.status = FriendshipStatus.CONFIRM
            await friendship.save()
            # 修改请求消息为第一句话
            request_message = await UserMessage.filter(
                user_send_id=user_request.id,
                user_receive_id=user_accept_id,
                message_type=MessageType.NOTICE,
            ).select_for_update().first()
            request_message.message_type = MessageType.TEXT
            await request_message.save()
            
            return friendship.user_request.name
        
        else:
            await friendship.delete()
            return 'friend request rejected'


async def get_waiting_accept_service(user_id: int) -> Dict[str, List[Dict[str, str | UserParams]]]:
    """
    查看等待接收的好友请求（包括发起和接受）

    :param user_id: 用户id

    :return: 返回待同意和可同意的玩家模型列表
    """
    # 1.查看该玩家发起等待其他玩家同意的请求
    waiting_accept = await UserUser.filter(
        user_request_id=user_id,
        status=FriendshipStatus.WAITING,
    ).select_related('user_accept').all()
    request_messages = await UserMessage.filter(
        user_send_id=user_id,
        message_type=MessageType.NOTICE,
    ).select_related('user_receive').all()
    request_messages_map = {
        user_message.user_receive.id: user_message.content
        for user_message in request_messages
    }
    
    # 2.查看其他玩家发起等待该玩家同意的请求
    can_accept = await UserUser.filter(
        user_accept_id=user_id,
        status=FriendshipStatus.WAITING,
    ).select_related('user_request').all()
    can_accept_messages = await UserMessage.filter(
        user_receive_id=user_id,
        message_type=MessageType.NOTICE,
    ).select_related('user_send').all()
    can_accept_messages_map = {
        user_message.user_send.id: user_message.content
        for user_message in can_accept_messages
    }
    
    # 3.组织为UserParams并返回
    return {
        'waiting_accept': [
            {
                'user': UserParams(
                            uid=user.user_accept.uid,
                            name=user.user_accept.name,
                            avatar=user.user_accept.avatar,
                            signature=user.user_accept.signature,
                            level=user.user_accept.level,
                        ),
                'request_message': request_messages_map[user.user_accept.id],
                
            }
            for user in waiting_accept
        ],
        'can_accept': [
            {
                'user': UserParams(
                    uid=user.user_request.uid,
                    name=user.user_request.name,
                    avatar=user.user_request.avatar,
                    signature=user.user_request.signature,
                    level=user.user_request.level,
                ),
                'request_message': can_accept_messages_map[user.user_request.id]
            }
            for user in can_accept
        ]
    }


async def delete_friendship_service(
    user_id: int,
    friend_uid: str
) -> str:
    """
    删除好友

    :param user_id: 当前用户 id
    :param friend_uid: 要删除的好友 uid

    :return: 操作反馈，可枚举
    """
    # 1.确定目标解除的用户存在（系统错误才会不存在，因为当一名用户不存在时，与他相关的好友关系应当被级联删除）
    try:
        friend = await User.get(uid=friend_uid)
    except DoesNotExist:
        return 'friend does not exist'
    
    # 2.确定两名玩家是好友
    friendship = await UserUser.filter(
        Q(user_request_id=user_id, user_accept_id=friend.id) |
        Q(user_request_id=friend.id, user_accept_id=user_id),
        status=FriendshipStatus.CONFIRM
    ).select_for_update().first()
    if not friendship:
        return 'friendship does not exist'
    
    # 3.从UserUser表中删除相应记录
    await friendship.delete()
    return 'friend deleted'
