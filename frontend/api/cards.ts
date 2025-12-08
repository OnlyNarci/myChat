/**
 * 卡牌相关API接口
 */

import { apiRequest } from '../utils';
import type { Card, UserCard, UserCardParams, BaseResponse, PaginatedResponse } from './types';

/**
 * 获取卡牌信息
 * @param cardId 卡牌ID
 * @returns Promise<Card>
 */
export const getCardInfo = (cardId: number): Promise<BaseResponse<Card>> => {
  return apiRequest.get(`/card/info`, { params: { card_id: cardId } });
};

/**
 * 获取用户卡牌列表
 * @param params 查询参数
 * @returns Promise<PaginatedResponse<UserCard>>
 */
export const getUserCards = (params?: {
  page?: number;
  size?: number;
  package?: string;
  rarity?: number;
}): Promise<PaginatedResponse<UserCard>> => {
  return apiRequest.get('/player/cards', { params });
};

/**
 * 合成卡牌
 * @param params 合成参数
 * @returns Promise<BaseResponse<UserCard>>
 */
export const craftCard = (params: {
  target_card_id: number;
  materials: { card_id: number; number: number }[];
}): Promise<BaseResponse<UserCard>> => {
  return apiRequest.post('/player/cards', params);
};

/**
 * 分解卡牌
 * @param params 分解参数
 * @returns Promise<BaseResponse<UserCard>>
 */
export const decomposeCard = (params: {
  card_id: number;
  number: number;
}): Promise<BaseResponse<UserCard>> => {
  return apiRequest.delete('/player/cards', { params });
};

/**
 * 获取合成材料列表
 * @param cardId 目标卡牌ID
 * @returns Promise<BaseResponse<UserCard[]>>
 */
export const getCraftMaterials = (cardId: number): Promise<BaseResponse<UserCard[]>> => {
  return apiRequest.get('/card/materials/compose', { params: { card_id: cardId } });
};

/**
 * 获取分解材料列表
 * @param cardId 目标卡牌ID
 * @returns Promise<BaseResponse<UserCard[]>>
 */
export const getDecomposeMaterials = (cardId: number): Promise<BaseResponse<UserCard[]>> => {
  return apiRequest.get('/card/materials/decompose', { params: { card_id: cardId } });
};

/**
 * 抽卡
 * @param params 抽卡参数
 * @returns Promise<BaseResponse<{ cards: UserCard[]; cost: number }>>
 */
export const drawCards = (params: {
  count: number;
  package?: string;
}): Promise<BaseResponse<{ cards: UserCard[]; cost: number }>> => {
  return apiRequest.post('/player/cards', params);
};