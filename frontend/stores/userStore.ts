/**
 * 用户状态管理
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../api';
import { LoadingState, type BaseState } from './types';

// 用户状态接口
interface UserState extends BaseState {
  // 用户数据
  user: User | null;
  isAuthenticated: boolean;
  
  // 操作方法
  setUser: (user: User) => void;
  clearUser: () => void;
  setLoading: (loading: LoadingState) => void;
  setError: (error: string | null) => void;
}

// 创建用户store（持久化用户基本信息，认证依赖cookie）
export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // 初始状态
      loading: LoadingState.IDLE,
      error: null,
      user: null,
      isAuthenticated: false,
      
      // 设置用户信息
      setUser: (user: User) => {
        set({ user, isAuthenticated: true, error: null });
      },
      
      // 清除用户信息
      clearUser: () => {
        set({ 
          user: null, 
          isAuthenticated: false, 
          error: null 
        });
      },
      
      // 设置加载状态
      setLoading: (loading: LoadingState) => {
        set({ loading });
      },
      
      // 设置错误信息
      setError: (error: string | null) => {
        set({ error });
      },
    }),
    {
      name: 'tcg-user-storage', // localStorage中的key名
      partialize: (state) => ({ 
        user: state.user,           // 持久化用户基本信息（游戏公开数据）
        isAuthenticated: state.isAuthenticated  // 持久化认证状态
      }), // 认证仍依赖cookie，但持久化可提升体验
    }
  )
);