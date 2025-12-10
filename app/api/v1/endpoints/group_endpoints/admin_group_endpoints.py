from typing import Dict, List, TypeAlias
from fastapi import Depends, Query, Body, Path
from app.core.security import get_current_user_id
from app.core.exceptions import ErrorCodes, ServerError, ClientError
from app.schemas.base_schemas import UserParams
from app.schemas.group_schemas import GroupSelfParams
from app.api.v1.endpoints.group_endpoints import group_router
from app.services.group_services.admin_group_services import (
    get_join_request_service,
    handle_join_request_service,
    kick_out_member_service,
    post_group_notice_service,
    modify_group_info_service
)
from log.log_config.service_logger import err_logger

GroupUsersType: TypeAlias = Dict[str, bool | str | Dict[str, List[UserParams]]]


@group_router.get('/{group_uid}/under_review_members', response_model=GroupUsersType)
async def get_join_request_members_endpoint(
    group_uid: str = Path(max_length=6),
    user_id: int = Depends(get_current_user_id),
) -> GroupUsersType:
    """
    查看待处理的入群请求
    
    :param group_uid: 查看的群聊
    :param user_id: 当前用户id，依赖自动获取，应当为该群管理员
    :return: 待同意的发起入群请求的玩家个人信息
    """
    try:
        response = await get_join_request_service(
            group_uid=group_uid,
            user_id=user_id
        )
        match response:
            case 'user is not admin':
                raise ClientError(error_code=ErrorCodes.Forbidden, message='user is not admin')
            case 'group not found':
                raise ClientError(error_code=ErrorCodes.NotFound, message='group not found')
            case 'success in post group notice':
                return {
                    'success': True,
                    'message': 'success in get join_request_service',
                    'data': {'under_review_members': response}
                }
        
    except Exception as e:
        err_logger.error(f'failed to get join_request_service: {e} | params: group_uid={group_uid}; user_id={user_id}')
        raise ServerError(error_code=ErrorCodes.InternalServerError, message='服务器维护中，暂时无法查看入群请求。')
    

@group_router.post('/{group_uid}/group_message/notice', response_model=Dict[str, bool | str])
async def post_group_notice_endpoint(
    notice: str = Body(max_length=1024),
    group_uid: str = Path(max_length=6),
    user_id: int = Depends(get_current_user_id),
) -> Dict[str, bool | str]:
    """
    发布群公告
    
    :param notice: 群公告内容（只支持纯文本）
    :param group_uid: 群聊uid
    :param user_id: 当前用户id，依赖自动获取，应当为该群管理员
    :return:
    """
    try:
        response = await post_group_notice_service(
            user_id=user_id,
            group_uid=group_uid,
            notice=notice
        )
        match response:
            case 'user is not admin':
                raise ClientError(error_code=ErrorCodes.Forbidden, message='user is not admin')
            case 'group not found':
                raise ClientError(error_code=ErrorCodes.NotFound, message='group not found')
            case 'success in post group notice':
                return {
                    'success': True,
                    'message': 'success in post group notice',
                }
    except Exception as e:
        err_logger.error(f'failed to post group notice: {e} | params: group_uid={group_uid}; user_id={user_id}; notice={notice}')
        raise ServerError(error_code=ErrorCodes.InternalServerError, message='服务器维护中，暂时不能发布群公告。')
    

@group_router.put('/{group_uid}/under_review_members/{request_user_uid}', response_model=Dict[str, bool | str])
async def handle_join_request_members_endpoint(
    is_agree: bool = Query(),
    group_uid: str = Path(max_length=6),
    request_user_uid: str = Path(max_length=6),
    user_id: int = Depends(get_current_user_id),
) -> Dict[str, bool | str]:
    """
    处理入群请求
    
    :param is_agree: 是否同意
    :param group_uid: 群聊uid
    :param request_user_uid: 申请者uid
    :param user_id: 当前用户id，依赖自动获取，应当为该群管理员
    
    :return:
    """
    try:
        response = await handle_join_request_service(
            user_id=user_id,
            group_uid=group_uid,
            request_user_uid=request_user_uid,
            is_agree=is_agree
        )
        match response:
            case 'user is not admin':
                raise ClientError(error_code=ErrorCodes.Forbidden, message='user is not admin')
            case 'join request not found':
                raise ClientError(error_code=ErrorCodes.NotFound, message='join request not found')
            case 'success in agree':
                return {
                    'success': True,
                    'message': 'success in agree member request',
                }
            case 'success in reject':
                return {
                    'success': True,
                    'message': 'success in reject member request',
                }
                
    except Exception as e:
        err_logger.error(f'failed to handle join_request_service: {e} | params: is_agree={is_agree}; group_uid={group_uid}; request_user_uid={request_user_uid} user_id={user_id}')
        raise ServerError(error_code=ErrorCodes.InternalServerError, message='服务器维护中，暂时无法处理入群请求。')


@group_router.put('/{group_uid}/info', response_model=Dict[str, bool | str])
async def modify_group_info_endpoint(
    group_params: GroupSelfParams,
    user_id: int = Depends(get_current_user_id),
) -> Dict[str, bool | str]:
    """
    修改群信息/群设置
    
    :param group_params: 新的群信息/群设置模型
    :param user_id: 当前用户id，依赖自动获取，应当为该群管理员
    
    :return:
    """
    try:
        response = modify_group_info_service(
            user_id=user_id,
            new_group_params=group_params
        )
        match response:
            case 'user is not admin':
                raise ClientError(error_code=ErrorCodes.Forbidden, message='user is not admin')
            case 'group not found':
                raise ClientError(error_code=ErrorCodes.NotFound, message='group not found')
            case 'success in modify group info':
                return {
                    'success': True,
                    'message': 'success in modify group info',
                }
    except Exception as e:
        err_logger.error(f'failed to modify group_info service: {e} | params: user_id={user_id}; group_params={group_params}')
        raise ServerError(error_code=ErrorCodes.InternalServerError, message='服务器维护中，暂时无法修改群设置。')
    
    
@group_router.delete('/{group_uid}/members/{member_uid}', response_model=Dict[str, bool | str])
async def kick_out_member_endpoint(
    group_uid: str = Path(max_length=6),
    member_uid: str = Path(max_length=6),
    user_id: int = Depends(get_current_user_id),
) -> Dict[str, bool | str]:
    """
    踢出指定的群成员
    
    :param group_uid: 群聊uid
    :param member_uid: 要踢出的群成员的uid
    :param user_id: 当前用户id，依赖自动获取，应当为该群管理员
    
    :return:
    """
    try:
        response = await kick_out_member_service(
            user_id=user_id,
            group_uid=group_uid,
            kick_user_uid=member_uid
        )
        match response:
            case 'user is not admin':
                raise ClientError(error_code=ErrorCodes.Forbidden, message='user is not admin')
            case 'member not found':
                raise ClientError(error_code=ErrorCodes.NotFound, message='member not found')
            case 'can not kick out admin':
                raise ClientError(error_code=ErrorCodes.Forbidden, message='admin can not kick out admin')
            case 'can not kick out owner':
                raise ClientError(error_code=ErrorCodes.Forbidden, message='admin can not kick out owner')
            case 'success in kick out':
                return {
                    'success': True,
                    'message': f'user {member_uid} has been kick out',
                }
        
    except Exception as e:
        err_logger.error(f'failed to kick_out_member_service: {e} | params: group_uid={group_uid}; member_uid={member_uid}; user_id={user_id}')
        raise ServerError(error_code=ErrorCodes.InternalServerError, message='服务器维护中，暂时无法踢出成员。')
    

    