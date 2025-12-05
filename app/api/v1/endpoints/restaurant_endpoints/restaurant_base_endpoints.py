from fastapi import Depends
from app.core.security import get_current_user_id
from app.schemas.base_schemas import RestaurantParams, RestaurantSelfParams
from app.api.v1.endpoints.restaurant_endpoints import restaurant_router


@restaurant_router.get('/{user_uid}', response_model=RestaurantParams | RestaurantSelfParams)
async def query_restaurant(
    user_uid: str,
    user_id: int = Depends(get_current_user_id)
) -> RestaurantParams | RestaurantSelfParams:
    """
    查看餐馆基本信息，如果是餐馆主人自己查看能获取更多信息
    
    :param user_uid: 目标查看餐馆的主人uid
    :param user_id: 当前用户id
    
    :return: 餐馆基本信息
    """
    pass


@restaurant_router.post('/{user_uid}')
async def create_restaurant(
    restaurant_params: RestaurantSelfParams,
    user_id: int = Depends(get_current_user_id)
):
    """
    创建餐馆并选择经营业务
    
    :param restaurant_params:
    :param user_id:
    
    :return:
    """
    pass


@restaurant_router.put('/{user_uid}')
async def update_restaurant(
    restaurant_params: RestaurantSelfParams,
    user_id: int = Depends(get_current_user_id)
):
    """
    修改餐馆信息
    
    :param restaurant_params:
    :param user_id:
    
    :return:
    """
    pass
