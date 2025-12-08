/**
 * 工具函数统一导出
 */

// 导出请求相关
export { default as apiClient, apiRequest } from './request';
export type { AxiosRequestConfig, AxiosResponse, AxiosError } from './request';

// 导出类型定义
import type { ApiResponse, PaginatedResponse, ErrorResponse, RequestConfig } from './types';
import { ApiError, isApiError, createApiError } from './types';

export type { ApiResponse, PaginatedResponse, ErrorResponse, RequestConfig };
export { ApiError, isApiError, createApiError };