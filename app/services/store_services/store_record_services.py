from datetime import datetime, timedelta
from typing import List

from app.db.models import StoreRecord
from app.schemas.record_schemas import StoreRecordParams


async def query_buy_record_service(
    user_id: int,
) -> List[StoreRecordParams]:
    """
    获取玩家自己近一个月所有买入卡牌记录
    """
    month_ago = datetime.now() - timedelta(days=30)
    store_records = await StoreRecord.filter(
        buy_id=user_id,
        created_at__gte=month_ago
    ).select_related('buyer', 'seller', 'card').all()
    return [
        StoreRecordParams(
            buyer_name=store_record.buyer.name,
            seller_name=store_record.seller.name,
            card_name=store_record.card.name,
            number=store_record.number,
            price=store_record.price,
            trade_time=store_record.created_at
        )
        for store_record in store_records
    ]


async def query_sell_record_service(
    user_id: int
) -> List[StoreRecordParams]:
    """
    获取玩家自己近一个月所有出售卡牌记录
    """
    month_ago = datetime.now() - timedelta(days=30)
    store_records = await StoreRecord.filter(
        seller_id=user_id,
        created_at__gte=month_ago
    ).select_related('buyer', 'seller', 'card').all()
    return [
        StoreRecordParams(
            buyer_name=store_record.buyer.name,
            seller_name=store_record.seller.name,
            card_name=store_record.card.name,
            number=store_record.number,
            price=store_record.price,
            trade_time=store_record.created_at
        )
        for store_record in store_records
    ]
