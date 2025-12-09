/**
 * 商店服务 - 连接API请求与状态管理
 */

import { 
  getStoreCards, 
  addStoreCard, 
  removeStoreCard, 
  buyCard, 
  getMyStoreCards, 
  getOrders, 
  confirmOrder, 
  cancelOrder,
  getBuyRecords,
  getSellRecords
} from '../api';
import { useStoreStore } from '../stores';
import { LoadingState } from '../stores/types';
import { StoreCardParams, OrderParams } from '../api/types';

/**
 * 获取商店卡牌列表服务
 * @param params 查询参数
 * @returns Promise<boolean> 获取是否成功
 */
export const getStoreCardsService = async (params?: {
  page?: number;
  size?: number;
  package?: string;
  rarity?: number;
}): Promise<boolean> => {
  const { 
    setStoreCardsLoading, 
    setStoreCardsError, 
    setStoreCardsData,
    setStoreCardsPagination 
  } = useStoreStore.getState();
  
  try {
    setStoreCardsLoading(LoadingState.LOADING);
    
    const response = await getStoreCards(params);
    
    if (response.code === 200 && response.data) {
      const { items, total, page, size, pages } = response.data;
      
      setStoreCardsData(items, {
        page,
        size,
        total,
        pages
      });
      
      return true;
    } else {
      setStoreCardsError(response.message || '获取商店卡牌列表失败');
      return false;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '获取商店卡牌列表失败';
    setStoreCardsError(errorMessage);
    return false;
  }
};

/**
 * 获取我的上架卡牌服务
 * @param params 查询参数
 * @returns Promise<boolean> 获取是否成功
 */
export const getMyStoreCardsService = async (params?: {
  page?: number;
  size?: number;
}): Promise<boolean> => {
  const { 
    setMyStoreCardsLoading, 
    setMyStoreCardsError, 
    setMyStoreCardsData,
    setMyStoreCardsPagination 
  } = useStoreStore.getState();
  
  try {
    setMyStoreCardsLoading(LoadingState.LOADING);
    
    const response = await getMyStoreCards(params);
    
    if (response.code === 200 && response.data) {
      const { items, total, page, size, pages } = response.data;
      
      setMyStoreCardsData(items, {
        page,
        size,
        total,
        pages
      });
      
      return true;
    } else {
      setMyStoreCardsError(response.message || '获取我的上架卡牌失败');
      return false;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '获取我的上架卡牌失败';
    setMyStoreCardsError(errorMessage);
    return false;
  }
};

/**
 * 获取订单列表服务
 * @param params 查询参数
 * @returns Promise<boolean> 获取是否成功
 */
export const getOrdersService = async (params?: {
  page?: number;
  size?: number;
  status?: number;
}): Promise<boolean> => {
  const { 
    setOrdersLoading, 
    setOrdersError, 
    setOrdersData,
    setOrdersPagination 
  } = useStoreStore.getState();
  
  try {
    setOrdersLoading(LoadingState.LOADING);
    
    const response = await getOrders(params);
    
    if (response.code === 200 && response.data) {
      const { items, total, page, size, pages } = response.data;
      
      setOrdersData(items, {
        page,
        size,
        total,
        pages
      });
      
      return true;
    } else {
      setOrdersError(response.message || '获取订单列表失败');
      return false;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '获取订单列表失败';
    setOrdersError(errorMessage);
    return false;
  }
};

/**
 * 上架卡牌服务
 * @param params 上架参数
 * @returns Promise<boolean> 上架是否成功
 */
export const addStoreCardService = async (params: StoreCardParams): Promise<boolean> => {
  const { setLoading, setError } = useStoreStore.getState();
  
  try {
    setLoading(LoadingState.LOADING);
    
    const response = await addStoreCard(params);
    
    if (response.code === 200) {
      setLoading(LoadingState.SUCCESS);
      // 上架成功后刷新我的上架卡牌列表
      await getMyStoreCardsService();
      return true;
    } else {
      setError(response.message || '上架卡牌失败');
      setLoading(LoadingState.ERROR);
      return false;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '上架卡牌失败';
    setError(errorMessage);
    setLoading(LoadingState.ERROR);
    return false;
  }
};

/**
 * 下架卡牌服务
 * @param id 上架记录ID
 * @returns Promise<boolean> 下架是否成功
 */
export const removeStoreCardService = async (id: number): Promise<boolean> => {
  const { setLoading, setError } = useStoreStore.getState();
  
  try {
    setLoading(LoadingState.LOADING);
    
    const response = await removeStoreCard(id);
    
    if (response.code === 200) {
      setLoading(LoadingState.SUCCESS);
      // 下架成功后刷新我的上架卡牌列表
      await getMyStoreCardsService();
      return true;
    } else {
      setError(response.message || '下架卡牌失败');
      setLoading(LoadingState.ERROR);
      return false;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '下架卡牌失败';
    setError(errorMessage);
    setLoading(LoadingState.ERROR);
    return false;
  }
};

/**
 * 购买卡牌服务
 * @param params 购买参数
 * @returns Promise<boolean> 购买是否成功
 */
export const buyCardService = async (params: OrderParams): Promise<boolean> => {
  const { setLoading, setError } = useStoreStore.getState();
  
  try {
    setLoading(LoadingState.LOADING);
    
    const response = await buyCard(params);
    
    if (response.code === 200) {
      setLoading(LoadingState.SUCCESS);
      // 购买成功后刷新订单列表
      await getOrdersService();
      return true;
    } else {
      setError(response.message || '购买卡牌失败');
      setLoading(LoadingState.ERROR);
      return false;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '购买卡牌失败';
    setError(errorMessage);
    setLoading(LoadingState.ERROR);
    return false;
  }
};

/**
 * 确认订单服务
 * @param id 订单ID
 * @returns Promise<boolean> 确认是否成功
 */
export const confirmOrderService = async (id: number): Promise<boolean> => {
  const { setLoading, setError } = useStoreStore.getState();
  
  try {
    setLoading(LoadingState.LOADING);
    
    const response = await confirmOrder(id);
    
    if (response.code === 200) {
      setLoading(LoadingState.SUCCESS);
      // 确认成功后刷新订单列表
      await getOrdersService();
      return true;
    } else {
      setError(response.message || '确认订单失败');
      setLoading(LoadingState.ERROR);
      return false;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '确认订单失败';
    setError(errorMessage);
    setLoading(LoadingState.ERROR);
    return false;
  }
};

/**
 * 取消订单服务
 * @param id 订单ID
 * @returns Promise<boolean> 取消是否成功
 */
export const cancelOrderService = async (id: number): Promise<boolean> => {
  const { setLoading, setError } = useStoreStore.getState();
  
  try {
    setLoading(LoadingState.LOADING);
    
    const response = await cancelOrder(id);
    
    if (response.code === 200) {
      setLoading(LoadingState.SUCCESS);
      // 取消成功后刷新订单列表
      await getOrdersService();
      return true;
    } else {
      setError(response.message || '取消订单失败');
      setLoading(LoadingState.ERROR);
      return false;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '取消订单失败';
    setError(errorMessage);
    setLoading(LoadingState.ERROR);
    return false;
  }
};

/**
 * 获取购买记录服务
 * @returns Promise<boolean> 获取是否成功
 */
export const getBuyRecordsService = async (): Promise<boolean> => {
  const { setBuyRecordsLoading, setBuyRecordsError, setBuyRecordsData } = useStoreStore.getState();
  
  try {
    setBuyRecordsLoading(LoadingState.LOADING);
    
    const response = await getBuyRecords();
    
    if (response.success && response.data) {
      setBuyRecordsData(response.data.buy_record);
      setBuyRecordsLoading(LoadingState.SUCCESS);
      return true;
    } else {
      setBuyRecordsError(response.message || '获取购买记录失败');
      setBuyRecordsLoading(LoadingState.ERROR);
      return false;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '获取购买记录失败';
    setBuyRecordsError(errorMessage);
    setBuyRecordsLoading(LoadingState.ERROR);
    return false;
  }
};

/**
 * 获取出售记录服务
 * @returns Promise<boolean> 获取是否成功
 */
export const getSellRecordsService = async (): Promise<boolean> => {
  const { setSellRecordsLoading, setSellRecordsError, setSellRecordsData } = useStoreStore.getState();
  
  try {
    setSellRecordsLoading(LoadingState.LOADING);
    
    const response = await getSellRecords();
    
    if (response.success && response.data) {
      setSellRecordsData(response.data.sell_record);
      setSellRecordsLoading(LoadingState.SUCCESS);
      return true;
    } else {
      setSellRecordsError(response.message || '获取出售记录失败');
      setSellRecordsLoading(LoadingState.ERROR);
      return false;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '获取出售记录失败';
    setSellRecordsError(errorMessage);
    setSellRecordsLoading(LoadingState.ERROR);
    return false;
  }
};