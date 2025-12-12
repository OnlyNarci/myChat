import uuid
from datetime import datetime, timedelta, UTC
from typing import Dict, Optional, Union
from fastapi import Depends
from app.core.security import (
    varify_password,
    get_basic_headers
)
from app.core.config import settings
from app.schemas.auth_schemas import LoginParams
from app.db.models import UserSession


async def create_session(
        user_id: str,
        user_agent: Optional[str] = None,
        ip_address: Optional[str] = None
) -> str:
    """
    创建用户会话（基于MySQL），生成UUID作为会话ID
    :param user_id: 用户唯一标识
    :param user_agent: 客户端User-Agent
    :param ip_address: 客户端IP地址
    :return: 会话ID，服务器密钥
    """
    session_id = str(uuid.uuid4())
    # 计算过期时间
    current_time = datetime.now(UTC)
    expires_at = current_time + timedelta(hours=settings.SESSION_EXPIRE_HOURS)

    user_session = UserSession(
        user_id=user_id,
        session_id=session_id,
        created_at=current_time,
        expires_at=expires_at,
        user_agent=user_agent,
        ip_address=ip_address
    )
    await user_session.save()

    return session_id


async def validate_login_request(
        payload: LoginParams,
        headers: Dict[str, str] = Depends(get_basic_headers)
) -> Dict[str, Union[str, bool]]:
    """校验登录请求参数，通过则创建会话"""
    user_agent = headers.get('user_agent')
    client_ip = headers.get('client_ip')
    if not user_agent or not client_ip:
        return {
            'success': False,
            'session_id': '',
            'message': 'unknown user agent or client ip',
        }

    user = await varify_password(
        user_name=payload.user_name,
        plain_password=payload.password,
    )
    if user['success']:
        session_id = await create_session(
            user_id=user['user_id'],
            user_agent=user_agent,
            ip_address=client_ip
        )
        return {
            'success': True,
            "session_id": session_id,
            "message": "login success",
        }

    elif user['message'] == 'password incorrect':
        return {
            'success': False,
            'session_id': '',
            'message': 'password incorrect',
        }

    else:
        return {
            'success': False,
            'session_id': '',
            'message': 'user does not exist',
        }
