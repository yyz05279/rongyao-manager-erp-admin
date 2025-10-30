# 发货清单导入 API 接口设计

## 现有接口分析

### 1. 当前导入接口

```typescript
/**
 * Excel导入创建发货清单
 */
function createShippingListFromExcel(
  projectId: string,
  batchNumber: string,
  responsiblePersonId: string,
  items: ShippingItemVO[]
): Promise<ApiResponse<string>>
```

### 2. ShippingItemVO 数据结构

```typescript
interface ShippingItemVO {
  id: string;
  shippingListId: string;
  itemCode?: string;
  itemName: string;              // 物品名称
  specification?: string;         // 规格型号
  equipmentType: EquipmentType;  // 设备类型
  quantity: number;              // 数量
  unit: string;                  // 单位
  unitWeight?: number;           // 单重(kg)
  totalWeight?: number;          // 总重(kg)
  unitVolume?: number;           // 单体积(m³)
  totalVolume?: number;          // 总体积(m³)
  manufacturer?: string;         // 制造商
  model?: string;                // 型号
  serialNumber?: string;         // 序列号
  packageType?: string;          // 包装方式
  packageQuantity?: number;      // 包装件数
  isFragile: boolean;            // 是否易碎
  isHazardous: boolean;          // 是否危险品
  storageRequirement?: string;   // 存储要求
  remarks?: string;              // 备注
  createTime: string;
  updateTime: string;
}
```

## 增强版解析数据结构

### 1. 发货时间记录

```typescript
interface ShippingTimeRecord {
  序号: number | string;
  名称: string;
  明细: string;
  发货时间: string;           // yyyy-MM-dd
  车辆信息: string;
  车牌号?: string;            // 解析后
  车辆描述?: string;          // 解析后
  司机姓名及电话: string;
  司机姓名?: string;          // 解析后
  司机电话?: string;          // 解析后
}
```

### 2. 设备明细记录

```typescript
interface EquipmentDetailRecord {
  序号: number | string;
  名称: string;
  分项?: string;
  数量: number | string;
  单位: string;
  备注?: string;
  重量?: number | string;     // 可能是多个分项的总和
  [key: string]: any;         // 动态字段
}
```

### 3. 图片数据

```typescript
interface UploadedImage {
  file: File;
  url: string;                // 本地预览URL
}
```

## 数据映射分析

### 问题识别

1. **字段不匹配**

   - Excel 解析：`名称`、`分项`
   - 接口需要：`itemName`、`specification`

2. **缺失字段**

   - 接口需要但 Excel 没有：`equipmentType`、`isFragile`、`isHazardous`
   - Excel 有但接口不需要：`序号`、`分项`（作为子项）

3. **发货时间信息**

   - Excel 解析出单独的发货时间表
   - 现有接口没有对应字段

4. **图片数据**

   - 增强版支持发货照片和司机驾照
   - 现有接口没有图片上传参数

## 解决方案

### 方案 A：扩展现有接口（推荐）

创建新的增强版导入接口，支持完整的数据结构：

```typescript
/**
 * 增强版Excel导入创建发货清单
 */
interface EnhancedShippingImportRequest {
  // 基本信息
  projectId: string;
  batchNumber: string;
  responsiblePersonId: string;

  // 发货时间信息
  shippingDate?: string;           // 从Excel解析的发货日期
  vehiclePlate?: string;           // 车牌号
  vehicleDescription?: string;     // 车辆描述
  driverName?: string;             // 司机姓名
  driverPhone?: string;            // 司机电话

  // 设备明细（支持分项结构）
  equipmentDetails: EnhancedEquipmentDetail[];

  // 图片文件
  shippingPhotos?: File[];         // 发货照片
  driverLicensePhotos?: File[];    // 司机驾照
}

interface EnhancedEquipmentDetail {
  序号: number;
  名称: string;                    // 主设备名称
  分项: string;                    // 子项名称
  数量: number;
  单位: string;
  备注?: string;
  重量?: number;                   // 单位：吨

  // 映射到标准字段
  itemName?: string;               // = 名称 + 分项
  equipmentType?: string;          // 根据名称推断
}
```

### 方案 B：数据转换层（当前实现）

在前端进行数据转换，将增强版数据映射到现有接口格式：

```typescript
/**
 * 将增强版解析数据转换为标准ShippingItemForm格式
 */
function convertToShippingItems(
  equipmentDetails: EquipmentDetailRecord[]
): ShippingItemForm[] {
  return equipmentDetails.map(detail => ({
    itemName: detail.名称 + (detail.分项 ? ` - ${detail.分项}` : ''),
    specification: detail.分项 || '',
    quantity: Number(detail.数量) || 0,
    unit: detail.单位 || '套',
    unitWeight: detail.重量 ? Number(detail.重量) * 1000 : undefined, // 吨转kg
    remarks: detail.备注 || '',
    equipmentType: inferEquipmentType(detail.名称),
    isFragile: false,
    isHazardous: false
  }));
}

/**
 * 根据设备名称推断设备类型
 */
function inferEquipmentType(name: string): EquipmentType {
  if (name.includes('输送') || name.includes('传送')) return 'MECHANICAL';
  if (name.includes('粉碎') || name.includes('破碎')) return 'MECHANICAL';
  if (name.includes('钢平台') || name.includes('立柱')) return 'AUXILIARY';
  if (name.includes('除尘')) return 'AUXILIARY';
  return 'AUXILIARY';
}
```

## 推荐实现方案

### 阶段 1：前端数据转换（当前）

```typescript
// 在导入对话框中
const handleImport = async () => {
  try {
    importing.value = true;

    // 1. 提取发货时间信息（使用第一条记录）
    const firstTimeRecord = parsedData.value.shippingTimes[0];
    const shippingDate = firstTimeRecord?.发货时间 || new Date().toISOString().split('T')[0];

    // 2. 转换设备明细
    const allItems: ShippingItemForm[] = [];

    parsedData.value.equipmentDetails.forEach(sheet => {
      const items = sheet.data.map(detail => ({
        itemName: detail.名称 + (detail.分项 ? ` - ${detail.分项}` : ''),
        specification: detail.分项 || '',
        quantity: Number(detail.数量) || 0,
        unit: detail.单位 || '套',
        unitWeight: detail.重量 ? Number(detail.重量) * 1000 : undefined,
        remarks: detail.备注 || '',
        equipmentType: inferEquipmentType(detail.名称),
        isFragile: false,
        isHazardous: false
      }));

      allItems.push(...items);
    });

    // 3. 上传图片（如果有）
    await uploadImages();

    // 4. 调用现有接口
    const response = await createShippingListFromExcel(
      importConfig.projectId,
      importConfig.batchNumber,
      importConfig.responsiblePersonId,
      allItems
    );

    ElMessage.success('导入成功');
    emit('success', response.data);
  } catch (error) {
    ElMessage.error('导入失败');
  } finally {
    importing.value = false;
  }
};
```

### 阶段 2：后端接口扩展（未来）

创建新的增强版导入端点：

```typescript
// 前端API调用
export const importEnhancedShippingList = (data: EnhancedShippingImportRequest): AxiosPromise<string> => {
  const formData = new FormData();

  // 基本信息
  formData.append('projectId', data.projectId);
  formData.append('batchNumber', data.batchNumber);
  formData.append('responsiblePersonId', data.responsiblePersonId);

  // 发货信息
  if (data.shippingDate) formData.append('shippingDate', data.shippingDate);
  if (data.vehiclePlate) formData.append('vehiclePlate', data.vehiclePlate);
  if (data.driverName) formData.append('driverName', data.driverName);
  if (data.driverPhone) formData.append('driverPhone', data.driverPhone);

  // 设备明细
  formData.append('equipmentDetails', JSON.stringify(data.equipmentDetails));

  // 发货照片
  data.shippingPhotos?.forEach((file, index) => {
    formData.append(`shippingPhoto_${index}`, file);
  });

  // 司机驾照
  data.driverLicensePhotos?.forEach((file, index) => {
    formData.append(`driverLicense_${index}`, file);
  });

  return request({
    url: '/erp/saltprocess/shipping/import-enhanced',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};
```

## 数据结构对比

### 现有接口 vs 增强版需求

| 数据项   | 现有接口        | 增强版解析     | 映射方案     |
| -------- | --------------- | -------------- | ------------ |
| 物品名称 | itemName        | 名称 + 分项    | 拼接字符串   |
| 规格型号 | specification   | 分项           | 直接映射     |
| 数量     | quantity        | 数量           | 类型转换     |
| 单位     | unit            | 单位           | 直接映射     |
| 重量     | unitWeight (kg) | 重量 (吨)      | 乘以 1000    |
| 备注     | remarks         | 备注           | 直接映射     |
| 设备类型 | equipmentType   | -              | 根据名称推断 |
| 发货日期 | -               | 发货时间       | 新增字段     |
| 车牌号   | -               | 车牌号         | 新增字段     |
| 司机信息 | -               | 司机姓名、电话 | 新增字段     |
| 图片     | -               | File[]         | 新增参数     |

## 完整示例

### 前端调用示例

```typescript
// 当前方案：使用现有接口
const items = convertToShippingItems(parsedData.value.equipmentDetails);

await createShippingListFromExcel(
  importConfig.projectId,
  importConfig.batchNumber,
  importConfig.responsiblePersonId,
  items
);

// 未来方案：使用增强版接口
await importEnhancedShippingList({
  projectId: importConfig.projectId,
  batchNumber: importConfig.batchNumber,
  responsiblePersonId: importConfig.responsiblePersonId,
  shippingDate: parsedData.value.shippingTimes[0]?.发货时间,
  vehiclePlate: parsedData.value.shippingTimes[0]?.车牌号,
  driverName: parsedData.value.shippingTimes[0]?.司机姓名,
  driverPhone: parsedData.value.shippingTimes[0]?.司机电话,
  equipmentDetails: flattenEquipmentDetails(parsedData.value.equipmentDetails),
  shippingPhotos: uploadedImages.value.map(img => img.file),
  driverLicensePhotos: driverLicenseImages.value.map(img => img.file)
});
```

### 后端接口规范（建议）

```
POST /erp/saltprocess/shipping/import-enhanced
Content-Type: multipart/form-data

FormData:
  - projectId: string
  - batchNumber: string
  - responsiblePersonId: string
  - shippingDate: string (optional)
  - vehiclePlate: string (optional)
  - driverName: string (optional)
  - driverPhone: string (optional)
  - equipmentDetails: string (JSON)
  - shippingPhoto_0: File (optional)
  - shippingPhoto_1: File (optional)
  - ...
  - driverLicense_0: File (optional)
  - driverLicense_1: File (optional)
  - ...

Response:
{
  "code": 200,
  "message": "导入成功",
  "data": "SL20251029001"  // 发货清单ID
}
```

## 结论

### 当前实现状态

✅ **满足基本需求**：

- 设备明细可以通过字段映射转换为 ShippingItemVO
- 名称和分项通过拼接成为 itemName
- 数量、单位、备注等字段直接映射

⚠️ **需要注意**：

- 发货时间、车辆、司机信息未保存
- 图片数据未上传到服务器
- 设备类型需要根据名称推断
- 重量单位需要转换（吨 →kg）

### 建议改进

1. **短期**：使用当前方案，在前端完成数据转换
2. **中期**：扩展 ShippingListForm，添加车辆和司机信息字段
3. **长期**：创建专门的增强版导入接口，支持完整数据结构

## 实现清单

- [x] 合并单元格解析
- [x] 数据字段映射
- [x] 前端数据转换函数
- [ ] 图片上传功能集成
- [ ] 发货信息字段扩展
- [ ] 后端增强版接口开发
- [ ] 完整的端到端测试
