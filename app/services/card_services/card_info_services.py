from typing import List
from tortoise.exceptions import DoesNotExist
from app.schemas.card_schemas import UserCardParams, CardParams
from app.db.models import Card


async def query_card_info_service(card_id: int) -> CardParams | str:
    """
    查看指定卡牌的信息（除了合成所需材料）
    
    :param card_id: 卡牌id
    
    :return:卡牌信息模型
    """
    try:
        card = await Card.get(id=card_id)
    except DoesNotExist:
        return 'card not found'
    
    return CardParams(
        card_id=card.id,
        name=card.name,
        image=card.image,
        rarity=card.rarity,
        package=card.package,
        unlock_level=card.unlock_level,
        description=card.description,
    )
    
    
async def query_card_compose_materials_service(card_id: int) -> List[UserCardParams] | str:
    """
    查看合成一张指定卡牌所需的材料

    :param card_id: 卡牌id

    :return: 合成所需材料
    """
    # 1.确认卡牌存在
    try:
        card = await Card.get(id=card_id)
    except DoesNotExist:
        return 'card not found'
    
    # 2.查询合成所需材料
    materials = await Card.filter(id__in=list(card.compose_materials.keys())).all()
    
    # 3.组织为UserCardParams返回
    compose_materials = []
    for material in materials:
        compose_materials.append(
            UserCardParams(
                card_id=material.id,
                name=material.name,
                image=material.image,
                rarity=material.rarity,
                package=material.package,
                unlock_level=material.unlock_level,
                description=material.description,
                number=card.compose_materials[material.id],
            )
        )
    return compose_materials
    

async def query_card_decompose_materials_service(card_id: int) -> List[UserCardParams] | str:
    """
    查看一张指定卡牌分解产物
    
    :param card_id: 卡牌id
    
    :return: 分解产物
    """
    try:
        card = await Card.get(id=card_id)
    except DoesNotExist:
        return 'card not found'
        
    # 2.查询分解获得材料
    products = await Card.filter(id__in=list(card.decompose_materials.keys())).all()
    
    # 3.组织为UserCardParams返回
    decompose_materials = []
    for product in products:
        decompose_materials.append(
            UserCardParams(
                card_id=product.id,
                name=product.name,
                image=product.image,
                rarity=product.rarity,
                package=product.package,
                unlock_level=product.unlock_level,
                description=product.description,
                number=card.compose_materials[product.id],
            )
        )
    return decompose_materials
