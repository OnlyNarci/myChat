/**
 * 服务层统一导出
 */

// 导出用户服务
export {
  loginService,
  registerService,
  getCurrentUserService,
  updateUserService,
  logoutService
} from './userService';

// 导出卡牌服务
export {
  getUserCardsService,
  getCardInfoService,
  craftCardService,
  decomposeCardService,
  getCraftMaterialsService,
  getDecomposeMaterialsService,
  drawCardsService
} from './cardsService';

// 导出商店服务
export {
  getStoreCardsService,
  getMyStoreCardsService,
  getOrdersService,
  addStoreCardService,
  removeStoreCardService,
  buyCardService,
  confirmOrderService,
  cancelOrderService
} from './storeService';

// 导出好友服务
export {
  getFriendsService,
  searchUsersService,
  getFriendRequestsService,
  sendFriendRequestService,
  acceptFriendRequestService,
  rejectFriendRequestService,
  deleteFriendService
} from './friendsService';