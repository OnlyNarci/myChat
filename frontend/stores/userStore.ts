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
  hasCheckedAuth: boolean;  // 添加标志，避免重复检查
  
  // 操作方法
  setUser: (user: User) => void;
  clearUser: () => void;
  setLoading: (loading: LoadingState) => void;
  setError: (error: string | null) => void;
  setHasCheckedAuth: (checked: boolean) => void;
  reset: () => void;
}

// 创建用户store（简化持久化策略）
export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // 初始状态
      loading: LoadingState.IDLE,
      error: null,
      user: null,
      isAuthenticated: false,
      hasCheckedAuth: false,  // 初始化为false
      
      // 设置用户信息
      setUser: (user: User) => {
        console.log('设置用户信息:', user);
        set({ 
          user, 
          isAuthenticated: true, 
          error: null,
          hasCheckedAuth: true
        });
      },
      
      // 清除用户信息
      clearUser: () => {
        console.log('清除用户信息');
        set({ 
          user: null, 
          isAuthenticated: false, 
          error: null,
          hasCheckedAuth: true  // 即使清除也要标记为已检查
        });
      },
      
      // 设置加载状态
      setLoading: (loading: LoadingState) => {
        set({ loading });
      },
      
      // 设置错误信息
      setError: (error: string | null) => {
        console.log('设置错误信息:', error);
        set({ error });
      },
      
      // 设置认证检查状态
      setHasCheckedAuth: (checked: boolean) => {
        set({ hasCheckedAuth: checked });
      },
      
      // 重置所有状态
      reset: () => {
        console.log('重置用户状态');
        set({
          loading: LoadingState.IDLE,
          error: null,
          user: null,
          isAuthenticated: false,
          hasCheckedAuth: false
        });
      }
    }),
    {
      name: 'tcg-user-storage',
      partialize: (state) => ({ 
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        hasCheckedAuth: state.hasCheckedAuth
      }),
      // 添加存储版本，便于清理旧数据
      version: 1,
      // 每次启动时清理过时数据
      onRehydrateStorage: () => (state) => {
        console.log('重新水化用户状态:', state);
        if (state) {
          // 如果状态不完整，重置它
          if (state.hasCheckedAuth === undefined) {
            state.hasCheckedAuth = false;
          }
        }
      }
    }
  )
);