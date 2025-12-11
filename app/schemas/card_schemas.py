from typing import Optional
from pydantic import Field
from app.schemas import BaseParams
from app.db.model_dependencies import Package


class CardParams(BaseParams):
    """
    卡牌基本模型
    """
    card_id: int = Field(ge=1, title='卡牌id')
    name: Optional[str] = Field(default=None, max_length=16, title='卡牌名称')
    image: Optional[str] = Field(default=None, min_length=0, max_length=1024, title='卡牌原画')
    rarity: Optional[int] = Field(default=None, ge=1, le=5, title='卡牌稀有度')
    package: Package = Field(default=Package.BASE, max_length=16, title='卡牌包')
    unlock_level: Optional[int] = Field(default=None, ge=1, title='解锁等级')
    description: Optional[str] = Field(default=None, title='卡牌描述')
    
    def __repr__(self):
        return f'<UserCardParams (card_id={self.card_id}; name={self.name}; image={self.image}; rarity={self.rarity}; package={self.package})>'
    
    def __eq__(self, other) -> bool:
        if not isinstance(other, CardParams):
            return False
        return self.card_id == other.card_id
    
    def __hash__(self) -> int:
        return hash(self.card_id)
    
    def __getitem__(self, key):
        if key not in self.model_fields:
            raise KeyError(f'CardParams has no field name {key}')
        raise getattr(self, key)
    
    def __iter__(self):
        return iter(self.model_dump().items())

    
class StoreCardParams(CardParams):
    """
    商店中的卡牌模型，用于校验查商店、买卡、上架卡牌的请求参数
    """
    store_id: Optional[int] = Field(default=None, ge=1, title='卡牌的商店id')
    number: int = Field(ge=1, title='卡牌数量')
    price: int = Field(ge=1, title='卡牌价格')
    owner_name: Optional[str] = Field(default=None, title='卡牌持有者名称')
    is_publish: bool = Field(default=True, title='是否公开出售', description='否则只有朋友可见')
    
    def __repr__(self):
        return f'<UserCardParams (card_id={self.card_id}; name={self.name}; image={self.image}; rarity={self.rarity}; package={self.package}; store_id={self.store_id}; number={self.number}; price={self.price}; is_publish={self.is_publish})>'

    
class UserCardParams(CardParams):
    """
    玩家卡牌模型，用于校验合卡、分卡的请求参数
    """
    number: Optional[int] = Field(default=None, ge=1, title='卡牌数量')
    
    def __repr__(self):
        return f'<UserCardParams (card_id={self.card_id}; name={self.name}; image={self.image}; rarity={self.rarity}; package={self.package}; number={self.number})>'


class PullCardParams(BaseParams):
    """
    玩家抽卡请求模型，用于校验抽卡请求体
    """
    times: int = Field(default=1, ge=1, le=100, title='抽卡次数')
    package: str = Field(default='base', min_length=1, max_length=16)

    
if __name__ == '__main__':
    pass
    