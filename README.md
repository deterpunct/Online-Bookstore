<<<<<<< HEAD
# 在线书店系统

## 项目简介
这是一个基于React + Spring Boot的在线书店系统，实现了用户管理、书籍管理、购物车、订单管理等功能。

## 技术栈
- **前端**: React + React Router + Ant Design + Axios
- **后端**: Spring Boot + Spring Security + Spring Data JPA + JWT
- **数据库**: MySQL

## 功能特性
- ✅ 用户管理（登录、注册、角色管理）
- ✅ 书籍管理（增删改查、搜索）
- ✅ 购物车功能
- ✅ 订单管理
- ✅ 统计分析
- ✅ 权限控制

## 项目结构
```
online-bookstore/
├── backend/                 # Spring Boot后端应用
│   ├── src/main/java/com/boostore/
│   │   ├── controller/      # 控制器层
│   │   ├── service/         # 服务层
│   │   ├── repository/      # 数据访问层
│   │   ├── entity/          # 实体类
│   │   ├── dto/             # 数据传输对象
│   │   ├── config/          # 配置类
│   │   └── util/            # 工具类
│   ├── src/main/resources/
│   │   └── application.yml  # 应用配置
│   └── pom.xml              # Maven配置
├── frontend/                # React前端应用
│   ├── src/
│   │   ├── components/      # 组件
│   │   ├── pages/           # 页面
│   │   ├── contexts/        # React上下文
│   │   ├── services/        # API服务
│   │   └── App.js           # 主应用
│   └── package.json         # 依赖配置
└── database/                # 数据库脚本
    └── init.sql             # 初始化脚本
```

## 快速开始

### 环境要求
- Java 11+
- Node.js 14+
- MySQL 8.0+

### 1. 数据库配置
1. 创建MySQL数据库
2. 执行 `database/init.sql` 脚本初始化数据库
3. 修改 `backend/src/main/resources/application.yml` 中的数据库连接信息

### 2. 启动后端服务
```bash
cd backend
mvn spring-boot:run
```
后端服务将在 http://localhost:8080 启动

### 3. 启动前端应用
```bash
cd frontend
npm install
npm start
```
前端应用将在 http://localhost:3000 启动

## 默认账户
- **管理员**: admin / admin123
- **测试用户**: user / user123

## API接口

### 用户相关
- `POST /api/users/register` - 用户注册
- `POST /api/users/login` - 用户登录
- `GET /api/users/current` - 获取当前用户信息
- `GET /api/users` - 获取所有用户（管理员）
- `PUT /api/users/{id}/status` - 更新用户状态（管理员）

### 书籍相关
- `GET /api/books` - 获取所有书籍
- `GET /api/books/{id}` - 获取书籍详情
- `POST /api/books` - 添加书籍（管理员）
- `PUT /api/books/{id}` - 更新书籍（管理员）
- `DELETE /api/books/{id}` - 删除书籍（管理员）
- `GET /api/books/search` - 搜索书籍

## 功能说明

### 用户角色
- **管理员**: 可以管理用户、书籍，查看统计数据
- **顾客**: 可以浏览书籍、购物、查看订单

### 主要功能
1. **用户管理**: 注册、登录、角色区分、用户状态管理
2. **书籍管理**: 书籍的增删改查、搜索功能
3. **购物车**: 添加商品、修改数量、清空购物车
4. **订单管理**: 查看订单历史、订单状态
5. **统计分析**: 热销榜、消费榜、销售统计

## 开发说明

### 后端开发
- 使用Spring Boot 2.7.0
- JPA进行数据持久化
- Spring Security进行安全控制
- JWT进行身份认证

### 前端开发
- 使用React 18
- Ant Design作为UI组件库
- React Router进行路由管理
- Context API进行状态管理

## 部署说明

### 后端部署
```bash
cd backend
mvn clean package
java -jar target/online-bookstore-1.0.0.jar
```

### 前端部署
```bash
cd frontend
npm run build
# 将dist目录部署到Web服务器
```

## 注意事项
1. 确保MySQL服务已启动
2. 检查数据库连接配置
3. 前端开发时需要后端服务运行
4. 生产环境需要配置HTTPS

## 许可证
MIT License 
=======
Download the above folders, and run the following codes to install node_modules:
```
cd frontend/backend/mcp-server
npm ci
```
>>>>>>> 4acecc2b587ae1a295db4c9ce11fba85d98f997e
