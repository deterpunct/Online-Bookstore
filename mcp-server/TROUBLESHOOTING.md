# MCP服务器故障排除指南

## 常见问题及解决方案

### 问题1: MCP服务器无法启动

#### 症状
- Cherry Studio显示MCP服务器连接失败
- 运行 `node index.js` 时出现错误

#### 诊断步骤

1. **检查Node.js是否安装**
   ```bash
   node --version
   ```
   应该显示版本号（如 v22.16.0）

2. **检查依赖是否安装**
   ```bash
   npm list --depth=0
   ```
   应该看到：
   - @modelcontextprotocol/sdk
   - mysql2
   - dotenv

3. **如果依赖缺失，重新安装**
   ```bash
   npm install
   ```

4. **测试数据库连接**
   ```bash
   npm test
   ```
   如果测试失败，检查：
   - MySQL服务是否运行
   - `.env` 文件配置是否正确
   - 数据库和表是否已创建

5. **运行调试工具**
   ```bash
   node debug-mcp.js
   ```
   这会测试MCP服务器是否能正常启动

#### 解决方案

**如果Node.js未安装**：
- 下载并安装Node.js: https://nodejs.org/
- 推荐使用LTS版本

**如果依赖缺失**：
```bash
cd mcp-server
npm install
```

**如果数据库连接失败**：
1. 检查MySQL服务是否运行
2. 检查 `.env` 文件中的配置
3. 确保数据库 `bookstore` 已创建
4. 确保 `books` 表存在

---

### 问题2: Cherry Studio无法连接到MCP服务器

#### 症状
- Cherry Studio显示MCP服务器未连接
- 配置文件中已添加MCP服务器配置

#### 诊断步骤

1. **检查配置文件路径**
   - Windows: `%APPDATA%\Cherry Studio\config.json`
   - macOS: `~/Library/Application Support/Cherry Studio/config.json`
   - Linux: `~/.config/cherry-studio/config.json`

2. **检查配置文件格式**
   - 确保是有效的JSON格式
   - 使用JSON验证工具检查语法

3. **检查MCP服务器路径**
   - 必须使用**绝对路径**
   - Windows示例: `E:/online-bookstore/mcp-server/index.js`
   - 不要使用相对路径

4. **检查Node.js路径**
   - 在命令行运行 `where node` (Windows) 或 `which node` (Linux/macOS)
   - 确保配置中使用的是正确的Node.js路径

#### 解决方案

**配置文件示例（Windows）**：
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

**配置文件示例（macOS/Linux）**：
```json
{
  "mcpServers": {
    "bookstore": {
      "command": "node",
      "args": [
        "/Users/username/online-bookstore/mcp-server/index.js"
      ],
      "env": {
        "DB_HOST": "localhost",
        "DB_PORT": "3306",
        "DB_USER": "root",
        "DB_PASSWORD": "your_password",
        "DB_NAME": "bookstore"
      }
    }
  }
}
```

**重要提示**：
- 路径中的斜杠：Windows可以使用 `/` 或 `\\`，但推荐使用 `/`
- 路径不能包含空格（如果包含，需要用引号包裹）
- 确保路径中的每个目录都存在

---

### 问题3: MCP服务器启动但工具无法使用

#### 症状
- Cherry Studio显示MCP服务器已连接
- 但调用工具时没有响应或返回错误

#### 诊断步骤

1. **测试数据库连接**
   ```bash
   npm test
   ```

2. **检查数据库权限**
   - 确保数据库用户有SELECT权限
   - 测试查询: `SELECT * FROM books LIMIT 1;`

3. **检查工具调用**
   - 在Cherry Studio中查看工具调用日志
   - 检查是否有错误信息

#### 解决方案

**如果数据库查询失败**：
1. 检查数据库用户权限
2. 确保 `books` 表存在且有数据
3. 检查 `.env` 文件配置

**如果工具调用失败**：
1. 查看Cherry Studio的错误日志
2. 检查MCP服务器代码是否有语法错误
3. 尝试重启Cherry Studio

---

### 问题4: 环境变量未正确加载

#### 症状
- 数据库连接失败
- 错误信息显示使用默认配置

#### 解决方案

**方法1: 在配置文件中直接指定环境变量**
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

**方法2: 确保.env文件在正确位置**
- `.env` 文件应该在 `mcp-server` 目录下
- 确保文件内容格式正确（没有多余的空格或引号）

---

### 问题5: 路径问题（Windows特殊处理）

#### 症状
- Windows系统上路径解析失败
- 找不到文件错误

#### 解决方案

**使用正斜杠**：
```json
"args": ["E:/online-bookstore/mcp-server/index.js"]
```

**或使用双反斜杠**：
```json
"args": ["E:\\online-bookstore\\mcp-server\\index.js"]
```

**避免使用单反斜杠**（会被转义）

---

## 调试工具使用

### 1. 测试数据库连接
```bash
npm test
```

### 2. 调试MCP服务器
```bash
node debug-mcp.js
```

### 3. 手动测试MCP服务器
```bash
node index.js
```
如果看到 "Bookstore MCP Server running on stdio"，说明服务器启动成功。

---

## 获取帮助

如果以上方法都无法解决问题，请：

1. **收集错误信息**：
   - Cherry Studio的错误日志
   - 命令行运行 `node index.js` 的输出
   - 运行 `npm test` 的输出

2. **检查环境**：
   - Node.js版本: `node --version`
   - 操作系统版本
   - MySQL版本

3. **查看日志**：
   - Cherry Studio日志位置（参考CHERRY_STUDIO_INSTALL.md）
   - 检查是否有相关错误信息

---

## 快速检查清单

在报告问题前，请确认：

- [ ] Node.js已安装且版本 >= 18
- [ ] 依赖包已安装 (`npm install`)
- [ ] MySQL服务正在运行
- [ ] 数据库 `bookstore` 已创建
- [ ] `books` 表存在且有数据
- [ ] `.env` 文件配置正确
- [ ] Cherry Studio配置文件使用绝对路径
- [ ] 配置文件JSON格式正确
- [ ] 已重启Cherry Studio

如果所有项目都已检查，问题仍然存在，请提供详细的错误信息以便进一步诊断。

