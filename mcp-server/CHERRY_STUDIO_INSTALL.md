# Cherry Studio 获取和安装指南

## 什么是Cherry Studio？

Cherry Studio是一个支持MCP (Model Context Protocol) 协议的桌面应用程序，允许AI助手通过MCP服务器访问外部数据源和工具。

## 获取Cherry Studio

### 方法1：官方网站下载（推荐）

1. **访问官方网站**
   - 网址：https://cherry-ai.com/
   - 或直接访问：https://cherry.studio/

2. **下载安装包**
   - 在首页找到"Download"或"下载"按钮
   - 根据您的操作系统选择对应的版本：
     - **Windows**: `.exe` 安装程序
     - **macOS**: `.dmg` 安装包
     - **Linux**: `.AppImage` 或 `.deb` 包

3. **安装步骤**
   - **Windows**: 双击 `.exe` 文件，按照安装向导完成安装
   - **macOS**: 打开 `.dmg` 文件，将Cherry Studio拖拽到Applications文件夹
   - **Linux**: 
     - `.deb` 包：`sudo dpkg -i cherry-studio.deb`
     - `.AppImage`：添加执行权限后直接运行

### 方法2：GitHub下载

1. **访问GitHub仓库**
   - 网址：https://github.com/CherryHQ/cherry-studio

2. **下载最新版本**
   - 在"Releases"页面找到最新版本
   - 下载对应操作系统的安装包

3. **安装方式同方法1**

## 系统要求

### Windows
- Windows 10 或更高版本
- 64位系统

### macOS
- macOS 10.15 (Catalina) 或更高版本
- Intel 或 Apple Silicon (M1/M2) 芯片

### Linux
- Ubuntu 18.04 或更高版本
- 或其他基于Debian/RedHat的发行版

## 安装后配置

### 1. 首次启动

1. 打开Cherry Studio
2. 如果是首次使用，可能需要：
   - 创建账户或登录
   - 选择AI模型提供商（如OpenAI、Anthropic等）
   - 配置API密钥

### 2. 配置MCP服务器

#### 找到配置文件位置

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

#### 编辑配置文件

在配置文件中添加MCP服务器配置：

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
- 将 `E:/online-bookstore/mcp-server/index.js` 替换为您的实际项目路径
- 使用绝对路径，不要使用相对路径
- Windows路径可以使用 `/` 或 `\\`

#### 重启Cherry Studio

保存配置文件后，完全关闭并重新启动Cherry Studio，使配置生效。

### 3. 验证MCP服务器连接

1. 在Cherry Studio中，查看设置或MCP服务器列表
2. 应该能看到"bookstore"服务器已连接
3. 如果显示连接失败，检查：
   - Node.js是否已安装
   - 配置文件路径是否正确
   - 数据库服务是否运行

## 使用MCP服务器

配置完成后，您可以在Cherry Studio中直接提问：

```
帮我找一下三体这本书的信息
```

AI助手会通过MCP服务器查询数据库并返回结果。

## 常见问题

### Q1: 找不到配置文件？

**A**: 
- 确保Cherry Studio已经启动过至少一次
- 配置文件可能位于不同的位置，尝试搜索 `cherry-studio` 或 `config.json`
- 如果不存在，可以手动创建配置文件

### Q2: 如何手动创建配置文件？

**A**: 
1. 创建配置文件目录（如果不存在）
2. 创建 `config.json` 文件
3. 添加MCP服务器配置（参考上面的示例）
4. 保存并重启Cherry Studio

### Q3: MCP服务器连接失败？

**A**: 检查以下几点：
1. Node.js是否已安装：在命令行运行 `node --version`
2. MCP服务器路径是否正确（使用绝对路径）
3. 数据库服务是否运行
4. 查看Cherry Studio的错误日志

### Q4: 如何查看Cherry Studio的日志？

**A**: 
- **Windows**: `%APPDATA%\Cherry Studio\logs\`
- **macOS**: `~/Library/Logs/Cherry Studio/`
- **Linux**: `~/.config/cherry-studio/logs/`

### Q5: 支持其他MCP客户端吗？

**A**: 是的，MCP是一个开放协议，其他支持MCP的客户端也可以使用：
- Claude Desktop (Anthropic)
- 其他支持MCP的AI助手客户端

## 替代方案

如果无法使用Cherry Studio，您也可以考虑：

1. **Claude Desktop** (Anthropic)
   - 下载：https://claude.ai/download
   - 同样支持MCP协议
   - 配置方式类似

2. **其他MCP客户端**
   - 查看MCP协议官方文档：https://modelcontextprotocol.io/
   - 寻找其他支持MCP的客户端

## 相关链接

- Cherry Studio官网：https://cherry-ai.com/
- Cherry Studio GitHub：https://github.com/CherryHQ/cherry-studio
- MCP协议文档：https://modelcontextprotocol.io/
- 本项目MCP服务器文档：[README.md](./README.md)

## 下一步

安装好Cherry Studio后，请参考：
- [快速开始指南](./QUICKSTART.md) - 5分钟快速配置
- [详细使用指南](./USAGE_GUIDE.md) - 完整的使用说明
- [使用前后对比](./COMPARISON.md) - 了解MCP服务器的优势

