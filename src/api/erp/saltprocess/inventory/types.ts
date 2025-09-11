/**
 * 库存管理模块 - 类型定义
 */
import { PageQuery, InventoryType, StockOperation } from '../types';

// 库存状态
export enum InventoryStatus {
  NORMAL = 'NORMAL',               // 正常
  LOW_STOCK = 'LOW_STOCK',         // 库存不足
  OUT_OF_STOCK = 'OUT_OF_STOCK',   // 缺货
  OVERSTOCK = 'OVERSTOCK',         // 库存过多
  EXPIRED = 'EXPIRED',             // 已过期
  DAMAGED = 'DAMAGED'              // 已损坏
}

// 库存预警级别
export enum AlertLevel {
  NORMAL = 'NORMAL',               // 正常
  WARNING = 'WARNING',             // 警告
  CRITICAL = 'CRITICAL'            // 严重
}

// 库存查询参数
export interface InventoryQuery extends PageQuery {
  materialCode?: string;
  materialName?: string;
  inventoryType?: InventoryType;
  warehouseId?: string;
  status?: InventoryStatus;
  alertLevel?: AlertLevel;
  categoryId?: string;
}

// 库存信息
export interface InventoryVO {
  id: string;
  materialCode: string;
  materialName: string;
  specification: string;
  inventoryType: InventoryType;
  categoryId: string;
  categoryName: string;
  warehouseId: string;
  warehouseName: string;
  locationId?: string;
  locationName?: string;
  currentStock: number;
  availableStock: number;
  reservedStock: number;
  safetyStock: number;
  maxStock: number;
  unit: string;
  unitPrice: number;
  totalValue: number;
  status: InventoryStatus;
  alertLevel: AlertLevel;
  batchInfo: BatchInfo[];
  expiryDate?: string;
  lastInboundTime?: string;
  lastOutboundTime?: string;
  lastUpdateTime: string;
  createTime: string;
}

// 批次信息
export interface BatchInfo {
  batchNo: string;
  quantity: number;
  unitPrice: number;
  productionDate?: string;
  expiryDate?: string;
  supplierId?: string;
  supplierName?: string;
  qualityStatus: 'QUALIFIED' | 'UNQUALIFIED' | 'PENDING';
  inboundTime: string;
}

// 库存表单
export interface InventoryForm {
  id?: string;
  materialCode: string;
  materialName: string;
  specification: string;
  inventoryType: InventoryType;
  categoryId: string;
  warehouseId: string;
  locationId?: string;
  safetyStock: number;
  maxStock: number;
  unit: string;
  unitPrice: number;
  remarks?: string;
}

// 出入库记录查询参数
export interface StockTransactionQuery extends PageQuery {
  transactionNo?: string;
  materialId?: string;
  operation?: StockOperation;
  warehouseId?: string;
  operatorId?: string;
  startTime?: string;
  endTime?: string;
  batchNo?: string;
}

// 出入库记录
export interface StockTransactionVO {
  id: string;
  transactionNo: string;
  materialId: string;
  materialCode: string;
  materialName: string;
  specification: string;
  operation: StockOperation;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalAmount: number;
  batchNo?: string;
  warehouseId: string;
  warehouseName: string;
  locationId?: string;
  locationName?: string;
  operatorId: string;
  operatorName: string;
  transactionTime: string;
  relatedTaskId?: string;
  relatedTaskType?: string;
  supplierId?: string;
  supplierName?: string;
  customerId?: string;
  customerName?: string;
  remarks?: string;
  createTime: string;
}

// 出入库表单
export interface StockTransactionForm {
  materialId: string;
  operation: StockOperation;
  quantity: number;
  unitPrice: number;
  batchNo?: string;
  warehouseId: string;
  locationId?: string;
  operatorId: string;
  relatedTaskId?: string;
  relatedTaskType?: string;
  supplierId?: string;
  customerId?: string;
  remarks?: string;
}

// 库存调整记录
export interface StockAdjustmentVO {
  id: string;
  adjustmentNo: string;
  materialId: string;
  materialCode: string;
  materialName: string;
  adjustmentType: 'INCREASE' | 'DECREASE' | 'CORRECTION';
  beforeQuantity: number;
  adjustmentQuantity: number;
  afterQuantity: number;
  unit: string;
  reason: string;
  warehouseId: string;
  warehouseName: string;
  locationId?: string;
  locationName?: string;
  operatorId: string;
  operatorName: string;
  approverId?: string;
  approverName?: string;
  adjustmentTime: string;
  approvalTime?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  remarks?: string;
  createTime: string;
}

// 库存调整表单
export interface StockAdjustmentForm {
  materialId: string;
  adjustmentType: 'INCREASE' | 'DECREASE' | 'CORRECTION';
  adjustmentQuantity: number;
  reason: string;
  warehouseId: string;
  locationId?: string;
  operatorId: string;
  remarks?: string;
}

// 库存预警
export interface InventoryAlert {
  id: string;
  materialId: string;
  materialCode: string;
  materialName: string;
  alertType: 'LOW_STOCK' | 'OUT_OF_STOCK' | 'OVERSTOCK' | 'EXPIRY' | 'DAMAGE';
  alertLevel: AlertLevel;
  currentStock: number;
  safetyStock: number;
  maxStock: number;
  warehouseId: string;
  warehouseName: string;
  message: string;
  status: 'ACTIVE' | 'HANDLED' | 'CLOSED';
  createTime: string;
  handledTime?: string;
  handledBy?: string;
  handlingAction?: string;
}

// 库存盘点
export interface InventoryCountVO {
  id: string;
  countNo: string;
  countName: string;
  countType: 'FULL' | 'PARTIAL' | 'CYCLE';
  warehouseId: string;
  warehouseName: string;
  status: 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  plannedStartTime: string;
  plannedEndTime: string;
  actualStartTime?: string;
  actualEndTime?: string;
  operatorId: string;
  operatorName: string;
  supervisorId?: string;
  supervisorName?: string;
  totalItems: number;
  countedItems: number;
  discrepancyItems: number;
  progress: number;
  remarks?: string;
  createTime: string;
  updateTime: string;
}

// 盘点表单
export interface InventoryCountForm {
  countName: string;
  countType: 'FULL' | 'PARTIAL' | 'CYCLE';
  warehouseId: string;
  plannedStartTime: string;
  plannedEndTime: string;
  operatorId: string;
  supervisorId?: string;
  materialIds?: string[]; // 部分盘点时指定物料
  remarks?: string;
}

// 盘点明细
export interface InventoryCountDetailVO {
  id: string;
  countId: string;
  materialId: string;
  materialCode: string;
  materialName: string;
  specification: string;
  unit: string;
  bookQuantity: number;
  actualQuantity: number;
  discrepancyQuantity: number;
  discrepancyRate: number;
  unitPrice: number;
  discrepancyValue: number;
  batchNo?: string;
  locationId?: string;
  locationName?: string;
  counterId: string;
  counterName: string;
  countTime: string;
  status: 'PENDING' | 'COUNTED' | 'CONFIRMED';
  remarks?: string;
}

// 盘点明细表单
export interface InventoryCountDetailForm {
  countId: string;
  materialId: string;
  actualQuantity: number;
  batchNo?: string;
  locationId?: string;
  counterId: string;
  countTime: string;
  remarks?: string;
}

// 库存统计
export interface InventoryStatistics {
  totalMaterials: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  expiredItems: number;
  turnoverRate: number;
  averageStockDays: number;
  warehouseUtilization: number;
  period: string;
}

// 库存周转分析
export interface InventoryTurnoverAnalysis {
  materialId: string;
  materialCode: string;
  materialName: string;
  averageStock: number;
  totalConsumption: number;
  turnoverRate: number;
  turnoverDays: number;
  lastInboundTime?: string;
  lastOutboundTime?: string;
  stockStatus: InventoryStatus;
  period: string;
}

// ABC分析
export interface ABCAnalysis {
  materialId: string;
  materialCode: string;
  materialName: string;
  totalValue: number;
  valuePercentage: number;
  cumulativePercentage: number;
  category: 'A' | 'B' | 'C';
  recommendedStrategy: string;
}

// 库存报告
export interface InventoryReport {
  reportType: 'STOCK_STATUS' | 'TURNOVER' | 'ABC_ANALYSIS' | 'ALERT_SUMMARY';
  reportTitle: string;
  reportPeriod: string;
  warehouseId?: string;
  warehouseName?: string;
  totalItems: number;
  totalValue: number;
  summary: InventoryReportSummary;
  details: any[];
  generateTime: string;
  generatedBy: string;
}

// 库存报告汇总
export interface InventoryReportSummary {
  normalItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  overstockItems: number;
  expiredItems: number;
  totalAlerts: number;
  averageTurnoverRate: number;
  warehouseUtilization: number;
}
