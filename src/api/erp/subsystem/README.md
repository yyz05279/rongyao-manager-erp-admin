# 子系统管理模块 - API 接口使用指南

基于后端 API v1.1 文档实现的前端接口封装。

## 📁 文件结构

```
subsystem/
├── index.ts      # API 接口定义
├── types.ts      # TypeScript 类型定义
└── README.md     # 使用指南（本文件）
```

## 🚀 快速开始

### 1. 导入接口

```typescript
import {
  // 子系统接口
  listSubsystem,
  getSubsystem,
  addSubsystem,
  updateSubsystem,
  delSubsystem,
  exportSubsystem,
  generateSubsystemCode,
  updateSubsystemStatus,
  copySubsystem,
  checkSubsystemCodeUnique,
  
  // 子项接口
  listSubsystemItem,
  getSubsystemItem,
  addSubsystemItem,
  updateSubsystemItem,
  delSubsystemItem,
  batchAddSubsystemItems,
  generateSubsystemItemCode,
  getSubsystemItemTree,
  
  // 物料接口
  listSubsystemMaterial,
  getSubsystemMaterial,
  addSubsystemMaterial,
  updateSubsystemMaterial,
  delSubsystemMaterial,
  batchAddSubsystemMaterials
} from '@/api/erp/subsystem';
```

### 2. 导入类型

```typescript
import type {
  SubsystemQuery,
  SubsystemVO,
  SubsystemForm,
  SubsystemDetailVO,
  SubsystemItemQuery,
  SubsystemItemVO,
  SubsystemItemForm,
  SubsystemMaterialQuery,
  SubsystemMaterialVO,
  SubsystemMaterialForm,
  SubsystemStatus,
  SubsystemItemStatus,
  MaterialStatus
} from '@/api/erp/subsystem/types';
```

## 📖 使用示例

### 子系统管理

#### 1. 查询子系统列表

```typescript
const queryParams: SubsystemQuery = {
  pageNum: 1,
  pageSize: 10,
  subsystemName: '机械系统',
  projectId: 1,
  status: 'ACTIVE'
};

const response = await listSubsystem(queryParams);
console.log('子系统列表:', response.data.rows);
console.log('总数:', response.data.total);
```

#### 2. 获取子系统详情

```typescript
const subsystemId = 1;
const response = await getSubsystem(subsystemId);
console.log('子系统详情:', response.data);
console.log('子项列表:', response.data.items);
console.log('统计信息:', response.data.statistics);
```

#### 3. 新增子系统

```typescript
const formData: SubsystemForm = {
  subsystemName: '固态处理厂-机械系统',
  projectId: 1,
  projectName: '淮安项目',
  category: '机械',
  description: '固态处理厂机械系统',
  responsiblePerson: '张三',
  responsiblePersonId: 100,
  status: 'ACTIVE',
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  priority: 1,
  remarks: '重点项目'
};

await addSubsystem(formData);
```

#### 4. 修改子系统

```typescript
const formData: SubsystemForm = {
  id: 1,
  subsystemName: '固态处理厂-机械系统（已优化）',
  projectId: 1,
  projectName: '淮安项目',
  category: '机械',
  status: 'ACTIVE'
};

await updateSubsystem(formData);
```

#### 5. 删除子系统

```typescript
// 删除单个
await delSubsystem(1);

// 删除多个
await delSubsystem([1, 2, 3]);
await delSubsystem('1,2,3');
```

#### 6. 生成子系统编号

```typescript
const projectCode = 'PRJ001';
const response = await generateSubsystemCode(projectCode);
console.log('生成的编号:', response.data); // PRJ001-SS-0001
```

#### 7. 更新子系统状态

```typescript
await updateSubsystemStatus(1, 'ACTIVE');
```

#### 8. 复制子系统

```typescript
const response = await copySubsystem(1);
console.log('新子系统ID:', response.data);
```

#### 9. 校验编号唯一性

```typescript
// 新增时校验
const isUnique = await checkSubsystemCodeUnique('PRJ001-SS-0001');
console.log('编号是否可用:', isUnique.data);

// 编辑时校验（排除自己）
const isUnique2 = await checkSubsystemCodeUnique('PRJ001-SS-0001', 1);
```

#### 10. 导出子系统列表

```typescript
const queryParams: SubsystemQuery = {
  projectId: 1,
  status: 'ACTIVE'
};

const blob = await exportSubsystem(queryParams);
// 处理 blob 下载
const url = window.URL.createObjectURL(blob.data);
const link = document.createElement('a');
link.href = url;
link.download = '子系统列表.xlsx';
link.click();
```

### 子项管理

#### 1. 查询子项列表

```typescript
const queryParams: SubsystemItemQuery = {
  pageNum: 1,
  pageSize: 10,
  subsystemId: 1,
  itemName: '输送系统',
  status: 'IN_PROGRESS'
};

const response = await listSubsystemItem(queryParams);
```

#### 2. 获取子项详情

```typescript
const response = await getSubsystemItem(1);
console.log('子项详情:', response.data);
```

#### 3. 新增子项

```typescript
const formData: SubsystemItemForm = {
  subsystemId: 1,
  itemName: '输送系统',
  itemType: '系统',
  specification: '标准配置',
  description: '输送系统描述',
  sequenceNumber: 1,
  parentItemId: 0,
  quantity: 1,
  unit: '套',
  weight: 500.5,
  status: 'PENDING',
  remarks: '重要子项'
};

await addSubsystemItem(formData);
```

#### 4. 批量新增子项

```typescript
const items: SubsystemItemForm[] = [
  {
    subsystemId: 1,
    itemName: '输送系统A',
    itemType: '系统',
    quantity: 1,
    unit: '套',
    weight: 300.0
  },
  {
    subsystemId: 1,
    itemName: '输送系统B',
    itemType: '系统',
    quantity: 2,
    unit: '套',
    weight: 450.0
  }
];

await batchAddSubsystemItems(1, items);
```

#### 5. 生成子项编号

```typescript
const subsystemCode = 'PRJ001-SS-0001';
const response = await generateSubsystemItemCode(subsystemCode);
console.log('生成的编号:', response.data); // PRJ001-SS-0001-IT-0001
```

#### 6. 获取子项树形结构

```typescript
const response = await getSubsystemItemTree(1);
console.log('树形结构:', response.data);
```

### 物料管理

#### 1. 查询物料列表

```typescript
const queryParams: SubsystemMaterialQuery = {
  pageNum: 1,
  pageSize: 10,
  subsystemId: 1,
  itemId: 1,
  materialName: '钢材',
  status: 'NORMAL'
};

const response = await listSubsystemMaterial(queryParams);
```

#### 2. 添加物料

```typescript
const formData: SubsystemMaterialForm = {
  subsystemId: 1,
  itemId: 1,
  materialId: 100,
  materialCode: 'MAT001',
  materialName: '钢材',
  specification: 'Q235',
  materialType: '原材料',
  quantity: 100,
  unit: '吨',
  unitWeight: 7.85,
  manufacturer: '某钢铁厂',
  model: 'Q235B',
  serialNumber: 'SN20240001',
  sequenceNumber: 1,
  status: 'NORMAL',
  remarks: '优质钢材'
};

await addSubsystemMaterial(formData);
```

#### 3. 批量添加物料

```typescript
const materials: SubsystemMaterialForm[] = [
  {
    subsystemId: 1,
    itemId: 1,
    materialCode: 'MAT001',
    materialName: '钢材',
    specification: 'Q235',
    quantity: 100,
    unit: '吨',
    unitWeight: 7.85
  },
  {
    subsystemId: 1,
    itemId: 1,
    materialCode: 'MAT002',
    materialName: '铝材',
    specification: '6061',
    quantity: 50,
    unit: '吨',
    unitWeight: 2.7
  }
];

await batchAddSubsystemMaterials(1, 1, materials);
```

## 🔑 枚举值说明

### 子系统状态 (SubsystemStatus)

```typescript
enum SubsystemStatus {
  DRAFT = 'DRAFT',       // 草稿
  ACTIVE = 'ACTIVE',     // 生效
  INACTIVE = 'INACTIVE', // 停用
  ARCHIVED = 'ARCHIVED'  // 归档
}
```

### 子项状态 (SubsystemItemStatus)

```typescript
enum SubsystemItemStatus {
  PENDING = 'PENDING',         // 待处理
  IN_PROGRESS = 'IN_PROGRESS', // 进行中
  COMPLETED = 'COMPLETED',     // 已完成
  SUSPENDED = 'SUSPENDED'      // 已暂停
}
```

### 物料状态 (MaterialStatus)

```typescript
enum MaterialStatus {
  NORMAL = 'NORMAL',             // 正常
  OUT_OF_STOCK = 'OUT_OF_STOCK', // 缺货
  RESERVED = 'RESERVED',         // 已预留
  ALLOCATED = 'ALLOCATED'        // 已分配
}
```

### 附件类型 (AttachmentType)

```typescript
enum AttachmentType {
  DRAWING = 'DRAWING',   // 图纸
  DOCUMENT = 'DOCUMENT', // 文档
  PHOTO = 'PHOTO',       // 照片
  OTHER = 'OTHER'        // 其他
}
```

## 📝 在 Vue 组件中使用

### 使用 Composition API

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  listSubsystem,
  addSubsystem,
  updateSubsystem,
  delSubsystem
} from '@/api/erp/subsystem';
import type { SubsystemQuery, SubsystemVO, SubsystemForm } from '@/api/erp/subsystem/types';

// 列表数据
const subsystemList = ref<SubsystemVO[]>([]);
const total = ref(0);
const loading = ref(false);

// 查询参数
const queryParams = ref<SubsystemQuery>({
  pageNum: 1,
  pageSize: 10
});

// 获取列表
const getList = async () => {
  loading.value = true;
  try {
    const response = await listSubsystem(queryParams.value);
    subsystemList.value = response.data.rows;
    total.value = response.data.total;
  } finally {
    loading.value = false;
  }
};

// 新增
const handleAdd = async (formData: SubsystemForm) => {
  await addSubsystem(formData);
  await getList();
};

// 修改
const handleUpdate = async (formData: SubsystemForm) => {
  await updateSubsystem(formData);
  await getList();
};

// 删除
const handleDelete = async (id: number) => {
  await delSubsystem(id);
  await getList();
};

// 初始化
onMounted(() => {
  getList();
});
</script>
```

## ⚠️ 注意事项

1. **编号自动生成**：子系统编号和子项编号支持自动生成，新增时可以不传 `code` 字段
2. **重量自动计算**：物料的 `totalWeight` 由系统自动计算（`quantity × unitWeight`）
3. **删除限制**：删除子系统前需确认无关联子项和物料
4. **权限控制**：所有接口都需要相应的权限，详见 API 文档权限要求
5. **数据验证**：前端应该进行基础的数据验证，如必填项、格式校验等
6. **错误处理**：建议使用 try-catch 包裹异步操作，处理可能的错误

## 🔗 相关文档

- [子系统管理模块 API 接口文档](../../../docs/07-子系统管理/子系统管理模块API接口设计文档.md)
- [子系统管理模块使用指南](../../../docs/07-子系统管理/子系统管理模块使用指南.md)
- [菜单权限配置图解](../../../docs/07-子系统管理/菜单权限配置图解.md)

## 📅 版本历史

| 版本 | 日期       | 说明                     |
| ---- | ---------- | ------------------------ |
| v1.0 | 2025-11-04 | 初始版本，基于 API v1.1  |

