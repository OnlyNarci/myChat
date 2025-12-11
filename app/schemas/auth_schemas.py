import re
from pydantic import Field, EmailStr, field_validator
from app.core.exceptions import ErrorCodes, ClientError
from app.schemas import BaseParams


class LoginParams(BaseParams):
    """登录参数模型"""
    user_name: str = Field(
        min_length=1,
        max_length=16,
        description='用户名不能为空'
    )
    password: str = Field(
        min_length=8,
        max_length=32,
        pattern=r'^[a-zA-Z0-9!@#$%^&*_.-]+$',
        description='密码不能为空'
    )


class SignupParams(BaseParams):
    """注册参数模型"""
    user_name: str
    password: str
    email: EmailStr

    @field_validator('user_name')
    def validate_username(cls, user_name: str) -> str:
        if len(user_name) == 0:
            raise ClientError(
                error_code=ErrorCodes.InvalidParams,
                message="用户名不能为空"
            )

        if len(user_name) > 16:
            raise ClientError(
                error_code=ErrorCodes.InvalidParams,
                message="用户名不能超过16个字符"
            )

        return user_name

    @field_validator('password')
    def validate_password(cls, password: str) -> str:
        if len(password) < 8 or len(password) > 32:
            raise ClientError(
                error_code=ErrorCodes.InvalidParams,
                message="密码至少包含8个字符，至多包含32个字符"
            )

        allow_chars = r'^[a-zA-Z0-9!@#$%^&*_.-]+$'
        if not re.match(allow_chars, password):
            raise ClientError(
                error_code=ErrorCodes.InvalidParams,
                message="密码只能包含大小写字母和以下特殊字符(!@#$%^&*_.-)"
            )

        return password


class UserParams(BaseParams):
    """用户模型"""
    uid: str = Field(max_length=6, description='用户uid')
    name: str = Field(max_length=16, description='用户名称')
    avatar: str = Field(default='', max_length=1024, description='用户头像在文件服务器中的url')
    signature: str = Field(default='', max_length=255, description='个性签名')
    level: int = Field(default=1, description='用户等级')


if __name__ == '__main__':
    pass
