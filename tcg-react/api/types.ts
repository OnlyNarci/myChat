/**
 * API类型定义
 * 基于后端API文档中的数据模型定义
 */

// 用户相关类型
export interface User {
  uid: string;
  name: string;
  avatar?: string;
  signature?: string;
  level: number;
}

export interface UserParams {
  uid: string;
  name: string;
  avatar?: string;
  signature?: string;
  level?: number;
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
  uid: string;
  password: string;
}

export interface RegisterParams {
  uid: string;
  name: string;
  password: string;
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

// API响应类型
export interface BaseResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

export interface PaginatedResponse<T = any> extends BaseResponse<{
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}> {}