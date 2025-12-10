from datetime import date
from typing import List, Dict
from fastapi import Path, Depends
from app.core.security import get_current_user_id
from app.core.exceptions import ErrorCodes, ClientError, ServerError
from app.schemas.auth_schemas import UserParams
from app.api.v1.endpoints.user_endpoints import user_router
from app.services.user_services.user_user_services import (
    get_waiting_accept_service,
    request_friendship_service,
    handle_friend_request_service,
    delete_friendship_service
)
from log.log_config.service_logger import err_logger


@user_router.get("/friendship/under_review", response_model=Dict[str, str | bool | Dict[str, Dict[str, List[Dict[str, str | UserParams]]]]])
async def get_waiting_accept(
    user_id: int = Depends(get_current_user_id),
) -> Dict[str, str | bool | Dict[str, List[Dict[str, str | UserParams]]]]:
    try:
        waiting_accept = await get_waiting_accept_service(user_id=user_id)
        return {
            'success': True,
            'message': 'success in getting waiting accept',
            'data': {'waiting_accept': waiting_accept}
        }
    
    except Exception as e:
        err_logger.error(f'failed to get waiting accept: {e} | params: user_id={user_id}')
        raise ServerError(error_code=ErrorCodes.InternalServerError, message='服务器维护中，暂时不能查看好友请求。')


@user_router.post("/friendship/{request_user_uid}", response_model=Dict[str, bool | str])
async def request_friendship(
    request_message: str,
    request_user_uid: str = Path(max_length=6),
    user_id: int = Depends(get_current_user_id),
) -> Dict[str, bool | str]:
    """
    向指定 uid 玩家发起好友请求
    
    :param request_user_uid: 目标玩家 uid
    :param request_message: 请求时附带的消息
    :param user_id: 当前玩家 id, Depends自动获取
    
    :return: 请求响应结果
    """
    try:
        result = await request_friendship_service(
            user_request_id=user_id,
            user_accept_uid=request_user_uid,
            request_message=request_message
        )
        
    except Exception as e:
        err_logger.error(f'failed to request friendship: {e} | params: user_id={user_id}; request_user_uid={request_user_uid}')
        raise ServerError(error_code=ErrorCodes.InternalServerError, message='服务器维护中，暂时不能发起好友请求。')
    
    match result:
        case "User accept does not exist":
            raise ClientError(error_code=ErrorCodes.NotFound, message='player not found')
        case "can not request self":
            raise ClientError(error_code=ErrorCodes.Forbidden, message='could not request self')
        case 'waiting for accept':
            raise ClientError(error_code=ErrorCodes.Conflict, message='you have sending request before, please wait for accept')
        case 'friendship is confirm':
            raise ClientError(error_code=ErrorCodes.Conflict, message='friendship is confirm')
        case 'black list member can not request':
            raise ClientError(error_code=ErrorCodes.Forbidden, message='black list member can not request')
        case 'success in sending request':
            return {
                "success": True,
                'message': 'success in sending request, please wait for accept',
            }
        case 'got request before, now is accepted':
            return {
                "success": True,
                'message': f'对方也向你发起了好友请求，{date.today().strftime('%Y年%m月%d日')}，你们成为了好友。'
            }
        

@user_router.put("/friendship/{request_user_uid}", response_model=Dict[str, bool | str])
async def handle_friend_request(
    is_accepted: bool,
    request_user_uid: str = Path(max_length=6),
    user_id: int = Depends(get_current_user_id),
) -> Dict[str, bool | str]:
    """
    处理一个收到的好友请求
    
    :param request_user_uid: 请求者 uid
    :param is_accepted: 是否同意
    :param user_id: 当前玩家 id, 通过Depends自动获取
    
    :return: 请求响应结果
    """
    try:
        result = await handle_friend_request_service(
            user_accept_id=user_id,
            user_request_uid=request_user_uid,
            is_accept=is_accepted
        )
        
    except Exception as e:
        err_logger.error(f'failed to handle friendship: {e} | params: user_id={user_id}; request_user_uid={request_user_uid}; is_accept={is_accepted}')
        raise ServerError(error_code=ErrorCodes.InternalServerError, message='服务器维护中，暂时无法处理好友请求。')
    
    match result:
        case "User A does not exist":
            raise ClientError(error_code=ErrorCodes.NotFound, message='player not found')
        case "got no friend request from user A":
            raise ClientError(error_code=ErrorCodes.Conflict, message=f'got no friend request from user: {request_user_uid}')
        case 'friendship has confirm':
            raise ClientError(error_code=ErrorCodes.Conflict, message='friendship has confirm')
        case 'friend request rejected':
            raise {
                "success": True,
                "message": f'你拒绝了对方的好友请求。'
            }
        case _:
            return {
                'success': True,
                'message': f'{date.today().strftime('%Y年%m月%d日')}，你和{result}成为了好友。'
            }


@user_router.delete("/friendship/{friend_uid}", response_model=Dict[str, bool | str])
async def delete_friendship(
    friend_uid: str = Path(max_length=6),
    user_id: int = Depends(get_current_user_id),
) -> Dict[str, bool | str]:
    """
    删除好友
    
    :param friend_uid: 目标删除的好友 uid
    :param user_id: 当前用户 id
    
    :return:
    """
    try:
        result = await delete_friendship_service(
            user_id=user_id,
            friend_uid=friend_uid
        )
        
    except Exception as e:
        err_logger.error(f'failed to delete friendship: {e} | params: user_id={user_id}; friend_uid={friend_uid}')
        raise ServerError(error_code=ErrorCodes.InternalServerError, message='服务器维护中，暂时无法删除好友。')
    
    match result:
        case 'friend does not exist':
            raise ClientError(error_code=ErrorCodes.NotFound, message='该账号已注销，如果你们的好友关系没有自动解除，请联系管理员解决。')
        case 'friendship does not exist':
            raise ClientError(error_code=ErrorCodes.Conflict, message='friendship does not exist')
        case 'friend deleted':
            return {
                "success": True,
                "message": 'success in deleting friendship',
            }
        