# 如何检查Cherry Studio和MCP服务器是否连接

## 方法1: 在Cherry Studio界面中检查

### 步骤1: 查看MCP服务器状态

1. **打开Cherry Studio**
2. **查找MCP服务器状态指示器**，通常位于：
   - 设置（Settings）页面
   - 侧边栏底部
   - 状态栏
   - 或专门的MCP服务器管理页面

3. **检查状态图标**：
   - ✅ **绿色/已连接**：MCP服务器已成功连接
   - ❌ **红色/未连接**：MCP服务器连接失败
   - ⚠️ **黄色/警告**：连接有问题

### 步骤2: 查看已连接的工具

1. 在Cherry Studio中，查找"工具"或"Tools"选项
2. 应该能看到以下工具（如果连接成功）：
   - `search_books` - 搜索图书
   - `get_book_by_id` - 根据ID获取图书
   - `get_books_by_author` - 按作者查找
   - `get_books_by_price_range` - 价格范围查询
   - `get_all_books` - 获取所有图书

### 步骤3: 测试工具调用

在Cherry Studio的对话界面中提问：

```
帮我找一下三体这本书的信息
```

**如果连接成功**：
- AI会直接调用 `search_books` 工具
- 返回完整的图书信息（书名、作者、价格、库存等）
- 回答中包含从数据库查询到的实时数据

**如果连接失败**：
- AI会提示无法访问数据库
- 或者显示工具调用错误
- 或者没有任何响应

---

## 方法2: 查看Cherry Studio日志

### 找到日志文件位置

**Windows**:
```
%APPDATA%\Cherry Studio\logs\
或
%USERPROFILE%\.cherry-studio\logs\
```

**macOS**:
```
~/Library/Logs/Cherry Studio/
```

**Linux**:
```
~/.config/cherry-studio/logs/
```

### 查看日志内容

1. 打开最新的日志文件
2. 搜索以下关键词：
   - `bookstore` - MCP服务器名称
   - `mcp` - MCP相关日志
   - `error` - 错误信息
   - `connection` - 连接信息

### 成功连接的日志示例

```
[INFO] MCP Server 'bookstore' connected successfully
[INFO] MCP Server 'bookstore' registered 5 tools
```

### 连接失败的日志示例

```
[ERROR] Failed to connect to MCP Server 'bookstore'
[ERROR] Error: spawn node ENOENT
[ERROR] MCP Server 'bookstore' connection timeout
```

---

## 方法3: 检查配置文件

### 找到配置文件

**Windows**:
```
%APPDATA%\Cherry Studio\config.json
或
%USERPROFILE%\.cherry-studio\config.json
```

**macOS**:
```
~/Library/Application Support/Cherry Studio/config.json
```

**Linux**:
```
~/.config/cherry-studio/config.json
```

### 检查配置内容

打开配置文件，确认包含以下内容：

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

**检查要点**：
- ✅ 配置格式正确（有效的JSON）
- ✅ 路径是绝对路径
- ✅ Node.js路径正确
- ✅ 环境变量配置完整

---

## 方法4: 手动测试MCP服务器

### 步骤1: 测试服务器能否启动

在命令行中运行：

```bash
cd mcp-server
node index.js
```

**如果看到**：
```
Bookstore MCP Server running on stdio
```

说明服务器可以正常启动。

**如果看到错误**：
- 检查依赖是否安装：`npm install`
- 检查数据库连接：`npm test`
- 查看错误信息并参考 `TROUBLESHOOTING.md`

### 步骤2: 运行调试工具

```bash
npm run debug
```

这会测试MCP服务器的完整功能。

---

## 方法5: 在对话中直接测试

### 测试查询1: 搜索图书

**提问**：
```
搜索包含"Java"的图书
```

**预期结果（连接成功）**：
```
找到了以下图书：
1. Java编程思想 - Bruce Eckel - ¥108.00
...
```

**预期结果（连接失败）**：
```
抱歉，我无法直接访问数据库...
```

### 测试查询2: 获取图书详情

**提问**：
```
获取ID为1的图书信息
```

**预期结果（连接成功）**：
```
图书ID 1 的详细信息：
书名：Java编程思想
作者：Bruce Eckel
...
```

### 测试查询3: 按作者查找

**提问**：
```
查找作者"刘慈欣"的所有图书
```

**预期结果（连接成功）**：
```
找到了刘慈欣的图书：
- 三体 (¥68.00, 库存55本)
```

---

## 常见连接问题诊断

### 问题1: 配置文件未生效

**症状**：修改配置后，Cherry Studio仍无法连接

**解决方案**：
1. 完全关闭Cherry Studio（不是最小化）
2. 重新启动Cherry Studio
3. 检查配置文件是否保存

### 问题2: 路径错误

**症状**：日志显示"找不到文件"或"ENOENT"错误

**解决方案**：
1. 确认使用绝对路径
2. 检查路径中的每个目录是否存在
3. Windows路径使用 `/` 或 `\\`，不要使用单个 `\`

### 问题3: Node.js未找到

**症状**：日志显示"node: command not found"

**解决方案**：
1. 检查Node.js是否安装：`node --version`
2. 在配置文件中使用完整路径：
   ```json
   "command": "C:/Program Files/nodejs/node.exe"
   ```

### 问题4: 权限问题

**症状**：日志显示权限错误

**解决方案**：
1. 确保有读取配置文件的权限
2. 确保有执行Node.js的权限
3. 在Windows上，可能需要以管理员身份运行Cherry Studio

---

## 快速检查清单

在报告连接问题前，请确认：

- [ ] Cherry Studio已完全重启
- [ ] 配置文件格式正确（有效的JSON）
- [ ] 配置文件路径正确
- [ ] MCP服务器路径是绝对路径
- [ ] Node.js已安装且可执行
- [ ] 依赖包已安装（`npm install`）
- [ ] 数据库连接正常（`npm test`）
- [ ] MCP服务器可以手动启动（`node index.js`）

---

## 如果仍然无法连接

1. **收集信息**：
   - Cherry Studio版本
   - Node.js版本
   - 操作系统版本
   - 配置文件内容（隐藏敏感信息）
   - 错误日志

2. **运行诊断**：
   ```bash
   npm test        # 测试数据库连接
   npm run debug   # 调试MCP服务器
   ```

3. **查看详细故障排除指南**：
   参考 `TROUBLESHOOTING.md` 文件

---

## 成功连接的标志

如果以下所有条件都满足，说明连接成功：

1. ✅ Cherry Studio界面显示MCP服务器已连接
2. ✅ 可以看到5个图书查询工具
3. ✅ 在对话中提问时，AI能直接返回数据库查询结果
4. ✅ 日志中没有错误信息
5. ✅ 工具调用返回正确的数据

如果满足以上条件，恭喜！MCP服务器已成功连接并可以使用了！🎉

