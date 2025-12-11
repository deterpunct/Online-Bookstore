# Bookstore MCP Server

这是一个为E-BookStore系统创建的MCP (Model Context Protocol) 服务器，允许AI助手通过标准化的接口查询MySQL数据库中的图书信息。

## 功能特性

- 🔍 **搜索图书**：根据书名、作者、ISBN或关键词进行模糊搜索
- 📖 **获取图书详情**：根据ID获取单本图书的完整信息
- 👤 **按作者查找**：查找指定作者的所有图书
- 💰 **价格范围查询**：根据价格范围筛选图书
- 📚 **获取所有图书**：支持分页获取所有图书列表

## 安装步骤

### 1. 安装依赖

```bash
cd mcp-server
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并修改数据库配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件，设置正确的数据库连接信息：

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=bookstore
```

### 3. 确保数据库运行

确保MySQL数据库正在运行，并且`bookstore`数据库已创建并包含`books`表。

## 在Cherry Studio中配置

### 方法1：通过配置文件

在Cherry Studio的配置文件中添加MCP服务器配置：

```json
{
  "mcpServers": {
    "bookstore": {
      "command": "node",
      "args": ["E:/online-bookstore/mcp-server/index.js"],
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

**注意**：请将路径 `E:/online-bookstore/mcp-server/index.js` 替换为您的实际项目路径。

### 方法2：通过Cherry Studio UI

1. 打开Cherry Studio
2. 进入设置（Settings）
3. 找到MCP服务器配置（MCP Servers）
4. 添加新服务器：
   - **名称**：bookstore
   - **命令**：node
   - **参数**：`["E:/online-bookstore/mcp-server/index.js"]`
   - **环境变量**：
     - `DB_HOST=localhost`
     - `DB_PORT=3306`
     - `DB_USER=root`
     - `DB_PASSWORD=Wangzc830209`
     - `DB_NAME=bookstore`

## 可用工具

### 1. search_books

根据关键词搜索图书。

**参数**：
- `keyword` (必需): 搜索关键词
- `limit` (可选): 返回结果的最大数量，默认10

**示例**：
```
搜索包含"Java"的图书
```

### 2. get_book_by_id

根据ID获取图书详情。

**参数**：
- `id` (必需): 图书ID

**示例**：
```
获取ID为1的图书信息
```

### 3. get_books_by_author

根据作者查找图书。

**参数**：
- `author` (必需): 作者姓名
- `limit` (可选): 返回结果的最大数量，默认20

**示例**：
```
查找作者"刘慈欣"的所有图书
```

### 4. get_books_by_price_range

根据价格范围查找图书。

**参数**：
- `minPrice` (必需): 最低价格
- `maxPrice` (必需): 最高价格
- `limit` (可选): 返回结果的最大数量，默认20

**示例**：
```
查找价格在50到100元之间的图书
```

### 5. get_all_books

获取所有图书列表。

**参数**：
- `limit` (可选): 返回结果的最大数量，默认50
- `offset` (可选): 跳过的记录数，用于分页，默认0

**示例**：
```
获取前10本图书
```

## 测试

启动服务器进行测试：

```bash
npm start
```

服务器将通过stdio进行通信，这是MCP协议的标准方式。

## 故障排除

### 连接数据库失败

- 检查MySQL服务是否运行
- 验证`.env`文件中的数据库配置是否正确
- 确认数据库用户有足够的权限

### 找不到模块

确保已安装所有依赖：

```bash
npm install
```

### 路径问题

在配置MCP服务器时，使用绝对路径而不是相对路径。

## 许可证

MIT

