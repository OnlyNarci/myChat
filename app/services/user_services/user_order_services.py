from datetime import datetime, UTC
from typing import List, Dict
from tortoise.transactions import atomic
from app.core.exceptions import UnAtomicError
from app.db.models import User, Card, UserCard, Order
from app.db.model_dependencies import OrderStatus
from app.schemas.base_schemas import OrderParams
from app.schemas.card_schemas import UserCardParams


async def get_orders_service(
    user_id: int
) -> List[OrderParams]:
    """
    查看待完成的订单，过期订单在此时删除
    
    :param user_id: 用户id
    
    :return:
    """
    # 1.查看所有状态为等待完成的订单
    waiting_orders = await Order.filter(
        user_id=user_id,
        status=OrderStatus.WAITING
    ).select_for_update()
    if not waiting_orders:
        return []
    
    # 2.将已超时的订单status改为2并保存
    current_time = datetime.now(UTC)
    timeout_orders = []
    for order in waiting_orders:
        if order.expires_at < current_time:
            order.status = OrderStatus.TIMEOUT  # 假设OrderStatus.TIMEOUT对应值为2
            timeout_orders.append(order)
    if timeout_orders:
        await Order.bulk_update(timeout_orders, fields=["status"])
        
    # 3.将其余订单组织为OrderParams返回
    valid_orders = [order for order in waiting_orders if order.status == OrderStatus.WAITING]
    return [
        OrderParams(
            order_id=order.id,
            user_id=user_id,
            require_card=order.require_card,
            byte=order.byte,
            exp=order.exp,
            expires_at=order.expires_at
        )
        for order in valid_orders
    ]


async def generate_order_service(
    user_id: int,
) -> List[OrderParams]:
    """
    如果今天没有生成过订单，生成24个新订单

    :param user_id: 用户id

    :return: 生成的新订单
    """
    # 1.查询今日是否创建过订单，如果已经创建过则返回空列表
    current_date = datetime.now(UTC).date()
    current_datetime = datetime(current_date.year, current_date.month, current_date.day)
    today_orders = await Order.filter(
        user_id=user_id,
        created_at__gte=current_datetime
    )
    if today_orders:
        return []
    
    # 2.随机生成新的订单并写入数据库和返回


@atomic()
async def complete_order_service(
    user_id: int,
    order_id: int,
) -> Dict[str, int]:
    """
    完成订单、交付卡牌、获取经验和比特
    
    :param user_id: 用户id
    :param order_id: 要交付的订单id
    
    :return: 无法完成订单返回缺少的卡牌
    """
    # 1.检查目标交付的订单存在
    order_to_complete = await Order.filter(
        id=order_id,
        user_id=user_id,
        status=OrderStatus.WAITING
    ).select_for_update().first()
    if not order_to_complete:
        raise UnAtomicError(message='order not found')
    
    # 2.检查用户有足量卡牌可交付，没有则返回缺少的卡牌
    # 提前准备需要的卡牌参数
    cards = await Card.filter(
        card_id__in=list(order_to_complete.require_card.keys())
    ).all()
    card_map = {
        card.id: card
        for card in cards
    }
    user_cards = await UserCard.filter(
        user_id=user_id,
        card_id__in=list(order_to_complete.require_card.keys())
    ).select_for_update().select_related('card').all()
    user_card_map = {
        user_card.card.id: user_card
        for user_card in user_cards
    }
    
    lack_cards: List[UserCardParams] = []
    to_order_cards: List[UserCard] = []
    # 记录缺少的卡牌
    for require_card_id, require_number in order_to_complete.require_card.items():
        if require_card_id not in user_card_map:
            lack_number = require_number
        elif user_card_map[require_card_id].number < require_number:
            lack_number = require_number - user_card_map[require_card_id].number
        else:
            lack_number = 0
            to_order_card = user_card_map[require_card_id]
            to_order_card.number -= require_number
            to_order_cards.append(to_order_card)
            
        if lack_number != 0:
            lack_cards.append(UserCardParams(
                    card_id=require_card_id,
                    name=card_map[require_card_id].name,
                    image=card_map[require_card_id].image,
                    rarity=card_map[require_card_id].rarity,
                    package=card_map[require_card_id].package,
                    unlock_level=card_map[require_card_id].unlock_level,
                    description=card_map[require_card_id].description,
                    number=lack_number,
                ))
    if lack_cards:
        raise UnAtomicError(message='lack cards', lack_cards=lack_cards)
    
    # 3.扣除用户交付的卡牌
    await UserCard.bulk_update(to_order_cards, fields=['number'])
    
    # 4.修改订单状态为完成
    order_to_complete.status = OrderStatus.CONFIRM
    await order_to_complete.save()
    
    # 5.为用户增加经验和比特
    user = await User.get(id=user_id)
    user.exp += order_to_complete.exp
    user.byte += order_to_complete.byte
    await user.save()
    
    return {
        'exp': order_to_complete.exp,
        'byte': order_to_complete.byte
    }
    

async def delete_order_service(
    user_id: int,
    order_id: int,
) -> None:
    """
    删除订单
    
    :param user_id: 用户id
    :param order_id: 要删除的订单id
    
    :return: 删除成功返回None
    """
    order = await Order.filter(
        id=order_id,
        user_id=user_id,
        status=OrderStatus.WAITING
    ).select_for_update().first()
    if not order:
        raise UnAtomicError(message='order not found')
    
    order.status = OrderStatus.REJECTED
    await order.save()
    