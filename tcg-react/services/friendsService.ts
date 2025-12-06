/**
 * 好友服务 - 连接API请求与状态管理
 */

import { 
  getFriends, 
  searchUsers, 
  sendFriendRequest, 
  acceptFriendRequest, 
  rejectFriendRequest, 
  deleteFriend, 
  getFriendRequests 
} from '../api';
import { useFriendsStore } from '../stores';
import { LoadingState } from '../stores/types';

/**
 * 获取好友列表服务
 * @param params 查询参数
 * @returns Promise<boolean> 获取是否成功
 */
export const getFriendsService = async (params?: {
  page?: number;
  size?: number;
}): Promise<boolean> => {
  const { 
    setFriendsLoading, 
    setFriendsError, 
    setFriendsData,
    setFriendsPagination 
  } = useFriendsStore.getState();
  
  try {
    setFriendsLoading(LoadingState.LOADING);
    
    const response = await getFriends(params);
    
    if (response.code === 200 && response.data) {
      const { items, total, page, size, pages } = response.data;
      
      setFriendsData(items, {
        page,
        size,
        total,
        pages
      });
      
      return true;
    } else {
      setFriendsError(response.message || '获取好友列表失败');
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
 * 获取好友请求列表服务
 * @param params 查询参数
 * @returns Promise<boolean> 获取是否成功
 */
export const getFriendRequestsService = async (params?: {
  page?: number;
  size?: number;
}): Promise<boolean> => {
  const { 
    setFriendRequestsLoading, 
    setFriendRequestsError, 
    setFriendRequestsData,
    setFriendRequestsPagination 
  } = useFriendsStore.getState();
  
  try {
    setFriendRequestsLoading(LoadingState.LOADING);
    
    const response = await getFriendRequests(params);
    
    if (response.code === 200 && response.data) {
      const { items, total, page, size, pages } = response.data;
      
      setFriendRequestsData(items, {
        page,
        size,
        total,
        pages
      });
      
      return true;
    } else {
      setFriendRequestsError(response.message || '获取好友请求列表失败');
      return false;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '获取好友请求列表失败';
    setFriendRequestsError(errorMessage);
    return false;
  }
};

/**
 * 发送好友请求服务
 * @param userId 目标用户ID
 * @returns Promise<boolean> 发送是否成功
 */
export const sendFriendRequestService = async (userId: number): Promise<boolean> => {
  const { setLoading, setError } = useFriendsStore.getState();
  
  try {
    setLoading(LoadingState.LOADING);
    
    const response = await sendFriendRequest(userId);
    
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
 * 接受好友请求服务
 * @param requestId 好友请求ID
 * @returns Promise<boolean> 接受是否成功
 */
export const acceptFriendRequestService = async (requestId: number): Promise<boolean> => {
  const { setLoading, setError } = useFriendsStore.getState();
  
  try {
    setLoading(LoadingState.LOADING);
    
    const response = await acceptFriendRequest(requestId);
    
    if (response.code === 200) {
      setLoading(LoadingState.SUCCESS);
      // 接受成功后刷新好友列表和好友请求列表
      await Promise.all([
        getFriendsService(),
        getFriendRequestsService()
      ]);
      return true;
    } else {
      setError(response.message || '接受好友请求失败');
      setLoading(LoadingState.ERROR);
      return false;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '接受好友请求失败';
    setError(errorMessage);
    setLoading(LoadingState.ERROR);
    return false;
  }
};

/**
 * 拒绝好友请求服务
 * @param requestId 好友请求ID
 * @returns Promise<boolean> 拒绝是否成功
 */
export const rejectFriendRequestService = async (requestId: number): Promise<boolean> => {
  const { setLoading, setError } = useFriendsStore.getState();
  
  try {
    setLoading(LoadingState.LOADING);
    
    const response = await rejectFriendRequest(requestId);
    
    if (response.code === 200) {
      setLoading(LoadingState.SUCCESS);
      // 拒绝成功后刷新好友请求列表
      await getFriendRequestsService();
      return true;
    } else {
      setError(response.message || '拒绝好友请求失败');
      setLoading(LoadingState.ERROR);
      return false;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '拒绝好友请求失败';
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
export const deleteFriendService = async (userId: number): Promise<boolean> => {
  const { setLoading, setError } = useFriendsStore.getState();
  
  try {
    setLoading(LoadingState.LOADING);
    
    const response = await deleteFriend(userId);
    
    if (response.code === 200) {
      setLoading(LoadingState.SUCCESS);
      // 删除成功后刷新好友列表
      await getFriendsService();
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