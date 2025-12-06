/**
 * 商店状态管理
 */

import { create } from 'zustand';
import type { StoreCard, Order } from '../api';
import { LoadingState, type AsyncResult, type PaginationState } from './types';

// 商店状态接口
interface StoreState {
  // 商店卡牌列表
  storeCards: AsyncResult<StoreCard[]>;
  storeCardsPagination: PaginationState;
  storeCardsFilters: {
    package?: string;
    rarity?: number;
    min_price?: number;
    max_price?: number;
    seller_uid?: string;
  };
  
  // 我的上架卡牌
  myListedCards: AsyncResult<StoreCard[]>;
  myListedCardsPagination: PaginationState;
  
  // 订单列表
  orders: AsyncResult<Order[]>;
  ordersPagination: PaginationState;
  ordersFilters: {
    status?: 'pending' | 'completed' | 'cancelled';
    type?: 'buy' | 'sell';
  };
  
  // 操作方法
  // 商店卡牌相关
  setStoreCardsLoading: (loading: LoadingState) => void;
  setStoreCardsError: (error: string | null) => void;
  setStoreCardsData: (cards: StoreCard[], pagination: PaginationState) => void;
  setStoreCardsPagination: (pagination: Partial<PaginationState>) => void;
  setStoreCardsFilters: (filters: Partial<StoreState['storeCardsFilters']>) => void;
  resetStoreCardsFilters: () => void;
  
  // 我的上架卡牌相关
  setMyListedCardsLoading: (loading: LoadingState) => void;
  setMyListedCardsError: (error: string | null) => void;
  setMyListedCardsData: (cards: StoreCard[], pagination: PaginationState) => void;
  setMyListedCardsPagination: (pagination: Partial<PaginationState>) => void;
  
  // 订单相关
  setOrdersLoading: (loading: LoadingState) => void;
  setOrdersError: (error: string | null) => void;
  setOrdersData: (orders: Order[], pagination: PaginationState) => void;
  setOrdersPagination: (pagination: Partial<PaginationState>) => void;
  setOrdersFilters: (filters: Partial<StoreState['ordersFilters']>) => void;
  resetOrdersFilters: () => void;
  updateOrderStatus: (orderId: string, status: 'pending' | 'completed' | 'cancelled') => void;
  
  // 重置所有状态
  resetStoreState: () => void;
}

// 创建商店store
export const useStoreStore = create<StoreState>((set, get) => ({
  // 初始状态
  storeCards: { data: null, loading: LoadingState.IDLE, error: null },
  storeCardsPagination: { page: 1, size: 20, total: 0, pages: 0 },
  storeCardsFilters: {},
  
  myListedCards: { data: null, loading: LoadingState.IDLE, error: null },
  myListedCardsPagination: { page: 1, size: 20, total: 0, pages: 0 },
  
  orders: { data: null, loading: LoadingState.IDLE, error: null },
  ordersPagination: { page: 1, size: 20, total: 0, pages: 0 },
  ordersFilters: {},
  
  // 商店卡牌相关操作
  setStoreCardsLoading: (loading: LoadingState) => {
    set(state => ({
      storeCards: { ...state.storeCards, loading }
    }));
  },
  
  setStoreCardsError: (error: string | null) => {
    set(state => ({
      storeCards: { ...state.storeCards, error, loading: LoadingState.ERROR }
    }));
  },
  
  setStoreCardsData: (cards: StoreCard[], pagination: PaginationState) => {
    set({
      storeCards: { data: cards, loading: LoadingState.SUCCESS, error: null },
      storeCardsPagination: pagination
    });
  },
  
  setStoreCardsPagination: (pagination: Partial<PaginationState>) => {
    set(state => ({
      storeCardsPagination: { ...state.storeCardsPagination, ...pagination }
    }));
  },
  
  setStoreCardsFilters: (filters: Partial<StoreState['storeCardsFilters']>) => {
    set(state => ({
      storeCardsFilters: { ...state.storeCardsFilters, ...filters },
      // 重置到第一页
      storeCardsPagination: { ...state.storeCardsPagination, page: 1 }
    }));
  },
  
  resetStoreCardsFilters: () => {
    set({
      storeCardsFilters: {},
      // 重置到第一页
      storeCardsPagination: { page: 1, size: 20, total: 0, pages: 0 }
    });
  },
  
  // 我的上架卡牌相关操作
  setMyListedCardsLoading: (loading: LoadingState) => {
    set(state => ({
      myListedCards: { ...state.myListedCards, loading }
    }));
  },
  
  setMyListedCardsError: (error: string | null) => {
    set(state => ({
      myListedCards: { ...state.myListedCards, error, loading: LoadingState.ERROR }
    }));
  },
  
  setMyListedCardsData: (cards: StoreCard[], pagination: PaginationState) => {
    set({
      myListedCards: { data: cards, loading: LoadingState.SUCCESS, error: null },
      myListedCardsPagination: pagination
    });
  },
  
  setMyListedCardsPagination: (pagination: Partial<PaginationState>) => {
    set(state => ({
      myListedCardsPagination: { ...state.myListedCardsPagination, ...pagination }
    }));
  },
  
  // 订单相关操作
  setOrdersLoading: (loading: LoadingState) => {
    set(state => ({
      orders: { ...state.orders, loading }
    }));
  },
  
  setOrdersError: (error: string | null) => {
    set(state => ({
      orders: { ...state.orders, error, loading: LoadingState.ERROR }
    }));
  },
  
  setOrdersData: (orders: Order[], pagination: PaginationState) => {
    set({
      orders: { data: orders, loading: LoadingState.SUCCESS, error: null },
      ordersPagination: pagination
    });
  },
  
  setOrdersPagination: (pagination: Partial<PaginationState>) => {
    set(state => ({
      ordersPagination: { ...state.ordersPagination, ...pagination }
    }));
  },
  
  setOrdersFilters: (filters: Partial<StoreState['ordersFilters']>) => {
    set(state => ({
      ordersFilters: { ...state.ordersFilters, ...filters },
      // 重置到第一页
      ordersPagination: { ...state.ordersPagination, page: 1 }
    }));
  },
  
  resetOrdersFilters: () => {
    set({
      ordersFilters: {},
      // 重置到第一页
      ordersPagination: { page: 1, size: 20, total: 0, pages: 0 }
    });
  },
  
  updateOrderStatus: (orderId: string, status: 'pending' | 'completed' | 'cancelled') => {
    set(state => {
      if (!state.orders.data) return state;
      
      const updatedOrders = state.orders.data.map(order => 
        order.order_id === orderId ? { ...order, status } : order
      );
      
      return {
        orders: { ...state.orders, data: updatedOrders }
      };
    });
  },
  
  // 重置所有状态
  resetStoreState: () => {
    set({
      storeCards: { data: null, loading: LoadingState.IDLE, error: null },
      storeCardsPagination: { page: 1, size: 20, total: 0, pages: 0 },
      storeCardsFilters: {},
      
      myListedCards: { data: null, loading: LoadingState.IDLE, error: null },
      myListedCardsPagination: { page: 1, size: 20, total: 0, pages: 0 },
      
      orders: { data: null, loading: LoadingState.IDLE, error: null },
      ordersPagination: { page: 1, size: 20, total: 0, pages: 0 },
      ordersFilters: {}
    });
  }
}));