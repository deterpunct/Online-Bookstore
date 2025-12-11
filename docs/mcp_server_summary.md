# MCP服务器项目总结

## 项目概述

本项目为E-BookStore在线书店系统创建了一个MCP (Model Context Protocol) 服务器，使AI助手能够直接访问MySQL数据库中的图书信息。

## 文件结构

```
mcp-server/
├── index.js                    # MCP服务器主程序
├── package.json                # Node.js项目配置和依赖
├── test-server.js              # 数据库连接测试脚本
├── .env.example                # 环境变量配置示例
├── .gitignore                  # Git忽略文件
├── README.md                   # 项目说明文档
├── USAGE_GUIDE.md             # 详细使用指南
├── COMPARISON.md              # 使用前后对比说明
└── cherry-studio-config.json.example  # Cherry Studio配置示例
```

## 实现的功能

### 1. 搜索图书 (search_books)
- 根据书名、作者、ISBN或描述进行模糊搜索
- 支持关键词匹配
- 可限制返回结果数量

### 2. 获取图书详情 (get_book_by_id)
- 根据图书ID获取完整信息
- 包含所有字段（标题、作者、价格、库存等）

### 3. 按作者查找 (get_books_by_author)
- 查找指定作者的所有图书
- 支持模糊匹配

### 4. 价格范围查询 (get_books_by_price_range)
- 根据价格范围筛选图书
- 结果按价格排序

### 5. 获取所有图书 (get_all_books)
- 支持分页获取所有图书
- 返回总数和当前页数据

## 技术栈

- **Node.js**: 运行环境
- **@modelcontextprotocol/sdk**: MCP协议SDK
- **mysql2**: MySQL数据库驱动
- **dotenv**: 环境变量管理

## 安装和配置

### 1. 安装依赖
```bash
cd mcp-server
npm install
```

### 2. 配置环境变量
创建 `.env` 文件，配置数据库连接信息。

### 3. 测试连接
```bash
npm test
```

### 4. 在Cherry Studio中配置
参考 `USAGE_GUIDE.md` 中的详细说明。

## 使用效果对比

### 不使用MCP服务器
- ❌ AI无法直接访问数据库
- ❌ 需要用户手动操作
- ❌ 回答不够直接和准确

### 使用MCP服务器
- ✅ AI可以直接访问数据库
- ✅ 实时获取准确数据
- ✅ 提供更好的用户体验

详细对比请参考 `COMPARISON.md`。

## 测试用例

1. **关键词搜索**：搜索包含"Java"的图书
2. **按作者查找**：查找作者"刘慈欣"的所有图书
3. **价格范围查询**：查找价格在50-100元之间的图书
4. **获取详情**：根据ID获取图书完整信息

## 注意事项

1. **路径配置**：在Cherry Studio配置中使用绝对路径
2. **数据库连接**：确保MySQL服务运行且配置正确
3. **权限设置**：数据库用户需要有SELECT权限
4. **环境变量**：敏感信息（如密码）建议使用环境变量

## 后续扩展

可以考虑添加以下功能：
- 图书库存更新
- 图书信息修改
- 统计信息查询
- 订单信息查询
- 用户信息查询

## 参考资料

- [MCP协议文档](https://modelcontextprotocol.io/)
- [Cherry Studio文档](https://cherry.studio/docs)
- [MySQL2文档](https://github.com/sidorares/node-mysql2)

