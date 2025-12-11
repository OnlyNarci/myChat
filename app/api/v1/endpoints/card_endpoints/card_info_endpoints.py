from typing import List, Dict, TypeAlias
from app.core.exceptions import ErrorCodes, ClientError, ServerError
from app.schemas.card_schemas import UserCardParams, CardParams
from app.api.v1.endpoints.card_endpoints import card_router
from app.services.card_services.card_info_services import (
    query_card_info_service,
    query_card_compose_materials_service,
    query_card_decompose_materials_service
)
from log.log_config.service_logger import err_logger


CardType: TypeAlias = Dict[str, bool | str | Dict[str, List[UserCardParams] | UserCardParams | CardParams | str]]


@card_router.get('/info', response_model=CardType)
async def query_card_info_endpoint(card_id: int) -> CardType:
    """
    查看指定卡牌的某些信息（除了合成所需材料）

    :param card_id: 要查看的卡牌id

    :return: 卡牌信息
    """
    try:
        card_info = await query_card_info_service(card_id)
        match card_info:
            case 'card not found':
                raise ClientError(error_code=ErrorCodes.NotFound, message='card not found')
            case _:
                return {
                    'success': True,
                    'message': 'success in query card info',
                    'data': {'card_info': card_info}
                }
        
    except Exception as e:
        err_logger.error(f'failed to query card info: {e} | params: card_id={card_id}')
        raise ServerError(error_code=ErrorCodes.InternalServerError, message='服务器维护中，暂时不能查看卡牌详情。')


@card_router.get('/materials/compose', response_model=CardType)
async def query_card_compose_materials_endpoint(card_id: int) -> CardType:
    """
    查看指定卡牌的合成所需材料
    
    :param card_id:
    
    :return: 合成所需材料
    """
    try:
        compose_materials = await query_card_compose_materials_service(card_id)
        match compose_materials:
            case 'card not found':
                raise ClientError(error_code=ErrorCodes.NotFound, message='card not found')
            case _:
                return {
                    'success': True,
                    'message': 'success in query card compose materials',
                    'data': {'compose_materials': compose_materials}
                }
    except Exception as e:
        err_logger.error(f'failed to query card compose materials: {e} | params: card_id={card_id}')
        raise ServerError(error_code=ErrorCodes.InternalServerError, message='服务器维护中，暂时不能查看卡牌详情。')


@card_router.get('/materials/decompose', response_model=CardType)
async def query_card_decompose_materials_endpoint(card_id: int) -> CardType:
    """
    查看指定卡牌的分解所能获得材料

    :param card_id:

    :return: 合成所需材料
    """
    try:
        decompose_materials = await query_card_decompose_materials_service(card_id)
        match decompose_materials:
            case 'card not found':
                raise ClientError(error_code=ErrorCodes.NotFound, message='card not found')
            case _:
                return {
                    'success': True,
                    'message': 'success in query card decompose materials',
                    'data': {'decompose_materials': decompose_materials}
                }
        
    except Exception as e:
        err_logger.error(f'failed to query card decompose materials: {e} | params: card_id={card_id}')
        raise ServerError(error_code=ErrorCodes.InternalServerError, message='服务器维护中，暂时不能查看卡牌详情。')
