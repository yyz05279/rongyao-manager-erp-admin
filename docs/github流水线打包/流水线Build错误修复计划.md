# 流水线Build错误修复计划

## 错误总览

共有 **118 行错误**，主要分为以下几类：

### 1. 缺失方法/属性错误 (20+ 个)
- `onChangeWarehouse` 方法未定义
- `dateFormatter` 方法未定义
- `console` 对象访问错误
- `validate` 方法不存在于数组上

### 2. 类型定义不匹配 (30+ 个)
- Props 类型定义冲突
- API 返回类型与定义不符
- 对象属性缺失

### 3. 导出错误 (2 个)
- `ProductVO` 未导出
- `PurchaseInVO` 未导出

### 4. Emits 定义错误 (2 个)
- Emits 类型不满足约束

### 5. Element Plus 导入错误 (1 个)
- `ElFormRules` 应为 `FormRules`

## 优先级修复顺序

### 第一优先级（阻塞编译）
1. 修复 Props 类型定义冲突
2. 修复导出错误
3. 修复 Element Plus 导入错误

### 第二优先级（功能错误）
4. 添加缺失的方法定义
5. 修复类型不匹配

### 第三优先级（优化）
6. 修复 API 响应类型
7. 优化类型定义

## 关键问题分析

### 问题 1: Props 类型定义冲突
**文件**: PurchaseInItemForm.vue, PurchaseOrderItemForm.vue
**错误**: `items` 属性类型冲突导致 Props 被简化为 `never`
**原因**: Props 定义中 `items: undefined` 与实际使用不符
**解决方案**: 修改 Props 定义为正确的类型

### 问题 2: 缺失方法定义
**文件**: 多个 Vue 组件
**错误**: 方法在模板中调用但未在脚本中定义
**解决方案**: 添加缺失的方法实现

### 问题 3: 导出错误
**文件**: API 类型定义文件
**错误**: 类型在模块中声明但未导出
**解决方案**: 在导出语句中添加类型

### 问题 4: Element Plus 导入
**文件**: RatioManagement.vue
**错误**: `ElFormRules` 不存在，应为 `FormRules`
**解决方案**: 修改导入和使用

## 详细修复步骤

见下一个文档: BUILD_ERROR_DETAILED_FIXES.md

