"""
基本的群组功能服务，包括搜索群聊、创建群聊、加入群聊、退出群聊
"""
from typing import List, Optional
from tortoise.queryset import Q
from tortoise.transactions import atomic
from tortoise.exceptions import DoesNotExist
from app.core.security import generate_unique_uid
from app.core.extra_params import extra_params
from app.db.models import Group, GroupUser, GroupMessage, GroupMemberStatus, MessageType
from app.schemas.group_schemas import GroupParams, GroupSelfParams, GroupMessageParams


async def query_groups_not_in_service(
    group_uid: Optional[str],
    name_in: Optional[str],
    level_ge: Optional[int],
) -> List[GroupParams]:
    """
    搜索符合条件的群聊
    
    :param group_uid: 群聊的uid
    :param name_in: 群聊名称字符串子集
    :param level_ge: 等级大于等于
    
    :return: 符合条件的群聊
    """
    # 1.若 uid 不为 None，直接返回指定群聊
    if group_uid is not None:
        try:
            group = await Group.get(uid=group_uid)
            return [GroupParams(
                uid=group_uid,
                name=group.name,
                avatar=group.avatar,
                signature=group.signature,
                tags=group.tags,
            )]
        except DoesNotExist:
            return []
    # 2.构建 Q 对象执行复合查询
    query = Q()
    if name_in is not None:
        query &= Q(name__icontains=name_in)
    if level_ge is not None:
        query &= Q(level__gte=level_ge)
    
    groups = await Group.filter(query).all()
    return [
        GroupParams(
            uid=group.uid,
            name=group.name,
            avatar=group.avatar,
            signature=group.signature,
            tags=group.tags,
        )
        for group in groups
    ]


async def query_groups_in_service(
    user_id: int,
) -> List[GroupParams]:
    """
    查看自己已加入的群聊(用于在群聊主页返回数据)

    :param user_id: 用户id

    :return: 包含群聊基本信息的列表
    """
    # 1.获取用户所属的目标群聊（关联Group）
    group_users = await GroupUser.filter(
        user_id=user_id
    ).select_related("group").all()
    
    if not group_users:
        return []
    
    # 2.查询群信息
    groups = [
        GroupParams(
            uid=group_user.group.uid,
            name=group_user.group.name,
            avatar=group_user.group.avatar,
            signature=group_user.group.signature,
            tags=group_user.group.tags,
            level=group_user.group.level,
            allow_search=group_user.group.allow_search,
            join_free=group_user.group.join_free,
        )
        for group_user in group_users
    ]
    
    return groups
    

@atomic()
async def create_group_service(
    user_id: int,
    group_params: GroupSelfParams,
) -> str:
    """
    创建群聊
    
    :param user_id: 群主用户 id
    :param group_params: 初始化群聊必须的参数
    
    :return:
    """
    # 1.检查用户创建的群聊数量，大于等于最大数量时停止创建
    user_groups = await Group.filter(
        owner_id=user_id,
    )
    if len(user_groups) >= extra_params.MAX_GROUP_FOR_USER:
        return 'group too march'
        
    # 2.创建群聊
    uid = await generate_unique_uid(database='group')
    group = await Group.create(
        uid=uid,
        name=group_params.name,
        owner_id=user_id,
        avatar=group_params.avatar,
        signature=group_params.signature,
        tags=group_params.tags,
    )
    # 3.将群主加入群聊
    await GroupUser.create(
        group_id=group.id,
        user_id=user_id,
        status=GroupMemberStatus.OWNER,
        title='群主'
    )
    
    return uid


async def join_group_service(
    user_id: int,
    group_uid: str,
) -> str:
    """
    加入群聊
    
    :param user_id: 用户id
    :param group_uid: 目标加入的群聊uid
    
    :return:
    """
    # 1.查询指定的群
    try:
        group = await Group.get(uid=group_uid)
    except DoesNotExist:
        return 'group not found'
    
    group_user = await GroupUser.filter(
        group_id=group.id,
        user_id=user_id,
    ).first()
    if group_user:
        # 2.确认该玩家不在群的黑名单中
        if group_user.status == GroupMemberStatus.BLACK_LIST:
            return 'forbidden to join group'
        # 3.确认该玩家不在群中
        else:
            return 'group already joined'
    
    # 4.创建GroupUser记录(如果群聊允许自由加入直接成为成员)
    await GroupUser.create(
        group_id=group.id,
        user_id=user_id,
        status=GroupMemberStatus.MEMBER if group.join_free else GroupMemberStatus.UNDER_REVIEW,
        level=1,
        title='萌新',
    )
    return 'group joined'


async def leave_group_service(
    user_id: int,
    group_uid: str,
) -> str:
    """
    退出群聊
    
    :param user_id: 用户id
    :param group_uid: 目标退出的群聊uid
    
    :return:
    """
    try:
        group_user = await GroupUser.get(
            group__uid=group_uid,
            user_id=user_id,
        )
        await group_user.delete()
        return 'leave group'
    except DoesNotExist:
        return 'not in group'


async def query_group_notice_service(
    user_id: int,
    group_uid: str,
) -> List[GroupMessageParams] | str:
    """
    查看群聊的群公告
    
    :param user_id: 玩家id，用于校验是否在群中
    :param group_uid: 指定的群聊uid
    
    :return: 群聊公告列表
    """
    # 1.校验玩家是否在群中
    try:
        group_user = await GroupUser.get(
            group__uid=group_uid,
            user_id=user_id,
            status__in=[GroupMemberStatus.MEMBER, GroupMemberStatus.ADMIN, GroupMemberStatus.OWNER],
        )
    except DoesNotExist:
        return 'user not in group'
    
    # 2.获取群消息中所有类型为Notice的
    group_notice_list = await GroupMessage.filter(
        group__uid=group_uid,
        message_type=MessageType.NOTICE
    ).select_related('user').all()
    
    # 3.组织为GroupMessageParams并返回
    return [
        GroupMessageParams(
            group_uid=group_user.group.uid,
            user_name=group_notice.user.name,
            content=group_notice.content,
            message_type=MessageType.NOTICE,
            created_at=group_notice.created_at
        )
        for group_notice in group_notice_list
    ]
    