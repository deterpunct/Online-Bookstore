# MCP服务器快速开始指南

## 5分钟快速配置

### 步骤1：安装依赖（1分钟）

```bash
cd mcp-server
npm install
```

### 步骤2：配置数据库（1分钟）

创建 `.env` 文件：

```bash
# Windows (PowerShell)
Copy-Item .env.example .env

# Linux/macOS
cp .env.example .env
```

编辑 `.env` 文件，确保数据库配置正确。

### 步骤3：测试连接（1分钟）

```bash
npm test
```

如果看到 "✅ 所有测试通过！"，说明配置成功。

### 步骤4：配置Cherry Studio（2分钟）

1. 找到Cherry Studio配置文件位置
2. 打开配置文件（通常是JSON格式）
3. 添加以下配置（**记得修改路径**）：

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

**重要**：将 `E:/online-bookstore/mcp-server/index.js` 替换为您的实际路径！

4. 保存配置文件
5. 重启Cherry Studio

### 步骤5：测试使用

在Cherry Studio中提问：

```
帮我找一下三体这本书的信息
```

如果AI能够直接返回图书信息，说明配置成功！

## 常见问题

### Q: 找不到Cherry Studio配置文件？

**A**: 配置文件位置：
- Windows: `%APPDATA%\Cherry Studio\config.json`
- macOS: `~/Library/Application Support/Cherry Studio/config.json`
- Linux: `~/.config/cherry-studio/config.json`

### Q: 测试失败，显示连接错误？

**A**: 检查：
1. MySQL服务是否运行
2. `.env` 文件中的数据库配置是否正确
3. 数据库 `bookstore` 是否已创建
4. `books` 表是否存在

### Q: Cherry Studio无法连接MCP服务器？

**A**: 检查：
1. 配置文件中的路径是否为绝对路径
2. Node.js是否已安装（运行 `node --version` 检查）
3. 路径中的斜杠是否正确（Windows使用 `/` 或 `\\`）

## 需要帮助？

查看详细文档：
- [完整使用指南](./USAGE_GUIDE.md)
- [使用前后对比](./COMPARISON.md)
- [项目README](./README.md)

