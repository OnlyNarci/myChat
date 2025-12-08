from typing import List, Dict
from tortoise.transactions import atomic
from tortoise.exceptions import IntegrityError, DoesNotExist
from app.core.security import generate_unique_uid, get_string_hash
from app.db.models import User
from app.schemas.base_schemas import UserParams, UserSelfParams


async def create_user(
        user_name: str,
        password: str,
        email: str,
) -> Dict[str, bool | str]:
    """
    注册功能
    
    :param user_name: 用户名
    :param password: 密码
    :param email: 邮箱
    
    :return: 注册是否成功，失败返回原因
    """
    uid = await generate_unique_uid(database='user')
    hash_password = get_string_hash(password)

    try:
        await User.create(
            uid=uid,
            name=user_name,
            password=hash_password,
            email=email,
        )
        return {
            'success': True,
            'message': '注册成功，正在跳转到登录页面'
        }
    except IntegrityError:
        return {
            'success': False,
            'message': '用户名或邮箱已被使用'
        }
    except Exception as e:
        return {
            'success': False,
            'message': str(e)
        }


async def get_self_info_service(
    user_id: int,
) -> UserSelfParams:
    """
    返回用户个人信息
    
    :param user_id: 用户id
    
    :return: 用户个人信息模型
    """
    user = await User.get(id=user_id)
    return UserSelfParams(
        uid=user.uid,
        name=user.name,
        title=user.title,
        avatar=user.avatar,
        signature=user.signature,
        level=user.level,
        email=user.email,
        exp=user.exp,
        byte=user.byte,
    )


async def get_user_info_service(
    user_uid: str,
) -> UserParams | str:
    """
    返回指定用户个人可公开的信息
    
    :param user_uid:
    
    :return:
    """
    try:
        user = await User.get(uid=user_uid)
    except DoesNotExist:
        return 'user not found'
    
    return UserParams(
        uid=user.uid,
        name=user.name,
        avatar=user.avatar,
        signature=user.signature,
        level=user.level,
    )


@atomic()
async def update_self_info_service(
    user_id: int,
    update_params: UserSelfParams,
) -> None:
    """
    修改个人信息
    
    :param user_id:
    :param update_params:
    
    :return: 修改成功返回 None，否则raise暂时还不知道的错误
    """
    user = await User.filter(id=user_id).select_for_update().first()
    user.name = update_params.name
    user.avatar = update_params.avatar
    user.signature = update_params.signature
    await user.save()
