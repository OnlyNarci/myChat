from datetime import datetime
from pydantic import Field
from app.schemas import BaseParams


class StoreRecordParams(BaseParams):
    buyer_name: str = Field(default='unknown', min_length=1, max_length=16, title='买家名称')
    seller_name: str = Field(default='unknown', min_length=1, max_length=16, itle='卖家名称')
    card_name: str = Field(min_length=1, max_length=16, title='交易的卡牌名称')
    number: int = Field(ge=1, title='交易数量')
    price: int = Field(ge=1, title='交易单价')
    trade_time: datetime = Field(title='交易时间')
    