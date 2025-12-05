"""
玩家卡牌资源aoi
"""
from typing import List, Dict, Optional, TypeAlias
from fastapi import Depends, Query

from app.core.exceptions import ErrorCodes, ServerError, ClientError, UnAtomicError
from app.core.security import get_current_user_id
from app.schemas.card_schemas import UserCardParams, PullCardParams
from app.api.v1.endpoints.user_endpoints import user_router
from app.services.user_services.user_card_services import (
    get_box_service,
    pull_card_service,
    compose_card_service,
    decompose_card_service
)
from log.log_config.service_logger import info_logger, err_logger


CardsType: TypeAlias = Dict[str, bool | str | List[UserCardParams]]


@user_router.get('/cards', response_model=CardsType)
async def query_box(
    name_in: Optional[str] = Query(None, min_length=1, max_length=16),
    rarity: Optional[int] = Query(None, ge=1, le=4),
    package: Optional[str] = Query(None, min_length=1, max_length=16),
    user_id: int = Depends(get_current_user_id),
) -> CardsType:
    """
    查看自己拥有的卡牌
    
    :param name_in: 卡牌名称（模糊查询）
    :param rarity: 卡牌稀有度
    :param package: 卡牌包
    :param user_id: 用户id
    
    :return: 查询到的持有卡牌
    """
    try:
        cards = await get_box_service(
            user_id=user_id,
            name_in=name_in,
            rarity=rarity,
            package=package
        )
        return {
            'success': True,
            'message': 'get box success',
            'cards': cards
        }
    except Exception as e:
        err_logger.error(f'failed to query card for user: {e} | params: user_id={user_id}; name_in={name_in}; rarity={rarity}; package={package}')
        raise ServerError(error_code=ErrorCodes.InternalServerError, message='服务器维护中，暂时无法查看卡牌收藏')


@user_router.post('/cards', response_model=CardsType)
async def pull_card(
    card_to_pull: PullCardParams,
    user_id: int = Depends(get_current_user_id),
) -> CardsType:
    """
    抽卡请求接口
    
    :param card_to_pull: 玩家抽卡参数
    :param user_id: 用户id
    
    :return: 抽到的卡牌
    """
    try:
        cards = await pull_card_service(
            user_id=user_id,
            card_to_pull=card_to_pull
        )
        return {
            'success': True,
            'message': 'pull card success',
            'cards': cards
        }
    except UnAtomicError as e:
        match e.message:
            case 'package not found':
                raise ClientError(error_code=ErrorCodes.InvalidParams, message=f'未知的扩展包: {card_to_pull.package}')
            case 'byte not enough':
                raise ClientError(error_code=ErrorCodes.Conflict, message=f'比特不足，至少需要: {card_to_pull.times * 10} 比特')
    except Exception as e:
        err_logger.error(f'fail to pull card for user: {e} | params: user_id={user_id}; package={card_to_pull.package}; times={card_to_pull.times}')
        raise ServerError(error_code=ErrorCodes.InternalServerError, message="服务器维护中，暂时不能抽卡")


@user_router.put('/cards', response_model=Dict[str, str | bool])
async def compose_card(
    card_to_compose: UserCardParams,
    user_id: int = Depends(get_current_user_id),
) -> Dict[str, str | bool]:
    """
    合卡请求接口
    
    :param card_to_compose: 目标合成的卡牌
    :param user_id: 玩家id
    
    :return: 合成结果
    """
    try:
        await compose_card_service(
            user_id=user_id,
            card_to_compose=card_to_compose
        )
        return {
            'success': True,
            'message': 'compose card success'
        }
    except UnAtomicError as e:
        match e.message:
            case 'card not found':
                raise ClientError(error_code=ErrorCodes.InvalidParams, message=f'未知的卡牌: {card_to_compose.name}。')
            case 'not allow compose':
                raise ClientError(error_code=ErrorCodes.Forbidden, message='该卡牌无法合成。')
            case 'level not enough':
                raise ClientError(error_code=ErrorCodes.Forbidden, message=f'等级不足，该卡牌将于{e.extra['unlock_level']}解锁。', unlock_level=e.extra['unlock_level'])
            case 'materials not enough':
                raise ClientError(error_code=ErrorCodes.Conflict, message='缺少合成所需的卡牌。', lack_materials=e.extra['lack_materials'])
    except Exception as e:
        err_logger.error(
            f'fail to compose card for user: {e} | params: user_id={user_id}; card_to_compose={card_to_compose}')
        raise ServerError(error_code=ErrorCodes.InternalServerError, message="服务器维护中，暂时不能合卡")


@user_router.delete('/cards', response_model=CardsType)
async def decompose_card(
    card_to_decompose: UserCardParams,
    user_id: int = Depends(get_current_user_id),
) -> CardsType:
    """
    分卡请求接口
    
    :param card_to_decompose: 目标分解的卡牌
    :param user_id: 玩家id
    
    :return: 分解结果
    """
    try:
        decompose_materials_cards = await decompose_card_service(
            user_id=user_id,
            card_to_decompose=card_to_decompose
        )
        return {
            'success': True,
            'message': 'decompose card success',
            'cards': decompose_materials_cards
        }
    
    except UnAtomicError as e:
        match e.message:
            case 'card not found':
                raise ClientError(error_code=ErrorCodes.Conflict, message='卡牌数量不足')
            case 'not allow decompose':
                raise ClientError(error_code=ErrorCodes.Forbidden, message='该卡牌无法分解')
    except Exception as e:
        err_logger.error(f'fail to decompose card for user: {e} | params: user_id={user_id}; card_to_decompose={card_to_decompose}')
        raise ServerError(error_code=ErrorCodes.InternalServerError, message='服务器维护中，暂时无法分解卡牌')
