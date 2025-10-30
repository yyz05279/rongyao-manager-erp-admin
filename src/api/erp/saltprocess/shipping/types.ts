/**
 * 项目发货清单管理模块 - 类型定义
 */
import { PageQuery } from '../types';

// 发货清单状态
export enum ShippingStatus {
  DRAFT = 'DRAFT',                    // 草稿
  PENDING = 'PENDING',                // 待发货
  PARTIAL_SHIPPED = 'PARTIAL_SHIPPED', // 部分发货
  SHIPPED = 'SHIPPED',                // 已发货
  DELIVERED = 'DELIVERED',            // 已送达
  COMPLETED = 'COMPLETED',            // 已完成
  CANCELLED = 'CANCELLED'             // 已取消
}

// 设备类型
export enum EquipmentType {
  MECHANICAL = 'MECHANICAL',          // 机械设备
  ELECTRICAL = 'ELECTRICAL',          // 电控设备
  PIPELINE = 'PIPELINE',              // 管路设备
  BURNER = 'BURNER',                  // 燃烧器
  AUXILIARY = 'AUXILIARY',            // 辅助设备
  STANDARD_PARTS = 'STANDARD_PARTS'   // 标准件
}

// 发货方式
export enum ShippingMethod {
  TRUCK = 'TRUCK',                    // 卡车运输
  RAIL = 'RAIL',                      // 铁路运输
  SEA = 'SEA',                        // 海运
  AIR = 'AIR'                         // 空运
}

// 发货清单主表
export interface ShippingListVO {
  id?: string;                        // 前端映射字段
  shippingListId?: string;            // 后端返回字段
  listCode: string;                   // 清单编号
  projectId: string;                  // 项目ID
  projectName: string;                // 项目名称
  batchNumber: string;                // 批次号（如：第一车、第二车）
  responsiblePerson: string;          // 负责人
  responsiblePersonId?: string;       // 负责人ID
  shippingDate: string;               // 发货日期
  expectedDeliveryDate?: string;      // 预计送达日期
  actualDeliveryDate?: string;        // 实际送达日期
  status: ShippingStatus | string;    // 发货状态
  statusName?: string;                // 状态名称（中文）
  shippingMethod: ShippingMethod | string; // 发货方式
  shippingMethodName?: string;        // 发货方式名称（中文）
  vehicleInfo?: string;               // 车辆信息
  driverInfo?: string;                // 司机信息
  totalItems: number;                 // 总件数
  totalWeight: number | string;       // 总重量(kg)
  totalVolume?: number | string;      // 总体积(m³)
  packingListPath?: string;           // 装箱清单文件路径
  photoPath?: string;                 // 发货照片路径
  remarks?: string;                   // 备注
  createTime: string;
  updateTime: string;
  createBy?: string;
  updateBy?: string;
  materialItems?: any;                // 物料明细
  statistics?: any;                   // 统计信息
}

// 发货清单明细表
export interface ShippingItemVO {
  id: string;
  shippingListId: string;             // 发货清单ID
  itemCode?: string;                  // 物品编码
  itemName: string;                   // 物品名称
  specification?: string;             // 规格型号
  equipmentType: EquipmentType;       // 设备类型
  quantity: number;                   // 数量
  unit: string;                       // 单位
  unitWeight?: number;                // 单重(kg)
  totalWeight?: number;               // 总重(kg)
  unitVolume?: number;                // 单体积(m³)
  totalVolume?: number;               // 总体积(m³)
  manufacturer?: string;              // 制造商
  model?: string;                     // 型号
  serialNumber?: string;              // 序列号
  packageType?: string;               // 包装方式
  packageQuantity?: number;           // 包装件数
  isFragile: boolean;                 // 是否易碎
  isHazardous: boolean;               // 是否危险品
  storageRequirement?: string;        // 存储要求
  remarks?: string;                   // 备注
  createTime: string;
  updateTime: string;
}

// 发货清单查询参数
export interface ShippingListQuery extends PageQuery {
  projectId?: string;
  projectName?: string;
  listCode?: string;
  batchNumber?: string;
  responsiblePerson?: string;
  status?: ShippingStatus;
  equipmentType?: EquipmentType;
  shippingDateStart?: string;
  shippingDateEnd?: string;
  expectedDeliveryDateStart?: string;
  expectedDeliveryDateEnd?: string;
}

// 发货清单表单数据
export interface ShippingListForm {
  id?: string;
  projectId: string;
  batchNumber: string;
  responsiblePersonId: string;
  shippingDate: string;
  expectedDeliveryDate?: string;
  shippingMethod: ShippingMethod;
  vehicleInfo?: string;
  driverInfo?: string;
  remarks?: string;
  items: ShippingItemForm[];
}

// 增强版发货清单表单数据
export interface EnhancedShippingListForm extends ShippingListForm {
  // 增强版字段
  vehiclePlate?: string;              // 车牌号
  vehicleDescription?: string;        // 车辆描述
  driverName?: string;                // 司机姓名
  driverPhone?: string;               // 司机电话
  shippingPhotoUrls?: string[];       // 发货照片URL列表
  driverLicensePhotoUrls?: string[];  // 司机驾照照片URL列表
}

// 发货清单明细表单数据
export interface ShippingItemForm {
  id?: string;
  itemName: string;
  specification?: string;
  equipmentType: EquipmentType;
  quantity: number;
  unit: string;
  unitWeight?: number;
  unitVolume?: number;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  packageType?: string;
  packageQuantity?: number;
  isFragile: boolean;
  isHazardous: boolean;
  storageRequirement?: string;
  remarks?: string;
}

// 增强版发货清单明细表单数据（来自Excel解析）
export interface EnhancedShippingItemForm {
  sequenceNo?: number | string;      // 序号
  equipmentName: string;              // 设备名称（原：名称）
  subItemName?: string;               // 子项名称（原：分项）
  quantity: number | string;          // 数量
  unit: string;                       // 单位
  weight?: number | string;           // 重量（吨）
  specification?: string;             // 规格
  shippingType?: string;              // 发货类型（如：机械、电控）
  equipmentType?: EquipmentType | string; // 设备类型（MECHANICAL/ELECTRICAL/PIPELINE等）
  subsystem?: string;                 // 子系统/所属系统（如：固态处理厂）
  sheetName?: string;                 // Sheet标签名称（如：第一批设备）
  remarks1?: string;                  // 备注1（Excel中的"备注"列）
  remarks?: string;                   // 备注2
}

// 发货统计数据
export interface ShippingStatistics {
  totalLists: number;                 // 总清单数
  totalItems: number;                 // 总物品数
  totalWeight: number;                // 总重量
  totalVolume: number;                // 总体积
  statusCounts: {
    [key in ShippingStatus]: number;
  };
  equipmentTypeCounts: {
    [key in EquipmentType]: number;
  };
  monthlyShippingTrend: {
    month: string;
    count: number;
    weight: number;
  }[];
}

// Excel导入配置
export interface ShippingExcelImportConfig {
  fileType: 'GENERAL' | 'MECHANICAL' | 'ELECTRICAL' | 'PIPELINE' | 'BURNER';
  sheetName?: string;
  headerRow: number;
  columnMapping: {
    [key: string]: string;
  };
}

// Excel导入结果
export interface ShippingExcelImportResult {
  success: boolean;
  totalRows: number;
  successRows: number;
  errorRows: number;
  errors: {
    row: number;
    field: string;
    message: string;
  }[];
  data: ShippingItemForm[];
}

// 发货跟踪记录
export interface ShippingTrackingRecord {
  id: string;
  shippingListId: string;
  status: ShippingStatus;
  statusTime: string;
  location?: string;
  operator: string;
  operatorId: string;
  remarks?: string;
  createTime: string;
}

// 发货清单附件
export interface ShippingAttachment {
  id: string;
  shippingListId: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  fileType: string;
  attachmentType: 'PACKING_LIST' | 'PHOTO' | 'DOCUMENT' | 'OTHER';
  uploadTime: string;
  uploadBy: string;
}

// Excel导出相关类型
export interface ShippingExportParams {
  exportType: 'current' | 'custom'; // 导出类型：当前查询结果 | 自定义条件
  projectId?: string;
  dateRange?: [string, string];
  status?: ShippingStatus;
  responsiblePersonId?: string;
  shippingMethod?: ShippingMethod;
  batchNumber?: string;
  startDate?: string;
  endDate?: string;
}

export interface ShippingItemsExportParams {
  exportType: 'current' | 'custom';
  projectId?: string;
  dateRange?: [string, string];
  equipmentType?: EquipmentType;
  itemName?: string;
  manufacturer?: string;
  startDate?: string;
  endDate?: string;
  groupBy?: 'project' | 'equipment_type' | 'manufacturer'; // 分组方式
}
