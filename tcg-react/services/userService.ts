/**
 * 用户服务 - 连接API请求与状态管理
 */

import { login, register, getCurrentUser, updateUser, logout } from '../api';
import { useUserStore } from '../stores';
import { LoginParams, RegisterParams, UserParams } from '../api/types';
import { LoadingState } from '../stores/types';

/**
 * 用户登录服务
 * @param params 登录参数
 * @returns Promise<boolean> 登录是否成功
 */
export const loginService = async (params: LoginParams): Promise<boolean> => {
  const { setUser, setToken, setLoading, setError } = useUserStore.getState();
  
  try {
    setLoading(LoadingState.LOADING);
    
    const response = await login(params);
    
    if (response.code === 200 && response.data) {
      // 假设登录成功后返回token，实际情况可能需要调整
      const token = 'mock_token_' + Date.now(); // 实际应从response中获取
      
      setUser(response.data);
      setToken(token);
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
  const { setUser, setLoading, setError } = useUserStore.getState();
  
  try {
    setLoading(LoadingState.LOADING);
    
    const response = await getCurrentUser();
    
    if (response.code === 200 && response.data) {
      setUser(response.data);
      setLoading(LoadingState.SUCCESS);
      return true;
    } else {
      setError(response.message || '获取用户信息失败');
      setLoading(LoadingState.ERROR);
      return false;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '获取用户信息失败';
    setError(errorMessage);
    setLoading(LoadingState.ERROR);
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
    
    // 无论API调用是否成功，都清除本地用户信息
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
 * 在应用启动时调用，检查本地存储的token并获取用户信息
 * @returns Promise<void>
 */
export const initializeUserState = async (): Promise<void> => {
  const { token, isAuthenticated } = useUserStore.getState();
  
  // 如果本地有token但用户信息为空，尝试获取用户信息
  if (token && !isAuthenticated) {
    await getCurrentUserService();
  }
};