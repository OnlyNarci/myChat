/**
 * API类型定义
 * 基于后端API文档中的数据模型定义
 */

// 用户相关类型
export interface User {
  uid: string;
  name: string;
  title: string;
  avatar?: string;
  signature?: string;
  level: number;
}

export interface UserParams {
  uid: string;
  name: string;
  title: string;
  avatar?: string;
  signature?: string;
  level?: number;
}

// 用户自身信息类型（包含邮箱等私有信息）
export interface UserSelfParams extends UserParams {
  email?: string;
  exp?: number;
  byte?: number;
}

// 卡牌相关类型
export interface Card {
  card_id: number;
  name?: string;
  image?: string;
  rarity?: number;
  package?: string;
  unlock_level?: number;
  description?: string;
}

export interface UserCard {
  card_id: number;
  name?: string;
  image?: string;
  rarity?: number;
  package?: string;
  unlock_level?: number;
  description?: string;
  number?: number;
}

export interface UserCardParams {
  card_id: number;
  name?: string;
  image?: string;
  rarity?: number;
  package?: string;
  unlock_level?: number;
  description?: string;
  number?: number;
}

// 商店相关类型
export interface StoreCard {
  card_id: number;
  name?: string;
  image?: string;
  rarity?: number;
  package?: string;
  unlock_level?: number;
  description?: string;
  number: number;
  price: number;
  is_public: boolean;
}

export interface StoreCardParams {
  card_id: number;
  name?: string;
  image?: string;
  rarity?: number;
  package?: string;
  unlock_level?: number;
  description?: string;
  number: number;
  price: number;
  is_public?: boolean;
}

// 登录相关类型
export interface LoginParams {
  user_name: string;
  password: string;
}

export interface RegisterParams {
  user_name: string;
  password: string;
  email: string;
}

// 好友相关类型
export interface Friend {
  uid: string;
  name: string;
  avatar?: string;
  signature?: string;
  level: number;
}

// 订单相关类型
export interface Order {
  order_id: string;
  buyer_uid: string;
  seller_uid: string;
  card_id: number;
  number: number;
  price: number;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

// 群组相关类型
export interface Group {
  uid: string;
  name: string;
  avatar?: string;
  signature?: string;
  tags: string[];
  level: number;
  allow_search: boolean;
  join_free: boolean;
}

export interface GroupSelfParams {
  name: string;
  avatar?: string;
  signature?: string;
  tags?: string[];
  allow_search?: boolean;
  join_free?: boolean;
}

export interface GroupMessage {
  group_uid: string;
  user_name: string;
  content: string;
  message_type: number;
  created_at: string;
}

export interface GroupNotice extends GroupMessage {
  // 群公告就是特殊类型的群消息
}

export interface OrderParams {
  card_id: number;
  number: number;
  price: number;
  seller_uid: string;
}

// 抽卡相关类型
export interface DrawResult {
  cards: UserCard[];
  cost: number;
}

// 合成/分解相关类型
export interface Material {
  card_id: number;
  number: number;
}

export interface CraftParams {
  target_card_id: number;
  materials: Material[];
}

export interface DecomposeParams {
  card_id: number;
  number: number;
}

// 交易记录相关类型
export interface StoreRecord {
  buyer_name: string;
  seller_name: string;
  card_name: string;
  number: number;
  price: number;
  trade_time: string; // ISO datetime string
}

// API响应类型
export interface BaseResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

// 用于兼容没有data字段的响应
export interface SimpleResponse {
  success: boolean;
  message: string;
}

export interface PaginatedResponse<T = any> extends BaseResponse<{
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}> { }

// 用户信息响应类型
export interface UserInfoResponse {
  self_info: UserSelfParams;
}

// 好友请求响应类型
export interface FriendRequestResponse {
  waiting_accept: {
    sent: (Friend & { message: string })[];
    received: (Friend & { message: string })[];
  };
}

// 卡牌列表响应类型
export interface CardsResponse {
  cards: UserCard[];
}

// 订单列表响应类型
export interface OrdersResponse {
  orders: Order[];
}

// 卡牌信息响应类型
export interface CardInfoResponse {
  card_info: Card;
}

// 合成材料响应类型
export interface ComposeMaterialsResponse {
  compose_materials: Material[];
}

// 分解材料响应类型
export interface DecomposeMaterialsResponse {
  decompose_materials: Material[];
}

// 商店卡牌列表响应类型
export interface StoreCardsResponse {
  cards: StoreCard[];
}

// 购买卡牌响应类型
export interface BuyCardResponse {
  cost_byte: number;
}

// 下架卡牌响应类型
export interface DelistCardResponse {
  card_to_delist: number;
  require_num: number;
}

// 群组列表响应类型
export interface GroupsResponse {
  groups: Group[];
}

// 群公告响应类型
export interface GroupNoticeResponse {
  group_notice: GroupNotice[];
}

// 创建群组响应类型
export interface CreateGroupResponse {
  group: string;
}

// 群成员响应类型
export interface GroupMembersResponse {
  under_review_members: User[];
}