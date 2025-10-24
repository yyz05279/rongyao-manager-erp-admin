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
 * 物料导入业务对象
 */
export interface MaterialImportBo {
  projectId: string;
  batchNumber?: string;
  responsiblePerson?: string;
  shippingDate?: string;
  materialItems: MaterialItemBo[];
  fileSource?: string;
  remarks?: string;
}

/**
 * 物料明细业务对象
 */
export interface MaterialItemBo {
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

