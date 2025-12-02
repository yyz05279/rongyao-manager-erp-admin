/**
 * 质量管理模块 - 类型定义
 */
import { PageQuery, SaltType, QualityLevel, InspectionResult } from '../types';

// 质量检验状态
export enum QualityInspectionStatus {
  PENDING = 'PENDING',             // 待检验
  IN_PROGRESS = 'IN_PROGRESS',     // 检验中
  COMPLETED = 'COMPLETED',         // 已完成
  CANCELLED = 'CANCELLED'          // 已取消
}

// 批次状态
export enum BatchStatus {
  PENDING = 'PENDING',             // 待检验
  QUALIFIED = 'QUALIFIED',         // 合格
  UNQUALIFIED = 'UNQUALIFIED',     // 不合格
  QUARANTINED = 'QUARANTINED',     // 隔离
  RELEASED = 'RELEASED',           // 已放行
  REJECTED = 'REJECTED'            // 已拒收
}

// 不合格品处理方式
export enum NonconformityAction {
  REWORK = 'REWORK',               // 返工
  REPAIR = 'REPAIR',               // 修复
  DOWNGRADE = 'DOWNGRADE',         // 降级
  SCRAP = 'SCRAP',                 // 报废
  RETURN = 'RETURN'                // 退货
}

// 质量检验查询参数
export interface QualityInspectionQuery extends PageQuery {
  inspectionNo?: string;
  batchNo?: string;
  productType?: SaltType;
  status?: QualityInspectionStatus;
  inspectorId?: string;
  startTime?: string;
  endTime?: string;
  qualityLevel?: QualityLevel;
}

// 质量检验信息
export interface QualityInspectionVO {
  id: string;
  inspectionNo: string;
  batchNo: string;
  productType: SaltType;
  productName: string;
  quantity: number;
  unit: string;
  supplierId?: string;
  supplierName?: string;
  productionDate?: string;
  inspectionDate: string;
  inspectorId: string;
  inspectorName: string;
  supervisorId?: string;
  supervisorName?: string;
  status: QualityInspectionStatus;
  qualityLevel?: QualityLevel;
  overallResult?: InspectionResult;
  testItems: QualityTestItemResult[];
  sampleQuantity: number;
  sampleMethod: string;
  testStandardId: string;
  testStandardName: string;
  certificateNo?: string;
  remarks?: string;
  createTime: string;
  updateTime: string;
}

// 质量检验表单
export interface QualityInspectionForm {
  id?: string;
  batchNo: string;
  productType: SaltType;
  quantity: number;
  unit: string;
  supplierId?: string;
  productionDate?: string;
  inspectionDate: string;
  inspectorId: string;
  supervisorId?: string;
  sampleQuantity: number;
  sampleMethod: string;
  testStandardId: string;
  remarks?: string;
}

// 检验项目结果
export interface QualityTestItemResult {
  itemId: string;
  itemName: string;
  itemCode: string;
  standardValue: string;
  actualValue: string;
  unit: string;
  tolerance: string;
  testMethod: string;
  result: InspectionResult;
  deviation?: number;
  isRequired: boolean;
  testTime: string;
  testerId: string;
  testerName: string;
  remarks?: string;
}

// 检验项目表单
export interface QualityTestItemForm {
  itemId: string;
  actualValue: string;
  result: InspectionResult;
  testTime: string;
  testerId: string;
  remarks?: string;
}

// 批次管理查询参数
export interface BatchQuery extends PageQuery {
  batchNo?: string;
  productType?: SaltType;
  status?: BatchStatus;
  productionStartDate?: string;
  productionEndDate?: string;
  qualityLevel?: QualityLevel;
}

// 批次信息
export interface BatchVO {
  id: string;
  batchNo: string;
  productType: SaltType;
  productName: string;
  productionDate: string;
  expiryDate?: string;
  quantity: number;
  unit: string;
  status: BatchStatus;
  qualityLevel?: QualityLevel;
  projectId?: string;
  projectName?: string;
  taskId?: string;
  taskName?: string;
  operatorId: string;
  operatorName: string;
  warehouseId?: string;
  warehouseName?: string;
  locationId?: string;
  locationName?: string;
  inspectionId?: string;
  inspectionResult?: InspectionResult;
  certificateNo?: string;
  traceabilityInfo: TraceabilityInfo;
  remarks?: string;
  createTime: string;
  updateTime: string;
}

// 批次表单
export interface BatchForm {
  id?: string;
  batchNo: string;
  productType: SaltType;
  productionDate: string;
  expiryDate?: string;
  quantity: number;
  unit: string;
  projectId?: string;
  taskId?: string;
  operatorId: string;
  warehouseId?: string;
  locationId?: string;
  remarks?: string;
}

// 可追溯信息
export interface TraceabilityInfo {
  rawMaterials: RawMaterialTrace[];
  processSteps: ProcessStepTrace[];
  qualityRecords: QualityRecordTrace[];
  operators: OperatorTrace[];
}

// 原料追溯
export interface RawMaterialTrace {
  materialId: string;
  materialName: string;
  batchNo: string;
  supplierId: string;
  supplierName: string;
  quantity: number;
  unit: string;
  usageTime: string;
}

// 工艺步骤追溯
export interface ProcessStepTrace {
  stepName: string;
  stepType: string;
  startTime: string;
  endTime: string;
  operatorId: string;
  operatorName: string;
  equipmentId: string;
  equipmentName: string;
  parameters: Record<string, any>;
}

// 质量记录追溯
export interface QualityRecordTrace {
  inspectionId: string;
  inspectionType: string;
  inspectionTime: string;
  inspectorId: string;
  inspectorName: string;
  result: InspectionResult;
  certificateNo?: string;
}

// 操作员追溯
export interface OperatorTrace {
  operatorId: string;
  operatorName: string;
  operationType: string;
  operationTime: string;
  workShift: string;
}

// 不合格品查询参数
export interface NonconformityQuery extends PageQuery {
  nonconformityNo?: string;
  batchNo?: string;
  productType?: SaltType;
  status?: string;
  handlerId?: string;
  startTime?: string;
  endTime?: string;
}

// 不合格品信息
export interface NonconformityVO {
  id: string;
  nonconformityNo: string;
  batchId: string;
  batchNo: string;
  productType: SaltType;
  productName: string;
  quantity: number;
  unit: string;
  nonconformityType: string;
  nonconformityDescription: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  discoveryTime: string;
  discoveredBy: string;
  discoveredByName: string;
  inspectionId?: string;
  inspectionNo?: string;
  rootCause?: string;
  correctiveAction?: string;
  preventiveAction?: string;
  handlingAction: NonconformityAction;
  handlerId?: string;
  handlerName?: string;
  handlingTime?: string;
  handlingResult?: string;
  status: 'IDENTIFIED' | 'INVESTIGATING' | 'HANDLING' | 'COMPLETED' | 'CLOSED';
  cost?: number;
  photos: string[];
  documents: string[];
  remarks?: string;
  createTime: string;
  updateTime: string;
}

// 不合格品表单
export interface NonconformityForm {
  id?: string;
  batchId: string;
  quantity: number;
  nonconformityType: string;
  nonconformityDescription: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  discoveryTime: string;
  discoveredBy: string;
  inspectionId?: string;
  rootCause?: string;
  correctiveAction?: string;
  preventiveAction?: string;
  handlingAction: NonconformityAction;
  handlerId?: string;
  handlingTime?: string;
  handlingResult?: string;
  cost?: number;
  photos: string[];
  documents: string[];
  remarks?: string;
}

// 质量标准查询参数
export interface QualityStandardQuery extends PageQuery {
  standardName?: string;
  productType?: SaltType;
  isActive?: boolean;
}

// 质量标准信息
export interface QualityStandardVO {
  id: string;
  standardCode: string;
  standardName: string;
  productType: SaltType;
  version: string;
  effectiveDate: string;
  expiryDate?: string;
  isActive: boolean;
  testItems: QualityTestStandardItem[];
  approvedBy: string;
  approvedByName: string;
  approvalDate: string;
  remarks?: string;
  createTime: string;
  updateTime: string;
}

// 质量标准检验项目
export interface QualityTestStandardItem {
  itemId: string;
  itemName: string;
  itemCode: string;
  standardValue: string;
  tolerance: string;
  unit: string;
  testMethod: string;
  isRequired: boolean;
  sortOrder: number;
  remarks?: string;
}

// 质量统计
export interface QualityStatistics {
  totalInspections: number;
  passedInspections: number;
  failedInspections: number;
  passRate: number;
  totalBatches: number;
  qualifiedBatches: number;
  qualificationRate: number;
  premiumRate: number;
  firstClassRate: number;
  nonconformityCount: number;
  nonconformityRate: number;
  averageInspectionTime: number; // 分钟
  period: string;
}

// 质量趋势分析
export interface QualityTrendAnalysis {
  period: string;
  passRate: number;
  qualificationRate: number;
  premiumRate: number;
  nonconformityRate: number;
  averageTestValue: Record<string, number>;
  trendDirection: 'UP' | 'DOWN' | 'STABLE';
}

// 检验项目统计
export interface TestItemStatistics {
  itemId: string;
  itemName: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  passRate: number;
  averageValue: number;
  standardValue: string;
  deviation: number;
  outOfSpecCount: number;
}

// 质量报告
export interface QualityReport {
  reportType: 'INSPECTION_SUMMARY' | 'BATCH_QUALITY' | 'NONCONFORMITY_ANALYSIS' | 'TREND_ANALYSIS';
  reportTitle: string;
  reportPeriod: string;
  productType?: SaltType;
  summary: QualityReportSummary;
  details: any[];
  charts: QualityChartData[];
  generateTime: string;
  generatedBy: string;
}

// 质量报告汇总
export interface QualityReportSummary {
  totalInspections: number;
  passRate: number;
  qualificationRate: number;
  nonconformityCount: number;
  averageInspectionTime: number;
  topNonconformityTypes: string[];
  qualityTrend: 'IMPROVING' | 'DECLINING' | 'STABLE';
}

// 质量图表数据
export interface QualityChartData {
  chartType: 'LINE' | 'BAR' | 'PIE' | 'SCATTER';
  title: string;
  xAxis: string[];
  yAxis: number[];
  series: QualityChartSeries[];
}

// 质量图表系列
export interface QualityChartSeries {
  name: string;
  data: number[];
  type: string;
}

// 质量测试查询参数
export interface QualityTestQuery extends PageQuery {
  inspectionNo?: string;
  batchNo?: string;
  itemName?: string;
  testCode?: string;
  sampleName?: string;
  testType?: string;
  testStatus?: string;
  testResult?: string;
  testDateRange?: [string, string];
  result?: InspectionResult;
  startDate?: string;
  endDate?: string;
}

// 质量测试结果VO
export interface QualityTestVO {
  id: string;
  inspectionNo: string;
  batchNo: string;
  itemId: string;
  itemName: string;
  itemCode: string;
  standardValue: string;
  actualValue: string;
  unit: string;
  tolerance: string;
  testMethod: string;
  result: InspectionResult;
  deviation?: number;
  isRequired: boolean;
  testTime: string;
  testerId: string;
  testerName: string;
  remarks?: string;
  createTime: string;
}
