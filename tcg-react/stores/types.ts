/**
 * Store基础类型定义
 */

// 加载状态枚举
export enum LoadingState {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error'
}

// 基础状态接口
export interface BaseState {
  loading: LoadingState;
  error: string | null;
}

// 分页状态接口
export interface PaginationState {
  page: number;
  size: number;
  total: number;
  pages: number;
}

// 异步操作结果接口
export interface AsyncResult<T> {
  data: T | null;
  loading: LoadingState;
  error: string | null;
}

// Store通用操作接口
export interface StoreActions<T> {
  setLoading: (loading: LoadingState) => void;
  setError: (error: string | null) => void;
  setData: (data: T) => void;
  reset: () => void;
}

// 分页Store操作接口
export interface PaginatedStoreActions<T> extends StoreActions<T[]> {
  setPagination: (pagination: Partial<PaginationState>) => void;
  setPage: (page: number) => void;
  setSize: (size: number) => void;
  nextPage: () => void;
  prevPage: () => void;
}