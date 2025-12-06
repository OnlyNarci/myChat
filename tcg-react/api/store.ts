/**
 * 商店相关API接口
 */

import { apiRequest } from '../utils';
import type { StoreCard, StoreCardParams, BaseResponse, PaginatedResponse, Order } from './types';

/**
 * 获取商店卡牌列表
 * @param params 查询参数
 * @returns Promise<PaginatedResponse<StoreCard>>
 */
export const getStoreCards = (params?: {
  page?: number;
  size?: number;
  package?: string;
  rarity?: number;
  min_price?: number;
  max_price?: number;
  seller_uid?: string;
}): Promise<PaginatedResponse<StoreCard>> => {
  return apiRequest.get('/store/cards', { params });
};

/**
 * 上架卡牌
 * @param params 上架参数
 * @returns Promise<BaseResponse<StoreCard>>
 */
export const listCard = (params: StoreCardParams): Promise<BaseResponse<StoreCard>> => {
  return apiRequest.post('/store/list', params);
};

/**
 * 下架卡牌
 * @param cardId 卡牌ID
 * @returns Promise<BaseResponse<null>>
 */
export const delistCard = (cardId: number): Promise<BaseResponse<null>> => {
  return apiRequest.delete(`/store/list/${cardId}`);
};

/**
 * 购买卡牌
 * @param params 购买参数
 * @returns Promise<BaseResponse<Order>>
 */
export const buyCard = (params: {
  card_id: number;
  number: number;
  price: number;
  seller_uid: string;
}): Promise<BaseResponse<Order>> => {
  return apiRequest.post('/store/buy', params);
};

/**
 * 获取我的上架卡牌
 * @param params 查询参数
 * @returns Promise<PaginatedResponse<StoreCard>>
 */
export const getMyListedCards = (params?: {
  page?: number;
  size?: number;
}): Promise<PaginatedResponse<StoreCard>> => {
  return apiRequest.get('/store/my/listed', { params });
};

/**
 * 获取订单列表
 * @param params 查询参数
 * @returns Promise<PaginatedResponse<Order>>
 */
export const getOrders = (params?: {
  page?: number;
  size?: number;
  status?: 'pending' | 'completed' | 'cancelled';
  type?: 'buy' | 'sell';
}): Promise<PaginatedResponse<Order>> => {
  return apiRequest.get('/store/orders', { params });
};

/**
 * 确认收货
 * @param orderId 订单ID
 * @returns Promise<BaseResponse<Order>>
 */
export const confirmOrder = (orderId: string): Promise<BaseResponse<Order>> => {
  return apiRequest.put(`/store/orders/${orderId}/confirm`);
};

/**
 * 取消订单
 * @param orderId 订单ID
 * @returns Promise<BaseResponse<Order>>
 */
export const cancelOrder = (orderId: string): Promise<BaseResponse<Order>> => {
  return apiRequest.put(`/store/orders/${orderId}/cancel`);
};