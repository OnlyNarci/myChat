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
  token: string | null;
  isAuthenticated: boolean;
  
  // 操作方法
  setUser: (user: User) => void;
  setToken: (token: string) => void;
  clearUser: () => void;
  setLoading: (loading: LoadingState) => void;
  setError: (error: string | null) => void;
}

// 创建用户store
export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // 初始状态
      loading: LoadingState.IDLE,
      error: null,
      user: null,
      token: null,
      isAuthenticated: false,
      
      // 设置用户信息
      setUser: (user: User) => {
        set({ user, isAuthenticated: true, error: null });
      },
      
      // 设置token
      setToken: (token: string) => {
        set({ token });
        // 同时将token保存到localStorage，供axios拦截器使用
        localStorage.setItem('token', token);
      },
      
      // 清除用户信息
      clearUser: () => {
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false, 
          error: null 
        });
        // 清除localStorage中的token
        localStorage.removeItem('token');
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
      name: 'user-storage', // localStorage中的key名
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token, 
        isAuthenticated: state.isAuthenticated 
      }), // 只持久化这些字段
    }
  )
);