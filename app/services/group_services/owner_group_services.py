"""
需要群主权限的群聊服务
"""
from typing import Dict, List
from tortoise.exceptions import DoesNotExist
from app.db.models import Group, GroupUser, GroupMemberStatus
from app.schemas.group_schemas import GroupUserParams, GroupSelfParams


async def confirm_user_is_admin(
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


async def delete_group_service():
    """解散群聊"""
    pass


async def upgrade_group_service():
    """升级群聊"""
    pass


async def handle_group_admin_service():
    """添加/撤销管理员"""
    pass


async def transfer_group_owner_service():
    """
    转让群主(群主权限)
    当不指定转让对象时自动转让给等级最高的管理员(群主注销账号时触发此逻辑)
    """
    pass
