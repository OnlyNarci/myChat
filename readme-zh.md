# 测试注册登录接口

**状态**：仅限开发环境
<br>
**版本**：0.8.0
<br>
**所有权**：缤纷
<br>
**主要开发**：缤纷
<br>
**联系方式**：binfen0403@163.com
<br>
**git地址**: 
<br>

示例注册和登录接口

## 项目特性

- **全代码异步**：全项目模块均使用异步函数，支持协程。
- **轻量级框架**：项目后端使用Fastapi框架开发，更高效便捷。
- **自定义扩展**：提供丰富的插件接口，支持进一步开发。



## 本地部署

1.安装python解释器（推荐版本3.13）、MySQL数据库。

2.配置数据库服务，搭建虚拟环境，安装依赖

```python
pip install -i https://mirrors.aliyun.com/pypi/simple/
```

3.初始化数据库
```sql
-- 创建数据库
CREATE DATABASE IF NOT EXISTS narcissus_tcg
DEFAULT CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

```cmd
-- 创建数据表
aerich init -t app.core.config.TORTOISE_ORM_CONFIG
aerich init-db
```

4.配置信息
修改app.core.config.Settings中的参数，使之符合需求

5.运行./tests/insert_cards.py，添加一些测试用卡牌


## 目录
- [测试注册登录接口](#测试注册登录接口)
  - [目录](#目录)
  - [本地部署](#本地部署)
  - [app](#app)
    - [api](#api)
    - [core](#core)
    - [db](#db)
    - [schemas](#schemas)
    - [services](#services)
    - [utils](#utils)
    - [main.py](#mainpy)
  - [frontend](#fronted)
    - [html](#html)
    - [css](#css)
    - [js](#js)
  - [log](#log)
    - [log_lib](#log_lib)
    - [logging_config](#logging_config)
  - [static](#static)
  - [tests](#tests)


## app
<p>后端模块</p>

### api
<p>api端口</p>

### core
<p>核心配置与安全相关校验，定义了自定义错误和http状态码</p>

### db
<p>数据库操作模块，使用turtoise-orm进行数据库操作</p>

### schemas
<p>参数校验模块，使用pydantic模型</p>

### services
<p>后端服务</p>

### utils
<p>一些小工具</p>

### main.py
<p>服务启动入口，实现了路由创建、路由分发、CORS中间件配置、静态目录挂载和各类错误的返回</p>

### pyproject.toml

项目依赖

## 后端文件模块导入规范
1.导入fastapi、tortoise之外的第三方库
2.导入tortoise模块
3.导入fastapi模块
4.导入内部模块，内部模块遵循如下顺序：app.core - app.db - app.schemas - app.api - app.services - app.utils - log













<style>
/* 基础样式设置 */
body {
    font-size: 1.1rem;
    font-family: 'Inter', 'system-ui', sans-serif;
    line-height: 1.5; /* 修改中文行高为1.5 */
    color: #333;
    max-width: 800px;
    margin: 0 30px;
    padding: 2rem 1rem;
    background-color: #f9f9f9;
}

/* 代码样式 */
code {
    font-family: 'Fira Code', 'Consolas', 'Monaco', monospace;
    font-size: 1.1em;
    background-color: #f5f5f5;
    padding: 0.15rem 0.3rem;
    border-radius: 3px;
    color:rgb(132,49,197);
}

/* 标题样式 - h1 */
h1 {
  font-size: 2.7rem;
  font-family: "Noto Serif SC", "Source Han Serif CN", "宋体", serif;
  font-weight: 700px;
  font-weight: 700;
  color: #222;
  margin-top: 3rem;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #eee;
  letter-spacing: -0.02em;
}

/* 标题样式 - h2 */
h2 {
  font-size: 2.4rem;
  font-weight: 600;
  color: #004386;
  font-family: "楷体", "Microsoft YaHei", sans-serif;
  margin-top: 1.8rem;
  margin-bottom: 1.25rem;
  padding-bottom: 0.3rem;
  border-bottom: 1px solid #eee;
  letter-spacing: -0.01em;
}

/* 标题样式 - h3 */
h3 {
  font-size: 1.8rem;
  font-weight: 500;
  color:rgb(30, 149, 66);
  font-family: "Noto Serif SC", "Source Han Serif CN", "宋体", serif;
  margin-top: 2rem;
  margin-bottom: 1rem;
}

/* 标题样式 - h4 */
h4 {
    font-size: 1.6rem;
    font-family: 'Cambria', 'Georgia', serif; /* 使用更具风格的衬线字体 */
    font-weight: 500;
    color: #444;
    margin-top: 1.5rem;
    margin-bottom: 0.75rem;
}

/* 段落样式 */
body > p {
    margin-bottom: 1.25rem;
    text-align: justify;
}

/* 链接样式 */
a {
    color: #165DFF;
    text-decoration: none;
    transition: all 0.2s ease;
    border-bottom: 1px solid transparent;
}

a:hover {
    color: #0E42B3;
    border-bottom-color: #0E42B3;
}

/* 强调样式 */
strong {
    font-weight: 600;
    color: #222;
}

em {
    font-style: italic;
    color: #444;
}

/* 列表样式 */
ul, ol {
    margin-bottom: 1.25rem;
    padding-left: 1.5rem;
}

ul {
    list-style-type: disc;
}

ol {
    list-style-type: decimal;
}

li {
    margin-bottom: 0.5rem;
}

/* 引用样式 */
blockquote {
    border-left: 4px solid #ddd;
    padding-left: 1rem;
    margin-left: 0;
    margin-bottom: 1.25rem;
    color: #666;
    font-style: italic;
}



pre {
    font-size: 1.1rem;
    background-color: #2b2b2b; /* 修改代码块背景色 */
    padding: 0.2rem;
    border-radius: 5px;
    overflow-x: auto;
    margin-bottom: 1.25rem;
}

pre code {
    background-color: transparent;
    padding: 0;
    color: #abb2bf;
    font-size: 1.1rem;
}

/* 表格样式 */
table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 1.25rem;
}

th, td {
    padding: 0.75rem;
    border: 1px solid #ddd;
}

th {
    background-color: #f7f7f7;
    font-weight: 600;
    text-align: left;
}

tr:nth-child(even) {
    background-color: #f9f9f9;
}

/* 响应式设计 */
@media (max-width: 600px) {
    body {
        padding: 1.5rem 1rem;
        font-size: 0.95rem;
    }
    
    h1 {
        font-size: 2rem;
    }
    
    h2 {
        font-size: 1.6rem;
    }
    
    h3 {
        font-size: 1.3rem;
    }
    
    h4 {
        font-size: 1.1rem;
    }
}



</style>