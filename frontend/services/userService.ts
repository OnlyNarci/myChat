/**
 * 用户服务 - 连接API请求与状态管理
 */

import { login, register, getCurrentUser, updateUser, logout } from '../api';
import { useUserStore } from '../stores';
import type { LoginParams, RegisterParams, UserParams } from '../api/types';
import { LoadingState } from '../stores/types';

/**
 * 用户登录服务
 * @param params 登录参数
 * @returns Promise<boolean> 登录是否成功
 */
export const loginService = async (params: LoginParams): Promise<boolean> => {
  const { setUser, setLoading, setError } = useUserStore.getState();
  
  try {
    setLoading(LoadingState.LOADING);
    
    const response = await login(params);
    
    if (response.code === 200) {
      // 登录成功，session会自动通过cookie设置，无需手动管理token
      
      // 尝试获取用户信息，但不覆盖登录的加载状态
      const userResponse = await getCurrentUser();
      if (userResponse.code === 200 && userResponse.data) {
        setUser(userResponse.data);
      }
      
      setLoading(LoadingState.SUCCESS);
      return true;
    } else {
      setError(response.message || '登录失败');
      setLoading(LoadingState.ERROR);
      return false;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '登录失败';
    setError(errorMessage);
    setLoading(LoadingState.ERROR);
    return false;
  }
};

/**
 * 用户注册服务
 * @param params 注册参数
 * @returns Promise<boolean> 注册是否成功
 */
export const registerService = async (params: RegisterParams): Promise<boolean> => {
  const { setLoading, setError } = useUserStore.getState();
  
  try {
    setLoading(LoadingState.LOADING);
    
    const response = await register(params);
    
    if (response.code === 200) {
      setLoading(LoadingState.SUCCESS);
      return true;
    } else {
      setError(response.message || '注册失败');
      setLoading(LoadingState.ERROR);
      return false;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '注册失败';
    setError(errorMessage);
    setLoading(LoadingState.ERROR);
    return false;
  }
};

/**
 * 获取当前用户信息服务
 * @returns Promise<boolean> 获取是否成功
 */
export const getCurrentUserService = async (): Promise<boolean> => {
  const { setUser, setError, loading: currentLoading } = useUserStore.getState();
  
  try {
    // 只有在IDLE状态下才设置LOADING，避免干扰其他操作
    if (currentLoading === LoadingState.IDLE) {
      useUserStore.getState().setLoading(LoadingState.LOADING);
    }
    
    const response = await getCurrentUser();
    
    if (response.code === 200 && response.data) {
      setUser(response.data);
      // 只有在IDLE状态下设置过LOADING才设置SUCCESS
      if (currentLoading === LoadingState.IDLE) {
        useUserStore.getState().setLoading(LoadingState.SUCCESS);
      }
      return true;
    } else {
      setError(response.message || '获取用户信息失败');
      if (currentLoading === LoadingState.IDLE) {
        useUserStore.getState().setLoading(LoadingState.ERROR);
      }
      return false;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '获取用户信息失败';
    setError(errorMessage);
    if (currentLoading === LoadingState.IDLE) {
      useUserStore.getState().setLoading(LoadingState.ERROR);
    }
    return false;
  }
};

/**
 * 更新用户信息服务
 * @param params 用户参数
 * @returns Promise<boolean> 更新是否成功
 */
export const updateUserService = async (params: UserParams): Promise<boolean> => {
  const { setUser, setLoading, setError } = useUserStore.getState();
  
  try {
    setLoading(LoadingState.LOADING);
    
    const response = await updateUser(params);
    
    if (response.code === 200 && response.data) {
      setUser(response.data);
      setLoading(LoadingState.SUCCESS);
      return true;
    } else {
      setError(response.message || '更新用户信息失败');
      setLoading(LoadingState.ERROR);
      return false;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '更新用户信息失败';
    setError(errorMessage);
    setLoading(LoadingState.ERROR);
    return false;
  }
};

/**
 * 用户登出服务
 * @returns Promise<boolean> 登出是否成功
 */
export const logoutService = async (): Promise<boolean> => {
  const { clearUser, setLoading, setError } = useUserStore.getState();
  
  try {
    setLoading(LoadingState.LOADING);
    
    const response = await logout();
    
    // 清除本地用户信息（cookie会自动清除）
    clearUser();
    setLoading(LoadingState.SUCCESS);
    
    return true;
  } catch (error) {
    // 即使API调用失败，也清除本地用户信息
    clearUser();
    setLoading(LoadingState.SUCCESS);
    
    return true;
  }
};

/**
 * 初始化用户状态
 * 在应用启动时调用，检查持久化数据并验证session
 * @returns Promise<void>
 */
export const initializeUserState = async (): Promise<void> => {
  const { isAuthenticated, user } = useUserStore.getState();
  
  // 如果本地有用户信息，尝试验证session是否仍然有效
  if (isAuthenticated && user) {
    try {
      await getCurrentUserService();
    } catch (error) {
      // session已过期，清除本地数据
      useUserStore.getState().clearUser();
    }
  } else {
    // 没有本地用户信息，尝试通过cookie获取
    await getCurrentUserService();
  }
};