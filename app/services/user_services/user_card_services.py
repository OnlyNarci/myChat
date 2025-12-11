import random
from typing import List, Dict, Optional
from collections import defaultdict
from tortoise.queryset import Q
from tortoise.transactions import atomic
from tortoise.exceptions import DoesNotExist
from app.core.exceptions import UnAtomicError
from app.db.models import User, Card, UserCard
from app.db.model_dependencies import Package
from app.schemas.card_schemas import UserCardParams, PullCardParams


async def get_box_service(
    user_id: int,
    name_in: Optional[str] = None,
    rarity: Optional[int] = None,
    package: Optional[str] = None,
) -> List[UserCardParams]:
    """
    查看个人持有卡牌
    
    :param user_id: 用户id
    :param name_in: 卡牌名称包含的字符串
    :param rarity: 卡牌稀有度
    :param package: 卡牌包名称
    
    :return: 符合条件的持有卡牌列表
    """
    query = Q(user_id=user_id)
    
    if name_in is not None:
        query &= Q(card__name__icontains=name_in)
    if rarity is not None:
        query &= Q(card__rarity=rarity)
    if package is not None:
        query &= Q(card__package=package)
        
    card_items = await UserCard.filter(query).select_related('card').all()
    
    if not card_items:
        return []
    
    cards = [
        UserCardParams(
            card_id=user_card.card.id,
            name=user_card.card.name,
            image=user_card.card.image,
            rarity=user_card.card.rarity,
            package=user_card.card.package,
            description=user_card.card.description,
            number=user_card.number,
        )
        for user_card in card_items
    ]
    return cards


@atomic()
async def pull_card_service(
    user_id: int,
    card_to_pull: PullCardParams,
) -> List[UserCardParams]:
    """
    用户在指定扩展包抽指定次数的卡，扣除time*10的比特
    
    :param user_id: 用户id
    :param card_to_pull: 玩家抽卡参数
    
    :return: 抽卡是否成功，成功则返回抽到的卡牌列表，失败则返回失败信息
    """
    def generate_random_number(n: int) -> List[int]:
        """
        生成n个随机数：75% 的概率返回 1, 20% 的概率返回 2, 4% 的概率返回 3, 1% 的概率返回 4
        """
        numbers = [1, 2, 3, 4]
        weights = [75, 20, 4, 1]

        result = random.choices(numbers, weights=weights, k=n)
        
        return result
    
    # 1.确认扩展包名存在
    try:
        package = Package(card_to_pull.package)
    except ValueError:
        raise UnAtomicError(message='package not found')
    
    # 2.确认玩家比特充足并扣除相应比特
    need_byte = card_to_pull.times * 10
    user = await User.filter(id=user_id).select_for_update().first()
    if user.byte < need_byte:
        raise UnAtomicError(message='byte not enough')
    
    user.byte -= need_byte
    await user.save()
    
    # 3.随机生成抽到的稀有度
    rarity_list = generate_random_number(card_to_pull.times)
    rarity_set = set(rarity_list)
    
    # 4.查询所有符合稀有度的卡牌，并按照稀有度分组
    all_available_card = await Card.filter(
        package=package,
        rarity__in=rarity_set,
        unlock_level__gte=user.level
    ).all()
    cards_by_rarity: Dict[int, List[Card]] = defaultdict(list)
    for card in all_available_card:
        cards_by_rarity[card.rarity].append(card)
    
    # 5.遍历稀有度列表，为每次抽卡随机选择对应稀有度的卡牌，并记录每张卡牌抽到的次数
    drawn_cards: Dict[int, UserCardParams] = {}
    
    for rarity in rarity_list:
        available_cards = cards_by_rarity.get(rarity)
        selected_card: Card = random.choice(available_cards)
        if selected_card.id in drawn_cards:
            drawn_cards[selected_card.id].number += 1
        else:
            user_card = UserCardParams(
                card_id=selected_card.id,
                name=selected_card.name,
                image=selected_card.image,
                rarity=selected_card.rarity,
                package=selected_card.package,
                description=selected_card.description,
                number=1
            )
            drawn_cards[selected_card.id] = user_card
    
    # 6.根据本次抽到的卡牌id，查询用户已有的卡牌方便后续更新操作
    existing_user_cards = await UserCard.filter(
        user_id=user_id,
        card_id__in=list(drawn_cards.keys())
    ).select_for_update().select_related('card').all()
    if existing_user_cards:
        existing_card_dict = {uc.card.id: uc for uc in existing_user_cards}
    else:
        existing_card_dict = {}
    
    # 7.区分需要更新和创建的卡牌
    to_update = []
    to_create = []
    for card_id, drawn_card in drawn_cards.items():
        if card_id in existing_card_dict:
            # 如果已存在，则更新数量
            existing_card = existing_card_dict[card_id]
            existing_card.number += drawn_card.number
            to_update.append(existing_card)
        else:
            # 如果不存在，则准备创建新记录
            to_create.append(UserCard(
                user_id=user_id,
                card_id=card_id,
                number=drawn_card.number,
            ))
    
    # 8.执行数据库更新操作
    if to_update:
        await UserCard.bulk_update(to_update, fields=['number'])
    if to_create:
        await UserCard.bulk_create(to_create)

    return list(drawn_cards.values())


@atomic()
async def compose_card_service(
    user_id: int,
    card_to_compose: UserCardParams,
) -> None:
    """
    合成卡牌（修正版）
    """
    user = await User.get(id=user_id)
    # 1.检查目标卡牌是否存在且可合成
    try:
        card = await Card.get(id=card_to_compose.card_id)
    except DoesNotExist:
        raise UnAtomicError(message='card not found')

    if not card.compose_materials:
        raise UnAtomicError(message='not allow compose')
    elif card.unlock_level > user.level:
        raise UnAtomicError(message='level not enough', extra={'unlock_level': card.unlock_level})

    required_materials = {
        int(card_id): num * card_to_compose.number
        for card_id, num in card.compose_materials.items()
    }
    required_card_ids = set(required_materials.keys())

    # 2.加行锁查询用户所有相关材料卡
    user_materials_map = {
        uc.card.id: uc
        for uc in await UserCard.filter(
            user_id=user_id,
            card_id__in=required_card_ids
        ).select_for_update()
    }

    # 3.检查用户材料是否充足
    lack_materials = []
    for card_id, need_num in required_materials.items():
        user_card = user_materials_map.get(card_id)
        if not user_card:
            # 用户完全没有该材料卡
            lack_materials.append(UserCardParams(
                card_id=card_id,
                number=need_num,
                # 可通过Card表补充其他字段
                **await Card.get(id=card_id).values("name", "image", "rarity", "package", "description")
            ))
        elif user_card.number < need_num:
            # 用户有该卡但数量不足
            lack_materials.append(UserCardParams(
                card_id=card_id,
                number=need_num - user_card.number,
                **await Card.get(id=card_id).values("name", "image", "rarity", "package", "description")
            ))

    if lack_materials:
        raise UnAtomicError(message='materials not enough', lack_materials=lack_materials)

    # 4.扣减材料
    for card_id, need_num in required_materials.items():
        user_card = user_materials_map[card_id]
        user_card.number -= need_num
        await user_card.save()

    # 5.添加目标卡牌
    user_compose_card, created = await UserCard.get_or_create(
        user_id=user_id,
        card_id=card_to_compose.card_id,
        defaults={"number": 0}
    )
    user_compose_card.number += card_to_compose.number
    await user_compose_card.save()

    return None


@atomic()
async def decompose_card_service(
    user_id: int,
    card_to_decompose: UserCardParams,
) -> List[UserCardParams]:
    """
    分解卡牌
    
    :param user_id: 发起请求的用户id
    :param card_to_decompose: 目标分解的卡牌

    :return: 分解是否成功，否则message附带失败原因
    """
    # 1.确认玩家持有目标分解的卡牌
    user_card = await UserCard.filter(
        card_id=card_to_decompose.card_id
    ).select_for_update().select_related('card').first()
    if not user_card:
        raise UnAtomicError(message='card not found')
    elif user_card.number < card_to_decompose.number:
        raise UnAtomicError(message='card not found')
    
    # 2.确认目标分解卡牌可分解
    if not user_card.card.decompose_materials:
        raise UnAtomicError(message='not allow decompose')
    
    # 3.扣减指定数量的目标分解卡牌，若扣减后数量为0则删除该条目
    user_card.number -= card_to_decompose.number
    if card_to_decompose.number == 0:
        await user_card.delete()
    else:
        await user_card.save()
        
    # 4.为玩家增加分解后获得的卡牌
    existing_user_cards = await UserCard.filter(
        user_id=user_id,
        card_id__in=list(user_card.card.decompose_materials.keys())
    ).select_for_update().select_related('card').all()
    existing_card_dict = {uc.card.id: uc for uc in existing_user_cards}
    
    to_update = []
    to_create = []
    for card_id, number in user_card.card.decompose_materials.items():
        if card_id in existing_card_dict:
            # 如果已存在，则更新数量
            existing_card = existing_card_dict[card_id]
            existing_card.number += number
            to_update.append(existing_card)
        else:
            # 如果不存在，则准备创建新记录
            to_create.append(UserCard(
                user_id=user_id,
                card_id=card_id,
                number=number,
            ))
    
    if to_update:
        await UserCard.bulk_update(to_update, fields=['number'])
    if to_create:
        await UserCard.bulk_create(to_create)
        
    # 5.返回分解获得的卡牌
    decompose_materials_cards = await Card.filter(
        card_id__in=list(user_card.card.decompose_materials.keys())
    )
    return [
        UserCardParams(
            card_id=card.id,
            name=card.name,
            image=card.image,
            rarity=card.rarity,
            package=card.package,
            description=card.description,
            number=user_card.card.decompose_materials[card.id]
        )
        for card in decompose_materials_cards
    ]
