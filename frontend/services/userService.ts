/**
 * 用户服务 - 连接API请求与状态管理
 */

import { login, register, getCurrentUser, updateUser, logout, updateAvatar } from '../api';
import { useUserStore } from '../stores';
import type { LoginParams, RegisterParams, UserParams, UserSelfParams } from '../api/types';
import { LoadingState } from '../stores/types';

/**
 * 用户登录服务
 * @param params 登录参数
 * @returns Promise<boolean> 登录是否成功
 */
export const loginService = async (params: LoginParams): Promise<boolean> => {
  const store = useUserStore.getState();
  const { setUser, setLoading, setError } = store;

  try {
    setLoading(LoadingState.LOADING);
    console.log('开始登录，参数:', { user_name: params.user_name });

    const response = await login(params);
    console.log('登录响应:', response);

    // axios已经通过HTTP状态码判断了请求是否成功
    // 如果代码能执行到这里，说明HTTP请求是成功的（2xx状态码）

    // 登录成功，session会自动通过cookie设置，无需手动管理token

    // 尝试获取用户信息
    const userResponse = await getCurrentUser();
    console.log('获取用户信息响应:', userResponse);

    if (userResponse.success) {
      setUser(userResponse.self_info);
      console.log('登录成功并获取到用户信息:', userResponse.self_info);
    } else {
      console.warn('登录成功但获取用户信息失败:', userResponse.message);
    }

    setLoading(LoadingState.SUCCESS);
    return true;
  } catch (error) {
    // HTTP请求失败，axios会抛出包含状态码的错误
    const errorMessage = error instanceof Error ? error.message : '登录失败';
    console.error('登录异常:', error);
    setError(errorMessage);
    setLoading(LoadingState.ERROR);
    return false;
  }
};

/**
 * 上传头像服务
 * @param file 头像文件
 * @returns Promise<boolean> 上传是否成功
 */
export const uploadAvatarService = async (file: File): Promise<boolean> => {
  const store = useUserStore.getState();
  const { setUser, setLoading, setError } = store;

  try {
    setLoading(LoadingState.LOADING);

    const response = await updateAvatar(file);

    if (response.success) {
      // 更新用户头像URL
      const currentUser = store.user;
      if (currentUser) {
        setUser({
          ...currentUser,
          avatar: response.avatar_url
        });
      }
      setLoading(LoadingState.SUCCESS);
      return true;
    } else {
      setError(response.message || '头像上传失败');
      setLoading(LoadingState.ERROR);
      return false;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '头像上传失败';
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

    // 注册成功
    setLoading(LoadingState.SUCCESS);
    return true;
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
  const store = useUserStore.getState();
  const { setUser, setError, isAuthenticated } = store;

  try {
    console.log('开始获取当前用户信息...');

    const response = await getCurrentUser();
    console.log('获取用户信息响应:', response);

    if (response.success) {
      setUser(response.self_info);
      store.setLoading(LoadingState.SUCCESS);
      console.log('✅ 成功获取用户信息');
      return true;
    } else {
      // 没有用户数据，表示未登录
      console.log('ℹ️ 用户未登录，这是正常情况');
      store.clearUser(); // 确保清理状态
      return false;
    }
  } catch (error) {
    // 网络错误或其他异常
    const errorMessage = error instanceof Error ? error.message : '获取用户信息失败';
    console.error('❌ 获取用户信息异常:', error);

    // 如果是网络错误，不设置错误状态，让用户继续
    if (errorMessage.includes('网络') || errorMessage.includes('timeout')) {
      console.log('ℹ️ 网络问题，忽略错误');
      return false;
    }

    setError(errorMessage);
    store.setLoading(LoadingState.ERROR);
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

    if (response.data) {
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