from typing import List, Dict, TypeAlias
from fastapi import Path, Depends
from app.core.security import get_current_user_id
from app.core.exceptions import ErrorCodes, ClientError, UnAtomicError, ServerError
from app.schemas.base_schemas import OrderParams
from app.api.v1.endpoints.user_endpoints import user_router
from app.services.user_services.user_order_services import (
    get_orders_service,
    # generate_order_service,
    complete_order_service,
    delete_order_service,
)
from log.log_config.service_logger import err_logger


OrdersType: TypeAlias = Dict[str, bool | str | Dict[str, List[OrderParams]]]


@user_router.get('/orders/waiting', response_model=OrdersType)
async def get_waiting_orders(
    user_id: int = Depends(get_current_user_id),
) -> OrdersType:
    """
    获取今日未完成的订单
    
    :param user_id: 用户id
    
    :return: 今日未完成的订单
    """
    try:
        orders = await get_orders_service(user_id=user_id)
    except Exception as e:
        err_logger.error(f'failed to get waiting orders: {e} | params: user_id={user_id}')
        raise ServerError(error_code=ErrorCodes.InternalServerError, message='服务器维护中，暂时无法查看订单')
    
    return {
        'success': True,
        'message': 'get waiting orders successfully',
        'data': {'orders': orders}
    }
    

# @user_router.get('/orders/new', response_model=OrdersType)
# async def get_new_orders(
#     user_id: int = Depends(get_current_user_id),
# ) -> OrdersType:
#     """
#     获取今日新订单（发起这个请求时订单才被创建）
#
#     :param user_id: 用户id
#
#     :return: 新的订单
#     """
#     pass


@user_router.post('/orders/{order_id}', response_model=Dict[str, bool | str | Dict[str, int]])
async def complete_order(
    order_id: int = Path(...),
    user_id: int = Depends(get_current_user_id),
) -> Dict[str, bool | str | Dict[str, int]]:
    """
    提交物品并完成指定的订单
    
    :param order_id: 订单 id
    :param user_id: 用户 id
    
    :return: 订单收益
    """
    try:
        result = await complete_order_service(
            user_id=user_id,
            order_id=order_id,
        )

        return {
            'success': True,
            'message': 'complete order successfully',
            'data': {
                'exp': result['exp'],
                'byte': result['byte']
            }
        }
        
    except UnAtomicError as e:
        match e.message:
            case 'order not found':
                raise ClientError(error_code=ErrorCodes.NotFound, message='order not found')
            case 'lack cards':
                raise ClientError(error_code=ErrorCodes.Conflict, message='lack cards, could not confirm order', extra=e.extra)
                # 这里会返回JsonResponse{'success': False, 'message': message, 'data': {'lack_cards': list[UserCardParams]}}
            case _:
                raise ServerError(error_code=ErrorCodes.InternalServerError, message='服务器维护中，暂时无法完成订单')
    except Exception as e:
        err_logger.error(f'failed to complete order: {e} | params: user_id={user_id}; order_id={order_id}')
        raise ServerError(error_code=ErrorCodes.InternalServerError, message='服务器维护中，暂时无法完成订单')


@user_router.delete('/orders/{order_id}', response_model=Dict[str, bool | str])
async def delete_order(
    order_id: int = Path(),
    user_id: int = Depends(get_current_user_id),
) -> Dict[str, bool | str]:
    """
    用户主动删除一个订单
    
    :param order_id: 订单id
    :param user_id: 用户id
    
    :return: 删除结果
    """
    try:
        await delete_order_service(
            user_id=user_id,
            order_id=order_id,
        )
        return {
            'success': True,
            'message': 'delete order successfully',
        }
        
    except UnAtomicError as e:
        match e.message:
            case 'order not found':
                raise ClientError(error_code=ErrorCodes.NotFound, message='order not found')
            case _:
                raise ServerError(error_code=ErrorCodes.InternalServerError, message='服务器维护中，暂时无法删除订单')
    except Exception as e:
        err_logger.error(f'failed to delete order: {e} | params: user_id={user_id}; order_id={order_id}')
        raise ServerError(error_code=ErrorCodes.InternalServerError, message='服务器维护中，暂时无法删除订单')
