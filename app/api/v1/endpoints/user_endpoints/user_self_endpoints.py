from typing import Dict, TypeAlias
from fastapi import Path, Depends
from app.core.security import get_current_user_id
from app.core.exceptions import ErrorCodes, ClientError, ServerError
from app.schemas.base_schemas import UserParams, UserSelfParams
from app.api.v1.endpoints.user_endpoints import user_router
from app.services.user_services.user_self_services import (
    get_self_info_service,
    get_user_info_service,
    update_self_info_service,
)
from log.log_config.service_logger import err_logger


UserType: TypeAlias = Dict[str, bool | str | UserParams | UserSelfParams]


@user_router.get('/info/me', response_model=UserType)
async def get_self_info_endpoint(
    user_id: int = Depends(get_current_user_id),
) -> UserType:
    """
    查看个人信息及个人设置
    
    :param user_id: 用户id，依赖自动获取
    
    :return: 用户个人信息模型
    """
    try:
        self_info = await get_self_info_service(user_id=user_id)
        return {
            'success': True,
            'message': 'success to get self info',
            'self_info': self_info,
        }
    
    except Exception as e:
        err_logger.error(f'failed to get self info: {e} | params: user_id={user_id}')
        raise ServerError(error_code=ErrorCodes.InternalServerError, message='服务器维护中，暂时无法查看个人主页')


@user_router.get('/info/{user_uid}', response_model=UserType)
async def get_user_info_endpoint(
    user_uid: str = Path(max_length=6)
) -> UserType:
    """
    获取指定 uid 玩家公开的个人信息
    
    :param user_uid: 玩家 uid
    
    :return: 玩家公开信息模型
    """
    try:
        user_info = await get_user_info_service(user_uid=user_uid)
        match user_info:
            case 'user not found':
                raise ClientError(error_code=ErrorCodes.NotFound, message='未知玩家')
            case _:
                return {
                    'success': True,
                    'message': 'success to get user info',
                    'user_info': user_info,
                }
    
    except Exception as e:
        err_logger.error(f'failed to get user info: {e} | params: user_uid={user_uid}')
        raise ServerError(error_code=ErrorCodes.InternalServerError, message='服务器维护中，暂时无法查看个人主页')


@user_router.put('/info/me')
async def update_self_info_endpoint(
    user_info: UserSelfParams,
    user_id: int = Depends(get_current_user_id),
):
    """
    更新个人信息及设置
    
    :param user_info: 待更新的信息模型
    :param user_id: 用户id，依赖自动获取
    
    :return:
    """
    try:
        await update_self_info_service(
            user_id=user_id,
            user_info=user_info
        )
        return {
            'success': True,
            'message': 'success to update self info',
        }
    except Exception as e:
        err_logger.error(f'failed to update self info: {e} | params: user_id={user_id}; user_info={user_info}')
        raise ServerError(error_code=ErrorCodes.InternalServerError, message='服务器维护中，暂时无法修改个人信息')
    