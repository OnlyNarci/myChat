/**
 * 好友状态管理
 */

import { create } from 'zustand';
import type { Friend } from '../api';
import { LoadingState, type AsyncResult, type PaginationState } from './types';

// 好友状态接口
interface FriendsState {
  // 好友列表
  friends: AsyncResult<Friend[]>;
  friendsPagination: PaginationState;
  
  // 好友请求列表
  friendRequests: AsyncResult<Friend[]>;
  friendRequestsPagination: PaginationState;
  friendRequestsType: 'sent' | 'received' | 'all';
  
  // 搜索结果
  searchResults: AsyncResult<Friend[]>;
  searchResultsPagination: PaginationState;
  searchKeyword: string;
  
  // 操作方法
  // 好友列表相关
  setFriendsLoading: (loading: LoadingState) => void;
  setFriendsError: (error: string | null) => void;
  setFriendsData: (friends: Friend[], pagination: PaginationState) => void;
  setFriendsPagination: (pagination: Partial<PaginationState>) => void;
  addFriend: (friend: Friend) => void;
  removeFriend: (uid: string) => void;
  updateFriend: (uid: string, friend: Partial<Friend>) => void;
  
  // 好友请求相关
  setFriendRequestsLoading: (loading: LoadingState) => void;
  setFriendRequestsError: (error: string | null) => void;
  setFriendRequestsData: (requests: Friend[], pagination: PaginationState) => void;
  setFriendRequestsPagination: (pagination: Partial<PaginationState>) => void;
  setFriendRequestsType: (type: 'sent' | 'received' | 'all') => void;
  addFriendRequest: (request: Friend) => void;
  removeFriendRequest: (uid: string) => void;
  
  // 搜索结果相关
  setSearchResultsLoading: (loading: LoadingState) => void;
  setSearchResultsError: (error: string | null) => void;
  setSearchResultsData: (results: Friend[], pagination: PaginationState) => void;
  setSearchResultsPagination: (pagination: Partial<PaginationState>) => void;
  setSearchKeyword: (keyword: string) => void;
  clearSearchResults: () => void;
  
  // 重置所有状态
  resetFriendsState: () => void;
}

// 创建好友store
export const useFriendsStore = create<FriendsState>((set, get) => ({
  // 初始状态
  friends: { data: null, loading: LoadingState.IDLE, error: null },
  friendsPagination: { page: 1, size: 20, total: 0, pages: 0 },
  
  friendRequests: { data: null, loading: LoadingState.IDLE, error: null },
  friendRequestsPagination: { page: 1, size: 20, total: 0, pages: 0 },
  friendRequestsType: 'all',
  
  searchResults: { data: null, loading: LoadingState.IDLE, error: null },
  searchResultsPagination: { page: 1, size: 20, total: 0, pages: 0 },
  searchKeyword: '',
  
  // 好友列表相关操作
  setFriendsLoading: (loading: LoadingState) => {
    set(state => ({
      friends: { ...state.friends, loading }
    }));
  },
  
  setFriendsError: (error: string | null) => {
    set(state => ({
      friends: { ...state.friends, error, loading: LoadingState.ERROR }
    }));
  },
  
  setFriendsData: (friends: Friend[], pagination: PaginationState) => {
    set({
      friends: { data: friends, loading: LoadingState.SUCCESS, error: null },
      friendsPagination: pagination
    });
  },
  
  setFriendsPagination: (pagination: Partial<PaginationState>) => {
    set(state => ({
      friendsPagination: { ...state.friendsPagination, ...pagination }
    }));
  },
  
  addFriend: (friend: Friend) => {
    set(state => {
      if (!state.friends.data) return state;
      
      // 检查是否已经是好友
      const isAlreadyFriend = state.friends.data.some(f => f.uid === friend.uid);
      if (isAlreadyFriend) return state;
      
      return {
        friends: {
          ...state.friends,
          data: [friend, ...state.friends.data]
        }
      };
    });
  },
  
  removeFriend: (uid: string) => {
    set(state => {
      if (!state.friends.data) return state;
      
      return {
        friends: {
          ...state.friends,
          data: state.friends.data.filter(friend => friend.uid !== uid)
        }
      };
    });
  },
  
  updateFriend: (uid: string, friendUpdate: Partial<Friend>) => {
    set(state => {
      if (!state.friends.data) return state;
      
      return {
        friends: {
          ...state.friends,
          data: state.friends.data.map(friend => 
            friend.uid === uid ? { ...friend, ...friendUpdate } : friend
          )
        }
      };
    });
  },
  
  // 好友请求相关操作
  setFriendRequestsLoading: (loading: LoadingState) => {
    set(state => ({
      friendRequests: { ...state.friendRequests, loading }
    }));
  },
  
  setFriendRequestsError: (error: string | null) => {
    set(state => ({
      friendRequests: { ...state.friendRequests, error, loading: LoadingState.ERROR }
    }));
  },
  
  setFriendRequestsData: (requests: Friend[], pagination: PaginationState) => {
    set({
      friendRequests: { data: requests, loading: LoadingState.SUCCESS, error: null },
      friendRequestsPagination: pagination
    });
  },
  
  setFriendRequestsPagination: (pagination: Partial<PaginationState>) => {
    set(state => ({
      friendRequestsPagination: { ...state.friendRequestsPagination, ...pagination }
    }));
  },
  
  setFriendRequestsType: (type: 'sent' | 'received' | 'all') => {
    set({
      friendRequestsType: type,
      // 重置到第一页
      friendRequestsPagination: { page: 1, size: 20, total: 0, pages: 0 }
    });
  },
  
  addFriendRequest: (request: Friend) => {
    set(state => {
      if (!state.friendRequests.data) return state;
      
      // 检查是否已存在该请求
      const isAlreadyRequested = state.friendRequests.data.some(r => r.uid === request.uid);
      if (isAlreadyRequested) return state;
      
      return {
        friendRequests: {
          ...state.friendRequests,
          data: [request, ...state.friendRequests.data]
        }
      };
    });
  },
  
  removeFriendRequest: (uid: string) => {
    set(state => {
      if (!state.friendRequests.data) return state;
      
      return {
        friendRequests: {
          ...state.friendRequests,
          data: state.friendRequests.data.filter(request => request.uid !== uid)
        }
      };
    });
  },
  
  // 搜索结果相关操作
  setSearchResultsLoading: (loading: LoadingState) => {
    set(state => ({
      searchResults: { ...state.searchResults, loading }
    }));
  },
  
  setSearchResultsError: (error: string | null) => {
    set(state => ({
      searchResults: { ...state.searchResults, error, loading: LoadingState.ERROR }
    }));
  },
  
  setSearchResultsData: (results: Friend[], pagination: PaginationState) => {
    set({
      searchResults: { data: results, loading: LoadingState.SUCCESS, error: null },
      searchResultsPagination: pagination
    });
  },
  
  setSearchResultsPagination: (pagination: Partial<PaginationState>) => {
    set(state => ({
      searchResultsPagination: { ...state.searchResultsPagination, ...pagination }
    }));
  },
  
  setSearchKeyword: (keyword: string) => {
    set({
      searchKeyword: keyword,
      // 重置到第一页
      searchResultsPagination: { page: 1, size: 20, total: 0, pages: 0 }
    });
  },
  
  clearSearchResults: () => {
    set({
      searchResults: { data: null, loading: LoadingState.IDLE, error: null },
      searchResultsPagination: { page: 1, size: 20, total: 0, pages: 0 },
      searchKeyword: ''
    });
  },
  
  // 重置所有状态
  resetFriendsState: () => {
    set({
      friends: { data: null, loading: LoadingState.IDLE, error: null },
      friendsPagination: { page: 1, size: 20, total: 0, pages: 0 },
      
      friendRequests: { data: null, loading: LoadingState.IDLE, error: null },
      friendRequestsPagination: { page: 1, size: 20, total: 0, pages: 0 },
      friendRequestsType: 'all',
      
      searchResults: { data: null, loading: LoadingState.IDLE, error: null },
      searchResultsPagination: { page: 1, size: 20, total: 0, pages: 0 },
      searchKeyword: ''
    });
  }
}));