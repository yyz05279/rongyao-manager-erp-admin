/**
 * 物料查询参数
 */
export interface MaterialQuery {
  pageNum?: number;
  pageSize?: number;
  projectId?: string;
  materialName?: string;
  materialType?: string;
  batchNumber?: string;
}

/**
 * 物料视图对象
 */
export interface MaterialVO {
  id?: string;
  projectId: string;
  sequenceNumber?: string;
  materialName: string;
  materialType: string;
  specification?: string;
  quantity: number;
  unit?: string;
  materialCategory?: string;
  manufacturer?: string;
  model?: string;
  remarks1?: string;
  remarks2?: string;
  unitWeight?: number;
  fileSource?: string;
  sheetName?: string;
  rowNumber?: number;
  batchNumber?: string;
  createTime?: string;
  updateTime?: string;
  // 前端验证字段
  hasErrors?: boolean;
  hasWarnings?: boolean;
  errors?: Record<string, string>;
  warnings?: Record<string, string>;
}

/**
 * 物料导入业务对象 - 完整版（100%匹配后端接口文档）
 */
export interface MaterialImportBo {
  // 项目信息
  projectId: string;
  projectName?: string;

  // 批次信息
  batchNumber?: string;

  // 负责人信息
  responsiblePerson?: string;
  responsiblePersonId?: number;

  // 发货日期信息
  shippingDate?: string;
  expectedDeliveryDate?: string;

  // 发货方式和车辆信息
  shippingMethod?: string;
  vehicleInfo?: string;
  driverInfo?: string;

  // 备注和来源
  remarks?: string;
  fileSource?: string;

  // 物料明细列表
  materialItems: MaterialItemBo[];
}

/**
 * 物料明细业务对象 - 完整版（100%匹配后端接口文档）
 */
export interface MaterialItemBo {
  // 基本信息
  sequenceNumber?: string;
  materialType?: string;
  materialName: string;
  specification?: string;
  quantity: number;
  unit?: string;

  // 材质和制造商信息
  materialCategory?: string;
  manufacturer?: string;
  model?: string;

  // 备注信息
  remarks1?: string;
  remarks2?: string;

  // 重量和体积信息
  unitWeight?: number;
  totalWeight?: number;
  unitVolume?: number;
  totalVolume?: number;

  // 包装信息
  packageType?: string;
  packageQuantity?: number;

  // 特殊属性
  isFragile?: boolean;
  isHazardous?: boolean;
  storageRequirement?: string;

  // 来源和位置信息
  fileSource?: string;
  sheetName?: string;
  rowNumber?: number;

  // 验证状态
  hasErrors?: boolean;
  hasWarnings?: boolean;
}

/**
 * 物料导入结果视图对象
 */
export interface MaterialImportResultVo {
  success: boolean;
  summary: string;
  totalRecords: number;
  successRecords: number;
  failedRecords: number;
  newProductRecords: number;
  matchedProductRecords: number;
  shippingListId?: string;
  listCode?: string;
  errors?: MaterialImportError[];
  warnings?: MaterialImportWarning[];
}

/**
 * 物料导入错误
 */
export interface MaterialImportError {
  rowNumber: number;
  materialName: string;
  fieldName: string;
  errorMessage: string;
}

/**
 * 物料导入警告
 */
export interface MaterialImportWarning {
  rowNumber: number;
  materialName: string;
  warningMessage: string;
}

/**
 * 产品匹配请求
 */
export interface ProductMatchRequest {
  materialName: string;
  specification?: string;
}

/**
 * 产品匹配响应
 */
export interface ProductMatchResponse {
  productId?: number;
  productName: string;
  specification?: string;
  matched: boolean;
}

