/**
 * 卡牌服务 - 连接API请求与状态管理
 */

import { 
  getCardInfo, 
  getUserCards, 
  composeCard, 
  decomposeCard, 
  getCraftMaterials, 
  getDecomposeMaterials, 
  pullCards 
} from '../api';
import { useCardsStore } from '../stores';
import { LoadingState } from '../stores/types';
import type { CraftParams, DecomposeParams } from '../api/types';

/**
 * 获取用户卡牌列表服务
 * @param params 查询参数
 * @returns Promise<boolean> 获取是否成功
 */
export const getUserCardsService = async (params?: {
  name_in?: string;
  rarity?: number;
  package?: string;
}): Promise<boolean> => {
  const { 
    setUserCardsLoading, 
    setUserCardsError, 
    setUserCardsData,
    setUserCardsPagination 
  } = useCardsStore.getState();
  
  try {
    setUserCardsLoading(LoadingState.LOADING);
    
    const response = await getUserCards(params);
    
    if (response.success) {
      const { cards } = response.data;
      
      setUserCardsData(cards, {
        page: 1,
        size: cards.length,
        total: cards.length,
        pages: 1
      });
      
      return true;
    } else {
      setUserCardsError(response.message || '获取卡牌列表失败');
      return false;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '获取卡牌列表失败';
    setUserCardsError(errorMessage);
    return false;
  }
};

/**
 * 获取卡牌详情服务
 * @param cardId 卡牌ID
 * @returns Promise<boolean> 获取是否成功
 */
export const getCardInfoService = async (cardId: number): Promise<boolean> => {
  const { 
    setCardDetailLoading, 
    setCardDetailError, 
    setCardDetailData 
  } = useCardsStore.getState();
  
  try {
    setCardDetailLoading(cardId, LoadingState.LOADING);
    
    const response = await getCardInfo(cardId);
    
    if (response.code === 200 && response.data) {
      setCardDetailData(cardId, response.data);
      return true;
    } else {
      setCardDetailError(cardId, response.message || '获取卡牌详情失败');
      return false;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '获取卡牌详情失败';
    setCardDetailError(cardId, errorMessage);
    return false;
  }
};

/**
 * 合成卡牌服务
 * @param params 合成参数
 * @returns Promise<boolean> 合成是否成功
 */
export const craftCardService = async (params: CraftParams): Promise<boolean> => {
  const { setLoading, setError } = useCardsStore.getState();
  
  try {
    setLoading(LoadingState.LOADING);
    
    const response = await craftCard(params);
    
    if (response.code === 200) {
      setLoading(LoadingState.SUCCESS);
      // 合成成功后刷新卡牌列表
      await getUserCardsService();
      return true;
    } else {
      setError(response.message || '合成卡牌失败');
      setLoading(LoadingState.ERROR);
      return false;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '合成卡牌失败';
    setError(errorMessage);
    setLoading(LoadingState.ERROR);
    return false;
  }
};

/**
 * 分解卡牌服务
 * @param params 分解参数
 * @returns Promise<boolean> 分解是否成功
 */
export const decomposeCardService = async (params: DecomposeParams): Promise<boolean> => {
  const { setLoading, setError } = useCardsStore.getState();
  
  try {
    setLoading(LoadingState.LOADING);
    
    const response = await decomposeCard(params);
    
    if (response.code === 200) {
      setLoading(LoadingState.SUCCESS);
      // 分解成功后刷新卡牌列表
      await getUserCardsService();
      return true;
    } else {
      setError(response.message || '分解卡牌失败');
      setLoading(LoadingState.ERROR);
      return false;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '分解卡牌失败';
    setError(errorMessage);
    setLoading(LoadingState.ERROR);
    return false;
  }
};

/**
 * 获取合成材料列表服务
 * @param cardId 目标卡牌ID
 * @returns Promise<boolean> 获取是否成功
 */
export const getCraftMaterialsService = async (cardId: number): Promise<boolean> => {
  const { 
    setCardDetailLoading, 
    setCardDetailError 
  } = useCardsStore.getState();
  
  try {
    setCardDetailLoading(cardId, LoadingState.LOADING);
    
    const response = await getCraftMaterials(cardId);
    
    if (response.code === 200 && response.data) {
      // 这里可以将合成材料信息存储到卡牌详情中
      // 实际实现可能需要调整数据结构
      return true;
    } else {
      setCardDetailError(cardId, response.message || '获取合成材料失败');
      return false;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '获取合成材料失败';
    setCardDetailError(cardId, errorMessage);
    return false;
  }
};

/**
 * 获取分解材料列表服务
 * @param cardId 目标卡牌ID
 * @returns Promise<boolean> 获取是否成功
 */
export const getDecomposeMaterialsService = async (cardId: number): Promise<boolean> => {
  const { 
    setCardDetailLoading, 
    setCardDetailError 
  } = useCardsStore.getState();
  
  try {
    setCardDetailLoading(cardId, LoadingState.LOADING);
    
    const response = await getDecomposeMaterials(cardId);
    
    if (response.code === 200 && response.data) {
      // 这里可以将分解材料信息存储到卡牌详情中
      // 实际实现可能需要调整数据结构
      return true;
    } else {
      setCardDetailError(cardId, response.message || '获取分解材料失败');
      return false;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '获取分解材料失败';
    setCardDetailError(cardId, errorMessage);
    return false;
  }
};

/**
 * 抽卡服务
 * @param params 抽卡参数
 * @returns Promise<boolean> 抽卡是否成功
 */
export const drawCardsService = async (params: {
  count: number;
  package?: string;
}): Promise<boolean> => {
  const { 
    setDrawResultLoading, 
    setDrawResultError, 
    setDrawResultData 
  } = useCardsStore.getState();
  
  try {
    setDrawResultLoading(LoadingState.LOADING);
    
    const response = await drawCards(params);
    
    if (response.code === 200 && response.data) {
      setDrawResultData(response.data);
      // 抽卡成功后刷新卡牌列表
      await getUserCardsService();
      return true;
    } else {
      setDrawResultError(response.message || '抽卡失败');
      return false;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '抽卡失败';
    setDrawResultError(errorMessage);
    return false;
  }
};