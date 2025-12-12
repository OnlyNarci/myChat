from typing import Dict
from fastapi import Path, Depends
from app.core.security import get_current_user_id
from app.core.exceptions import ErrorCodes, ClientError, ServerError
from app.api.v1.endpoints.group_endpoints import group_router
from app.services.group_services.owner_group_services import (
    delete_group_service,
    appoint_group_admin_service,
    dismiss_group_admin_service,
    transfer_group_owner_service
)
from log.log_config.service_logger import err_logger


@group_router.put('/{group_uid}/member/{member_uid}', response_model=Dict[str, bool | str])
async def appoint_group_admin_endpoint(
    group_uid: str = Path(...),
    member_uid: str = Path(...),
    user_id: int = Depends(get_current_user_id)
) -> Dict[str, bool | str]:
    """
    任命群管理员
    
    :param group_uid: 群聊uid
    :param member_uid: 要任命的群成员uid
    :param user_id: 当前用户id
    
    :return:
    """
    try:
        response = await appoint_group_admin_service(
            user_id=user_id,
            group_uid=group_uid,
            member_uid=member_uid
        )
        match response:
            case 'user is not owner':
                raise ClientError(error_code=ErrorCodes.Forbidden, message='user is not owner')
            case 'user not found':
                raise ClientError(error_code=ErrorCodes.Conflict, message='can not appoint someone who is not member as group admin')
            case 'appoint group admin success':
                return {
                    'success': True,
                    'message': 'appoint group admin success'
                }
            case _:
                raise ServerError(error_code=ErrorCodes.InternalServerError, message='服务器维护中，暂时不能任命管理员。')
        
    except Exception as e:
        err_logger.error(f'failed to appoint group admin: {e} | params: user_id={user_id}; group_uid={group_uid}; member_uid={member_uid}')
        raise ServerError(error_code=ErrorCodes.InternalServerError, message='服务器维护中，暂时不能任命管理员。')


@group_router.put('/{group_uid}/admin/{admin_uid}', response_model=Dict[str, bool | str])
async def dismiss_group_admin_endpoint(
    group_uid: str = Path(...),
    admin_uid: str = Path(...),
    user_id: int = Depends(get_current_user_id)
) -> Dict[str, bool | str]:
    """
    撤职群管理员
    
    :param group_uid: 群聊uid
    :param admin_uid: 要撤职的群管理uid
    :param user_id: 当前用户id
    
    :return:
    """
    try:
        response = await dismiss_group_admin_service(
            user_id=user_id,
            group_uid=group_uid,
            admin_uid=admin_uid
        )
        match response:
            case 'user is not owner':
                raise ClientError(error_code=ErrorCodes.Forbidden, message='user is not owner')
            case 'user not found':
                raise ClientError(error_code=ErrorCodes.Conflict, message='can not dismiss someone who is not admin')
            case 'dismiss group admin success':
                return {
                    'success': True,
                    'message': 'dismiss group admin success'
                }
            case _:
                raise ServerError(error_code=ErrorCodes.InternalServerError, message='服务器维护中，暂时不能撤职管理员。')
    
    except Exception as e:
        err_logger.error(
            f'failed to dismiss group admin: {e} | params: user_id={user_id}; group_uid={group_uid}; admin_uid={admin_uid}')
        raise ServerError(error_code=ErrorCodes.InternalServerError, message='服务器维护中，暂时不能撤职管理员。')


@group_router.put('/{group_uid}/owner/{member_uid}', response_model=Dict[str, bool | str])
async def transfer_group_owner_endpoint(
    group_uid: str = Path(...),
    member_uid: str = Path(...),
    user_id: int = Depends(get_current_user_id)
) -> Dict[str, bool | str]:
    """
    转让群主

    :param group_uid: 群聊uid
    :param member_uid: 要任命的群成员uid
    :param user_id: 当前用户id
    
    :return:
    """
    try:
        response = await transfer_group_owner_service(
            user_id=user_id,
            group_uid=group_uid,
            member_uid=member_uid
        )
        match response:
            case 'user is not owner':
                raise ClientError(error_code=ErrorCodes.Forbidden, message='user is not owner')
            case 'user not found':
                raise ClientError(error_code=ErrorCodes.Conflict, message='can not transfer someone who is not member as group owner')
            case 'transfer group owner success':
                return {
                    'success': True,
                    'message': 'transfer group owner success'
                }
            case _:
                raise ServerError(error_code=ErrorCodes.InternalServerError, message='服务器维护中，暂时不能转让群主。')
    
    except Exception as e:
        err_logger.error(
            f'failed to transfer group owner: {e} | params: user_id={user_id}; group_uid={group_uid}; member_uid={member_uid}')
        raise ServerError(error_code=ErrorCodes.InternalServerError, message='服务器维护中，暂时不能转让群主。')
    
    
@group_router.delete('/{group_uid}', response_model=Dict[str, bool | str])
async def dissolve_group_endpoint(
    group_uid: str = Path(...),
    user_id: int = Depends(get_current_user_id)
) -> Dict[str, bool | str]:
    """
    解散群聊
    
    :param group_uid: 要解散的群聊uid
    :param user_id: 当前用户id
    
    :return:
    """
    try:
        response = await delete_group_service(
            user_id=user_id,
            group_uid=group_uid,
        )
        match response:
            case 'user is not owner':
                raise ClientError(error_code=ErrorCodes.Forbidden, message='user is not owner')
            case 'delete group success':
                return {
                    'success': True,
                    'message': 'delete group success'
                }
            case _:
                raise ServerError(error_code=ErrorCodes.InternalServerError, message='服务器维护中，暂时不能解散群聊。')
    
    except Exception as e:
        err_logger.error(f'failed to dissolve group: {e} | params: user_id={user_id}; group_uid={group_uid}')
        raise ServerError(error_code=ErrorCodes.InternalServerError, message='服务器维护中，暂时不能解散群聊。')
