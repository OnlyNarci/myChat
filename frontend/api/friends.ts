/**
 * 好友相关API接口
 */

import { apiRequest } from '../utils';
import type { Friend, BaseResponse, SimpleResponse, PaginatedResponse, FriendRequestResponse } from './types';

/**
 * 获取待处理好友请求
 * @returns Promise<BaseResponse<FriendRequestResponse>>
 */
export const getFriendRequests = (): Promise<BaseResponse<FriendRequestResponse>> => {
  return apiRequest.get('/player/friendship/under_review');
};


/**
 * 处理好友请求
 * @param uid 请求者用户ID
 * @param isAccepted 是否接受
 * @returns Promise<SimpleResponse>
 */
export const handleFriendRequest = (uid: string, isAccepted: boolean): Promise<SimpleResponse> => {
  return apiRequest.put(`/player/friendship/${uid}`, null, {
    params: { is_accepted: isAccepted }
  });
};


/**
 * 获取指定用户公开信息
 * @param uid 用户ID
 * @returns Promise<BaseResponse<{ user_info: Friend }>>
 */
export const getUserInfo = (uid: string): Promise<BaseResponse<{ user_info: Friend }>> => {
  return apiRequest.get(`/player/info/${uid}`);
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
