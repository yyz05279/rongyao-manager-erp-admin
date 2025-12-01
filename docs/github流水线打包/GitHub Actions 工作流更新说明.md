# GitHub Actions 工作流更新说明

## 问题描述

GitHub 已弃用 `actions/upload-artifact@v3` 和 `actions/download-artifact@v3`，需要升级到 v4 版本。

**错误信息：**
```
Error: This request has been automatically failed because it uses a deprecated version of 
`actions/upload-artifact: v3`. Learn more: https://github.blog/changelog/2024-04-16-deprecation-notice-v3-of-the-artifact-actions/
```

## 解决方案

### 已更新的文件

1. **build-mac-intel.yml**
   - ✅ `actions/upload-artifact@v3` → `actions/upload-artifact@v4`
   - ✅ 合并校验和上传到同一个 artifact
   - ✅ 添加 `if-no-files-found: warn` 参数

2. **build-mac-arm64.yml**
   - ✅ `actions/upload-artifact@v3` → `actions/upload-artifact@v4`
   - ✅ 合并校验和上传到同一个 artifact
   - ✅ 添加 `if-no-files-found: warn` 参数

3. **build-windows.yml**
   - ✅ `actions/upload-artifact@v3` → `actions/upload-artifact@v4`
   - ✅ 合并校验和上传到同一个 artifact
   - ✅ 添加 `if-no-files-found: warn` 参数

4. **release.yml**
   - ✅ `actions/download-artifact@v3` → `actions/download-artifact@v4`

## 主要变更

### upload-artifact v3 → v4

**v3 写法：**
```yaml
- uses: actions/upload-artifact@v3
  with:
    name: artifact-name
    path: path/to/files
    retention-days: 30
```

**v4 写法：**
```yaml
- uses: actions/upload-artifact@v4
  with:
    name: artifact-name
    path: path/to/files
    retention-days: 30
    if-no-files-found: warn
```

### download-artifact v3 → v4

**v3 写法：**
```yaml
- uses: actions/download-artifact@v3
  with:
    path: artifacts
```

**v4 写法：**
```yaml
- uses: actions/download-artifact@v4
  with:
    path: artifacts
```

## v4 新特性

### 1. 改进的性能
- 更快的上传和下载速度
- 更好的并发处理

### 2. 新增参数
```yaml
if-no-files-found: warn  # 如果找不到文件，显示警告而不是失败
                         # 可选值: warn, error, ignore
```

### 3. 更好的错误处理
- 更清晰的错误消息
- 更好的日志输出

## 优化改进

### 合并 Artifact 上传
之前的方式：
```yaml
- uses: actions/upload-artifact@v3
  with:
    name: macos-intel
    path: dist/Haitang*.dmg

- uses: actions/upload-artifact@v3
  with:
    name: checksums-intel
    path: dist/checksums-intel.txt
```

现在的方式：
```yaml
- uses: actions/upload-artifact@v4
  with:
    name: macos-intel
    path: |
      dist/Haitang*.dmg
      dist/Haitang*.zip
      dist/checksums-intel.txt
```

**优点：**
- ✅ 减少 API 调用
- ✅ 更快的上传速度
- ✅ 更简洁的代码

## 测试步骤

### 1. 提交更新
```bash
git add .github/workflows/
git commit -m "fix: update GitHub Actions artifact actions to v4"
git push origin main
```

### 2. 创建测试标签
```bash
git tag -a v1.0.0-test -m "Test release"
git push origin v1.0.0-test
```

### 3. 监控构建
1. 进入 GitHub 仓库
2. 点击 "Actions" 标签
3. 查看工作流运行状态
4. 检查是否有错误

### 4. 验证 Release
1. 进入 "Releases" 页面
2. 检查是否成功创建 Release
3. 验证所有文件是否上传
4. 下载并测试安装包

## 常见问题

### Q1: 仍然出现 v3 错误

**解决方案：**
1. 清除浏览器缓存
2. 检查是否所有工作流文件都已更新
3. 查看 GitHub Actions 日志中的具体错误

### Q2: 找不到构建产物

**解决方案：**
1. 检查构建是否成功完成
2. 验证文件路径是否正确
3. 查看 GitHub Actions 日志

### Q3: 上传速度慢

**解决方案：**
1. 检查网络连接
2. 减少上传文件大小
3. 使用压缩格式

## 回滚方案

如果需要回滚到 v3（不推荐）：

```yaml
- uses: actions/upload-artifact@v3
  with:
    name: artifact-name
    path: path/to/files
    retention-days: 30
```

**注意：** v3 已被弃用，不建议使用。建议使用 v4。

## 相关链接

- [GitHub Actions 更新日志](https://github.blog/changelog/2024-04-16-deprecation-notice-v3-of-the-artifact-actions/)
- [upload-artifact v4 文档](https://github.com/actions/upload-artifact)
- [download-artifact v4 文档](https://github.com/actions/download-artifact)

## 下一步

1. ✅ 提交更新的工作流文件
2. ✅ 创建测试版本标签
3. ✅ 验证构建成功
4. ✅ 创建正式版本发布

---

**更新时间**: 2025-12-01
**状态**: ✅ 已完成

