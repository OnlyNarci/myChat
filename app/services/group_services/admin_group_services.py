"""
需要管理员及以上权限的群聊服务
"""
from typing import List
from tortoise.exceptions import DoesNotExist
from app.db.models import Group, GroupMessage, GroupUser
from app.db.model_dependencies import GroupMemberStatus, MessageType
from app.schemas.group_schemas import GroupUserParams, GroupSelfParams
from app.schemas.base_schemas import UserParams


async def confirm_user_is_admin(
    user_id: int,
    group_uid: str,
) -> bool | GroupUser:
    """
    确认一名用户是指定群聊的管理员或群主
    
    :param user_id: 用户id
    :param group_uid: 群聊uid
    
    :return: 是则返回status为Admin的群成员对象，否则返回False
    """
    try:
        admin = await GroupUser.get(
            group__uid=group_uid,
            user_id=user_id,
            status__in={GroupMemberStatus.ADMIN, GroupMemberStatus.OWNER},
        )
        return admin
    
    except DoesNotExist:
        return False
    
    
async def get_join_request_service(
    user_id: int,
    group_uid: str,
) -> str | List[UserParams]:
    """
    查看本群等待同意的入群请求
    
    :param user_id: 用户id
    :param group_uid: 群聊uid
    
    :return:
    """
    # 1.确定玩家是该群管理员
    admin = await confirm_user_is_admin(user_id, group_uid)
    if not admin:
        return 'user is not admin'
        
    # 2.查询Status为UNDER_REVIEW的群成员
    under_review_members = await GroupUser.filter(
        group__uid=group_uid,
        status=GroupMemberStatus.UNDER_REVIEW,
    ).select_related('user').all()
    return [
            UserParams(
                uid=under_review_member.user.uid,
                name=under_review_member.user.name,
                title=under_review_member.user.title,
                avatar=under_review_member.user.avatar,
                signature=under_review_member.user.signature,
                level=under_review_member.user.level,
            )
            for under_review_member in under_review_members
        ]

    
async def handle_join_request_service(
    user_id: int,
    group_uid: str,
    request_user_uid: str,
    is_agree: bool
) -> str:
    """
    处理入群请求
    
    :param user_id: 作为管理员的用户id
    :param group_uid: 群聊uid
    :param request_user_uid: 请求入群的用户uid
    :param is_agree: 是否同意加入
    
    :return:
    """
    # 1.确认用户是管理员
    admin = await confirm_user_is_admin(user_id, group_uid)
    if not admin:
        return 'user is not admin'
    
    # 2.确定加群请求存在
    try:
        under_review_member = await GroupUser.get(
            group__uid=group_uid,
            user__uid=request_user_uid,
            status=GroupMemberStatus.UNDER_REVIEW,
        )
    except DoesNotExist:
        return 'join request not found'
    
    # 3.同意/拒绝用户请求
    if is_agree:
        under_review_member.status = GroupMemberStatus.MEMBER
        await under_review_member.save()
        return 'success in agree'
    
    else:
        await under_review_member.delete()
        return 'success in reject'
    

async def kick_out_member_service(
    user_id: int,
    group_uid: str,
    kick_user_uid: str,
) -> str:
    """
    踢出指定群成员(管理员可以踢一般群成员，群主可以踢管理员)
    
    :param user_id: 作为管理员的用户id
    :param group_uid: 群聊uid
    :param kick_user_uid: 要踢出的群成员uid
    
    :return:
    """
    # 1.确认用户是管理员
    admin = await confirm_user_is_admin(user_id, group_uid)
    if not admin:
        return 'user is not admin'
    
    # 2.确认要踢出的成员存在于群中
    try:
        kick_member = await GroupUser.get(
            group__uid=group_uid,
            user__uid=kick_user_uid,
            status__in={GroupMemberStatus.MEMBER, GroupMemberStatus.ADMIN},
        )
    except DoesNotExist:
        return 'member not found'
    
    # 3.确认要踢出的成员是否是管理员，如果是，校验当前用户是否是群主
    if kick_member.status == GroupMemberStatus.ADMIN:
        if admin.status == GroupMemberStatus.OWNER:
            await kick_member.delete()
            return 'success in kick out'
        
        else:
            return 'can not kick out admin'
    elif kick_member.status == GroupMemberStatus.OWNER:
        return 'can not kick out owner'
    
    else:
        await kick_member.delete()
        return 'success in kick out'


async def post_group_notice_service(
    user_id: int,
    group_uid: str,
    notice: str,
) -> str:
    """
    发布群公告
    
    :param user_id: 玩家id
    :param group_uid: 群聊uid
    :param notice: 群公告内容
    
    :return:
    """
    # 1.确认玩家是管理员
    admin = await confirm_user_is_admin(user_id, group_uid)
    if not admin:
        return 'user is not admin'
    
    # 2.确认群聊存在
    try:
        group = await Group.get(
            group__uid=group_uid,
        )
    except DoesNotExist:
        return 'group not found'
    
    # 3.创建群公告
    await GroupMessage.create(
        group_id=group.id,
        user_id=user_id,
        message_type=MessageType.NOTICE,
        content=notice,
    )
    return 'success in post group notice'


async def modify_group_info_service(
    user_id: int,
    new_group_params: GroupSelfParams,
) -> str:
    """
    修改公开的群信息
    
    :param user_id: 用户id
    :param new_group_params: 含有新的群设置的参数模型
    
    :return:
    """
    # 1.确认用户是管理员
    admin = await confirm_user_is_admin(user_id, new_group_params.uid)
    if not admin:
        return 'user is not admin'
    
    # 2.查询群对象
    try:
        group = await Group.get()
    except DoesNotExist:
        return 'group not found'
    
    # 3.逐个修改群参数
    if new_group_params.name:
        group.name = new_group_params.name
    if new_group_params.avatar:
        group.avatar = new_group_params.avatar
    if new_group_params.signature:
        group.signature = new_group_params.signature
    if new_group_params.tags:
        group.tags = new_group_params.tags
    if new_group_params.allow_search:
        group.allow_search = new_group_params.allow_search
    if new_group_params.join_free is not None:
        group.join_free = new_group_params.join_free
    
    await group.save()
    return 'success in modify group info'


# async def modify_group_setting_service():
#     """修改群设置"""
#     pass
