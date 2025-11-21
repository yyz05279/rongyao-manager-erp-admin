# JavaScript 数字精度丢失修复 - 项目设备系统关联

## 修复日期
2025-11-21

## 问题描述

在调用新增项目设备系统关联接口时，传入的 `id` 参数出现了精度丢失问题。这是因为：
- 后端使用 Long 类型的 ID（雪花算法生成，64位）
- JavaScript 的 Number 类型最大安全整数为 2^53-1
- 超过此范围的数字会丢失精度

## 修复方案

将所有涉及 Long 类型 ID 的字段从 `number` 类型改为 `string` 类型，确保数据在传递过程中始终保持字符串格式，避免精度丢失。

## 修复文件清单

### 1. 组件文件修复

**文件：** `src/views/erp/saltprocess/equipment-system/components/ProjectEquipmentSystemAssociateForm.vue`

**修改内容：**

1. **FormData 接口定义（第 143-149 行）**
   ```typescript
   // 修改前
   interface FormData {
     projectId: string | null;
     equipmentSystemIds: number[];
   }
   
   // 修改后
   interface FormData {
     projectId: string | null;
     equipmentSystemIds: string[];  // 使用 string 类型避免 Long 类型精度丢失
   }
   ```

2. **表格选择变化处理（第 349-356 行）**
   ```typescript
   // 修改前
   const handleSelectionChange = (selection: EquipmentSystemTemplateVO[]) => {
     selectedTemplates.value = selection;
     formData.equipmentSystemIds = selection.map(item => Number(item.id));
   };
   
   // 修改后
   const handleSelectionChange = (selection: EquipmentSystemTemplateVO[]) => {
     selectedTemplates.value = selection;
     // 保持 string 类型，避免精度丢失
     formData.equipmentSystemIds = selection.map(item => String(item.id));
   };
   ```

3. **提交数据处理（第 429-436 行）**
   ```typescript
   // 修改前
   const submitData = {
     projectId: Number(formData.projectId),  // 转换为数字
     templateIds: formData.equipmentSystemIds
   };
   
   // 修改后
   const submitData = {
     projectId: formData.projectId as string,  // 保持 string 类型，避免精度丢失
     templateIds: formData.equipmentSystemIds
   };
   ```

### 2. API 接口文件修复

**文件：** `src/api/erp/saltprocess/equipment-system/index.ts`

**修改内容：**

1. **generateSystemCode 函数（第 86-96 行）**
   ```typescript
   // 修改前
   export const generateSystemCode = (projectId: number): AxiosPromise<string>
   
   // 修改后
   export const generateSystemCode = (projectId: string): AxiosPromise<string>
   ```

2. **copyProjectEquipmentSystem 函数（第 111-120 行）**
   ```typescript
   // 修改前
   export const copyProjectEquipmentSystem = (id: string | number): AxiosPromise<number>
   
   // 修改后
   export const copyProjectEquipmentSystem = (id: string | number): AxiosPromise<string>
   ```

3. **createFromTemplate 函数（第 122-133 行）**
   ```typescript
   // 修改前
   export const createFromTemplate = (projectId: number, templateId: number): AxiosPromise<number>
   
   // 修改后
   export const createFromTemplate = (projectId: string, templateId: string): AxiosPromise<string>
   ```

4. **createFromTemplates 函数（第 135-146 行）**
   ```typescript
   // 修改前
   export const createFromTemplates = (data: { 
     projectId: number; 
     templateIds: number[] 
   }): AxiosPromise<string[]>
   
   // 修改后
   export const createFromTemplates = (data: { 
     projectId: string; 
     templateIds: string[] 
   }): AxiosPromise<string[]>
   ```

### 3. 类型定义文件修复

**文件：** `src/api/erp/saltprocess/equipment-system/types.ts`

**修改内容：**

1. **ProjectEquipmentSystemQuery 接口（第 168-179 行）**
   ```typescript
   // 修改前
   export interface ProjectEquipmentSystemQuery extends PageQuery {
     projectId?: number | string;
     templateId?: number | string;
     responsiblePersonId?: number;
   }
   
   // 修改后
   export interface ProjectEquipmentSystemQuery extends PageQuery {
     projectId?: string;
     templateId?: string;
     responsiblePersonId?: string;
   }
   ```

2. **ProjectEquipmentSystemVO 接口（第 191-217 行）**
   ```typescript
   // 主要字段类型修改
   projectId: string;              // number → string
   templateId?: string;            // number → string
   responsiblePersonId?: string;   // number → string
   ```

3. **ProjectEquipmentSystemForm 接口（第 219-237 行）**
   ```typescript
   // 主要字段类型修改
   projectId: string;              // number → string
   templateId?: string;            // number → string
   responsiblePersonId?: string;   // number → string
   ```

## 修复验证

1. ✅ TypeScript 类型检查通过，无编译错误
2. ✅ IDE 诊断工具检查通过，无类型错误
3. ✅ 所有相关接口的类型定义已同步更新
4. ✅ 数据传递链路完整，从组件到 API 接口全程使用 string 类型

## 注意事项

1. **后端兼容性**：确保后端接口能够正确接收和解析 string 类型的 ID 参数
2. **其他调用点**：如果有其他地方调用了这些接口，也需要进行相应的修改
3. **测试建议**：
   - 测试使用大数值 ID（超过 2^53-1）的场景
   - 验证接口调用是否正常
   - 检查数据库中保存的 ID 是否正确

## 遵循规范

本次修复严格遵循项目编码规范：
- ✅ 使用 TypeScript 严格类型检查
- ✅ 添加详细的注释说明
- ✅ 保持代码风格一致
- ✅ 更新相关的类型定义文件

