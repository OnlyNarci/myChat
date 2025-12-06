# TCG React 卡牌游戏前端

基于 React + TypeScript + react-konva + Zustand + Vite + Socket.IO 技术栈的卡牌游戏前端项目。

## 技术栈

- **React 19** - 用户界面构建
- **TypeScript** - 类型安全的JavaScript
- **React Router 7** - 路由管理
- **React-Konva** - Canvas图形渲染
- **Zustand** - 状态管理
- **Vite** - 构建工具
- **Socket.IO** - 实时通信
- **Tailwind CSS** - 样式框架
- **Vitest** - 单元测试框架

## 项目结构

```
tcg-react/
├── api/                # API接口定义
│   ├── types.ts        # API数据类型
│   ├── auth.ts         # 认证相关API
│   ├── cards.ts        # 卡牌相关API
│   ├── store.ts        # 商店相关API
│   ├── friends.ts      # 好友相关API
│   └── index.ts        # API统一导出
├── components/         # 组件目录
├── pages/              # 页面目录
├── services/           # 服务层 - 连接API与状态管理
│   ├── userService.ts  # 用户服务
│   ├── cardsService.ts # 卡牌服务
│   ├── storeService.ts # 商店服务
│   ├── friendsService.ts # 好友服务
│   └── index.ts        # 服务统一导出
├── stores/             # 状态管理
│   ├── types.ts        # Store基础类型
│   ├── userStore.ts    # 用户状态
│   ├── cardsStore.ts   # 卡牌状态
│   ├── storeStore.ts   # 商店状态
│   ├── friendsStore.ts # 好友状态
│   └── index.ts        # Store统一导出
├── utils/              # 工具函数
│   ├── api.ts          # API请求封装
│   ├── types.ts        # 通用类型定义
│   └── index.ts        # 工具函数统一导出
├── tests/              # 测试文件
│   ├── setup.ts        # 测试设置
│   ├── utils/          # 工具函数测试
│   ├── stores/         # 状态管理测试
│   └── services/       # 服务层测试
└── public/             # 静态资源
```

## 开发指南

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 类型检查

```bash
npm run typecheck
```

### 运行测试

```bash
# 运行所有测试
npm run test

# 运行测试并生成覆盖率报告
npm run test:coverage

# 运行测试UI界面
npm run test:ui
```

## 架构说明

### API层

API层负责与后端进行通信，包含以下模块：

- **认证API** (`api/auth.ts`): 用户登录、注册、获取用户信息等
- **卡牌API** (`api/cards.ts`): 获取卡牌信息、用户卡牌列表、合成/分解卡牌等
- **商店API** (`api/store.ts`): 商店卡牌列表、上架/下架卡牌、购买卡牌等
- **好友API** (`api/friends.ts`): 好友列表、搜索用户、好友请求等

### 工具层

工具层提供通用的功能和类型定义：

- **API请求封装** (`utils/api.ts`): 封装fetch请求，处理认证、错误处理等
- **类型定义** (`utils/types.ts`): 通用类型定义，如API响应格式、分页等

### 状态管理层

使用Zustand进行状态管理，包含以下store：

- **用户状态** (`stores/userStore.ts`): 用户信息、登录状态、token等
- **卡牌状态** (`stores/cardsStore.ts`): 用户卡牌列表、卡牌详情、抽卡结果等
- **商店状态** (`stores/storeStore.ts`): 商店卡牌列表、我的上架卡牌、订单列表等
- **好友状态** (`stores/friendsStore.ts`): 好友列表、好友请求、搜索结果等

### 服务层

服务层作为API层和状态管理层之间的桥梁，负责：

- 调用API接口
- 处理API响应
- 更新状态管理
- 错误处理

### 组件层

组件层负责UI渲染和用户交互，使用React和React-Konva构建。

## 开发规范

### 代码风格

- 使用TypeScript进行类型安全开发
- 遵循ESLint和Prettier配置
- 组件使用函数式组件和Hooks
- 状态管理使用Zustand

### 提交规范

使用Conventional Commits规范：

- `feat`: 新功能
- `fix`: 修复bug
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

### 测试规范

- 单元测试使用Vitest
- 组件测试使用@testing-library/react
- 测试文件命名规范: `*.test.ts`
- 测试覆盖率要求: >80%

## 部署说明

### 环境变量

创建`.env.production`文件，配置生产环境变量：

```
VITE_API_BASE_URL=https://api.example.com
VITE_SOCKET_URL=https://socket.example.com
```

### 构建部署

```bash
npm run build
npm run start
```

## 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 许可证

本项目采用 MIT 许可证。详情请参阅 [LICENSE](LICENSE) 文件。