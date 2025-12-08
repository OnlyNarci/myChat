from datetime import datetime, UTC, timedelta
from typing import Dict, Union
from fastapi import Response, Depends
from app.core.exceptions import ErrorCodes, ServerError, ClientError
from app.core.config import settings
from app.api.v1.endpoints.user_endpoints import user_router
from app.api.v1.dependencies import validate_login_request
from app.schemas.auth_schemas import SignupParams
from app.services.user_services.user_self_services import create_user
from log.log_config.service_logger import info_logger, err_logger


@user_router.post("/login")
async def login(
        response: Response,
        params: Dict[str, Union[str, bool]] = Depends(validate_login_request),
):
    """
    发起登录请求
    """
    if params.get('success'):
        session_id = params.get("session_id")
        try:
            response.set_cookie(
                key="session_id",
                value=session_id,
                expires=datetime.now(UTC) + timedelta(hours=settings.SESSION_EXPIRE_HOURS),
                path='/',
                secure=False,
                httponly=True,
                samesite="lax",
            )
            info_logger.info(f'login success, session_id: {session_id}')

        except Exception as e:
            err_logger.error(f"something went wrong during setting cookie: {e}")
            raise ServerError(error_code=ErrorCodes.InternalServerError, message='服务器错误，请联系管理员')
        return {
                "status": ErrorCodes.Success.value,
                "message": "登录成功，页面将在5秒后跳转"
            }

    elif params.get('message') == 'unknown user agent or client ip':
        err_logger.error('got request for unknown user agent or client ip')
        raise ClientError(error_code=ErrorCodes.Forbidden, message='禁止无头浏览器或通过代理ip访问')

    elif params.get('message') == 'password incorrect':
        info_logger.error('login failed, password incorrect')
        raise ClientError(error_code=ErrorCodes.Forbidden, message='用户名或密码错误')

    elif params.get('message') == 'user does not exist':
        info_logger.error('login failed, user does not exist')
        raise ClientError(error_code=ErrorCodes.Unregistered, message='该用户名尚未注册')


@user_router.post('/signup')
async def signup(signup_params: SignupParams):
    """
    发起注册请求
    """
    signup_result = await create_user(
        user_name=signup_params.user_name,
        password=signup_params.password,
        email=signup_params.email,
    )
    if signup_result['success']:
        info_logger.info(f'signup success, user_name: {signup_params.user_name}')
        return {
                "status": ErrorCodes.Success.value,
                "message": "注册成功，即将跳转登录页面"
            }

    elif signup_result['message'] == '用户名或邮箱已被使用':
        raise ClientError(error_code=ErrorCodes.BadRequest, message='用户名或邮箱已被使用，请重新输入')
    else:
        err_logger.error(f'signup failed course internal server error: {signup_result["message"]}')
        raise ServerError(error_code=ErrorCodes.InternalServerError, message='服务器维护中，请稍后重试')
