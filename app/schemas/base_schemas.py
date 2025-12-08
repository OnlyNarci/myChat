from typing import List
from pydantic import Field
from app.schemas import BaseParams
from app.schemas.card_schemas import UserCardParams


class UserParams(BaseParams):
    """用户个人参数模型（公开的信息）"""
    uid: str = Field(max_length=6, title='用户uid')
    name: str = Field(max_length=16, title='用户姓名')
    title: str = Field(max_length=16, title='用户称号')
    avatar: str = Field(default='', max_length=1024, title='用户头像在文件服务器中的url')
    signature: str = Field(default='', max_length=255, title='个性签名')
    level: int = Field(default=1, ge=1, title='等级')


class UserSelfParams(UserParams):
    """用户个人参数模型（包含未公开的信息）"""
    email: str = Field(default='', max_length=60, title='注册邮箱')
    exp: int = Field(default=0, title='用户累计经验值')
    byte: int = Field(default=0, title='用户比特数量', description='这是游戏中的基础货币')


class OrderParams(BaseParams):
    """订单参数模型"""
    order_id: int = Field(ge=1, title='订单编号')
    user_id: int = Field(ge=1, title='用户编号')
    require: List[UserCardParams] = Field(title='订单内容')
    price: int = Field(ge=0, title='订单价格', description='完成订单可以获得的比特')
    exp: int = Field(ge=0, title='经验值', description='完成订单获得')


class RestaurantParams(BaseParams):
    """餐馆参数模型(公开的信息)"""
    pass


class RestaurantSelfParams(RestaurantParams):
    """餐馆参数模型(餐馆主人可见的信息)"""
    pass
