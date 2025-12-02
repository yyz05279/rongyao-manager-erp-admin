/**
 * 化盐工艺流程管理模块 - 通用类型定义
 */

// 基础响应类型
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

// 分页查询基础类型
export interface PageQuery {
  pageNum?: number;
  pageSize?: number;
}

// 分页响应类型
export interface PageResult<T> {
  rows: T[];
  total: number;
}

// 通用枚举类型
export enum ProjectStatus {
  PLANNING = 'PLANNING',           // 规划中
  IN_PROGRESS = 'IN_PROGRESS',     // 进行中
  COMPLETED = 'COMPLETED',         // 已完成
  SUSPENDED = 'SUSPENDED',         // 已暂停
  CANCELLED = 'CANCELLED'          // 已取消
}

export enum ProjectType {
  BINARY_SALT = 'BINARY_SALT',     // 二元化盐
  TERNARY_SALT = 'TERNARY_SALT'    // 三元化盐
}

export enum TaskStatus {
  PENDING = 'PENDING',             // 待开始
  IN_PROGRESS = 'IN_PROGRESS',     // 进行中
  COMPLETED = 'COMPLETED',         // 已完成
  FAILED = 'FAILED',               // 失败
  CANCELLED = 'CANCELLED'          // 已取消
}

export enum SaltType {
  BINARY = 'BINARY',               // 二元化盐
  TERNARY = 'TERNARY',             // 三元化盐
  BINARY_SALT = 'BINARY_SALT',     // 二元化盐（兼容）
  TERNARY_SALT = 'TERNARY_SALT'    // 三元化盐（兼容）
}

export enum ControlMode {
  AUTO = 'AUTO',                   // 自动控制
  MANUAL = 'MANUAL'                // 手动控制
}

export enum TemperatureLocation {
  TOP = 'TOP',                     // 罐体上部
  MIDDLE = 'MIDDLE',               // 罐体中部
  BOTTOM = 'BOTTOM'                // 罐体下部
}

export enum InspectionResult {
  PASS = 'PASS',                   // 合格
  FAIL = 'FAIL',                   // 不合格
  WARNING = 'WARNING'              // 警告
}

export enum RatioStatus {
  NORMAL = 'NORMAL',               // 正常
  WARNING = 'WARNING',             // 警告
  ERROR = 'ERROR'                  // 错误
}

export enum QualityLevel {
  PREMIUM = 'PREMIUM',             // 优等品
  FIRST_CLASS = 'FIRST_CLASS',     // 一等品
  QUALIFIED = 'QUALIFIED',         // 合格品
  UNQUALIFIED = 'UNQUALIFIED'      // 不合格品
}

export enum InventoryType {
  RAW_MATERIAL = 'RAW_MATERIAL',   // 原料
  FINISHED_PRODUCT = 'FINISHED_PRODUCT', // 成品
  WORK_IN_PROCESS = 'WORK_IN_PROCESS'    // 在制品
}

export enum StockOperation {
  IN = 'IN',                       // 入库
  OUT = 'OUT'                      // 出库
}

// 通用数据点类型
export interface DataPoint {
  timestamp: string;
  value: number;
}

export interface TemperaturePoint extends DataPoint {
  location: TemperatureLocation;
}

export interface PressurePoint extends DataPoint {
  unit: string; // MPa
}

export interface ParameterPoint extends DataPoint {
  parameter: string;
  unit: string;
}

// 报警类型
export interface Alert {
  id: string;
  taskId: string;
  type: string;
  level: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  message: string;
  status: 'ACTIVE' | 'HANDLED' | 'CLOSED';
  createTime: string;
  handledTime?: string;
  handledAction?: string;
  handledBy?: string;
}

// 操作记录类型
export interface OperationRecord {
  id: string;
  taskId: string;
  operationType: string;
  operationDesc: string;
  operatorId: string;
  operatorName: string;
  operationTime: string;
  parameters?: Record<string, any>;
  result?: string;
}

// 设备状态类型
export interface EquipmentStatus {
  equipmentId: string;
  equipmentName: string;
  status: 'NORMAL' | 'WARNING' | 'ERROR' | 'OFFLINE';
  temperature?: number;
  pressure?: number;
  power?: number;
  lastUpdateTime: string;
}

// 质量检验结果类型
export interface QualityResult {
  id: string;
  batchNo: string;
  productType: SaltType;
  qualityLevel: QualityLevel;
  testItems: QualityTestItem[];
  inspector: string;
  inspectionTime: string;
  remarks?: string;
}

export interface QualityTestItem {
  itemName: string;
  standardValue: string;
  actualValue: string;
  unit: string;
  result: 'PASS' | 'FAIL';
  deviation?: number;
}

// 配比相关类型
export interface RatioItem {
  component: string;
  componentName: string;
  targetRatio: number;
  currentRatio: number;
  deviation: number;
  targetAmount: number;
  actualAmount: number;
  tolerance: number;
  status: RatioStatus;
}

export interface RatioAdjustment {
  component: string;
  adjustmentAmount: number;
  adjustmentType: 'INCREASE' | 'DECREASE';
  reason?: string;
}

// 工艺参数类型
export interface ProcessParameters {
  temperature: number;
  targetTemperature: number;
  pressure: number;
  targetPressure: number;
  stirringSpeed: number;
  targetStirringSpeed: number;
  stirringPower: number;
  flowRate: number;
  controlMode: ControlMode;
  equipmentStatus: string;
  recordTime: string;
}

// 库存相关类型
export interface InventoryItem {
  id: string;
  materialCode: string;
  materialName: string;
  specification: string;
  inventoryType: InventoryType;
  currentStock: number;
  availableStock: number;
  reservedStock: number;
  safetyStock: number;
  unit: string;
  unitPrice: number;
  totalValue: number;
  lastUpdateTime: string;
}

export interface StockTransaction {
  id: string;
  transactionNo: string;
  materialId: string;
  operation: StockOperation;
  quantity: number;
  unit: string;
  batchNo?: string;
  warehouseId: string;
  locationId?: string;
  operatorId: string;
  operatorName: string;
  transactionTime: string;
  remarks?: string;
}

// 统计分析类型
export interface ProductionStatistics {
  totalOutput: number;
  targetOutput: number;
  achievementRate: number;
  qualityRate: number;
  equipmentUtilization: number;
  energyConsumption: number;
  period: string;
}

export interface QualityStatistics {
  totalBatches: number;
  qualifiedBatches: number;
  qualificationRate: number;
  premiumRate: number;
  firstClassRate: number;
  defectRate: number;
  period: string;
}

export interface CostStatistics {
  rawMaterialCost: number;
  energyCost: number;
  laborCost: number;
  totalCost: number;
  unitCost: number;
  period: string;
}

// 分析周期类型
export type AnalysisPeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | string;
