/**
 * 卡牌相关API接口
 */

import { apiRequest } from '../utils';
import type { Card, UserCard, UserCardParams, BaseResponse, PaginatedResponse, CardsResponse, CardInfoResponse, ComposeMaterialsResponse, DecomposeMaterialsResponse } from './types';

/**
 * 获取卡牌信息
 * @param cardId 卡牌ID
 * @returns Promise<BaseResponse<CardInfoResponse>>
 */
export const getCardInfo = (cardId: number): Promise<BaseResponse<CardInfoResponse>> => {
  return apiRequest.get(`/card/info`, { params: { card_id: cardId } });
};

/**
 * 获取用户卡牌列表
 * @param params 查询参数
 * @returns Promise<BaseResponse<CardsResponse>>
 */
export const getUserCards = (params?: {
  name_in?: string;
  rarity?: number;
  package?: string;
}): Promise<BaseResponse<CardsResponse>> => {
  return apiRequest.get('/player/cards', { params });
};

/**
 * 合成卡牌
 * @param params 合成参数
 * @returns Promise<SimpleResponse>
 */
export const composeCard = (params: UserCardParams): Promise<SimpleResponse> => {
  return apiRequest.put('/player/cards', params);
};

/**
 * 分解卡牌
 * @param params 分解参数
 * @returns Promise<BaseResponse<CardsResponse>>
 */
export const decomposeCard = (params: UserCardParams): Promise<BaseResponse<CardsResponse>> => {
  return apiRequest.delete('/player/cards', { data: params });
};

/**
 * 获取合成材料列表
 * @param cardId 目标卡牌ID
 * @returns Promise<BaseResponse<ComposeMaterialsResponse>>
 */
export const getCraftMaterials = (cardId: number): Promise<BaseResponse<ComposeMaterialsResponse>> => {
  return apiRequest.get('/card/materials/compose', { params: { card_id: cardId } });
};

/**
 * 获取分解材料列表
 * @param cardId 目标卡牌ID
 * @returns Promise<BaseResponse<DecomposeMaterialsResponse>>
 */
export const getDecomposeMaterials = (cardId: number): Promise<BaseResponse<DecomposeMaterialsResponse>> => {
  return apiRequest.get('/card/materials/decompose', { params: { card_id: cardId } });
};

/**
 * 抽卡
 * @param params 抽卡参数
 * @returns Promise<BaseResponse<CardsResponse>>
 */
export const pullCards = (params: {
  package: string;
  times: number;
}): Promise<BaseResponse<CardsResponse>> => {
  return apiRequest.post('/player/cards', params);
};