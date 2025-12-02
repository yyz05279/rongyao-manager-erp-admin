# Windows CI/CD构建错误修复总结

## 问题描述

### 错误信息
```
[vite:load-fallback] Could not load D:\a\rongyao-manager-erp-admin\rongyao-manager-erp-admin\src/views/erp/saltprocess/records/binary/index.vue (imported by src/router/modules/saltprocess.ts): ENOENT: no such file or directory
```

### 根本原因
GitHub Actions Windows构建流水线（`.github/workflows/build-windows.yml`）中的 `sparse-checkout` 规则错误地排除了 `binary` 文件夹中的所有文件。

### 影响范围
- 路由文件：`src/router/modules/saltprocess.ts` 第408行导入 `binary/index.vue`
- 相关文件：
  - `src/views/erp/saltprocess/records/binary/index.vue`
  - `src/views/erp/saltprocess/records/binary/detail.vue`
  - `src/views/erp/saltprocess/records/binary/components/*`

## 修复方案

### 修改文件
`.github/workflows/build-windows.yml` 第25-32行

### 修改前
```yaml
- name: Checkout code (exclude problematic docs)
  uses: actions/checkout@v4
  with:
    fetch-depth: 0
    sparse-checkout: |
      /*
      !/src/**/*.md
      !/src/views/erp/saltprocess/records/binary/*
    sparse-checkout-cone-mode: false
```

### 修改后
```yaml
- name: Checkout code (exclude problematic docs)
  uses: actions/checkout@v4
  with:
    fetch-depth: 0
    sparse-checkout: |
      /*
      !/src/**/*.md
    sparse-checkout-cone-mode: false
```

### 关键变化
- **移除**：`!/src/views/erp/saltprocess/records/binary/*` 排除规则
- **保留**：`!/src/**/*.md` 排除规则（用于排除文档文件）

## 技术说明

### Sparse Checkout 规则说明
- `/*` - 包含根目录的所有文件和文件夹
- `!/path/**/*.md` - 排除所有markdown文件（`!` 表示排除）
- 排除规则会导致指定的文件在checkout时不被下载

### 为什么会出现这个规则？
该规则可能是为了减少CI/CD流水线的checkout时间而添加的，但错误地排除了必要的源代码文件。

## 验证修复

### 本地验证
```bash
# 构建成功
npm run build:prod

# 输出示例
✓ 3052 modules transformed.
✓ built in 7.52s
```

### CI/CD验证
修复后，Windows构建流水线应该能够：
1. 正确检出所有源文件
2. 成功构建Vue应用
3. 生成Electron应用包

## 相关文件
- 工作流文件：`.github/workflows/build-windows.yml`
- 路由配置：`src/router/modules/saltprocess.ts`
- 源文件：`src/views/erp/saltprocess/records/binary/*`

## 后续建议

1. **定期检查sparse-checkout规则**：确保不会意外排除必要的源文件
2. **添加验证步骤**：在checkout后验证关键文件是否存在
3. **优化checkout性能**：使用更精确的规则而不是排除整个文件夹

## 提交信息
```
fix: 修复Windows CI流水线构建错误 - 移除对binary文件夹的排除规则

问题描述：
- GitHub Actions Windows构建流水线中的sparse-checkout规则错误地排除了
  src/views/erp/saltprocess/records/binary/* 文件夹
- 导致构建时无法找到 binary/index.vue 文件

修复方案：
- 移除sparse-checkout中的排除规则 !/src/views/erp/saltprocess/records/binary/*
- 保留对markdown文件的排除规则 !/src/**/*.md

影响范围：
- 修复Windows构建流水线的ENOENT错误
- 确保所有必要的源文件都被正确检出
```

