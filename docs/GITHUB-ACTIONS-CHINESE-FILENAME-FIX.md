# GitHub Actions 中文文件名问题修复

## 问题描述

GitHub Actions macOS 构建工作流出现错误：
```
❌ Error: No DMG files found in dist directory
Available files:
-rw-r--r--@   1 runner  staff   519M Dec  3 05:26 海棠企业管理系统-1.0.0.dmg
-rw-r--r--    1 runner  staff   552K Dec  3 05:27 海棠企业管理系统-1.0.0.dmg.blockmap
```

## 根本原因

1. **文件名是中文**：`electron-builder.yml` 中配置 `productName: 海棠企业管理系统`
2. **通配符不匹配**：工作流中使用 `Haitang*.dmg` 无法匹配中文文件名
3. **shasum 失败**：因为找不到匹配的文件，shasum 命令失败

## 解决方案

### 修改的文件

1. `.github/workflows/build-mac-intel.yml`
2. `.github/workflows/build-mac-arm64.yml`

### 改进的关键点

#### 1. 使用 find 命令替代通配符
```bash
# 旧方式（不支持中文）
ls dist/Haitang*.dmg

# 新方式（支持任何文件名）
find dist -maxdepth 1 -name "*.dmg" -type f
```

#### 2. 改进的验证步骤
```bash
dmgFiles=$(find dist -maxdepth 1 -name "*.dmg" -type f 2>/dev/null | wc -l)
if [ "$dmgFiles" -eq 0 ]; then
  echo "❌ Error: No DMG files found"
  exit 1
fi
```

#### 3. 改进的 shasum 步骤
```bash
dmgFiles=$(find . -maxdepth 1 -name "*.dmg" -type f)
echo "$dmgFiles" | while read dmgFile; do
  shasum -a 256 "$dmgFile"
done > checksums-intel.txt
```

#### 4. 更新上传工件的通配符
```yaml
# 旧方式
path: |
  dist/Haitang*.dmg
  dist/Haitang*.zip

# 新方式
path: |
  dist/*.dmg
  dist/*.zip
```

## 优势

✅ 支持中文文件名
✅ 支持任何文件名格式
✅ 更加通用和灵活
✅ 不依赖特定的产品名称

## 相关配置

### electron-builder.yml
```yaml
appId: com.haitang.admin
productName: 海棠企业管理系统  # 中文产品名称
```

这导致生成的文件名为：
- `海棠企业管理系统-1.0.0.dmg`
- `海棠企业管理系统-1.0.0.zip`

## 测试建议

1. 手动触发 macOS 构建工作流
2. 验证 "Verify build output" 步骤能找到 DMG 文件
3. 验证 "Create checksums" 步骤成功生成校验和
4. 检查上传的工件中是否包含所有文件

