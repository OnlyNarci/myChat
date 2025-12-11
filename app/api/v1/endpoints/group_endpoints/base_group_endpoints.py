from typing import List, Dict, Optional, TypeAlias
from fastapi import Depends, Query, Path
from app.services.group_services.base_group_services import (
    query_groups_not_in_service,
    query_groups_in_service,
    query_group_notice_service,
    create_group_service,
    join_group_service,
    leave_group_service,
)
from app.core.security import get_current_user_id
from app.core.exceptions import ErrorCodes, ClientError, ServerError
from app.core.extra_params import extra_params
from app.schemas.group_schemas import GroupParams, GroupSelfParams, GroupMessageParams
from app.api.v1.endpoints.group_endpoints import group_router
from log.log_config.service_logger import err_logger


GroupType: TypeAlias = Dict[str, bool | str | Dict[str, List[GroupParams]]]
GroupMessageType: TypeAlias = Dict[str, bool | str | Dict[str, List[GroupMessageParams]]]


@group_router.get('/others', response_model=GroupType)
async def query_groups_not_in_endpoint(
    group_uid: Optional[str] = Query(default=None, max_length=6),
    name_in: Optional[str] = Query(default=None, max_length=16),
    level_ge: Optional[int] = Query(default=None, ge=0),
) -> GroupType:
    """
    查找符合条件的群聊
    
    :param group_uid: 群聊uid, 当此参数不为空时，查询到的条目将是唯一的
    :param name_in: 群聊名称检索
    :param level_ge: 群聊等级检索
    
    :return: 符合条件的群聊
    """
    try:
        groups = await query_groups_not_in_service(
            group_uid=group_uid,
            name_in=name_in,
            level_ge=level_ge,
        )
        return {
            'success': True,
            'message': 'success in getting groups',
            'data': {'groups': groups,}
        }
    
    except Exception as e:
        err_logger.error(f'failed to query groups: {e} | params: group_uid={group_uid}; name_in={name_in}; level_ge={level_ge}')
        raise ServerError(error_code=ErrorCodes.InternalServerError, message='服务器维护中，暂时无法搜索群聊')
    

@group_router.get('/me', response_model=GroupType)
async def query_groups_in_endpoint(
    user_id: int = Depends(get_current_user_id),
) -> GroupType:
    """
    查看自己已加入的群聊(用于在群聊主页返回数据)

    :param user_id: 用户id

    :return:
    """
    try:
        groups = await query_groups_in_service(
            user_id=user_id,
        )
        return {
            'success': True,
            'message': 'success in getting groups',
            'data': {'groups': groups}
        }
    
    except Exception as e:
        err_logger.error(f'failed to get group information: {e} | params: user_id={user_id}')
        raise ServerError(error_code=ErrorCodes.InternalServerError, message='服务器维护中，暂时无法查看群聊')
    

@group_router.get('/{group_uid}/group_notice', response_model=GroupMessageType)
async def query_group_notice_endpoint(
    group_uid: str = Path(max_length=6),
    user_id: int = Depends(get_current_user_id),
) -> GroupMessageType:
    """
    查看指定群聊的群公告
    
    :param group_uid: 群聊uid
    :param user_id: 当前用户id，依赖自动获取
    
    :return: 群公告列表
    """
    try:
        response = await query_group_notice_service(
            group_uid=group_uid,
            user_id=user_id,
        )
        match response:
            case 'user not in group':
                raise ClientError(error_code=ErrorCodes.Forbidden, message="user not in group, can't view notice")
            case _:
                return {
                    'success': True,
                    'message': 'success in getting group notice',
                    'data': {'group_notice': response}
                }
    except Exception as e:
        err_logger.error(f'failed to get group notice: {e} | params: user_id={user_id}; group_uid={group_uid}')
        raise ServerError(error_code=ErrorCodes.InternalServerError, message='服务器维护中，暂时无法查看群公告')


@group_router.post('/members/owner', response_model=Dict[str, bool | str | Dict[str, str]])
async def create_group_endpoint(
    group_params: GroupSelfParams,
    user_id: int = Depends(get_current_user_id),
) -> Dict[str, bool | str | Dict[str, str]]:
    try:
        response = await create_group_service(
            user_id=user_id,
            group_params=group_params,
        )
        match response:
            case 'group too march':
                raise ClientError(error_code=ErrorCodes.Forbidden, message=f'everyone can create {extra_params.MAX_GROUP_FOR_USER} groups only')
            case _:
                return {
                    'success': True,
                    'message': 'success in creating group',
                    'data': {'group': response}
                }
    except Exception as e:
        err_logger.error(f'failed to create group: {e} | params: user_id={user_id}; group_params={group_params}')
        raise ServerError(error_code=ErrorCodes.InternalServerError, message='服务器维护中，暂时无法创建群聊')


@group_router.post('/{group_uid}/members/me', response_model=Dict[str, bool | str])
async def join_group_endpoint(
    group_uid: str = Path(max_length=6),
    user_id: int = Depends(get_current_user_id),
) -> Dict[str, bool | str]:
    """
    加入指定群聊
    
    :param group_uid: 目标群组uid
    :param user_id: 用户id
    
    :return:
    """
    try:
        response = await join_group_service(
            user_id=user_id,
            group_uid=group_uid,
        )
    except Exception as e:
        err_logger.error(f'failed to join group: {e} | params: user_id={user_id}; group_id={group_uid}')
        raise ServerError(error_code=ErrorCodes.InternalServerError, message='服务器维护中，暂时无法加入群聊')
    match response:
        case 'group not found':
            raise ClientError(error_code=ErrorCodes.NotFound, message='group not found')
        case 'forbidden to join group':
            raise ClientError(error_code=ErrorCodes.Forbidden, message='you are not allowed to join group')
        case 'group already joined':
            raise ClientError(error_code=ErrorCodes.Conflict, message='group already joined')
        case 'group joined':
            return {
                'success': True,
                'message': 'success in sending join request, please wait for accept',
            }
        case _:
            raise ServerError(error_code=ErrorCodes.InternalServerError, message='服务器维护中，暂时无法加入群聊')


@group_router.delete('/{group_uid}/members/me', response_model=Dict[str, bool | str])
async def leave_group_endpoint(
    group_uid: str = Path(max_length=6),
    user_id: int = Depends(get_current_user_id),
) -> Dict[str, bool | str]:
    """
    退出指定的群聊
    
    :param group_uid: 目标群组uid
    :param user_id: 用户id
    
    :return:
    """
    try:
        response = await leave_group_service(
            user_id=user_id,
            group_uid=group_uid,
        )
        match response:
            case 'not in group':
                raise ClientError(error_code=ErrorCodes.NotFound, message='you has left the group')
            case 'leave group':
                return {
                    'success': True,
                    'message': 'leave group successfully',
                }
            case _:
                raise ServerError(error_code=ErrorCodes.InternalServerError, message='服务器维护中，暂时无法退出群聊')
        
    except Exception as e:
        err_logger.error(f'failed to leave group: {e} | params: user_id={user_id}; group_id={group_uid}')
        raise ServerError(error_code=ErrorCodes.InternalServerError, message='服务器维护中，暂时无法退出群聊')
