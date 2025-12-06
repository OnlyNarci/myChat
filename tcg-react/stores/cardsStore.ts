/**
 * 卡牌状态管理
 */

import { create } from 'zustand';
import { type UserCard, type Card } from '../api';
import { LoadingState, type AsyncResult, type PaginationState, type PaginatedStoreActions } from './types';

// 卡牌状态接口
interface CardsState {
  // 用户卡牌列表
  userCards: AsyncResult<UserCard[]>;
  userCardsPagination: PaginationState;
  
  // 卡牌详情
  cardDetails: Record<number, AsyncResult<Card>>;
  
  // 抽卡结果
  drawResult: AsyncResult<{ cards: UserCard[]; cost: number }>;
  
  // 操作方法
  setUserCardsLoading: (loading: LoadingState) => void;
  setUserCardsError: (error: string | null) => void;
  setUserCardsData: (cards: UserCard[], pagination: PaginationState) => void;
  setUserCardsPagination: (pagination: Partial<PaginationState>) => void;
  setUserCardsPage: (page: number) => void;
  setUserCardsSize: (size: number) => void;
  nextPageUserCards: () => void;
  prevPageUserCards: () => void;
  
  setCardDetailLoading: (cardId: number, loading: LoadingState) => void;
  setCardDetailError: (cardId: number, error: string | null) => void;
  setCardDetailData: (cardId: number, card: Card) => void;
  
  setDrawResultLoading: (loading: LoadingState) => void;
  setDrawResultError: (error: string | null) => void;
  setDrawResultData: (result: { cards: UserCard[]; cost: number }) => void;
  clearDrawResult: () => void;
  
  // 重置所有状态
  resetCardsState: () => void;
}

// 创建卡牌store
export const useCardsStore = create<CardsState>((set, get) => ({
  // 初始状态
  userCards: { data: null, loading: LoadingState.IDLE, error: null },
  userCardsPagination: { page: 1, size: 20, total: 0, pages: 0 },
  cardDetails: {},
  drawResult: { data: null, loading: LoadingState.IDLE, error: null },
  
  // 用户卡牌相关操作
  setUserCardsLoading: (loading: LoadingState) => {
    set(state => ({
      userCards: { ...state.userCards, loading }
    }));
  },
  
  setUserCardsError: (error: string | null) => {
    set(state => ({
      userCards: { ...state.userCards, error, loading: LoadingState.ERROR }
    }));
  },
  
  setUserCardsData: (cards: UserCard[], pagination: PaginationState) => {
    set({
      userCards: { data: cards, loading: LoadingState.SUCCESS, error: null },
      userCardsPagination: pagination
    });
  },
  
  setUserCardsPagination: (pagination: Partial<PaginationState>) => {
    set(state => ({
      userCardsPagination: { ...state.userCardsPagination, ...pagination }
    }));
  },
  
  setUserCardsPage: (page: number) => {
    set(state => ({
      userCardsPagination: { ...state.userCardsPagination, page }
    }));
  },
  
  setUserCardsSize: (size: number) => {
    set(state => ({
      userCardsPagination: { ...state.userCardsPagination, size, page: 1 }
    }));
  },
  
  nextPageUserCards: () => {
    const { userCardsPagination } = get();
    if (userCardsPagination.page < userCardsPagination.pages) {
      set(state => ({
        userCardsPagination: { 
          ...state.userCardsPagination, 
          page: state.userCardsPagination.page + 1 
        }
      }));
    }
  },
  
  prevPageUserCards: () => {
    const { userCardsPagination } = get();
    if (userCardsPagination.page > 1) {
      set(state => ({
        userCardsPagination: { 
          ...state.userCardsPagination, 
          page: state.userCardsPagination.page - 1 
        }
      }));
    }
  },
  
  // 卡牌详情相关操作
  setCardDetailLoading: (cardId: number, loading: LoadingState) => {
    set(state => ({
      cardDetails: {
        ...state.cardDetails,
        [cardId]: { 
          ...(state.cardDetails[cardId] || { data: null, error: null }), 
          loading 
        }
      }
    }));
  },
  
  setCardDetailError: (cardId: number, error: string | null) => {
    set(state => ({
      cardDetails: {
        ...state.cardDetails,
        [cardId]: { 
          ...(state.cardDetails[cardId] || { data: null }), 
          error, 
          loading: LoadingState.ERROR 
        }
      }
    }));
  },
  
  setCardDetailData: (cardId: number, card: Card) => {
    set(state => ({
      cardDetails: {
        ...state.cardDetails,
        [cardId]: { 
          data: card, 
          loading: LoadingState.SUCCESS, 
          error: null 
        }
      }
    }));
  },
  
  // 抽卡结果相关操作
  setDrawResultLoading: (loading: LoadingState) => {
    set(state => ({
      drawResult: { ...state.drawResult, loading }
    }));
  },
  
  setDrawResultError: (error: string | null) => {
    set(state => ({
      drawResult: { ...state.drawResult, error, loading: LoadingState.ERROR }
    }));
  },
  
  setDrawResultData: (result: { cards: UserCard[]; cost: number }) => {
    set({
      drawResult: { data: result, loading: LoadingState.SUCCESS, error: null }
    });
  },
  
  clearDrawResult: () => {
    set({
      drawResult: { data: null, loading: LoadingState.IDLE, error: null }
    });
  },
  
  // 重置所有状态
  resetCardsState: () => {
    set({
      userCards: { data: null, loading: LoadingState.IDLE, error: null },
      userCardsPagination: { page: 1, size: 20, total: 0, pages: 0 },
      cardDetails: {},
      drawResult: { data: null, loading: LoadingState.IDLE, error: null }
    });
  }
}));