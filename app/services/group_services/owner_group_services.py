"""
需要群主权限的群聊服务
"""
from typing import Dict, List, Optional
from tortoise.transactions import atomic
from tortoise.exceptions import DoesNotExist
from app.db.models import Group, GroupUser, GroupMemberStatus


async def confirm_user_is_owner(
    user_id: int,
    group_uid: str,
) -> bool | GroupUser:
    """
    确认一名用户是指定群聊的群主

    :param user_id: 用户id
    :param group_uid: 群聊uid

    :return: 是则返回status为Admin的群成员对象，否则返回False
    """
    try:
        owner = await GroupUser.get(
            group__uid=group_uid,
            user_id=user_id,
            status=GroupMemberStatus.OWNER,
        )
        return owner
    
    except DoesNotExist:
        return False


async def delete_group_service(
    user_id: int,
    group_uid: str,
) -> str:
    """
    解散群聊
    
    :param user_id: 用户id
    :param group_uid: 要解散的群聊uid
    :return:
    """
    # 1.确认用户是群主
    owner = await confirm_user_is_owner(user_id, group_uid)
    if not owner:
        return 'user is not owner'
    
    # 2.删除群聊
    group = await Group.get(uid=group_uid)
    await group.delete()
    return 'delete group success'


async def upgrade_group_service(
    user_id: int,
    group_uid: str,
) -> str:
    """
    升级群聊
    
    :param user_id: 用户id
    :param group_uid: 要升级的群聊uid
    :return:
    """
    # 1.确认用户是群主
    owner = await confirm_user_is_owner(user_id, group_uid)
    if not owner:
        return 'user is not owner'


async def appoint_group_admin_service(
    user_id: int,
    group_uid: str,
    member_uid: str
) -> str:
    """
    指定群成员为群聊管理员

    :param user_id: 用户id
    :param group_uid: 群聊uid
    :param member_uid: 要成为管理员的群员uid
    :return:
    """
    # 1.确认用户是群主
    owner = await confirm_user_is_owner(user_id, group_uid)
    if not owner:
        return 'user is not owner'
    
    # 2.确认要任命的用户是群成员
    try:
        group_user = await GroupUser.get(
            user__uid=member_uid,
            status=GroupMemberStatus.MEMBER,
        )
    except DoesNotExist:
        return 'user not found'
    
    # 3.将改成员设置为管理员
    group_user.status = GroupMemberStatus.ADMIN
    await group_user.save()
    return 'appoint group admin success'


async def dismiss_group_admin_service(
    user_id: int,
    group_uid: str,
    admin_uid: str
) -> str:
    """
    撤销群管理员

    :param user_id: 用户id
    :param group_uid: 群聊uid
    :param admin_uid: 要成为管理员的群员uid
    :return:
    """
    # 1.确认用户是群主
    owner = await confirm_user_is_owner(user_id, group_uid)
    if not owner:
        return 'user is not owner'
    
    # 2.确认要撤职的成员是群管理
    try:
        group_user = await GroupUser.get(
            user__uid=admin_uid,
            status=GroupMemberStatus.ADMIN,
        )
    except DoesNotExist:
        return 'user not found'
    
    # 3.将群用户身份设置为群员
    group_user.status = GroupMemberStatus.MEMBER
    await group_user.save()
    return 'dismiss group admin success'


@atomic()
async def transfer_group_owner_service(
    user_id: int,
    group_uid: str,
    member_uid: Optional[str] = None
) -> str:
    """
    转让群主(群主权限)
    当不指定转让对象时自动转让给等级最高的管理员(群主注销账号时触发此逻辑)

    :param user_id: 用户id
    :param group_uid: 群聊uid
    :param member_uid: 要成为管理员的群员uid
    :return:
    """
    # 1.确认用户是群主
    owner = await confirm_user_is_owner(user_id, group_uid)
    if not owner:
        return 'user is not owner'
    
    # 2.确认目标用户是群成员
    try:
        group_user = await GroupUser.get(
            user__uid=member_uid,
            status__in={GroupMemberStatus.MEMBER, GroupMemberStatus.ADMIN},
        )
    except DoesNotExist:
        return 'user not found'
    
    # 3.将群主状态设置为群管理
    owner.status = GroupMemberStatus.ADMIN
    await owner.save()
    group_user.status = GroupMemberStatus.OWNER
    await group_user.save()
    return 'transfer group owner success'
