import string
import secrets
from passlib.context import CryptContext
from datetime import datetime, UTC
from typing import Dict, Optional, Union
from tortoise.exceptions import DoesNotExist
from fastapi import Request, Depends
from app.db import User, UserSession, Group
from app.core.config import settings
from app.core.exceptions import ErrorCodes, RedirectionError, ClientError


# 密码加密上下文
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


def get_string_hash(password: str) -> str:
    global pwd_context
    return pwd_context.hash(password)


async def varify_password(
        user_name: str,
        plain_password: str
) -> Dict[str, Union[str, bool]]:
    """验证密码"""
    global pwd_context
    try:
        user_item = await User.get(name=user_name).values('password', 'id')
    except DoesNotExist:
        return {
            'success': False,
            'user_id': '',
            'message': 'user does not exist'
        }

    if pwd_context.verify(plain_password, user_item['password']):
        return {
            'success': True,
            'user_id': user_item['id'],
            'message': 'password match'
        }
    else:
        return {
            'success': False,
            'user_id': '',
            'message': 'password incorrect'
        }


async def varify_skip_session(request: Request) -> bool:
    """
    判断当前路径是否需要跳过会话校验（如登录页）
    """
    skip_paths = {"/player/login", "/player/signup", "/docs", "/player/test"}
    url = request.url.path
    for path in skip_paths:
        if path in url:
            return True


async def verify_session_id(request: Request) -> Optional[str]:
    """从请求头或Cookie中提取session_id，返回None表示缺失"""
    session_id = request.headers.get("session_id") or request.cookies.get("session_id")
    if not session_id:
        return None

    # 校验会话有效性
    try:
        session_item = await UserSession.get(
            session_id=session_id,
            expires_at__gt=datetime.now(UTC),
            user_agent=request.headers.get("User-Agent", None),
            ip_address=request.client.host
        ).values('user_id')

        user_id = session_item['user_id']
        return user_id

    except DoesNotExist:
        return None


async def get_basic_headers(
        request: Request
) -> Dict[str, str]:
    """
    基础请求头校验，不允许无ip浏览和无头浏览
    """
    client_ip = request.client.host
    user_agent = request.headers.get('User-Agent', None)

    return {
        'user_agent': user_agent,
        'client_ip': client_ip
    }


async def validate_session_request(
        request: Request,
        should_skip: bool = Depends(varify_skip_session),        # 是否跳过校验
        headers: Dict[str, str] = Depends(get_basic_headers),                 # 校验请求头
        user_id: Optional[str] = Depends(verify_session_id),            # 获取会话ID
) -> bool | RedirectionError:
    """
    整合依赖，判断会话是否有效，无效则抛出重定向错误
    """
    # 跳过校验的路径直接返回有效
    if should_skip:
        return True

    if not headers['user_agent'] or not headers['client_ip'] or not user_id:
        target_url = f"http://{settings.SERVER_HOST}:{settings.SERVER_PORT}/player/login"
        raise RedirectionError(
            status_code=303,
            error_code=ErrorCodes.TemporaryRedirect,
            message="登录已过期，请重新登录",
            redirect_url=target_url
        )
    
    request.state.user_id = user_id
    
    return True


async def generate_unique_uid(database: str) -> str:
    """
    生成6位唯一UID（包含小写字母和数字）
    确保与数据库中已存在的User.uid不重复
    """
    # 定义字符集：26个小写字母 + 10个数字
    chars = string.ascii_lowercase + string.digits

    while True:
        # 使用secrets模块生成安全的随机字符串
        uid = ''.join(secrets.choice(chars) for _ in range(6))

        # 检查数据库中是否已存在该UID
        match database:
            case 'user':
                exists = await User.filter(uid=uid).exists()
                if not exists:
                    return uid
            case 'group':
                exists = await Group.filter(uid=uid).exists()
                if not exists:
                    return uid


async def get_current_user_id(request: Request) -> int:
    """
    从 request.state 中获取当前用户的 ID。
    如果不存在，则抛出 Unauthorized 异常。
    """
    user_id: Optional[str] = getattr(request.state, 'user_id', None)
    if not user_id:
        raise ClientError(error_code=ErrorCodes.Unauthorized, message='登录已过期，请重新登录')
    return int(user_id)

