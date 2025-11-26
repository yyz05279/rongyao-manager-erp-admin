# Bug 修复详解

## 问题描述

**症状**: 新建项目子系统时出现错误
```
❌ 错误：子系统名称不能为空
```

**影响**: 阻塞批量创建子系统功能

---

## 根本原因分析

### 数据流问题诊断

**ProjectSubsystemSelector 返回的数据** ✅
```typescript
{
  mode: 'reference',
  referenceTemplateId: 123,
  referenceTemplateName: "模板名称",  // ← 有值
  sequenceNumber: 1,
  remarks: ""
}
```

**ProjectSubsystemManagement 接收参数** ❌
```typescript
const handleSubsystemConfirm = async (selectedTemplates: SubsystemTemplateVO[])
// 期望接收 SubsystemTemplateVO[]，实际接收转换后的格式
```

**字段映射错误** ❌
```typescript
selectedTemplates.map((template) => ({
  templateId: template.id,           // ← undefined（不存在）
  subsystemName: template.templateName || '',  // ← undefined（不存在）
  subsystemCode: template.templateCode || '',  // ← undefined（不存在）
  ...
}))

结果: subsystemName = '' ❌ 验证失败
```

---

## 修复方案

### 修改文件

**路径**: `src/views/erp/saltprocess/equipment-system/components/ProjectSubsystemManagement.vue`  
**行号**: 366-407

### 修复内容

#### 第一步：参数类型更新 (L366-373)

```typescript
// ❌ 修改前
const handleSubsystemConfirm = async (selectedTemplates: SubsystemTemplateVO[])

// ✅ 修改后
const handleSubsystemConfirm = async (
  selectedTemplates: Array<{
    mode: string;
    referenceTemplateId: number;
    referenceTemplateName: string;
    sequenceNumber: number;
    remarks: string;
  }>
)
```

#### 第二步：字段映射修正 (L386-407)

```typescript
// 关键字段变更
templateId: template.referenceTemplateId,          // ✅ 正确
subsystemName: template.referenceTemplateName || '', // ✅ 正确
subsystemCode: '',  // 后端自动生成
category: '',       // 后端补充
description: '',    // 后端补充
sequenceNumber: template.sequenceNumber,           // ✅ 正确
remarks: template.remarks || `从模板创建：${template.referenceTemplateName}` // ✅
```

#### 第三步：日志优化 (L398-404)

显示实际使用的字段，便于问题追踪

---

## 修复前后对比

### ❌ 修复前

```
返回数据: referenceTemplateName = "模板名称"
  ↓
访问字段: template.templateName (不存在)
  ↓
结果: undefined → subsystemName = ''
  ↓
API 调用: 验证失败 ❌
错误信息: 子系统名称不能为空
```

### ✅ 修复后

```
返回数据: referenceTemplateName = "模板名称"
  ↓
访问字段: template.referenceTemplateName (正确)
  ↓
结果: "模板名称" → subsystemName = "模板名称"
  ↓
API 调用: 验证成功 ✅
成功信息: 成功添加 1 个子系统
```

---

## 关键字段映射表

| 字段位置 | 旧字段名 | 新字段名 | 原因 |
|---------|---------|---------|------|
| 返回数据 | - | referenceTemplateId | 返回格式 |
| 返回数据 | - | referenceTemplateName | 返回格式 |
| 映射代码 | template.id | template.referenceTemplateId | 字段一致 |
| 映射代码 | template.templateName | template.referenceTemplateName | 字段一致 |
| 映射代码 | index + 1 | template.sequenceNumber | 使用实际值 |

---

## 验证结果

- ✅ TypeScript 编译通过
- ✅ 类型检查通过（无任何错误）
- ✅ 字段映射完全正确
- ✅ API 调用成功
- ✅ 日志输出清晰

---

## 预期效果

✅ 不再出现"子系统名称不能为空"错误  
✅ 子系统名称正确设置为模板名称  
✅ 批量创建子系统功能正常  
✅ 子系统列表自动刷新  

---

**修复等级**: ⭐⭐⭐⭐⭐ 关键修复  
**修复难度**: 🟢 低  
**修复时间**: 已完成  
**可提交**: ✅ 是

