/**
 * 用户状态管理单元测试
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useUserStore, UserState } from '../../stores';
import { LoadingState } from '../../stores/types';

// 模拟localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('用户状态管理测试', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('应该初始化用户状态', () => {
    const { result } = renderHook(() => useUserStore());

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.loading).toBe(LoadingState.IDLE);
    expect(result.current.error).toBeNull();
  });

  it('应该设置用户信息', () => {
    const { result } = renderHook(() => useUserStore());
    const mockUser = {
      id: 1,
      username: 'testuser',
      nickname: 'Test User',
      email: 'test@example.com',
      avatar: '',
      coins: 1000,
      diamonds: 100,
      level: 1,
      exp: 0,
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    };

    act(() => {
      result.current.setUser(mockUser);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('应该设置token', () => {
    const { result } = renderHook(() => useUserStore());

    act(() => {
      result.current.setToken('test-token');
    });

    expect(result.current.token).toBe('test-token');
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('应该清除用户信息', () => {
    const { result } = renderHook(() => useUserStore());
    const mockUser = {
      id: 1,
      username: 'testuser',
      nickname: 'Test User',
      email: 'test@example.com',
      avatar: '',
      coins: 1000,
      diamonds: 100,
      level: 1,
      exp: 0,
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    };

    // 先设置用户信息
    act(() => {
      result.current.setUser(mockUser);
      result.current.setToken('test-token');
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.token).toBe('test-token');
    expect(result.current.isAuthenticated).toBe(true);

    // 然后清除用户信息
    act(() => {
      result.current.clearUser();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('应该设置加载状态', () => {
    const { result } = renderHook(() => useUserStore());

    act(() => {
      result.current.setLoading(LoadingState.LOADING);
    });

    expect(result.current.loading).toBe(LoadingState.LOADING);

    act(() => {
      result.current.setLoading(LoadingState.SUCCESS);
    });

    expect(result.current.loading).toBe(LoadingState.SUCCESS);

    act(() => {
      result.current.setLoading(LoadingState.ERROR);
    });

    expect(result.current.loading).toBe(LoadingState.ERROR);
  });

  it('应该设置错误信息', () => {
    const { result } = renderHook(() => useUserStore());

    act(() => {
      result.current.setError('Test error');
    });

    expect(result.current.error).toBe('Test error');
  });

  it('应该持久化用户状态到localStorage', () => {
    const { result } = renderHook(() => useUserStore());
    const mockUser = {
      id: 1,
      username: 'testuser',
      nickname: 'Test User',
      email: 'test@example.com',
      avatar: '',
      coins: 1000,
      diamonds: 100,
      level: 1,
      exp: 0,
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    };

    act(() => {
      result.current.setUser(mockUser);
      result.current.setToken('test-token');
    });

    // 检查localStorage中是否保存了用户状态
    const storedState = localStorage.getItem('user-storage');
    expect(storedState).toBeTruthy();
    
    const parsedState = JSON.parse(storedState!);
    expect(parsedState.state.user).toEqual(mockUser);
    expect(parsedState.state.token).toBe('test-token');
  });

  it('应该从localStorage恢复用户状态', () => {
    const mockUser = {
      id: 1,
      username: 'testuser',
      nickname: 'Test User',
      email: 'test@example.com',
      avatar: '',
      coins: 1000,
      diamonds: 100,
      level: 1,
      exp: 0,
      created_at: '2023-01-01T00:00:00Z',
      updated_at: '2023-01-01T00:00:00Z',
    };

    // 先在localStorage中设置用户状态
    localStorage.setItem(
      'user-storage',
      JSON.stringify({
        state: {
          user: mockUser,
          token: 'test-token',
          isAuthenticated: true,
          loading: LoadingState.IDLE,
          error: null,
        },
        version: 0,
      })
    );

    // 然后创建新的store实例
    const { result } = renderHook(() => useUserStore());

    // 验证状态是否从localStorage恢复
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.token).toBe('test-token');
    expect(result.current.isAuthenticated).toBe(true);
  });
});