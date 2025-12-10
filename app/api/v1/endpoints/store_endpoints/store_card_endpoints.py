"""
商店卡牌资源 api
"""
from typing import Optional, Dict, List, TypeAlias
from fastapi import Query, Path, Depends
from app.core.exceptions import ClientError, ServerError, UnAtomicError, ErrorCodes
from app.core.security import get_current_user_id
from app.core.extra_params import extra_params
from app.schemas.card_schemas import StoreCardParams
from app.api.v1.endpoints.store_endpoints import store_router
from app.services.store_services.store_card_services import (
    query_store_service,
    query_friend_store_service,
    list_card_service,
    delist_card_service,
    buy_card_service
)
from app.services.user_services.user_user_services import confirm_friendship_service
from log.log_config.service_logger import err_logger


CardsType: TypeAlias = Dict[str, bool | str | Dict[str, List[StoreCardParams]]]


@store_router.get("/cards", response_model=CardsType)
async def query_card_endpoint(
    user_id: int = Depends(get_current_user_id),
    package: Optional[str] = Query(None, max_length=16),
    name_in: Optional[str] = Query(None, max_length=16),
    price_le: Optional[int] = Query(None, ge=0),
    price_ge: Optional[int] = Query(None, ge=0),
) -> CardsType:
    """
    查看在售卡牌，包名即商店分区，可选名称或价格作为查询参数。
    
    :param user_id: 用户id
    :param package: 卡牌所属扩招包名称
    :param name_in: 卡牌名称中包含的字符串（模糊查询）
    :param price_le: 价格小于等于此值
    :param price_ge: 价格大于等于此值
    
    :return: 符合条件的在售卡牌
    """
    try:
        cards = await query_store_service(
            user_id=user_id,
            package=package,
            name_in=name_in,
            price_le=price_le,
            price_ge=price_ge,
        )
        return {
            'success': True,
            'message': 'query card success',
            'data': {'cards': cards}
        }
    except Exception as e:
        err_logger.error(f'failed to query card from store: {e} | params: package={package}; name_in={name_in}; price={price_le}; price={price_ge}')
        raise ServerError(error_code=ErrorCodes.InternalServerError, message='服务器维护中，暂时无法查看商店。')


@store_router.get("/{store_user_uid}/cards", response_model=CardsType)
async def query_friends_card_endpoint(
    store_user_uid: str = Path(max_length=6),
    user_id: int = Depends(get_current_user_id),
) -> CardsType:
    """
    查看指定uid的玩家商店中在售卡牌，目标玩家和当前用户必须是好友
    
    :param store_user_uid: 目标商店玩家uid
    :param user_id: 当前用户id
    
    :return:
    """
    # 1.确认两名玩家好友关系
    try:
        friendship = await confirm_friendship_service(
            user_request_id=user_id,
            user_accept_uid=store_user_uid
        )
        if not friendship:
            raise ClientError(error_code=ErrorCodes.Forbidden, message="can't view others store without friendship")

    except Exception as e:
        err_logger.error(f'failed to buy card from store: {e} | params: user_id={user_id}; store_user_uid={store_user_uid}')
        raise ServerError(error_code=ErrorCodes.InternalServerError, message='服务器维护中，暂时不能查看好友商店。')
    
    # 2.发起允许查询不公开卡牌的请求
    try:
        friend_cards = await query_friend_store_service(
            store_user_uid=store_user_uid,
        )
    except Exception as e:
        err_logger.error(f'failed to query card from friend store: {e} | params: user_id={user_id}; store_user_uid={store_user_uid}')
        raise ServerError(error_code=ErrorCodes.InternalServerError, message='服务器维护中，暂时无法查看好友商店')
    
    return {
        'success': True,
        'message': 'query friend card success',
        'data': {'cards': friend_cards}
    }
    

@store_router.post('/cards', response_model=Dict[str, str | bool])
async def list_card_endpoint(
    card_to_list: StoreCardParams,
    user_id: int = Depends(get_current_user_id),
) -> Dict[str, str | bool]:
    """
    在商店中上架卡牌
    
    :param card_to_list: 待购买的卡牌对象
    :param user_id: 卖家id，通过依赖获取
    """
    try:
        await list_card_service(
            user_id=user_id,
            card_to_list=card_to_list,
        )
        return {
            'success': True,
            'message': 'success in listing card',
        }
    
    except UnAtomicError as e:
        match e.message:
            case 'card not found':
                raise ClientError(error_code=ErrorCodes.InvalidParams, message='card not found')
            case 'card not enough':
                raise ClientError(error_code=ErrorCodes.Conflict, message='card not enough for listing')
        
    except Exception as e:
        err_logger.error(f'failed to list card to store: {e} | params: user_id={user_id}; card_to_list={card_to_list}')
        raise ServerError(error_code=ErrorCodes.InternalServerError, message='服务器维护中，暂时不能上架卡牌。')


@store_router.put('/cards', response_model=Dict[str, str | bool | int])
async def buy_card(
    card_to_buy: StoreCardParams,
    user_id: int = Depends(get_current_user_id),
    except_slippage: Optional[int] = None,
) -> Dict[str, str | bool | int]:
    """
    购买商店中的卡牌

    :param card_to_buy: 待购买的卡牌对象
    :param user_id: 买家id，通过依赖获取
    :param except_slippage: 用户可接受的滑点
    
    :return: 购买成功返回花费的比特
    """
    try:
        cost_byte = await buy_card_service(
            user_id=user_id,
            card_to_buy=card_to_buy,
            except_slippage=except_slippage,
            is_publish=True
        )
        return {
            'success': True,
            'message': f'success to buy card, cost byte: {cost_byte}',
            'data': {'cost_byte': cost_byte}
        }
    
    except UnAtomicError as e:
        match e.message:
            case 'card not found':
                raise ClientError(error_code=ErrorCodes.NotFound, message='the card you are trying to buy does not exist, please refresh the store and try again')
            case 'card not found with except_slippage':
                raise ClientError(error_code=ErrorCodes.NotFound, message='the card you are trying to buy does not exist, please refresh the store and try again')
            case 'can not buy self card':
                raise ClientError(error_code=ErrorCodes.Forbidden, message='can not buy self card')
            case 'trade today too march':
                raise ClientError(error_code=ErrorCodes.Forbidden, message=f'trading too frequently, you can only trade {extra_params.MAX_TRADE_DAY} times in 24 hour')
            case 'user byte not enough':
                raise ClientError(error_code=ErrorCodes.Conflict, message=f'byte not enough, need {e.extra["need_byte"]} byte at least。', need_byte=e.extra['need_byte'])
            case 'user level not enough':
                raise ClientError(error_code=ErrorCodes.Conflict, message=f'level not enough, this card will unlock at {e.extra["unlock_level"]} level', unlock_level=e.extra['unlock_level'])
                
    except Exception as e:
        err_logger.error(f'failed to buy card from store: {e} | params: user_id={user_id}; card_to_buy={card_to_buy}')
        raise ServerError(error_code=ErrorCodes.InternalServerError, message='服务器维护中，暂时不能购买卡牌。')


@store_router.put('/{store_user_id}/cards', response_model=Dict[str, str | bool | int])
async def buy_friends_card(
    card_to_buy: StoreCardParams,
    store_user_uid: str = Path(max_length=6),
    user_id: int = Depends(get_current_user_id),
) -> Dict[str, str | bool | int]:
    """
    购买指定uid的玩家商店中指定在售卡牌，目标玩家和当前用户必须是好友

    :param store_user_uid: 目标商店玩家uid
    :param card_to_buy: 目标购买的卡牌
    :param user_id: 当前用户id

    :return: 购买成功返回花费的比特
    """
    # 1.确认两名玩家好友关系
    try:
        friendship = await confirm_friendship_service(
            user_request_id=user_id,
            user_accept_uid=store_user_uid
        )
        if not friendship:
            raise ClientError(error_code=ErrorCodes.Forbidden, message='对方还不是你的好友，无法购买对方未公开出售的卡牌。')
        
    except ValueError:
        raise ClientError(error_code=ErrorCodes.NotFound, message='未查找到你要购买卡牌的持有玩家。')
    except Exception as e:
        err_logger.error(f'failed to buy card from store: {e} | params: user_id={user_id}; card_to_buy={card_to_buy}')
        raise ServerError(error_code=ErrorCodes.InternalServerError, message='服务器维护中，暂时不能购买卡牌。')
    
    # 2.发起购买指定卡牌的请求
    try:
        cost_byte = await buy_card_service(
            user_id=user_id,
            card_to_buy=card_to_buy,
            is_publish=False
        )
        return {
            'success': True,
            'message': f'success to buy card, cost byte: {cost_byte}。',
            'data': {'cost_byte': cost_byte}
        }
    
    except UnAtomicError as e:
        match e.message:
            case 'card not found':
                raise ClientError(error_code=ErrorCodes.NotFound,
                                  message='the card you are trying to buy does not exist, please refresh the store and try again')
            case 'card not found with except_slippage':
                raise ClientError(error_code=ErrorCodes.NotFound,
                                  message='the card you are trying to buy does not exist, please refresh the store and try again')
            case 'can not buy self card':
                raise ClientError(error_code=ErrorCodes.Forbidden, message='can not buy self card')
            case 'trade today too march':
                raise ClientError(error_code=ErrorCodes.Forbidden,
                                  message=f'trading too frequently, you can only trade {extra_params.MAX_TRADE_DAY} times in 24 hour')
            case 'user byte not enough':
                raise ClientError(error_code=ErrorCodes.Conflict,
                                  message=f'byte not enough, need {e.extra["need_byte"]} byte at least。',
                                  need_byte=e.extra['need_byte'])
            case 'user level not enough':
                raise ClientError(error_code=ErrorCodes.Conflict,
                                  message=f'level not enough, this card will unlock at {e.extra["unlock_level"]} level',
                                  unlock_level=e.extra['unlock_level'])
    
    except Exception as e:
        err_logger.error(f'failed to buy card from store: {e} | params: user_id={user_id}; card_to_buy={card_to_buy}')
        raise ServerError(error_code=ErrorCodes.InternalServerError, message='服务器维护中，暂时不能购买卡牌。')


@store_router.delete('/cards', response_model=Dict[str, str | bool | int])
async def delist_card(
    card_to_delist: StoreCardParams,
    user_id: int = Depends(get_current_user_id),
) -> Dict[str, str | bool | int]:
    """
    下架商店中的卡牌

    :param card_to_delist: 待下架的卡牌对象
    :param user_id: 用户id，通过依赖获取
    
    :return: 成功下架的卡牌数量；下架请求处理过程中已经被他人购买的卡牌数量
    """
    try:
        require_num = await delist_card_service(
            user_id=user_id,
            card_to_delist=card_to_delist,
        )
        success_delist = card_to_delist.number - require_num
        return {
            'success': True,
            'message': f'success to delist {success_delist} cards{f', but {require_num} cards has been bought' if require_num != 0 else ''}。',
            'data': {
                'card_to_delist': success_delist,
                'require_num': require_num
            }
        }
    
    except UnAtomicError as e:
        match e.message:
            case 'card not found':
                raise ClientError(error_code=ErrorCodes.Conflict, message="您上架的卡牌已被购买。")
    except Exception as e:
        err_logger.error(f'failed to delist card from store: {e} | params: user_id={user_id}; card_to_delist={card_to_delist}')
        raise ServerError(error_code=ErrorCodes.InternalServerError, message='服务器维护中，暂时不能下架卡牌。')
            