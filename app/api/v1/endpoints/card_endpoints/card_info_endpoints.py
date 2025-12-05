from typing import List, Dict, TypeAlias
from app.schemas.card_schemas import UserCardParams
from app.api.v1.endpoints.card_endpoints import card_router


CardType: TypeAlias = Dict[str, bool | str | List[UserCardParams] | UserCardParams]


@card_router.get('/info', response_model=CardType)
async def query_card_info_endpoint(card_id: int) -> CardType:
    """
    查看指定卡牌的某些信息（除了合成所需材料）

    :param card_id: 要查看的卡牌id

    :return: 卡牌信息
    """
    pass


@card_router.get('/materials/compose', response_model=CardType)
async def query_card_compose_materials_endpoint(card_id: int) -> CardType:
    """
    查看指定卡牌的合成所需材料
    
    :param card_id:
    
    :return: 合成所需材料
    """
    pass


@card_router.get('/materials/decompose', response_model=CardType)
async def query_card_decompose_materials_endpoint(card_id: int) -> CardType:
    """
    查看指定卡牌的分解所能获得材料

    :param card_id:

    :return: 合成所需材料
    """
    pass
