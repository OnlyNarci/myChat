from typing import List, Dict, TypeAlias
from fastapi import Depends
from app.core.security import get_current_user_id
from app.core.exceptions import ErrorCodes, ServerError
from app.schemas.record_schemas import StoreRecordParams
from app.api.v1.endpoints.store_endpoints import store_router
from app.services.store_services.store_record_services import query_buy_record_service, query_sell_record_service
from log.log_config.service_logger import err_logger

RecordType: TypeAlias = Dict[str, bool | str | Dict[str, List[StoreRecordParams]]]


@store_router.get('/buy_record', response_model=RecordType)
async def query_buy_record_endpoint(
    user_id: int = Depends(get_current_user_id),
) -> RecordType:
    """
    获取玩家自己近一个月所有买入卡牌记录
    """
    try:
        buy_records = await query_buy_record_service(user_id)
    except Exception as e:
        err_logger.error(f'failed to query buy record: {e} | params: user_id={user_id}')
        raise ServerError(error_code=ErrorCodes.InternalServerError, message='服务器维护中，暂时无法查看购买记录。')
    return {
        'success': True,
        'message': 'success in query buy record',
        'data': {'buy_record': buy_records}
    }


@store_router.get('/sell_record', response_model=RecordType)
async def query_sell_record_endpoint(
    user_id: int = Depends(get_current_user_id),
) -> RecordType:
    """
    获取玩家自己近一个月所有出售卡牌记录
    """
    try:
        sell_records = await query_sell_record_service(user_id)
    except Exception as e:
        err_logger.error(f'failed to query buy record: {e} | params: user_id={user_id}')
        raise ServerError(error_code=ErrorCodes.InternalServerError, message='服务器维护中，暂时无法查看出售记录。')
    return {
        'success': True,
        'message': 'success in query sell record',
        'data': {'sell_record': sell_records}
    }
