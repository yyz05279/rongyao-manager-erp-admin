# API 路径配置修正总结

## 问题

Electron 应用访问认证接口时收到 404 错误：
```
GET http://42.192.76.234:8080/prod-api/auth/code → 404
```

## 根本原因

后端 AuthController 的 `@RequestMapping` 注解配置的路径是 `/auth`，而不是 `/prod-api/auth`。这意味着 `/prod-api` 是一个多余的路径前缀。

## 修改内容

### 修改前
```
VITE_APP_BASE_API = 'http://42.192.76.234:8080/prod-api'
```

### 修改后
```
VITE_APP_BASE_API = 'http://42.192.76.234:8080'
```

## 影响范围

所有 API 请求都会使用新的基础 URL：

| 端点 | 修改前 | 修改后 |
|------|--------|--------|
| /auth/code | http://42.192.76.234:8080/prod-api/auth/code | http://42.192.76.234:8080/auth/code |
| /system/user/list | http://42.192.76.234:8080/prod-api/system/user/list | http://42.192.76.234:8080/system/user/list |
| /erp/project/list | http://42.192.76.234:8080/prod-api/erp/project/list | http://42.192.76.234:8080/erp/project/list |

## 验证步骤

修改后，在 Electron 应用中测试登录功能：

1. 运行 `npm run dev:electron`
2. 打开 Electron 应用
3. 按 F12 打开开发者工具
4. 查看 Network 标签
5. 尝试登录，确认 API 请求能够正确访问后端服务
6. 验证 `/auth/code` 请求返回 200 而不是 404

## 修改的文件

- `.env.electron` - 更新 VITE_APP_BASE_API 配置

## Git 提交

```
commit 33a49830947850c96c8a4880b6c75b57df624eff
Author: AI Assistant
Date:   2025-11-28

    fix: 修正 Electron 应用 API 基础路径配置
```

## 后续检查

确保后端所有 Controller 的 `@RequestMapping` 路径都不包含 `/prod-api` 前缀：

```java
// ✅ 正确的配置
@RestController
@RequestMapping("/auth")
public class AuthController { }

// ❌ 错误的配置（会导致路径重复）
@RestController
@RequestMapping("/prod-api/auth")
public class AuthController { }
```

## 相关配置文件

- `.env.electron` - Electron 环境配置（已修改）
- `.env.production` - 生产环境配置
- `.env.development` - 开发环境配置
- `electron.vite.config.ts` - Electron Vite 配置

