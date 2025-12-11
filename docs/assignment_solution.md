# 作业解答：数据库备份与分区 + MCP服务器实现

## A. 理论问题解答

### i. 物理备份和逻辑备份各自的优缺点

详细解答请参考：[database_backup_and_partition.md](./database_backup_and_partition.md#i-物理备份和逻辑备份各自的优缺点)

#### 物理备份

**优点**：
- ✅ 备份和恢复速度快
- ✅ 完整性好
- ✅ 占用空间相对较小
- ✅ 适合大规模数据
- ✅ 支持增量备份

**缺点**：
- ❌ 平台依赖性
- ❌ 可移植性差
- ❌ 可读性差
- ❌ 灵活性低

#### 逻辑备份

**优点**：
- ✅ 可移植性强
- ✅ 平台无关
- ✅ 可读性好
- ✅ 选择性恢复
- ✅ 灵活性高

**缺点**：
- ❌ 备份和恢复速度慢
- ❌ 占用空间大
- ❌ 不适合大规模数据
- ❌ 增量备份困难

### ii. 如果数据文件在一台机器上有足够的存储空间存储，是否还需要进行Partition？为什么？

**答案：即使有足够的存储空间，通常仍然需要进行分区。**

详细解答请参考：[database_backup_and_partition.md](./database_backup_and_partition.md#ii-如果数据文件在一台机器上有足够的存储空间存储是否还需要进行partition为什么)

**主要原因**：
1. **性能优化**：分区裁剪、并行处理、索引效率
2. **维护管理**：数据维护、备份恢复、数据归档
3. **可用性提升**：故障隔离、负载均衡
4. **数据管理**：数据生命周期管理、数据分布

---

## B. MCP服务器实现

### 项目概述

创建了一个MCP (Model Context Protocol) 服务器，使AI助手能够直接访问E-BookStore系统的MySQL数据库，查询图书信息。

### 项目结构

```
mcp-server/
├── index.js                    # MCP服务器主程序
├── package.json                # 项目配置和依赖
├── test-server.js              # 数据库连接测试脚本
├── .env.example                # 环境变量配置示例
├── README.md                   # 项目说明文档
├── USAGE_GUIDE.md             # 详细使用指南
├── COMPARISON.md              # 使用前后对比说明
└── cherry-studio-config.json.example  # Cherry Studio配置示例
```

### 实现的功能

1. **search_books** - 根据关键词搜索图书
2. **get_book_by_id** - 根据ID获取图书详情
3. **get_books_by_author** - 按作者查找图书
4. **get_books_by_price_range** - 根据价格范围查询
5. **get_all_books** - 获取所有图书列表（支持分页）

### 安装步骤

#### 1. 安装依赖

```bash
cd mcp-server
npm install
```

#### 2. 配置环境变量

创建 `.env` 文件：

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=Wangzc830209
DB_NAME=bookstore
```

#### 3. 测试连接

```bash
npm test
```

#### 4. 在Cherry Studio中配置

在Cherry Studio的配置文件中添加：

```json
{
  "mcpServers": {
    "bookstore": {
      "command": "node",
      "args": [
        "E:/online-bookstore/mcp-server/index.js"
      ],
      "env": {
        "DB_HOST": "localhost",
        "DB_PORT": "3306",
        "DB_USER": "root",
        "DB_PASSWORD": "Wangzc830209",
        "DB_NAME": "bookstore"
      }
    }
  }
}
```

**注意**：将路径替换为您的实际项目路径。

详细配置说明请参考：[USAGE_GUIDE.md](../mcp-server/USAGE_GUIDE.md)

### 使用效果对比

#### 不使用MCP服务器

**用户提问**：帮我找一下三体这本书的信息

**AI回答**：
```
抱歉，我无法直接访问您的数据库。要查找《三体》这本书的信息，您需要：
1. 打开浏览器访问您的在线书店系统
2. 在搜索框中输入"三体"
3. 查看搜索结果
```

**特点**：
- ❌ 无法直接访问数据
- ❌ 需要用户手动操作
- ❌ 回答不够直接

#### 使用MCP服务器

**用户提问**：帮我找一下三体这本书的信息

**AI回答**：
```
找到了《三体》这本书的详细信息：

📖 书名：三体
👤 作者：刘慈欣
📚 ISBN：9787536692930
💰 价格：¥68.00
📦 库存：55本
🏢 出版社：重庆出版社

内容简介：中国科幻文学的代表作，讲述了地球文明与三体文明的星际冲突。
```

**特点**：
- ✅ 直接访问数据库
- ✅ 实时准确数据
- ✅ 回答直接完整

详细对比请参考：[COMPARISON.md](../mcp-server/COMPARISON.md)

### 截图说明

#### 截图1：不使用MCP服务器

**截图内容**：
- Cherry Studio界面
- 用户提问："帮我找一下三体这本书的信息"
- AI回答显示无法访问数据库的提示

**标注要点**：
- 标注"无法直接访问数据库"
- 标注"需要手动操作"的提示

#### 截图2：使用MCP服务器

**截图内容**：
- Cherry Studio界面
- 用户提问："帮我找一下三体这本书的信息"
- AI回答显示完整的图书信息
- MCP工具调用日志（如果可见）

**标注要点**：
- 标注完整的图书信息
- 标注MCP工具调用
- 标注数据的准确性

### 测试用例

1. **关键词搜索**：`搜索包含"Java"的图书`
2. **按作者查找**：`查找作者"刘慈欣"的所有图书`
3. **价格范围查询**：`查找价格在50到100元之间的图书`
4. **获取详情**：`获取ID为1的图书信息`

### 技术实现

- **协议**：Model Context Protocol (MCP)
- **语言**：Node.js (JavaScript)
- **数据库**：MySQL
- **SDK**：@modelcontextprotocol/sdk
- **数据库驱动**：mysql2

### 相关文档

- [数据库备份与分区理论解答](./database_backup_and_partition.md)
- [MCP服务器使用指南](../mcp-server/USAGE_GUIDE.md)
- [使用前后对比说明](../mcp-server/COMPARISON.md)
- [MCP服务器项目总结](./mcp_server_summary.md)

---

## 总结

### A部分
- 详细阐述了物理备份和逻辑备份的优缺点
- 解释了即使存储空间充足，仍需要进行分区的原因

### B部分
- 成功实现了MCP服务器
- 提供了5个图书查询工具
- 实现了与MySQL数据库的连接
- 提供了完整的使用文档和配置说明
- 说明了使用MCP服务器前后的显著差异

所有代码和文档已准备就绪，可以直接使用。

