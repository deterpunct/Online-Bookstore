# MCP服务器使用指南

## 一、安装和配置

### 1. 安装依赖

```bash
cd mcp-server
npm install
```

### 2. 创建环境变量文件

创建 `.env` 文件（如果不存在），内容如下：

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=Wangzc830209
DB_NAME=bookstore
```

### 3. 测试MCP服务器

在命令行中运行以下命令测试服务器是否正常工作：

```bash
node index.js
```

如果服务器正常启动，应该看到 "Bookstore MCP Server running on stdio" 消息。

## 二、在Cherry Studio中配置MCP服务器

### 步骤1：找到Cherry Studio配置文件

Cherry Studio的配置文件通常位于：
- **Windows**: `%APPDATA%\Cherry Studio\config.json` 或 `%USERPROFILE%\.cherry-studio\config.json`
- **macOS**: `~/Library/Application Support/Cherry Studio/config.json`
- **Linux**: `~/.config/cherry-studio/config.json`

### 步骤2：编辑配置文件

在配置文件中添加MCP服务器配置。配置文件应该是JSON格式，类似这样：

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

**重要提示**：
- 将 `E:/online-bookstore/mcp-server/index.js` 替换为您项目的实际绝对路径
- 确保路径使用正斜杠 `/` 或双反斜杠 `\\`
- 在Windows上，路径可以是 `C:\\path\\to\\mcp-server\\index.js` 或 `C:/path/to/mcp-server/index.js`

### 步骤3：重启Cherry Studio

保存配置文件后，完全关闭并重新启动Cherry Studio，使配置生效。

### 步骤4：验证MCP服务器连接

在Cherry Studio中，您应该能够看到MCP服务器已连接。通常会在界面底部或设置中显示已连接的MCP服务器列表。

## 三、使用MCP服务器查找图书

### 场景1：不使用MCP服务器

**问题**：用户询问"帮我找一下三体这本书的信息"

**AI回答**（不使用MCP）：
```
抱歉，我无法直接访问您的数据库。要查找《三体》这本书的信息，您需要：
1. 打开浏览器访问您的在线书店系统
2. 在搜索框中输入"三体"
3. 查看搜索结果

或者，您可以告诉我数据库的连接信息，我可以帮您编写SQL查询语句。
```

**特点**：
- ❌ AI无法直接访问数据库
- ❌ 需要用户手动操作
- ❌ 无法实时获取数据
- ❌ 回答不够直接和准确

### 场景2：使用MCP服务器

**问题**：用户询问"帮我找一下三体这本书的信息"

**AI回答**（使用MCP）：
```
让我为您查找《三体》这本书的信息。

[调用 search_books 工具，keyword="三体"]

找到了《三体》这本书的信息：

**书名**：三体
**作者**：刘慈欣
**ISBN**：9787536692930
**价格**：¥68.00
**库存**：55本
**出版社**：重庆出版社
**描述**：中国科幻文学的代表作，讲述了地球文明与三体文明的星际冲突。本书获得了世界科幻文学最高奖项雨果奖。

需要我帮您查找其他图书吗？
```

**特点**：
- ✅ AI可以直接访问数据库
- ✅ 实时获取准确数据
- ✅ 回答直接、准确、完整
- ✅ 用户体验更好

## 四、截图对比说明

### 截图1：不使用MCP服务器

**截图内容**：
- 显示Cherry Studio界面
- 用户提问："帮我找一下Java编程思想这本书"
- AI回答显示无法访问数据库，建议用户手动操作

**标注要点**：
- 标注AI回答中的限制说明
- 标注需要用户手动操作的提示

### 截图2：使用MCP服务器

**截图内容**：
- 显示Cherry Studio界面
- 用户提问："帮我找一下Java编程思想这本书"
- AI回答显示完整的图书信息（书名、作者、价格、库存等）
- 显示MCP工具调用日志（如果可见）

**标注要点**：
- 标注AI直接返回的图书信息
- 标注MCP工具调用（如果界面显示）
- 标注数据的完整性和准确性

## 五、测试用例

### 测试用例1：关键词搜索

**用户输入**：
```
搜索包含"Java"的图书
```

**预期结果**：
- 返回所有书名、作者或描述中包含"Java"的图书
- 显示每本书的详细信息

### 测试用例2：按作者查找

**用户输入**：
```
查找作者"刘慈欣"的所有图书
```

**预期结果**：
- 返回刘慈欣的所有图书
- 至少包含《三体》

### 测试用例3：价格范围查询

**用户输入**：
```
查找价格在50到100元之间的图书
```

**预期结果**：
- 返回价格在指定范围内的所有图书
- 按价格从低到高排序

### 测试用例4：获取图书详情

**用户输入**：
```
获取ID为1的图书信息
```

**预期结果**：
- 返回ID为1的图书的完整信息
- 包含所有字段（标题、作者、ISBN、描述、价格、库存等）

## 六、常见问题

### Q1: MCP服务器无法启动

**解决方案**：
1. 检查Node.js是否已安装：`node --version`
2. 检查依赖是否已安装：`npm install`
3. 检查数据库连接配置是否正确
4. 检查数据库服务是否运行

### Q2: Cherry Studio无法连接到MCP服务器

**解决方案**：
1. 检查配置文件路径是否正确
2. 使用绝对路径而不是相对路径
3. 检查Node.js可执行文件路径
4. 查看Cherry Studio的错误日志

### Q3: 查询结果为空

**解决方案**：
1. 检查数据库是否包含数据
2. 检查数据库连接是否正常
3. 尝试使用 `get_all_books` 工具查看是否有数据

### Q4: 权限错误

**解决方案**：
1. 确保数据库用户有SELECT权限
2. 检查数据库用户密码是否正确
3. 确保数据库名称正确

## 七、高级配置

### 使用环境变量文件

如果不想在配置文件中硬编码密码，可以：

1. 在MCP服务器目录创建 `.env` 文件
2. 在配置文件中只指定环境变量文件路径（如果Cherry Studio支持）

### 日志调试

在 `index.js` 中添加更多日志输出：

```javascript
console.error('Database query:', query);
console.error('Query parameters:', params);
```

这些日志会输出到stderr，可以在Cherry Studio的日志中查看。

## 八、总结

使用MCP服务器后，AI助手可以：
- ✅ 直接访问数据库
- ✅ 实时获取准确的图书信息
- ✅ 提供更好的用户体验
- ✅ 减少用户的手动操作

这使得AI助手能够真正成为用户的智能助手，而不仅仅是提供建议的工具。

