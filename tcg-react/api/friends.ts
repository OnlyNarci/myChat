/**
 * 好友相关API接口
 */

import { apiRequest } from '../utils';
import type { Friend, BaseResponse, PaginatedResponse } from './types';

/**
 * 获取好友列表
 * @param params 查询参数
 * @returns Promise<PaginatedResponse<Friend>>
 */
export const getFriends = (params?: {
  page?: number;
  size?: number;
}): Promise<PaginatedResponse<Friend>> => {
  return apiRequest.get('/friends', { params });
};

/**
 * 搜索用户
 * @param params 搜索参数
 * @returns Promise<PaginatedResponse<Friend>>
 */
export const searchUsers = (params: {
  keyword: string;
  page?: number;
  size?: number;
}): Promise<PaginatedResponse<Friend>> => {
  return apiRequest.get('/friends/search', { params });
};

/**
 * 发送好友请求
 * @param uid 用户ID
 * @returns Promise<BaseResponse<null>>
 */
export const sendFriendRequest = (uid: string): Promise<BaseResponse<null>> => {
  return apiRequest.post(`/friends/request/${uid}`);
};

/**
 * 接受好友请求
 * @param uid 用户ID
 * @returns Promise<BaseResponse<Friend>>
 */
export const acceptFriendRequest = (uid: string): Promise<BaseResponse<Friend>> => {
  return apiRequest.put(`/friends/accept/${uid}`);
};

/**
 * 拒绝好友请求
 * @param uid 用户ID
 * @returns Promise<BaseResponse<null>>
 */
export const rejectFriendRequest = (uid: string): Promise<BaseResponse<null>> => {
  return apiRequest.put(`/friends/reject/${uid}`);
};

/**
 * 删除好友
 * @param uid 用户ID
 * @returns Promise<BaseResponse<null>>
 */
export const deleteFriend = (uid: string): Promise<BaseResponse<null>> => {
  return apiRequest.delete(`/friends/${uid}`);
};

/**
 * 获取好友请求列表
 * @param params 查询参数
 * @returns Promise<PaginatedResponse<Friend>>
 */
export const getFriendRequests = (params?: {
  page?: number;
  size?: number;
  type?: 'sent' | 'received';
}): Promise<PaginatedResponse<Friend>> => {
  return apiRequest.get('/friends/requests', { params });
};