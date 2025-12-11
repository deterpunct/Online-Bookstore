# ⚠️ 重要：必须重启Cherry Studio

## 问题说明

测试工具 `npm run test-tools` 已经成功运行，说明代码修复是正确的。但是Cherry Studio中仍然出现错误，这是因为：

**Cherry Studio还在使用旧的代码！**

## 解决方案

### 步骤1: 完全关闭Cherry Studio

**重要**：必须完全关闭，不是最小化！

1. **Windows**:
   - 右键点击任务栏中的Cherry Studio图标
   - 选择"关闭窗口"或"退出"
   - 或者使用任务管理器（Ctrl+Shift+Esc）确保进程完全结束

2. **macOS**:
   - 按 Cmd+Q 完全退出
   - 或从菜单选择"退出Cherry Studio"

3. **Linux**:
   - 完全关闭应用程序窗口
   - 检查进程：`ps aux | grep cherry`
   - 如果还有进程，使用 `kill` 命令结束

### 步骤2: 确认代码已更新

检查 `mcp-server/index.js` 文件，确认：
- 第207行附近使用字符串插值：`LIMIT ${limitNum}`
- 不是参数绑定：`LIMIT ?`

### 步骤3: 重新启动Cherry Studio

1. 打开Cherry Studio
2. 等待MCP服务器重新连接
3. 查看MCP服务器状态，确认已连接

### 步骤4: 测试

在Cherry Studio中尝试：

```
搜索"三体"这本书
```

应该能正常工作了。

## 为什么需要重启？

MCP服务器是通过stdio与Cherry Studio通信的。当您修改代码后：
- Cherry Studio已经启动的MCP服务器进程还在运行旧代码
- 只有重启Cherry Studio，才会重新启动MCP服务器进程
- 新的进程才会加载更新后的代码

## 验证修复

如果重启后仍然有问题，运行：

```bash
npm run test-tools
```

如果测试工具成功，但Cherry Studio仍然失败，可能是：
1. Cherry Studio没有完全重启
2. 配置文件路径指向了错误的文件
3. 有多个Cherry Studio实例在运行

## 快速检查清单

- [ ] 完全关闭了Cherry Studio（不是最小化）
- [ ] 确认进程已结束（任务管理器/活动监视器）
- [ ] 重新启动Cherry Studio
- [ ] 等待MCP服务器连接
- [ ] 测试工具调用

如果所有步骤都完成，问题应该就解决了！

