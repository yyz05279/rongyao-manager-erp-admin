# MCP Feedback Enhanced 配置说明

## 📋 问题总结

### 原配置问题

- ❌ 使用本地源码但未安装依赖
- ❌ Python 版本不符（3.9.6 < 要求的 3.11+）
- ❌ 配置使用 `python -m` 无法启动服务
- ❌ **Cursor 不支持 shell 命令链**（`cd && uv run`在 VSCode 中可用，但 Cursor 不支持）

## ✅ 最终解决方案（已应用）

### 当前配置（推荐）

使用启动脚本运行本地源码版本：

```json
{
  "mcpServers": {
    "mcp-feedback-enhanced": {
      "command": "/Users/yyz/Desktop/mcp-feedback-enhanced/start-mcp.sh",
      "args": [],
      "timeout": 600,
      "env": {
        "MCP_DESKTOP_MODE": "true",
        "MCP_WEB_HOST": "127.0.0.1",
        "MCP_WEB_PORT": "8765",
        "MCP_LANGUAGE": "zh-CN",
        "MCP_DEBUG": "false"
      },
      "autoApprove": ["interactive_feedback"]
    }
  }
}
```

### 为什么使用启动脚本？

#### VSCode vs Cursor 差异

- **VSCode MCP 实现**：支持 shell 命令链语法（`cd && uv run`）
- **Cursor MCP 实现**：不支持 shell 命令链，需要使用单个可执行文件
- **解决方案**：创建启动脚本封装命令链

#### 启动脚本优势

- ✅ **跨平台兼容**：在 Cursor 和 VSCode 中都能工作
- ✅ **本地源码**：可以修改和调试源码
- ✅ **虚拟环境**：使用项目自带的 Python 3.11.13 环境
- ✅ **稳定性**：脚本自动处理目录切换和环境激活

## 📝 启动脚本说明

### 主启动脚本（推荐）

**文件路径**: `/Users/yyz/Desktop/mcp-feedback-enhanced/start-mcp.sh`

```bash
#!/bin/bash
# MCP Feedback Enhanced 启动脚本
# 用于 Cursor MCP 配置

# 切换到项目目录
cd "$(dirname "$0")" || exit 1

# 使用 uv 运行 MCP 服务
exec uv run mcp-feedback-enhanced
```

### 备用启动脚本

**文件路径**: `/Users/yyz/Desktop/mcp-feedback-enhanced/start-mcp-venv.sh`

如果 `uv run` 方式有问题，可以使用此备用脚本：

```bash
#!/bin/bash
# 直接使用虚拟环境中的 Python

cd "$(dirname "$0")" || exit 1
exec .venv/bin/python -m mcp_feedback_enhanced
```

**使用备用脚本的配置**：

```json
{
  "mcpServers": {
    "mcp-feedback-enhanced": {
      "command": "/Users/yyz/Desktop/mcp-feedback-enhanced/start-mcp-venv.sh",
      "args": [],
      ...
    }
  }
}
```

## 配置说明

### 核心参数

- **command**: 启动脚本的完整路径
- **args**: 空数组（脚本不需要额外参数）
- **timeout**: `600` - 10 分钟超时

### 环境变量

- **MCP_DESKTOP_MODE**: `"true"` - 启用桌面应用模式（使用原生桌面窗口）
- **MCP_WEB_HOST**: `"127.0.0.1"` - 本地主机
- **MCP_WEB_PORT**: `"8765"` - Web 服务端口
- **MCP_LANGUAGE**: `"zh-CN"` - 界面语言设置为简体中文
- **MCP_DEBUG**: `"false"` - 调试模式（可改为 "true" 查看详细日志）

### 自动批准

- **autoApprove**: `["interactive_feedback"]` - 自动批准反馈工具调用

## 🚀 使用方法

### 1. 重启 Cursor

配置已更新，需要重启 Cursor 以加载新配置：

1. 完全退出 Cursor
2. 重新启动 Cursor
3. 检查 MCP 服务器状态

### 2. 测试服务

在 Cursor 中，MCP 服务会在首次使用时自动启动。你可以：

- 打开 MCP 服务器面板查看状态
- 绿点 🟢 = 服务正常运行
- 红点 🔴 = 服务未运行或配置错误

### 3. 触发反馈工具

在对话中，AI 可以调用 `interactive_feedback` 工具来请求用户反馈，会自动打开反馈窗口。

## 🎯 功能特性

### 桌面应用模式特点

- ✅ 原生桌面窗口体验
- ✅ 支持 Windows、macOS、Linux
- ✅ 完整的中文界面
- ✅ 智能提示词管理
- ✅ 自动定时提交
- ✅ 图片上传支持
- ✅ 会话历史追踪
- ✅ Markdown 渲染

### 快捷键

- `Cmd+Enter` (macOS) / `Ctrl+Enter` (Windows/Linux): 提交反馈
- `Cmd+V` (macOS) / `Ctrl+V` (Windows/Linux): 粘贴图片
- `Cmd+I` (macOS) / `Ctrl+I` (Windows/Linux): 聚焦输入框

## 🔧 故障排查

### 如果服务仍然无法启动

#### 方法 1：检查脚本权限

```bash
# 确保脚本有执行权限
ls -l /Users/yyz/Desktop/mcp-feedback-enhanced/start-mcp.sh

# 如果没有 x 权限，添加执行权限
chmod +x /Users/yyz/Desktop/mcp-feedback-enhanced/start-mcp.sh
```

#### 方法 2：手动测试启动脚本

```bash
# 测试主脚本
/Users/yyz/Desktop/mcp-feedback-enhanced/start-mcp.sh

# 测试备用脚本
/Users/yyz/Desktop/mcp-feedback-enhanced/start-mcp-venv.sh
```

#### 方法 3：查看调试日志

修改配置启用调试模式：

```json
"env": {
  "MCP_DEBUG": "true",
  ...
}
```

#### 方法 4：检查虚拟环境

```bash
cd /Users/yyz/Desktop/mcp-feedback-enhanced

# 检查虚拟环境
ls -la .venv

# 检查 Python 版本
.venv/bin/python --version

# 检查模块安装
.venv/bin/python -c "import mcp_feedback_enhanced"

# 如果模块未安装，重新安装依赖
uv sync
```

## 📚 对比：不同配置方案

### 方案对比表

| 方案                 | VSCode | Cursor | 优点       | 缺点             |
| -------------------- | ------ | ------ | ---------- | ---------------- |
| **Shell 命令链**     | ✅     | ❌     | 简洁       | Cursor 不支持    |
| **启动脚本（当前）** | ✅     | ✅     | 通用、稳定 | 需要额外文件     |
| **uvx @latest**      | ✅     | ✅     | 自动更新   | 不能修改源码     |
| **直接 Python**      | ✅     | ✅     | 简单       | 需要手动管理环境 |

### 配置示例对比

#### ❌ VSCode 可用但 Cursor 不支持

```json
{
  "command": "cd",
  "args": ["/path/to/project", "&&", "uv", "run", "app"]
}
```

#### ✅ 通用方案（推荐）

```json
{
  "command": "/path/to/project/start.sh",
  "args": []
}
```

## 📚 参考资源

- **官方文档**: [GitHub - mcp-feedback-enhanced](https://github.com/Minidoracat/mcp-feedback-enhanced)
- **中文文档**: `/Users/yyz/Desktop/mcp-feedback-enhanced/README.zh-CN.md`
- **配置示例**: `/Users/yyz/Desktop/mcp-feedback-enhanced/examples/`
- **启动脚本**: `/Users/yyz/Desktop/mcp-feedback-enhanced/start-mcp.sh`

## 🔄 版本信息

- **配置方案**: 启动脚本 + 本地源码
- **Python 版本**: 3.11.13 (虚拟环境)
- **uv 版本**: 0.7.15
- **项目状态**: 依赖已安装，模块可用

## 💡 技术说明

### 为什么 Cursor 不支持 shell 命令链？

**MCP 配置差异**：

- **VSCode**: 使用 Node.js `child_process.spawn` 配合 shell 选项
- **Cursor**: 使用更严格的进程启动机制，不支持 shell 特性

**解决原理**：

- 启动脚本本身是一个可执行文件
- Shell 解释器执行脚本内的命令链
- 对 Cursor 来说，只是启动了一个单独的可执行文件

### 启动流程

```
Cursor MCP 配置
    ↓
调用 start-mcp.sh
    ↓
脚本切换到项目目录
    ↓
uv run mcp-feedback-enhanced
    ↓
激活虚拟环境并运行模块
    ↓
MCP 服务启动
```

---

**配置时间**: 2025-10-29  
**更新原因**: 解决 Cursor 不支持 shell 命令链问题  
**解决方案**: 创建启动脚本封装命令
