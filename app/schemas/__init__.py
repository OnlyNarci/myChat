from pydantic import BaseModel


class BaseParams(BaseModel):
    """基础参数模型"""
    model_config = {
        "extra": "forbid",
        "str_strip_whitespace": True,
    }
    