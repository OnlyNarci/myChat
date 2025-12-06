/**
 * API响应通用类型定义
 */

// 基础API响应结构
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

// 分页响应结构
export interface PaginatedResponse<T = any> {
  code: number;
  message: string;
  data: {
    items: T[];
    total: number;
    page: number;
    size: number;
    pages: number;
  };
}

// 错误响应结构
export interface ErrorResponse {
  code: number;
  message: string;
  details?: any;
}

// 请求配置选项
export interface RequestConfig {
  showLoading?: boolean;
  showError?: boolean;
  timeout?: number;
}

// API错误类
export class ApiError extends Error {
  code: number;
  details?: any;
  
  constructor(message: string, code: number, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
  }
}

// 判断是否为API错误
export function isApiError(error: any): error is ApiError {
  return error instanceof ApiError;
}

// 从错误响应中创建ApiError实例
export function createApiError(errorResponse: ErrorResponse): ApiError {
  return new ApiError(errorResponse.message, errorResponse.code, errorResponse.details);
}