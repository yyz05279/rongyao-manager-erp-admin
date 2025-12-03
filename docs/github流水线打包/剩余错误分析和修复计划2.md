# 剩余错误分析和修复计划

## 错误统计
- **总错误数**: 约 100 行
- **已修复**: 约 18 行（15%）
- **剩余**: 约 82 行（85%）

## 剩余错误分类

### 1. 缺失属性错误 (30+ 个)
这些是最常见的错误，涉及类型定义中缺少某些属性。

**示例**:
- `overallResult` 不存在于 `PreheatingInspectionQuery`
- `totalWeight` 不存在于 `SubsystemMaterialForm`
- `pageNo` 不存在于查询类型（应为 `pageNum`）
- `testCode` 不存在于 `QualityTestVO`

**修复方法**:
1. 检查 API 类型定义文件
2. 添加缺失的属性定义
3. 或在使用处修改属性名称

### 2. 导出/导入错误 (2 个)
- ✅ ProductVO - 已修复
- ✅ PurchaseInVO - 已修复

### 3. 类型不匹配错误 (25+ 个)
**示例**:
- `items` 属性缺失于 `PurchaseOrderForm`
- `orderId` 不存在于 `PurchaseInForm`
- API 响应类型不匹配 (PageResult vs 数组)

**修复方法**:
1. 更新类型定义
2. 修复 API 响应类型
3. 修复表单类型定义

### 4. 方法参数错误 (20+ 个)
**示例**:
- 预期 1-2 个参数，但得到 3 个
- 参数类型不匹配
- 缺失参数

**修复方法**:
1. 检查方法签名
2. 修复调用处的参数
3. 更新方法定义

### 5. 枚举值错误 (5+ 个)
**示例**:
- `"DAILY"` 不能分配给 `AnalysisPeriod`
- `"TERNARY_SALT"` 不能分配给 `SaltType`

**修复方法**:
1. 检查枚举定义
2. 修复使用的枚举值
3. 添加缺失的枚举值

## 优先级修复顺序

### 第一阶段（高优先级）
1. 修复 API 类型定义中的缺失属性
2. 修复导出错误（已完成）
3. 修复表单类型定义

### 第二阶段（中优先级）
4. 修复方法参数错误
5. 修复枚举值定义
6. 修复 API 响应类型

### 第三阶段（低优先级）
7. 修复类型转换问题
8. 优化类型定义

## 关键文件需要修复

1. **API 类型定义**:
   - `src/api/erp/saltprocess/preheating/types.ts`
   - `src/api/erp/saltprocess/saltmaking/types.ts`
   - `src/api/erp/saltprocess/quality/types.ts`
   - `src/api/erp/subsystem/types.ts`

2. **组件文件**:
   - `src/views/erp/purchase/in/PurchaseInForm.vue`
   - `src/views/erp/purchase/order/PurchaseOrderForm.vue`
   - `src/views/erp/saltprocess/preheating/inspection.vue`
   - `src/views/erp/saltprocess/shipping/components/ShippingImportDialog.vue`

3. **Mock 服务**:
   - `src/api/erp/saltprocess/shipping/mock-service.ts`

