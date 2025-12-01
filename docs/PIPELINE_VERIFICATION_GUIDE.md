# 流水线打包修复验证指南

## 快速开始

### 本地验证（推荐）

#### 1. 清理环境
```bash
# 删除缓存的依赖和构建输出
rm -rf node_modules dist out package-lock.json

# 或在Windows上
rmdir /s /q node_modules dist out
del package-lock.json
```

#### 2. 安装依赖
```bash
# 使用改进的npm ci命令
npm ci --prefer-offline --no-audit

# 或使用npm install
npm install
```

#### 3. 验证依赖
```bash
# 检查electron-vite版本
npm list electron-vite

# 应该输出类似：
# electron-vite@1.1.0
```

#### 4. 构建Vue应用
```bash
npm run build:prod
```

#### 5. 验证Vue构建输出
```bash
# 检查是否包含文档文件
find dist -name "*.md" -type f

# 应该返回空（没有文件）
```

#### 6. 构建Electron应用（Windows）
```bash
npm run dist:win
```

#### 7. 运行验证脚本
```bash
# Linux/macOS
bash scripts/verify-build.sh

# Windows
scripts\verify-build.bat
```

### CI/CD验证（GitHub Actions）

#### 1. 创建测试标签
```bash
# 创建新标签
git tag v0.0.2-test-verify

# 推送标签触发流水线
git push origin v0.0.2-test-verify
```

#### 2. 监控构建过程
- 访问 GitHub 仓库
- 点击 "Actions" 标签
- 查看 "Release" 工作流
- 监控 "Build Windows (x86_64)" 任务

#### 3. 验证构建结果
- ✅ 检查 "Checkout code" 步骤是否成功
- ✅ 检查 "Install dependencies" 步骤是否成功
- ✅ 检查 "Build Vue application" 步骤是否成功
- ✅ 检查 "Verify no documentation files in build" 步骤是否成功
- ✅ 检查 "Upload Windows artifacts" 步骤是否成功

#### 4. 下载和检查Artifacts
- 在Actions页面中找到构建任务
- 下载 "windows-x64" artifact
- 检查包含的文件：
  - `Haitang-*.exe` (安装程序)
  - `Haitang-*-portable.exe` (便携版)
  - `checksums-windows.txt` (校验和)

## 详细验证清单

### Git Checkout 验证
- [ ] 能够成功checkout标签
- [ ] 没有文件名非法字符错误
- [ ] 所有源代码文件都已检出

### 依赖安装验证
- [ ] npm ci 命令成功完成
- [ ] electron-vite 版本正确
- [ ] 没有版本冲突错误
- [ ] node_modules 目录创建成功

### Vue构建验证
- [ ] `npm run build:prod` 成功完成
- [ ] dist 目录创建成功
- [ ] 没有编译错误
- [ ] dist 目录中不包含 .md 文件

### Electron构建验证
- [ ] `npm run dist:win` 成功完成
- [ ] 生成了 .exe 文件
- [ ] 生成了 .msi 文件
- [ ] 生成了 checksums-windows.txt 文件

### 文件内容验证
```bash
# 验证不包含markdown文件
find dist -name "*.md" -type f
# 应该返回空

# 验证不包含测试文件
find dist -name "*.test.js" -o -name "*.spec.js"
# 应该返回空

# 验证包含可执行文件
find dist -name "Haitang*.exe" -o -name "Haitang*.msi"
# 应该返回文件列表

# 验证包含checksum文件
cat dist/checksums-windows.txt
# 应该显示文件哈希值
```

## 故障排除

### 问题1: Git Checkout 失败
**症状**：
```
Error: invalid path 'src/views/erp/saltprocess/records/binary/...'
```

**解决方案**：
1. 确认已删除包含非法字符的文件
2. 运行 `git status` 检查是否有未提交的更改
3. 清理git缓存：`git clean -fd`

### 问题2: npm 安装失败
**症状**：
```
npm ERR! notarget No matching version found for electron-vite@^1.1.0
```

**解决方案**：
1. 清理npm缓存：`npm cache clean --force`
2. 删除 package-lock.json：`rm package-lock.json`
3. 重新安装：`npm install`
4. 检查package.json中的版本号

### 问题3: 构建包含文档文件
**症状**：
```
find dist -name "*.md" -type f
# 返回文件列表
```

**解决方案**：
1. 检查 electron-builder.yml 的 files 配置
2. 检查 electron-builder.json 的 files 配置
3. 确保排除规则正确
4. 清理dist目录重新构建

### 问题4: 可执行文件未生成
**症状**：
```
find dist -name "Haitang*.exe"
# 返回空
```

**解决方案**：
1. 检查Electron构建日志
2. 确保Vue应用构建成功
3. 检查 electron-builder 配置
4. 运行 `npm run dist:win` 查看详细错误

## 性能指标

### 预期的构建时间
- npm install: 2-5 分钟
- Vue构建: 1-2 分钟
- Electron构建: 3-5 分钟
- 总计: 6-12 分钟

### 预期的文件大小
- Haitang-*.exe: 150-200 MB
- Haitang-*-portable.exe: 150-200 MB
- 总计: 300-400 MB

### 预期的文件数量
- dist 目录文件数: < 1000
- 不包含任何 .md 文件
- 不包含任何测试文件

## 回滚计划

如果需要回滚到之前的配置：

```bash
# 查看提交历史
git log --oneline

# 回滚到之前的提交
git revert <commit-hash>

# 或重置到之前的提交
git reset --hard <commit-hash>

# 推送更改
git push origin master
```

## 下一步

### 短期任务
- [ ] 验证Windows构建成功
- [ ] 测试生成的exe文件
- [ ] 验证校验和正确性

### 中期任务
- [ ] 恢复macOS构建
- [ ] 测试macOS构建流程
- [ ] 优化构建时间

### 长期任务
- [ ] 添加自动化测试
- [ ] 添加代码质量检查
- [ ] 添加性能监控

## 相关文档

- [PIPELINE_FIX_SUMMARY.md](./PIPELINE_FIX_SUMMARY.md) - 修复总结
- [Electron打包完整指南.md](./Electron打包完整指南.md) - 打包指南
- [github流水线打包](./github流水线打包) - 流水线文档

