/**
 * 用户相关API接口
 */

import { apiRequest } from '../utils';
import type { User, UserParams, UserSelfParams, LoginParams, RegisterParams, BaseResponse, SimpleResponse, UserInfoResponse } from './types';

/**
 * 更新用户头像
 * @param file 头像文件
 * @returns Promise<{ success: boolean; message: string; avatar_url: string }>
 */
export const updateAvatar = (file: File): Promise<{
  success: boolean;
  message: string;
  avatar_url: string;
}> => {
  const formData = new FormData();
  formData.append('avatars_file', file); // 与后端参数名 avatars_file 保持一致

  // 核心修正：移除手动的 Content-Type 头，由浏览器自动生成（包含 boundary）
  return apiRequest.put('/player/info/me/avatars', formData, {
  });
};

/**
 * 用户登录
 * @param params 登录参数
 * @returns Promise<SimpleResponse>
 */
export const login = (params: LoginParams): Promise<SimpleResponse> => {
  return apiRequest.post('/player/login', params);
};

/**
 * 用户注册
 * @param params 注册参数
 * @returns Promise<SimpleResponse>
 */
export const register = (params: RegisterParams): Promise<SimpleResponse> => {
  return apiRequest.post('/player/signup', params);
};

/**
 * 获取当前登录用户的个人信息（无需传参，后端通过依赖自动获取用户ID）
 * @returns Promise<BaseResponse<UserInfoResponse>>
 */
export const getCurrentUser = (): Promise<BaseResponse<UserInfoResponse>> => {
  return apiRequest.get('/player/info/me');
};

/**
 * 更新用户信息
 * @param params 用户参数
 * @returns Promise<SimpleResponse>
 */
export const updateUser = (params: UserSelfParams): Promise<SimpleResponse> => {
  return apiRequest.put('/player/info/me', params);
};

/**
 * 用户登出
 * @returns Promise<BaseResponse<null>>
 */
export const logout = (): Promise<BaseResponse<null>> => {
  return apiRequest.post('/player/logout');
};