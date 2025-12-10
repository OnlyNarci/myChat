/**
 * API测试文件 - 用于验证新的响应格式
 * 在开发环境中可以使用此文件测试API接口
 */

import { 
  login, 
  register, 
  getCurrentUser, 
  getUserCards,
  getFriendRequests,
  sendFriendRequest,
  getStoreCards
} from '../api';

// 测试函数
export const testAPIs = async () => {
  try {
    console.log('=== 开始测试新API响应格式 ===');
    
    // 测试登录
    console.log('1. 测试登录API...');
    const loginResponse = await login({
      user_name: 'test_user',
      password: 'test_password'
    });
    console.log('登录响应:', loginResponse);
    console.log('登录响应类型检查:', {
      hasSuccess: 'success' in loginResponse,
      hasMessage: 'message' in loginResponse,
      hasData: 'data' in loginResponse
    });

    // 测试获取用户信息
    console.log('\n2. 测试获取用户信息API...');
    try {
      const userResponse = await getCurrentUser();
      console.log('用户信息响应:', userResponse);
      console.log('用户信息响应类型检查:', {
        hasSuccess: 'success' in userResponse,
        hasMessage: 'message' in userResponse,
        hasData: 'data' in userResponse,
        hasSelfInfo: userResponse.data && 'self_info' in userResponse.data
      });
    } catch (error) {
      console.log('获取用户信息失败（可能未登录）:', error);
    }

    // 测试获取卡牌列表
    console.log('\n3. 测试获取卡牌列表API...');
    try {
      const cardsResponse = await getUserCards();
      console.log('卡牌列表响应:', cardsResponse);
      console.log('卡牌列表响应类型检查:', {
        hasSuccess: 'success' in cardsResponse,
        hasMessage: 'message' in cardsResponse,
        hasData: 'data' in cardsResponse,
        hasCards: cardsResponse.data && 'cards' in cardsResponse.data
      });
    } catch (error) {
      console.log('获取卡牌列表失败（可能未登录）:', error);
    }

    // 测试获取好友请求
    console.log('\n4. 测试获取好友请求API...');
    try {
      const friendRequestsResponse = await getFriendRequests();
      console.log('好友请求响应:', friendRequestsResponse);
      console.log('好友请求响应类型检查:', {
        hasSuccess: 'success' in friendRequestsResponse,
        hasMessage: 'message' in friendRequestsResponse,
        hasData: 'data' in friendRequestsResponse,
        hasWaitingAccept: friendRequestsResponse.data && 'waiting_accept' in friendRequestsResponse.data
      });
    } catch (error) {
      console.log('获取好友请求失败（可能未登录）:', error);
    }

    // 测试获取商店卡牌
    console.log('\n5. 测试获取商店卡牌API...');
    try {
      const storeCardsResponse = await getStoreCards();
      console.log('商店卡牌响应:', storeCardsResponse);
      console.log('商店卡牌响应类型检查:', {
        hasSuccess: 'success' in storeCardsResponse,
        hasMessage: 'message' in storeCardsResponse,
        hasData: 'data' in storeCardsResponse,
        hasCards: storeCardsResponse.data && 'cards' in storeCardsResponse.data
      });
    } catch (error) {
      console.log('获取商店卡牌失败:', error);
    }

    console.log('\n=== API测试完成 ===');
  } catch (error) {
    console.error('API测试过程中发生错误:', error);
  }
};

// 只在开发环境中提供全局测试函数
if (import.meta.env.MODE === 'development') {
  (window as any).testAPIs = testAPIs;
  console.log('在控制台中运行 testAPIs() 来测试新的API响应格式');
}