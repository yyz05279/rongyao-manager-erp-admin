# GitHub Actions 工作流故障排除指南

## 常见错误及解决方案

### 错误 1: upload-artifact v3 已弃用

**错误信息：**
```
Error: This request has been automatically failed because it uses a deprecated version of 
`actions/upload-artifact: v3`
```

**原因：** GitHub 已弃用 v3，需要升级到 v4

**解决方案：**
```yaml
# ❌ 错误
- uses: actions/upload-artifact@v3

# ✅ 正确
- uses: actions/upload-artifact@v4
```

**状态：** ✅ 已修复

---

### 错误 2: 找不到构建文件

**错误信息：**
```
No files were found with the provided path: dist/Haitang*.dmg
```

**原因：** 构建失败或文件路径不正确

**解决方案：**
1. 检查构建步骤是否成功
2. 验证文件路径是否正确
3. 查看 "List build output" 步骤的输出

```yaml
# 添加调试步骤
- name: Debug build output
  run: |
    echo "=== Current directory ==="
    pwd
    echo "=== Directory contents ==="
    ls -la dist/ || echo "dist directory not found"
    echo "=== File search ==="
    find . -name "Haitang*.dmg" -o -name "Haitang*.exe"
```

---

### 错误 3: 构建超时

**错误信息：**
```
The operation timed out because it took longer than 360 minutes
```

**原因：** 构建耗时过长

**解决方案：**
1. 使用 npm ci 而不是 npm install
2. 启用 npm 缓存
3. 减少不必要的步骤

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v3
  with:
    node-version: 16.x
    cache: 'npm'  # 启用缓存

- name: Install dependencies
  run: npm ci  # 使用 ci 而不是 install
```

---

### 错误 4: macOS 公证失败

**错误信息：**
```
Error: Notarization failed with status: Invalid
```

**原因：** Apple ID 或密码不正确，或证书过期

**解决方案：**
1. 验证 GitHub Secrets 中的 APPLE_ID 和 APPLE_PASSWORD
2. 检查 App-specific password 是否有效
3. 确保 APPLE_TEAM_ID 正确

```bash
# 验证 App-specific password
# 访问 https://appleid.apple.com/account/manage
# 生成新的 App-specific password
```

---

### 错误 5: Windows 签名失败

**错误信息：**
```
Error: Code signing certificate not found
```

**原因：** 没有配置代码签名证书

**解决方案：**
1. 如果没有证书，注释掉签名配置
2. 或者添加有效的代码签名证书

```json
{
  "win": {
    "certificateFile": null,
    "certificatePassword": null,
    "sign": null
  }
}
```

---

### 错误 6: 权限被拒绝

**错误信息：**
```
Permission denied: /home/runner/work/repo/.github/workflows/build.yml
```

**原因：** 文件权限问题

**解决方案：**
```bash
# 修复文件权限
chmod +x .github/workflows/*.yml
git add .github/workflows/
git commit -m "fix: update workflow file permissions"
```

---

## 调试技巧

### 1. 启用调试日志

在工作流中添加：
```yaml
- name: Enable debug logging
  run: |
    echo "::debug::This is a debug message"
    echo "RUNNER_DEBUG=true" >> $GITHUB_ENV
```

### 2. 查看完整日志

1. 进入 GitHub Actions
2. 选择失败的工作流
3. 点击 "View all logs"
4. 搜索错误信息

### 3. 本地测试

```bash
# 使用 act 在本地测试工作流
# 安装 act: https://github.com/nektos/act

act push -j build
```

### 4. 临时禁用步骤

```yaml
- name: Build Electron app
  if: false  # 禁用此步骤
  run: npm run electron:build
```

---

## 性能优化

### 1. 缓存优化

```yaml
- name: Cache npm dependencies
  uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-
```

### 2. 并行构建

```yaml
jobs:
  build-mac-intel:
    runs-on: macos-latest
    # ...
  
  build-mac-arm64:
    runs-on: macos-latest
    # ...
  
  build-windows:
    runs-on: windows-latest
    # ...
```

### 3. 减小构建产物

```yaml
- name: Compress artifacts
  run: |
    tar -czf dist.tar.gz dist/
    rm -rf dist/
```

---

## 常见问题 (FAQ)

### Q1: 如何重新运行失败的工作流？

**答：** 
1. 进入 GitHub Actions
2. 选择失败的工作流运行
3. 点击 "Re-run jobs"
4. 选择 "Re-run all jobs" 或 "Re-run failed jobs"

### Q2: 如何查看工作流的详细日志？

**答：**
1. 进入 GitHub Actions
2. 选择工作流运行
3. 点击 "View all logs"
4. 下载日志文件

### Q3: 如何跳过工作流运行？

**答：** 在提交信息中添加 `[skip ci]`：
```bash
git commit -m "docs: update readme [skip ci]"
```

### Q4: 如何限制工作流只在特定分支运行？

**答：**
```yaml
on:
  push:
    branches:
      - main
      - develop
    tags:
      - 'v*'
```

### Q5: 如何设置工作流超时时间？

**答：**
```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    timeout-minutes: 60  # 设置超时为 60 分钟
```

---

## 回滚步骤

如果工作流出现问题，可以回滚到上一个版本：

```bash
# 查看提交历史
git log --oneline .github/workflows/

# 回滚到上一个版本
git revert <commit-hash>

# 或者重置到上一个版本
git reset --hard HEAD~1
```

---

## 获取帮助

1. **查看 GitHub Actions 文档**
   - https://docs.github.com/en/actions

2. **查看 electron-builder 文档**
   - https://www.electron.build/

3. **查看 GitHub 社区讨论**
   - https://github.com/orgs/community/discussions

4. **检查工作流日志**
   - GitHub Actions → 选择工作流 → 查看日志

---

**最后更新**: 2025-12-01
**版本**: 1.0.0

