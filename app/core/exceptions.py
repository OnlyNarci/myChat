from enum import IntEnum
from typing import Any, Union
from pydantic import ValidationError
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi import Request
from fastapi.exceptions import RequestValidationError


class ErrorCodes(IntEnum):
    Continue = 100
    SwitchingProtocols = 101
    EarlyHints = 103
    Success = 200       # 请求成功
    Created = 201
    Accept = 202        # 收到请求
    NoContent = 203     # 无请求内容
    MovedPermanently = 301
    Found = 302
    SeeOther = 303
    NotModified = 304
    TemporaryRedirect = 307
    PermanentRedirect = 308
    BadRequest = 400
    Unauthorized = 401      # 用户未登录
    Unregistered = 402      # 用户未注册
    Forbidden = 403
    NotFound = 404
    MethodNotAllowed = 405
    RequestTimeout = 408
    Conflict = 409
    Gone = 410
    PayloadTooLarge = 413
    UrlTooLong = 414
    UnsupportedMediaType = 415
    InvalidParams = 422     # 参数校验未通过（不合法参数）
    TooManyRequests = 429
    InternalServerError = 500   # 服务器错误
    BadGateway = 502
    UnExceptError = 1000


class RedirectionError(Exception):
    """重定向错误，3xx状态码"""
    def __init__(
        self,
        error_code: ErrorCodes,
        redirect_url: str,
        message: str = "",
        status_code: int = 303
    ):
        self.error_code: int = error_code.value
        self.status_code: int = status_code
        self.message = message
        self.redirect_url = redirect_url
        super().__init__(f"[{error_code.value}] {message or error_code.name}")


class ClientError(Exception):
    """客户端错误，4头错误码"""
    def __init__(self, error_code: ErrorCodes, message: str = "", **kwargs: Any):
        self.error_code: int = error_code.value
        self.status_code: int = error_code.value
        self.message = message
        self.extra = kwargs
        super().__init__(f"[{error_code.value}] {message or error_code.name}")


class ServerError(Exception):
    """服务端错误，5头错误码"""
    def __init__(self, error_code: ErrorCodes, message: str = "", **kwargs: Any):
        self.error_code: int = error_code.value
        self.status_code: int = error_code.value
        self.message = message
        self.extra = kwargs
        super().__init__(f"[{error_code.value}] {message or error_code.name}")


class UnExceptError(Exception):
    """未知错误，错误码1000"""
    def __init__(self, message: str = "", **kwargs: Any):
        self.error_code = 1000
        self.status_code = 1000
        self.message = message
        self.extra = kwargs
        super().__init__(f"[1000] {message}")


class UnAtomicError(Exception):
    """用于在一个原子事务内部中断，使事务回滚"""
    def __init__(self, message: str = "", **kwargs: Any):
        super().__init__(message)
        self.message = message
        self.extra = kwargs


async def handle_http_exception(request: Request, exc: Union[ClientError, RedirectionError, ServerError, RequestValidationError, ValidationError]) -> JSONResponse | RedirectResponse:
    """
    统一的HTTP异常处理函数，使用match-case语法简化逻辑。
    """
    
    def _get_validation_error_msg(e: RequestValidationError | ValidationError) -> str:
        """提取Pydantic验证错误信息的辅助函数"""
        error_messages = []
        for err in e.errors():
            err_field = ".".join(map(str, err['loc']))
            error_messages.append(f"{err_field}: {err['msg']}")
        return "; ".join(error_messages)
    
    match exc:
        # 匹配重定向异常
        case RedirectionError(redirect_url=url, status_code=code):
            return RedirectResponse(url, status_code=code)
        
        # 匹配Pydantic的两种验证错误，并使用辅助函数处理
        case RequestValidationError() | ValidationError():
            combined_errors = _get_validation_error_msg(exc)
            return JSONResponse(
                status_code=422,
                content={
                    'success': False,
                    "message": "请求参数验证未通过",
                    "errors": combined_errors
                }
            )
        
        case ServerError():
            return JSONResponse(
                status_code=exc.status_code,
                content={
                    'success': False,
                    'message': exc.message,
                    'data': exc.extra
                }
            )
        
        # 匹配客户端错误
        case ClientError():
            return JSONResponse(
                status_code=exc.error_code,
                content={
                    'success': False,
                    "message": exc.message,
                    "data": exc.extra
                }
            )
        
        # 匹配所有其他未知异常
        case _:
            return JSONResponse(
                status_code=ErrorCodes.InternalServerError.value,
                content={
                    'success': False,
                    "message": "服务器内部错误"
                }
            )
