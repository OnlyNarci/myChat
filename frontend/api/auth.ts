/**
 * 用户相关API接口
 */

import { apiRequest } from '../utils';
import type { User, UserParams, UserSelfParams, LoginParams, RegisterParams, BaseResponse } from './types';

/**
 * 用户登录
 * @param params 登录参数
 * @returns Promise<User>
 */
export const login = (params: LoginParams): Promise<BaseResponse<User>> => {
  return apiRequest.post('/player/login', params);
};

/**
 * 用户注册
 * @param params 注册参数
 * @returns Promise<User>
 */
export const register = (params: RegisterParams): Promise<BaseResponse<User>> => {
  return apiRequest.post('/player/signup', params);
};

/**
 * 获取当前用户信息
 * @returns Promise<UserSelfParams>
 */
export const getCurrentUser = (): Promise<BaseResponse<UserSelfParams>> => {
  return apiRequest.get('/player/info/me');
};

/**
 * 更新用户信息
 * @param params 用户参数
 * @returns Promise<User>
 */
export const updateUser = (params: UserParams): Promise<BaseResponse<User>> => {
  return apiRequest.put('/player/info/me', params);
};

/**
 * 用户登出
 * @returns Promise<BaseResponse<null>>
 */
export const logout = (): Promise<BaseResponse<null>> => {
  return apiRequest.post('/player/logout');
};