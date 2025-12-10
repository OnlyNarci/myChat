/**
 * 好友服务 - 连接API请求与状态管理
 */

import { 
  getFriendRequests, 
  sendFriendRequest, 
  handleFriendRequest, 
  deleteFriend,
  getUserInfo
} from '../api';
import { useFriendsStore } from '../stores';
import { LoadingState } from '../stores/types';

/**
 * 获取好友请求列表服务
 * @returns Promise<boolean> 获取是否成功
 */
export const getFriendRequestsService = async (): Promise<boolean> => {
  const { 
    setFriendsLoading, 
    setFriendsError, 
    setFriendRequests,
    clearFriendRequests
  } = useFriendsStore.getState();
  
  try {
    setFriendsLoading(LoadingState.LOADING);
    clearFriendRequests();
    
    const response = await getFriendRequests();
    
    if (response.success) {
      const { waiting_accept } = response.data;
      setFriendRequests(waiting_accept.sent, waiting_accept.received);
      return true;
    } else {
      setFriendsError(response.message || '获取好友请求失败');
      return false;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '获取好友列表失败';
    setFriendsError(errorMessage);
    return false;
  }
};

/**
 * 搜索用户服务
 * @param keyword 搜索关键词
 * @returns Promise<boolean> 搜索是否成功
 */
export const searchUsersService = async (keyword: string): Promise<boolean> => {
  const { 
    setSearchResultsLoading, 
    setSearchResultsError, 
    setSearchResultsData 
  } = useFriendsStore.getState();
  
  try {
    setSearchResultsLoading(LoadingState.LOADING);
    
    const response = await searchUsers(keyword);
    
    if (response.code === 200 && response.data) {
      setSearchResultsData(response.data);
      return true;
    } else {
      setSearchResultsError(response.message || '搜索用户失败');
      return false;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '搜索用户失败';
    setSearchResultsError(errorMessage);
    return false;
  }
};



/**
 * 发送好友请求服务
 * @param userId 目标用户ID
 * @param message 请求消息
 * @returns Promise<boolean> 发送是否成功
 */
export const sendFriendRequestService = async (userId: string, message: string): Promise<boolean> => {
  const { setLoading, setError } = useFriendsStore.getState();
  
  try {
    setLoading(LoadingState.LOADING);
    
    const response = await sendFriendRequest(userId, message);
    
    if (response.code === 200) {
      setLoading(LoadingState.SUCCESS);
      // 发送成功后清空搜索结果
      useFriendsStore.getState().setSearchResultsData([]);
      return true;
    } else {
      setError(response.message || '发送好友请求失败');
      setLoading(LoadingState.ERROR);
      return false;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '发送好友请求失败';
    setError(errorMessage);
    setLoading(LoadingState.ERROR);
    return false;
  }
};

/**
 * 处理好友请求服务
 * @param userId 请求者用户ID
 * @param isAccepted 是否接受
 * @returns Promise<boolean> 处理是否成功
 */
export const handleFriendRequestService = async (userId: string, isAccepted: boolean): Promise<boolean> => {
  const { setLoading, setError } = useFriendsStore.getState();
  
  try {
    setLoading(LoadingState.LOADING);
    
    const response = await handleFriendRequest(userId, isAccepted);
    
    if (response.success) {
      setLoading(LoadingState.SUCCESS);
      // 处理成功后刷新好友请求列表
      await getFriendRequestsService();
      return true;
    } else {
      setError(response.message || '处理好友请求失败');
      setLoading(LoadingState.ERROR);
      return false;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '处理好友请求失败';
    setError(errorMessage);
    setLoading(LoadingState.ERROR);
    return false;
  }
};

/**
 * 删除好友服务
 * @param userId 好友用户ID
 * @returns Promise<boolean> 删除是否成功
 */
export const deleteFriendService = async (userId: string): Promise<boolean> => {
  const { setLoading, setError } = useFriendsStore.getState();
  
  try {
    setLoading(LoadingState.LOADING);
    
    const response = await deleteFriend(userId);
    
    if (response.success) {
      setLoading(LoadingState.SUCCESS);
      // 删除成功后刷新好友请求列表
      await getFriendRequestsService();
      return true;
    } else {
      setError(response.message || '删除好友失败');
      setLoading(LoadingState.ERROR);
      return false;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '删除好友失败';
    setError(errorMessage);
    setLoading(LoadingState.ERROR);
    return false;
  }
};