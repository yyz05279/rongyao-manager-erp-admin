# shasum 错误修复 - 修改前后对比

## 问题症状

```
Run cd dist
shasum: Haitang*.dmg: No such file or directory
Error: Process completed with exit code 1.
```

## 修改前的代码

### build-mac-intel.yml 和 build-mac-arm64.yml

```yaml
- name: List build output
  run: |
    ls -lh dist/
    file dist/*.dmg || true

- name: Create checksums
  run: |
    cd dist
    shasum -a 256 Haitang*.dmg > checksums-intel.txt
    cat checksums-intel.txt
```

**问题**：
- ❌ 没有检查 DMG 文件是否存在
- ❌ 没有检查 dist 目录是否存在
- ❌ shasum 失败时没有错误处理
- ❌ 没有提供调试信息

## 修改后的代码

```yaml
- name: List build output
  run: |
    ls -lh dist/
    file dist/*.dmg || true

- name: Verify build output
  run: |
    if [ ! -d "dist" ]; then
      echo "❌ Error: dist directory not found"
      exit 1
    fi
    
    dmgFiles=$(ls dist/Haitang*.dmg 2>/dev/null | wc -l)
    if [ "$dmgFiles" -eq 0 ]; then
      echo "❌ Error: No DMG files found in dist directory"
      echo "Available files:"
      ls -lh dist/ || true
      exit 1
    fi
    
    echo "✓ Build output verified"
    echo "Found $dmgFiles DMG file(s)"
    ls -lh dist/Haitang*.dmg

- name: Create checksums
  run: |
    cd dist
    if ! shasum -a 256 Haitang*.dmg > checksums-intel.txt 2>&1; then
      echo "❌ Error: Failed to create checksums"
      cat checksums-intel.txt
      exit 1
    fi
    echo "✓ Checksums created successfully"
    cat checksums-intel.txt
```

**改进**：
- ✅ 检查 dist 目录存在性
- ✅ 检查 DMG 文件存在性
- ✅ 提前失败，避免执行 shasum
- ✅ 提供详细的调试信息
- ✅ 显示实际生成的文件列表
- ✅ 使用 `if !` 捕获 shasum 错误
- ✅ 提供清晰的成功/失败消息

## 执行流程对比

### 修改前
```
List build output
    ↓
Create checksums
    ↓ (如果 DMG 不存在)
❌ shasum: Haitang*.dmg: No such file or directory
```

### 修改后
```
List build output
    ↓
Verify build output
    ├─ 检查 dist 目录
    ├─ 检查 DMG 文件
    ├─ 列出实际文件
    └─ 提前失败（如果文件不存在）
    ↓
Create checksums
    ├─ 执行 shasum
    ├─ 检查返回值
    └─ 提供详细输出
```

## 预期输出

### 成功情况
```
✓ Build output verified
Found 1 DMG file(s)
-rw-r--r--  1 runner  staff  150M Dec  3 13:00 dist/Haitang-1.0.0.dmg

✓ Checksums created successfully
a1b2c3d4e5f6...  Haitang-1.0.0.dmg
```

### 失败情况
```
❌ Error: No DMG files found in dist directory
Available files:
total 0
drwxr-xr-x  2 runner  staff  64 Dec  3 13:00 dist/
```

## 相关工作流

- `.github/workflows/build-mac-intel.yml`
- `.github/workflows/build-mac-arm64.yml`

