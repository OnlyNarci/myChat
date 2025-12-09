# Narcissus TCG - 集换式卡牌游戏后端

[![FastAPI](https://img.shields.io/badge/FastAPI-0.116.1-green)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.13+-blue)](https://python.org)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)
[![Version](https://img.shields.io/badge/Version-0.8.0-red)](https://github.com)

一个基于FastAPI框架开发的现代化集换式卡牌游戏（TCG）后端系统，采用全异步架构设计，提供高性能的游戏服务支持。

## 🎯 项目特性

- **🚀 全异步架构**：基于FastAPI和asyncio，支持高并发处理
- **🛡️ 安全认证**：集成Argon2密码加密和Session管理
- **📊 ORM支持**：使用Tortoise ORM进行数据库操作
- **🔧 模块化设计**：清晰的分层架构，便于维护和扩展
- **🎮 游戏功能**：完整的卡牌、用户、群组、商店系统
- **📝 日志系统**：完善的日志记录和错误追踪
- **🔍 数据验证**：基于Pydantic的强类型数据校验

## 📋 系统要求

- Python 3.13+
- MySQL 5.7+ 或 8.0+
- 8GB+ RAM（推荐）
- 2GB+ 磁盘空间

## 🚀 快速开始

### 1. 环境准备

```bash
# 克隆项目
git clone <repository-url>
cd narcissus-tcg

# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Linux/Mac
# 或 venv\Scripts\activate  # Windows

# 安装依赖
pip install -i https://mirrors.aliyun.com/pypi/simple/ .
```

### 2. 数据库配置

```sql
-- 创建数据库
CREATE DATABASE IF NOT EXISTS narcissus_tcg
DEFAULT CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

### 3. 配置文件

修改 `app/core/config.py` 中的数据库连接信息：

```python
class Settings:
    DB_HOST: str = "localhost"
    DB_PORT: int = 3306
    DB_USER: str = "root"
    DB_PASSWORD: str = 'your_password'
    DB_NAME: str = "narcissus_tcg"
```

### 4. 数据库迁移

```bash
# 初始化数据库迁移
aerich init -t app.core.config.TORTOISE_ORM_CONFIG

# 创建初始迁移
aerich init-db

# 应用迁移（如有）
aerich upgrade
```

### 5. 初始化数据

```bash
# 导入测试卡牌数据
python tests/insert_cards.py
```

### 6. 启动服务

```bash
# 开发模式
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 或使用内置启动
python app/main.py
```

访问 http://localhost:8000 查看API文档。

## 📁 项目结构

```
workspace/
├── app/                    # 后端主模块
│   ├── api/               # API路由层
│   │   └── v1/           # API v1版本
│   │       ├── endpoints/ # 各功能端点
│   │       └── dependencies/ # 依赖注入
│   ├── core/             # 核心配置
│   │   ├── config.py     # 应用配置
│   │   ├── security.py   # 安全认证
│   │   ├── exceptions.py # 异常处理
│   │   └── middleware.py # 中间件
│   ├── db/               # 数据库层
│   │   ├── models.py     # ORM模型
│   │   └── crud.py       # 数据库操作
│   ├── schemas/          # 数据验证模式
│   │   ├── auth_schemas.py
│   │   ├── card_schemas.py
│   │   └── ...
│   ├── services/         # 业务逻辑层
│   │   ├── user_services/
│   │   ├── card_services/
│   │   ├── store_services/
│   │   └── group_services/
│   └── utils/            # 工具函数
├── frontend/              # 前端静态文件
│   ├── html/            # HTML页面
│   └── js/              # JavaScript文件
├── log/                  # 日志配置
├── tests/               # 测试文件
├── migrations/          # 数据库迁移文件
├── pyproject.toml       # 项目配置
└── README.md           # 项目文档
```

## 🔌 API 接口详细文档

### 📋 API通用说明

#### 认证要求标识
- ✅ 需要登录认证
- ❌ 无需认证

#### 错误响应格式
所有API错误响应都遵循统一的JSON格式：
```json
{
  "success": false,
  "message": "错误描述信息",
  "extra": {}  // 可选的额外信息，仅在特定错误时提供
}
```

#### 常见HTTP状态码
| 状态码 | 含义 | 描述 |
|--------|------|------|
| 200 | Success | 请求成功 |
| 400 | BadRequest | 请求参数错误 |
| 401 | Unauthorized | 用户未登录 |
| 402 | Unregistered | 用户未注册 |
| 403 | Forbidden | 权限不足 |
| 404 | NotFound | 资源不存在 |
| 409 | Conflict | 资源冲突 |
| 422 | InvalidParams | 参数验证失败 |
| 429 | TooManyRequests | 请求过于频繁 |
| 500 | InternalServerError | 服务器内部错误 |
| 1000 | UnExceptError | 未知错误 |

---

### 用户管理接口 (User Endpoints)

#### 认证相关 (Authentication)

| 方法 | 路径 | 描述 | 认证要求 |
|------|------|------|----------|
| GET | `/player/login` | 获取登录页面 | ❌ |
| POST | `/player/login` | 用户登录 | ❌ |
| GET | `/player/signup` | 获取注册页面 | ❌ |
| POST | `/player/signup` | 用户注册 | ❌ |

**登录接口详细信息**

```http
POST /player/login
Content-Type: application/json
```

**请求参数：**
```json
{
  "user_name": "string",  // 用户名，1-16字符
  "password": "string"     // 密码，8-32字符，支持字母数字和!@#$%^&*_.-
}
```

**成功响应 (200)：**
```json
{
  "status": 200,
  "message": "登录成功，页面将在5秒后跳转"
}
```
**设置Cookie：**
```
session_id=<session_id>; Path=/; HttpOnly; SameSite=lax; Max-Age=432000
```

**错误响应：**
- `403 Forbidden` - 用户名或密码错误
- `402 Unregistered` - 用户不存在  
- `403 Forbidden` - 未知用户代理或客户端IP
- `500 InternalServerError` - 服务器错误

**注册接口详细信息**

```http
POST /player/signup
Content-Type: application/json
```

**请求参数：**
```json
{
  "user_name": "string",  // 用户名，1-16字符
  "password": "string",    // 密码，8-32字符
  "email": "string"        // 邮箱地址
}
```

**成功响应 (200)：**
```json
{
  "status": 200,
  "message": "注册成功，即将跳转登录页面"
}
```

**错误响应：**
- `400 BadRequest` - 用户名或邮箱已被使用
- `422 InvalidParams` - 参数验证失败
  - **extra参数说明：**
    ```json
    {
      "errors": "user_name: 用户名不能为空; password: 密码至少包含8个字符"
    }
    ```
- `500 InternalServerError` - 服务器错误

---

#### 个人信息管理 (Profile Management)

| 方法 | 路径 | 描述 | 认证要求 |
|------|------|------|----------|
| GET | `/player/info/me` | 获取个人信息 | ✅ |
| GET | `/player/info/{user_uid}` | 获取指定用户公开信息 | ❌ |
| PUT | `/player/info/me` | 更新个人信息 | ✅ |

**获取个人信息接口**

```http
GET /player/info/me
Cookie: session_id=<session_id>
```

**成功响应 (200)：**
```json
{
  "success": true,
  "message": "success to get self info",
  "self_info": {
    "uid": "string",        // 用户UID
    "name": "string",       // 用户名
    "avatar": "string",     // 头像URL
    "signature": "string",  // 个性签名
    "level": 1,             // 等级
    "email": "string",      // 邮箱
    "exp": 0,               // 经验值
    "byte": 0               // 比特（游戏货币）
  }
}
```

**错误响应：**
- `500 InternalServerError` - 服务器错误

**获取指定用户信息接口**

```http
GET /player/info/{user_uid}
```

**路径参数：**
- `user_uid` (string, max_length=6) - 目标用户UID

**成功响应 (200)：**
```json
{
  "success": true,
  "message": "success to get user info",
  "user_info": {
    "uid": "string",
    "name": "string",
    "avatar": "string",
    "signature": "string",
    "level": 1
  }
}
```

**错误响应：**
- `404 NotFound` - 用户不存在

**更新个人信息接口**

```http
PUT /player/info/me
Content-Type: application/json
Cookie: session_id=<session_id>
```

**请求参数：**
```json
{
  "avatar": "string",     // 头像URL（可选）
  "signature": "string"   // 个性签名（可选）
}
```

**成功响应 (200)：**
```json
{
  "success": true,
  "message": "success to update self info"
}
```

---

#### 好友关系管理 (Friendship Management)

| 方法 | 路径 | 描述 | 认证要求 |
|------|------|------|----------|
| GET | `/player/friendship/under_review` | 获取待处理好友请求 | ✅ |
| POST | `/player/friendship/{request_user_uid}` | 发起好友请求 | ✅ |
| PUT | `/player/friendship/{request_user_uid}` | 处理好友请求 | ✅ |
| DELETE | `/player/friendship/{friend_uid}` | 删除好友关系 | ✅ |

**获取待处理好友请求接口**

```http
GET /player/friendship/under_review
Cookie: session_id=<session_id>
```

**成功响应 (200)：**
```json
{
  "success": true,
  "message": "success in getting waiting accept",
  "waiting_accept": {
    "sent": [           // 我发起的请求
      {
        "uid": "string",
        "name": "string",
        "avatar": "string",
        "message": "string"
      }
    ],
    "received": [        // 我收到的请求
      {
        "uid": "string",
        "name": "string", 
        "avatar": "string",
        "message": "string"
      }
    ]
  }
}
```

**发起好友请求接口**

```http
POST /player/friendship/{request_user_uid}?request_message=string
Cookie: session_id=<session_id>
```

**路径参数：**
- `request_user_uid` (string, max_length=6) - 目标用户UID

**查询参数：**
- `request_message` (string) - 请求附带的留言

**成功响应 (200)：**
```json
{
  "success": true,
  "message": "成功发起好友请求，请等待对方同意。"
}
```
或
```json
{
  "success": true,
  "message": "对方也向你发起了好友请求，2025年12月06日，你们成为了好友。"
}
```

**错误响应：**
- `404 NotFound` - 目标用户不存在
- `403 Forbidden` - 不能对自己发起请求或对方在黑名单中
- `409 Conflict` - 已存在好友关系或已发送请求

**处理好友请求接口**

```http
PUT /player/friendship/{request_user_uid}?is_accepted=boolean
Cookie: session_id=<session_id>
```

**路径参数：**
- `request_user_uid` (string, max_length=6) - 请求者UID

**查询参数：**
- `is_accepted` (boolean) - 是否同意请求

**成功响应 (200)：**
```json
{
  "success": true,
  "message": "2025年12月06日，你和player_name成为了好友。"
}
```

**删除好友关系接口**

```http
DELETE /player/friendship/{friend_uid}
Cookie: session_id=<session_id>
```

**成功响应 (200)：**
```json
{
  "success": true,
  "message": "好友关系已解除"
}
```

---

#### 卡牌管理 (Card Management)

| 方法 | 路径 | 描述 | 认证要求 |
|------|------|------|----------|
| GET | `/player/cards` | 查看个人卡牌收藏 | ✅ |
| POST | `/player/cards` | 抽卡 | ✅ |
| PUT | `/player/cards` | 合成卡牌 | ✅ |
| DELETE | `/player/cards` | 分解卡牌 | ✅ |

**查看卡牌收藏接口**

```http
GET /player/cards?name_in=string&rarity=integer&package=string
Cookie: session_id=<session_id>
```

**查询参数：**
- `name_in` (string, 可选) - 卡牌名称模糊搜索，1-16字符
- `rarity` (integer, 可选) - 稀有度筛选，1-4
- `package` (string, 可选) - 卡包筛选，1-16字符

**成功响应 (200)：**
```json
{
  "success": true,
  "message": "get box success",
  "cards": [
    {
      "card_id": 1,
      "name": "string",
      "image": "string",
      "rarity": 1,
      "package": "base",
      "unlock_level": 1,
      "description": "string"
    }
  ]
}
```

**抽卡接口**

```http
POST /player/cards
Content-Type: application/json
Cookie: session_id=<session_id>
```

**请求参数：**
```json
{
  "package": "string",  // 卡包名称
  "times": 1           // 抽卡次数
}
```

**成功响应 (200)：**
```json
{
  "success": true,
  "message": "pull card success",
  "cards": [
    {
      "card_id": 1,
      "name": "string",
      "image": "string",
      "rarity": 1,
      "package": "base",
      "unlock_level": 1,
      "description": "string"
    }
  ]
}
```

**错误响应：**
- `422 InvalidParams` - 未知的扩展包
- `409 Conflict` - 比特不足
  - **extra参数说明：**
    ```json
    {
      "need_byte": 100
    }
    ```

**合成卡牌接口**

```http
PUT /player/cards
Content-Type: application/json
Cookie: session_id=<session_id>
```

**请求参数：**
```json
{
  "name": "string"  // 要合成的卡牌名称
}
```

**成功响应 (200)：**
```json
{
  "success": true,
  "message": "compose card success"
}
```

**错误响应：**
- `422 InvalidParams` - 未知的卡牌
- `403 Forbidden` - 等级不足或无法合成
  - **extra参数说明（等级不足时）：**
    ```json
    {
      "unlock_level": 10
    }
    ```
- `409 Conflict` - 缺少合成材料
  - **extra参数说明：**
    ```json
    {
      "lack_materials": ["卡牌A", "卡牌B"]
    }
    ```

---

#### 订单管理 (Order Management)

| 方法 | 路径 | 描述 | 认证要求 |
|------|------|------|----------|
| GET | `/player/orders/waiting` | 获取未完成订单 | ✅ |
| POST | `/player/orders/{order_id}` | 完成订单 | ✅ |
| DELETE | `/player/orders/{order_id}` | 删除订单 | ✅ |

**获取未完成订单接口**

```http
GET /player/orders/waiting
Cookie: session_id=<session_id>
```

**成功响应 (200)：**
```json
{
  "success": true,
  "message": "get waiting orders successfully",
  "orders": [
    {
      "order_id": 1,
      "user_id": 1,
      "require": [
        {
          "name": "string",
          "number": 1
        }
      ],
      "price": 100,
      "exp": 50
    }
  ]
}
```

**完成订单接口**

```http
POST /player/orders/{order_id}
Cookie: session_id=<session_id>
```

**路径参数：**
- `order_id` (integer) - 订单ID

**成功响应 (200)：**
```json
{
  "success": true,
  "message": "complete order successfully",
  "exp": 50,
  "byte": 100
}
```

**错误响应：**
- `404 NotFound` - 找不到要交付的订单，可能已经过期
- `409 Conflict` - 订单需要的卡牌不足，无法交付
  - **extra参数说明：**
    ```json
    {
      "lack_cards": ["卡牌A", "卡牌B"]
    }
    ```

---

### 卡牌信息接口 (Card Endpoints)

| 方法 | 路径 | 描述 | 认证要求 |
|------|------|------|----------|
| GET | `/card/info` | 获取卡牌基本信息 | ❌ |
| GET | `/card/materials/compose` | 获取卡牌合成材料 | ❌ |
| GET | `/card/materials/decompose` | 获取卡牌分解材料 | ❌ |

**获取卡牌信息接口**

```http
GET /card/info?card_id=integer
```

**查询参数：**
- `card_id` (integer, required) - 卡牌ID

**成功响应 (200)：**
```json
{
  "success": true,
  "message": "success in query card info",
  "card_info": {
    "card_id": 1,
    "name": "string",
    "image": "string",
    "rarity": 1,
    "package": "base",
    "unlock_level": 1,
    "description": "string"
  }
}
```

**错误响应：**
- `404 NotFound` - 未知卡牌
- `500 InternalServerError` - 服务器错误

**获取卡牌合成材料接口**

```http
GET /card/materials/compose?card_id=integer
```

**查询参数：**
- `card_id` (integer, required) - 卡牌ID

**成功响应 (200)：**
```json
{
  "success": true,
  "message": "success in query card compose materials",
  "compose_materials": [
    {
      "card_id": 1,
      "name": "string",
      "number": 2
    }
  ]
}
```

**错误响应：**
- `404 NotFound` - 未知卡牌
- `500 InternalServerError` - 服务器错误

**获取卡牌分解材料接口**

```http
GET /card/materials/decompose?card_id=integer
```

**查询参数：**
- `card_id` (integer, required) - 卡牌ID

**成功响应 (200)：**
```json
{
  "success": true,
  "message": "success in query card decompose materials",
  "decompose_materials": [
    {
      "card_id": 1,
      "name": "string",
      "number": 1
    }
  ]
}
```

**错误响应：**
- `404 NotFound` - 未知卡牌
- `500 InternalServerError` - 服务器错误

---

### 商店系统接口 (Store Endpoints)

| 方法 | 路径 | 描述 | 认证要求 |
|------|------|------|----------|
| GET | `/store/cards` | 浏览商店卡牌 | ✅ |
| GET | `/store/{store_user_uid}/cards` | 查看好友商店 | ✅ |
| POST | `/store/cards` | 上架卡牌 | ✅ |
| PUT | `/store/cards` | 购买公开卡牌 | ✅ |
| PUT | `/store/{store_user_uid}/cards` | 购买好友卡牌 | ✅ |
| DELETE | `/store/cards` | 下架卡牌 | ✅ |

**浏览商店卡牌接口**

```http
GET /store/cards?package=string&name_in=string&price_le=integer&price_ge=integer
Cookie: session_id=<session_id>
```

**查询参数：**
- `package` (string, 可选) - 卡牌所属扩展包名称，max_length=16
- `name_in` (string, 可选) - 卡牌名称模糊搜索，max_length=16
- `price_le` (integer, 可选) - 价格上限
- `price_ge` (integer, 可选) - 价格下限

**成功响应 (200)：**
```json
{
  "success": true,
  "message": "query card success",
  "cards": [
    {
      "store_id": 1,
      "card_id": 1,
      "name": "string",
      "image": "string",
      "rarity": 1,
      "package": "base",
      "number": 1,
      "price": 100,
      "owner_name": "string",
      "is_publish": true
    }
  ]
}
```

**错误响应：**
- `500 InternalServerError` - 服务器错误

**查看好友商店接口**

```http
GET /store/{store_user_uid}/cards
Cookie: session_id=<session_id>
```

**路径参数：**
- `store_user_uid` (string, max_length=6) - 目标商店玩家UID

**成功响应 (200)：**
```json
{
  "success": true,
  "message": "query friend card success",
  "cards": [
    {
      "store_id": 1,
      "card_id": 1,
      "name": "string",
      "image": "string",
      "rarity": 1,
      "package": "base",
      "number": 1,
      "price": 100,
      "owner_name": "string",
      "is_publish": false
    }
  ]
}
```

**错误响应：**
- `403 Forbidden` - 对方还不是好友，无法查看未公开出售的卡牌
- `404 NotFound` - 未查找到目标玩家
- `500 InternalServerError` - 服务器错误

**上架卡牌接口**

```http
POST /store/cards
Content-Type: application/json
Cookie: session_id=<session_id>
```

**请求参数：**
```json
{
  "card_id": 1,           // 卡牌ID
  "name": "string",        // 卡牌名称（可选）
  "number": 1,             // 上架数量
  "price": 100,            // 售价
  "is_publish": true       // 是否公开出售（可选）
}
```

**成功响应 (200)：**
```json
{
  "success": true,
  "message": "成功上架卡牌"
}
```

**错误响应：**
- `422 InvalidParams` - 要上架的卡牌不存在
- `409 Conflict` - 要上架的卡牌数量不足
- `500 InternalServerError` - 服务器错误

**购买公开卡牌接口**

```http
PUT /store/cards?except_slippage=integer
Content-Type: application/json
Cookie: session_id=<session_id>
```

**查询参数：**
- `except_slippage` (integer, 可选) - 可接受的滑点

**请求参数：**
```json
{
  "store_id": 1,    // 商店ID
  "card_id": 1,     // 卡牌ID
  "number": 1,      // 购买数量
  "price": 100       // 购买单价
}
```

**成功响应 (200)：**
```json
{
  "success": true,
  "message": "购买卡牌成功，消耗比特: 100",
  "cost_byte": 100
}
```

**错误响应：**
- `409 Conflict` - 卡牌已下架或被购买
- `403 Forbidden` - 不能购买自己的卡牌或交易过于频繁
  - **extra参数说明（交易频繁时）：**
    ```json
    {
      "max_trades": 300
    }
    ```
- `409 Conflict` - 比特不足或等级不足
  - **extra参数说明：**
    ```json
    {
      "need_byte": 100,
      "unlock_level": 10
    }
    ```
- `500 InternalServerError` - 服务器错误

**购买好友卡牌接口**

```http
PUT /store/{store_user_uid}/cards
Content-Type: application/json
Cookie: session_id=<session_id>
```

**路径参数：**
- `store_user_uid` (string, max_length=6) - 目标商店玩家UID

**请求参数：**
```json
{
  "store_id": 1,    // 商店ID
  "card_id": 1,     // 卡牌ID
  "number": 1,      // 购买数量
  "price": 100       // 购买单价
}
```

**成功响应 (200)：**
```json
{
  "success": true,
  "message": "购买卡牌成功，花费比特: 100。",
  "cost_byte": 100
}
```

**错误响应：**
- `403 Forbidden` - 对方还不是好友或无法购买自己的卡牌
- `404 NotFound` - 未查找到目标玩家
- `409 Conflict` - 卡牌相关错误或交易限制
- `500 InternalServerError` - 服务器错误

**下架卡牌接口**

```http
DELETE /store/cards
Content-Type: application/json
Cookie: session_id=<session_id>
```

**请求参数：**
```json
{
  "store_id": 1,    // 商店ID
  "card_id": 1,     // 卡牌ID
  "number": 1       // 下架数量
}
```

**成功响应 (200)：**
```json
{
  "success": true,
  "message": "成功下架1张卡牌。",
  "card_to_delist": 1,
  "require_num": 0
}
```

**错误响应：**
- `409 Conflict` - 上架的卡牌已被购买
- `500 InternalServerError` - 服务器错误

---

### 群组系统接口 (Group Endpoints)

#### 基础群组管理 (Base Group Management)

| 方法 | 路径 | 描述 | 认证要求 |
|------|------|------|----------|
| GET | `/groups/others` | 查找符合条件的群聊 | ❌ |
| GET | `/groups/me` | 查看已加入的群聊 | ✅ |
| GET | `/groups/{group_uid}/group_notice` | 查看群公告 | ✅ |
| POST | `/groups/members/owner` | 创建群聊 | ✅ |
| POST | `/groups/{group_uid}/members/me` | 加入群聊 | ✅ |
| DELETE | `/groups/{group_uid}/members/me` | 退出群聊 | ✅ |

**查找群聊接口**

```http
GET /groups/others?group_uid=string&name_in=string&level_ge=integer
```

**查询参数：**
- `group_uid` (string, 可选) - 群聊UID，精确查找，max_length=6
- `name_in` (string, 可选) - 群聊名称模糊搜索，max_length=16
- `level_ge` (integer, 可选) - 群聊等级筛选

**成功响应 (200)：**
```json
{
  "success": true,
  "message": "success in getting groups",
  "groups": [
    {
      "uid": "string",
      "name": "string",
      "avatar": "string",
      "signature": "string",
      "tags": ["tag1", "tag2"],
      "level": 1,
      "allow_search": true,
      "join_free": true
    }
  ]
}
```

**错误响应：**
- `500 InternalServerError` - 服务器错误

**查看已加入群聊接口**

```http
GET /groups/me
Cookie: session_id=<session_id>
```

**成功响应 (200)：**
```json
{
  "success": true,
  "message": "success in getting groups",
  "groups": [
    {
      "uid": "string",
      "name": "string",
      "avatar": "string",
      "signature": "string",
      "tags": ["tag1", "tag2"],
      "level": 1,
      "allow_search": true,
      "join_free": true
    }
  ]
}
```

**错误响应：**
- `500 InternalServerError` - 服务器错误

**查看群公告接口**

```http
GET /groups/{group_uid}/group_notice
Cookie: session_id=<session_id>
```

**路径参数：**
- `group_uid` (string, max_length=6) - 群聊UID

**成功响应 (200)：**
```json
{
  "success": true,
  "message": "success in getting group notice",
  "group_notice": [
    {
      "group_uid": "string",
      "user_name": "string",
      "content": "string",
      "message_type": 3,
      "created_at": "2025-12-06T10:00:00"
    }
  ]
}
```

**错误响应：**
- `403 Forbidden` - 您还不在群中，无法查看群公告
- `500 InternalServerError` - 服务器错误

**创建群聊接口**

```http
POST /groups/members/owner
Content-Type: application/json
Cookie: session_id=<session_id>
```

**请求参数：**
```json
{
  "name": "string",        // 群聊名称，max_length=16
  "avatar": "string",      // 群头像URL（可选）
  "signature": "string",    // 群描述（可选）
  "tags": ["tag1"],        // 群标签（可选）
  "allow_search": true,    // 是否允许公开搜索（可选）
  "join_free": true        // 是否允许自由加入（可选）
}
```

**成功响应 (200)：**
```json
{
  "success": true,
  "message": "success in creating group",
  "group_uid": "group123"
}
```

**错误响应：**
- `403 Forbidden` - 每个人只能创建最多3个群聊
  - **extra参数说明：**
    ```json
    {
      "max_groups": 3
    }
    ```
- `500 InternalServerError` - 服务器错误

**加入群聊接口**

```http
POST /groups/{group_uid}/members/me
Cookie: session_id=<session_id>
```

**路径参数：**
- `group_uid` (string, max_length=6) - 目标群聊UID

**成功响应 (200)：**
```json
{
  "success": true,
  "message": "加群请求已发起，等待管理员同意"
}
```

**错误响应：**
- `404 NotFound` - 未找到要加入的群聊
- `403 Forbidden` - 您被禁止加入该群聊
- `409 Conflict` - 您已在群中
- `500 InternalServerError` - 服务器错误

**退出群聊接口**

```http
DELETE /groups/{group_uid}/members/me
Cookie: session_id=<session_id>
```

**成功响应 (200)：**
```json
{
  "success": true,
  "message": "leave group successfully"
}
```

**错误响应：**
- `404 NotFound` - 您已经不在群中了
- `500 InternalServerError` - 服务器错误

---

#### 管理员功能 (Admin Functions)

| 方法 | 路径 | 描述 | 认证要求 |
|------|------|------|----------|
| GET | `/groups/{group_uid}/under_review_members` | 查看待处理入群请求 | ✅ |
| POST | `/groups/{group_uid}/group_message/notice` | 发布群公告 | ✅ |
| PUT | `/groups/{group_uid}/under_review_members/{request_user_uid}` | 处理入群请求 | ✅ |
| PUT | `/groups/{group_uid}/info` | 修改群信息 | ✅ |
| DELETE | `/groups/{group_uid}/members/{member_uid}` | 踢出成员 | ✅ |

**查看待处理入群请求接口**

```http
GET /groups/{group_uid}/under_review_members
Cookie: session_id=<session_id>
```

**成功响应 (200)：**
```json
{
  "success": true,
  "message": "success in get join_request_service",
  "under_review_members": [
    {
      "uid": "string",
      "name": "string",
      "avatar": "string",
      "signature": "string",
      "level": 1
    }
  ]
}
```

**错误响应：**
- `403 Forbidden` - 您不是该群管理员
- `404 NotFound` - 未知的群聊
- `500 InternalServerError` - 服务器错误

**发布群公告接口**

```http
POST /groups/{group_uid}/group_message/notice
Content-Type: application/json
Cookie: session_id=<session_id>
```

**请求体：**
```
群公告内容（纯文本，max_length=1024）
```

**成功响应 (200)：**
```json
{
  "success": true,
  "message": "success in post group notice"
}
```

**错误响应：**
- `403 Forbidden` - 您不是该群管理员
- `404 NotFound` - 未知的群聊
- `500 InternalServerError` - 服务器错误

**处理入群请求接口**

```http
PUT /groups/{group_uid}/under_review_members/{request_user_uid}?is_agree=boolean
Cookie: session_id=<session_id>
```

**成功响应 (200)：**
```json
{
  "success": true,
  "message": "success in agree member request"
}
```

**错误响应：**
- `403 Forbidden` - 您不是该群管理员
- `404 NotFound` - 未找到该入群请求
- `500 InternalServerError` - 服务器错误

**修改群信息接口**

```http
PUT /groups/{group_uid}/info
Content-Type: application/json
Cookie: session_id=<session_id>
```

**请求参数：**
```json
{
  "name": "string",        // 群聊名称（可选）
  "avatar": "string",      // 群头像URL（可选）
  "signature": "string",    // 群描述（可选）
  "tags": ["tag1"],        // 群标签（可选）
  "allow_search": true,    // 是否允许公开搜索（可选）
  "join_free": true        // 是否允许自由加入（可选）
}
```

**成功响应 (200)：**
```json
{
  "success": true,
  "message": "success in modify group info"
}
```

**错误响应：**
- `403 Forbidden` - 您不是该群管理员
- `404 NotFound` - 未知的群聊
- `500 InternalServerError` - 服务器错误

**踢出成员接口**

```http
DELETE /groups/{group_uid}/members/{member_uid}
Cookie: session_id=<session_id>
```

**成功响应 (200)：**
```json
{
  "success": true,
  "message": "玩家player123已被踢出群聊"
}
```

**错误响应：**
- `403 Forbidden` - 权限不足（不是管理员或无法踢出管理员/群主）
- `404 NotFound` - 该玩家不是群成员
- `500 InternalServerError` - 服务器错误

---

#### 群主功能 (Owner Functions)

| 方法 | 路径 | 描述 | 认证要求 |
|------|------|------|----------|
| PUT | `/groups/{group_uid}/member/{member_uid}` | 任命群管理员 | ✅ |
| PUT | `/groups/{group_uid}/admin/{admin_uid}` | 撤职群管理员 | ✅ |
| PUT | `/groups/{group_uid}/owner/{member_uid}` | 转让群主 | ✅ |
| DELETE | `/groups/{group_uid}` | 解散群聊 | ✅ |

**任命群管理员接口**

```http
PUT /groups/{group_uid}/member/{member_uid}
Cookie: session_id=<session_id>
```

**成功响应 (200)：**
```json
{
  "success": true,
  "message": "appoint group admin success"
}
```

**错误响应：**
- `403 Forbidden` - 只有群主才能任命管理员
- `404 NotFound` - 该玩家不是群成员
- `500 InternalServerError` - 服务器错误

**撤职群管理员接口**

```http
PUT /groups/{group_uid}/admin/{admin_uid}
Cookie: session_id=<session_id>
```

**成功响应 (200)：**
```json
{
  "success": true,
  "message": "dismiss group admin success"
}
```

**错误响应：**
- `403 Forbidden` - 只有群主才能撤职管理员
- `404 NotFound` - 该玩家不是群管理
- `500 InternalServerError` - 服务器错误

**转让群主接口**

```http
PUT /groups/{group_uid}/owner/{member_uid}
Cookie: session_id=<session_id>
```

**成功响应 (200)：**
```json
{
  "success": true,
  "message": "transfer group owner success"
}
```

**错误响应：**
- `403 Forbidden` - 只有群主才能转让群主
- `404 NotFound` - 该玩家不是群成员
- `500 InternalServerError` - 服务器错误

**解散群聊接口**

```http
DELETE /groups/{group_uid}
Cookie: session_id=<session_id>
```

**成功响应 (200)：**
```json
{
  "success": true,
  "message": "delete group success"
}
```

**错误响应：**
- `403 Forbidden` - 只有群主才能解散群聊
- `500 InternalServerError` - 服务器错误

---

#### 群聊功能 (Group Chat)

| 方法 | 路径 | 描述 | 认证要求 |
|------|------|------|----------|
| WebSocket | `/groups/{group_uid}/chat` | 群聊WebSocket连接 | ✅ |

**群聊WebSocket接口**

```http
WebSocket /groups/{group_uid}/chat
Cookie: session_id=<session_id>
```

**说明：**
- 建立WebSocket连接进行实时群聊
- 支持文本、图片、链接等消息类型
- 需要提供group_uids列表参数



## 🗄️ 数据模型

### 核心实体

- **User（用户）**：玩家基本信息、等级、经验值、游戏货币
- **Card（卡牌）**：卡牌属性、稀有度、描述、合成材料
- **UserCard（用户卡牌）**：用户拥有的卡牌关系
- **Group（群组）**：游戏群组、成员管理
- **Order（订单）**：商店交易记录
- **Friendship（好友关系）**：用户间好友关系

## 🔧 配置说明

### 应用配置

```python
# app/core/config.py
class Settings:
    PROJECT_NAME: str = "Narcissus TCG"
    PROJECT_VERSION: str = "0.8.0"
    SESSION_EXPIRE_HOURS = 120
    SERVER_PORT: int = 8000
```

### 数据库配置

```python
TORTOISE_ORM_CONFIG = {
    'connections': {
        'default': {
            'engine': 'tortoise.backends.mysql',
            'credentials': {
                'host': settings.DB_HOST,
                'port': settings.DB_PORT,
                # ... 其他配置
            }
        }
    }
}
```

## 🔐 安全特性

- **密码加密**：使用Argon2算法进行密码哈希
- **Session管理**：基于Cookie的会话管理
- **CORS配置**：跨域请求控制
- **输入验证**：Pydantic模型验证
- **SQL注入防护**：ORM参数化查询

## 🧪 测试

```bash
# 运行测试
python -m pytest tests/

# 测试覆盖率
python -m pytest --cov=app tests/
```

## 📊 监控与日志

- **结构化日志**：使用Python logging模块
- **错误追踪**：自定义异常处理
- **请求日志**：中间件记录API访问
- **性能监控**：响应时间记录

## 🚀 部署

### Docker部署

```dockerfile
FROM python:3.13-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 环境变量

```bash
export DB_HOST=localhost
export DB_PORT=3306
export DB_USER=root
export DB_PASSWORD=your_password
export DB_NAME=narcissus_tcg
```

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📝 更新日志

### v0.8.0
- 初始版本发布
- 实现基础用户认证系统
- 完成卡牌管理功能
- 添加商店交易系统
- 实现群组管理功能

## 📄 许可证

本项目采用 GEU GPL v2 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 联系方式

- **主要开发者**：缤纷
- **邮箱**：binfen0403@163.com
- **项目地址**：[GitHub Repository]

## 🙏 致谢

感谢以下开源项目的支持：

- [FastAPI](https://fastapi.tiangolo.com/) - 现代化的Python Web框架
- [Tortoise ORM](https://tortoise.github.io/) - 异步ORM框架
- [Pydantic](https://pydantic-docs.helpmanual.io/) - 数据验证库
- [Uvicorn](https://www.uvicorn.org/) - ASGI服务器

---

⭐ 如果这个项目对你有帮助，请给它一个星标！