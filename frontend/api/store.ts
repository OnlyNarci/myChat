/**
 * 商店相关API接口
 */

import { apiRequest } from '../utils';
import type { StoreCard, StoreCardParams, BaseResponse, PaginatedResponse, Order, StoreRecord, StoreCardsResponse, BuyCardResponse, DelistCardResponse } from './types';

/**
 * 获取商店卡牌列表
 * @param params 查询参数
 * @returns Promise<BaseResponse<StoreCardsResponse>>
 */
export const getStoreCards = (params?: {
  package?: string;
  name_in?: string;
  price_le?: number;
  price_ge?: number;
}): Promise<BaseResponse<StoreCardsResponse>> => {
  return apiRequest.get('/store/cards', { params });
};

/**
 * 获取好友商店卡牌列表
 * @param storeUserUid 好友用户ID
 * @returns Promise<BaseResponse<StoreCardsResponse>>
 */
export const getFriendStoreCards = (storeUserUid: string): Promise<BaseResponse<StoreCardsResponse>> => {
  return apiRequest.get(`/store/${storeUserUid}/cards`);
};

/**
 * 上架卡牌
 * @param params 上架参数
 * @returns Promise<SimpleResponse>
 */
export const listCard = (params: StoreCardParams): Promise<SimpleResponse> => {
  return apiRequest.post('/store/cards', params);
};

/**
 * 下架卡牌
 * @param params 下架参数
 * @returns Promise<BaseResponse<DelistCardResponse>>
 */
export const delistCard = (params: StoreCardParams): Promise<BaseResponse<DelistCardResponse>> => {
  return apiRequest.delete('/store/cards', { data: params });
};

/**
 * 购买公开卡牌
 * @param params 购买参数
 * @param exceptSlippage 可接受的滑点
 * @returns Promise<BaseResponse<BuyCardResponse>>
 */
export const buyCard = (params: StoreCardParams, exceptSlippage?: number): Promise<BaseResponse<BuyCardResponse>> => {
  return apiRequest.put('/store/cards', params, { 
    params: exceptSlippage ? { except_slippage: exceptSlippage } : undefined 
  });
};

/**
 * 购买好友卡牌
 * @param storeUserUid 好友用户ID
 * @param params 购买参数
 * @returns Promise<BaseResponse<BuyCardResponse>>
 */
export const buyFriendCard = (storeUserUid: string, params: StoreCardParams): Promise<BaseResponse<BuyCardResponse>> => {
  return apiRequest.put(`/store/${storeUserUid}/cards`, params);
};

// 订单相关API
import type { OrdersResponse } from './types';

/**
 * 获取未完成订单
 * @returns Promise<BaseResponse<OrdersResponse>>
 */
export const getWaitingOrders = (): Promise<BaseResponse<OrdersResponse>> => {
  return apiRequest.get('/player/orders/waiting');
};

/**
 * 完成订单
 * @param orderId 订单ID
 * @returns Promise<BaseResponse<{ exp: number; byte: number }>>
 */
export const completeOrder = (orderId: number): Promise<BaseResponse<{ exp: number; byte: number }>> => {
  return apiRequest.post(`/player/orders/${orderId}`);
};

/**
 * 删除订单
 * @param orderId 订单ID
 * @returns Promise<SimpleResponse>
 */
export const deleteOrder = (orderId: number): Promise<SimpleResponse> => {
  return apiRequest.delete(`/player/orders/${orderId}`);
};

/**
 * 获取购买记录
 * @returns Promise<BaseResponse<{ buy_record: StoreRecord[] }>>
 */
export const getBuyRecords = (): Promise<BaseResponse<{ buy_record: StoreRecord[] }>> => {
  return apiRequest.get('/store/buy_record');
};

/**
 * 获取出售记录
 * @returns Promise<BaseResponse<{ sell_record: StoreRecord[] }>>
 */
export const getSellRecords = (): Promise<BaseResponse<{ sell_record: StoreRecord[] }>> => {
  return apiRequest.get('/store/sell_record');
};