/**
 * 用户服务单元测试
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  loginService, 
  registerService, 
  getCurrentUserService, 
  updateUserService, 
  logoutService 
} from '../../services';
import { useUserStore } from '../../stores';
import * as authApi from '../../api/auth';
import { LoadingState } from '../../stores/types';

// 模拟API模块
vi.mock('../../api/auth');
const mockAuthApi = vi.mocked(authApi);

// 模拟store
const mockSetUser = vi.fn();
const mockSetToken = vi.fn();
const mockClearUser = vi.fn();
const mockSetLoading = vi.fn();
const mockSetError = vi.fn();

describe('用户服务测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // 模拟store方法
    vi.spyOn(useUserStore, 'getState').mockReturnValue({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: LoadingState.IDLE,
      error: null,
      setUser: mockSetUser,
      setToken: mockSetToken,
      clearUser: mockClearUser,
      setLoading: mockSetLoading,
      setError: mockSetError,
    } as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('loginService', () => {
    it('应该成功登录并设置用户信息', async () => {
      const mockLoginParams = { username: 'testuser', password: 'password' };
      const mockResponse = {
        code: 200,
        message: '登录成功',
        data: {
          user: {
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
          },
          token: 'test-token',
        },
      };

      mockAuthApi.login.mockResolvedValueOnce(mockResponse);

      const result = await loginService(mockLoginParams);

      expect(mockAuthApi.login).toHaveBeenCalledWith(mockLoginParams);
      expect(mockSetUser).toHaveBeenCalledWith(mockResponse.data.user);
      expect(mockSetToken).toHaveBeenCalledWith(mockResponse.data.token);
      expect(mockSetLoading).toHaveBeenCalledWith(LoadingState.SUCCESS);
      expect(result).toBe(true);
    });

    it('应该处理登录失败', async () => {
      const mockLoginParams = { username: 'testuser', password: 'wrongpassword' };
      const mockResponse = {
        code: 401,
        message: '用户名或密码错误',
        data: null,
      };

      mockAuthApi.login.mockResolvedValueOnce(mockResponse);

      const result = await loginService(mockLoginParams);

      expect(mockAuthApi.login).toHaveBeenCalledWith(mockLoginParams);
      expect(mockSetError).toHaveBeenCalledWith('用户名或密码错误');
      expect(mockSetLoading).toHaveBeenCalledWith(LoadingState.ERROR);
      expect(result).toBe(false);
    });

    it('应该处理登录异常', async () => {
      const mockLoginParams = { username: 'testuser', password: 'password' };
      const mockError = new Error('网络错误');

      mockAuthApi.login.mockRejectedValueOnce(mockError);

      const result = await loginService(mockLoginParams);

      expect(mockAuthApi.login).toHaveBeenCalledWith(mockLoginParams);
      expect(mockSetError).toHaveBeenCalledWith('网络错误');
      expect(mockSetLoading).toHaveBeenCalledWith(LoadingState.ERROR);
      expect(result).toBe(false);
    });
  });

  describe('registerService', () => {
    it('应该成功注册并设置用户信息', async () => {
      const mockRegisterParams = {
        username: 'newuser',
        password: 'password',
        nickname: 'New User',
        email: 'newuser@example.com',
      };
      const mockResponse = {
        code: 200,
        message: '注册成功',
        data: {
          user: {
            id: 2,
            username: 'newuser',
            nickname: 'New User',
            email: 'newuser@example.com',
            avatar: '',
            coins: 1000,
            diamonds: 100,
            level: 1,
            exp: 0,
            created_at: '2023-01-01T00:00:00Z',
            updated_at: '2023-01-01T00:00:00Z',
          },
          token: 'new-token',
        },
      };

      mockAuthApi.register.mockResolvedValueOnce(mockResponse);

      const result = await registerService(mockRegisterParams);

      expect(mockAuthApi.register).toHaveBeenCalledWith(mockRegisterParams);
      expect(mockSetUser).toHaveBeenCalledWith(mockResponse.data.user);
      expect(mockSetToken).toHaveBeenCalledWith(mockResponse.data.token);
      expect(mockSetLoading).toHaveBeenCalledWith(LoadingState.SUCCESS);
      expect(result).toBe(true);
    });

    it('应该处理注册失败', async () => {
      const mockRegisterParams = {
        username: 'existinguser',
        password: 'password',
        nickname: 'Existing User',
        email: 'existing@example.com',
      };
      const mockResponse = {
        code: 400,
        message: '用户名已存在',
        data: null,
      };

      mockAuthApi.register.mockResolvedValueOnce(mockResponse);

      const result = await registerService(mockRegisterParams);

      expect(mockAuthApi.register).toHaveBeenCalledWith(mockRegisterParams);
      expect(mockSetError).toHaveBeenCalledWith('用户名已存在');
      expect(mockSetLoading).toHaveBeenCalledWith(LoadingState.ERROR);
      expect(result).toBe(false);
    });
  });

  describe('getCurrentUserService', () => {
    it('应该成功获取当前用户信息', async () => {
      const mockResponse = {
        code: 200,
        message: '获取成功',
        data: {
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
        },
      };

      mockAuthApi.getCurrentUser.mockResolvedValueOnce(mockResponse);

      const result = await getCurrentUserService();

      expect(mockAuthApi.getCurrentUser).toHaveBeenCalled();
      expect(mockSetUser).toHaveBeenCalledWith(mockResponse.data);
      expect(mockSetLoading).toHaveBeenCalledWith(LoadingState.SUCCESS);
      expect(result).toBe(true);
    });

    it('应该处理获取用户信息失败', async () => {
      const mockResponse = {
        code: 401,
        message: '未登录或token已过期',
        data: null,
      };

      mockAuthApi.getCurrentUser.mockResolvedValueOnce(mockResponse);

      const result = await getCurrentUserService();

      expect(mockAuthApi.getCurrentUser).toHaveBeenCalled();
      expect(mockSetError).toHaveBeenCalledWith('未登录或token已过期');
      expect(mockSetLoading).toHaveBeenCalledWith(LoadingState.ERROR);
      expect(result).toBe(false);
    });
  });

  describe('updateUserService', () => {
    it('应该成功更新用户信息', async () => {
      const mockUpdateParams = {
        nickname: 'Updated User',
        email: 'updated@example.com',
      };
      const mockResponse = {
        code: 200,
        message: '更新成功',
        data: {
          id: 1,
          username: 'testuser',
          nickname: 'Updated User',
          email: 'updated@example.com',
          avatar: '',
          coins: 1000,
          diamonds: 100,
          level: 1,
          exp: 0,
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-02T00:00:00Z',
        },
      };

      mockAuthApi.updateUser.mockResolvedValueOnce(mockResponse);

      const result = await updateUserService(mockUpdateParams);

      expect(mockAuthApi.updateUser).toHaveBeenCalledWith(mockUpdateParams);
      expect(mockSetUser).toHaveBeenCalledWith(mockResponse.data);
      expect(mockSetLoading).toHaveBeenCalledWith(LoadingState.SUCCESS);
      expect(result).toBe(true);
    });
  });

  describe('logoutService', () => {
    it('应该成功登出并清除用户信息', async () => {
      const mockResponse = {
        code: 200,
        message: '登出成功',
        data: null,
      };

      mockAuthApi.logout.mockResolvedValueOnce(mockResponse);

      const result = await logoutService();

      expect(mockAuthApi.logout).toHaveBeenCalled();
      expect(mockClearUser).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('应该处理登出失败但仍清除本地用户信息', async () => {
      const mockResponse = {
        code: 400,
        message: '登出失败',
        data: null,
      };

      mockAuthApi.logout.mockResolvedValueOnce(mockResponse);

      const result = await logoutService();

      expect(mockAuthApi.logout).toHaveBeenCalled();
      expect(mockClearUser).toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });
});