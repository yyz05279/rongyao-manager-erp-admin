/**
 * 预热记录管理模块 - 类型定义
 */

// 预热记录查询参数
export interface PreheatingRecordQuery {
  pageNum?: number;
  pageSize?: number;
  recordCode?: string;
  taskId?: number;
  projectId?: number;
  tankNumber?: string;
  recordDate?: string;
  qualityStatus?: number;
  equipmentStatus?: number;
  operatorId?: number;
  startDate?: string;
  endDate?: string;
}

// 预热记录VO (根据API文档规范)
export interface PreheatingRecordVO {
  id: number;
  recordCode: string;
  taskId: number;
  projectId: number;
  tankNumber: string;
  recordDate: string;
  recordTime: string;
  shift: number; // 1-白班, 2-夜班
  targetTemperature: number;
  actualTemperature: number;
  temperatureDeviation: number;
  heatingRate: number; // 升温速率(°C/min)
  targetPressure: number;
  actualPressure: number;
  pressureDeviation: number;
  heatingPower: number; // 加热功率(kW)
  heatingEfficiency: number; // 加热效率(%)
  equipmentStatus: number; // 1-正常, 2-维护, 3-故障
  alarmStatus: number; // 0-无报警, 1-有报警
  energyConsumption: number; // 能耗(kWh)
  hourlyConsumption: number; // 小时能耗(kWh/h)
  operatorId: number;
  operatorName: string;
  supervisorId?: number;
  supervisorName?: string;
  qualityStatus: number; // 1-正常, 2-异常, 3-待检查
  deviationReason?: string;
  correctiveAction?: string;
  remarks?: string;
  createTime: string;
  updateTime: string;
}

// 预热记录表单 (根据API文档规范)
export interface PreheatingRecordForm {
  id?: number;
  recordCode: string;
  taskId: number;
  projectId: number;
  tankNumber: string;
  recordDate: string;
  recordTime: string;
  shift: number;
  targetTemperature: number;
  actualTemperature: number;
  heatingRate: number;
  targetPressure: number;
  actualPressure: number;
  heatingPower: number;
  heatingEfficiency: number;
  equipmentStatus: number;
  alarmStatus: number;
  energyConsumption: number;
  hourlyConsumption: number;
  operatorId: number;
  operatorName: string;
  supervisorId?: number;
  supervisorName?: string;
  qualityStatus: number;
  deviationReason?: string;
  correctiveAction?: string;
  remarks?: string;
}

// 预热记录统计信息
export interface PreheatingRecordStatistics {
  totalRecords: number;
  todayRecords: number;
  weekRecords: number;
  monthRecords: number;
  normalRecords: number;
  abnormalRecords: number;
  averageTemperature: number;
  averagePressure: number;
  averageDuration: number;
  qualityPassRate: number;
}

// 温度趋势数据点
export interface TemperatureTrendPoint {
  time: string;
  targetTemperature: number;
  actualTemperature: number;
  deviation: number;
}

// 压力趋势数据点
export interface PressureTrendPoint {
  time: string;
  targetPressure: number;
  actualPressure: number;
  deviation: number;
}

// 预热记录审核信息
export interface PreheatingRecordAudit {
  id: string;
  recordId: string;
  auditType: string; // 审核类型
  auditStatus: number; // 1-通过, 2-拒绝, 3-待审核
  auditResult: string;
  auditComments?: string;
  auditorId: number;
  auditorName: string;
  auditTime: string;
}

// 预热记录验证结果
export interface PreheatingRecordValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

// 预热设备状态枚举
export enum PreheatingEquipmentStatus {
  NORMAL = 1,
  MAINTENANCE = 2,
  FAULT = 3
}

// 预热质量状态枚举
export enum PreheatingQualityStatus {
  NORMAL = 1,
  ABNORMAL = 2,
  PENDING_CHECK = 3
}

// 班次枚举
export enum WorkShift {
  DAY_SHIFT = 1,
  NIGHT_SHIFT = 2
}

// 预热记录导入结果
export interface PreheatingRecordImportResult {
  successCount: number;
  failureCount: number;
  totalCount: number;
  errors: Array<{
    row: number;
    message: string;
  }>;
}

// 预热记录导出参数
export interface PreheatingRecordExportParams extends PreheatingRecordQuery {
  exportFields?: string[];
  exportFormat?: 'excel' | 'csv';
}

// 预热记录批量操作参数
export interface PreheatingRecordBatchParams {
  ids: Array<string | number>;
  operation: 'delete' | 'updateStatus' | 'export';
  params?: any;
}

// 预热记录搜索条件
export interface PreheatingRecordSearchCondition {
  keyword?: string;
  dateRange?: [string, string];
  temperatureRange?: [number, number];
  pressureRange?: [number, number];
  qualityStatus?: number[];
  equipmentStatus?: number[];
  operatorIds?: number[];
}

// 预热记录排序参数
export interface PreheatingRecordSortParams {
  field: string;
  order: 'asc' | 'desc';
}

// 预热记录分页参数
export interface PreheatingRecordPageParams {
  pageNum: number;
  pageSize: number;
  sort?: PreheatingRecordSortParams;
}

// 预热记录过滤参数
export interface PreheatingRecordFilterParams {
  status?: number[];
  dateRange?: [string, string];
  temperatureRange?: [number, number];
  pressureRange?: [number, number];
  operators?: number[];
  projects?: number[];
  tanks?: string[];
}

// 预热记录汇总信息
export interface PreheatingRecordSummary {
  recordCount: number;
  averageTemperature: number;
  averagePressure: number;
  averageDuration: number;
  maxTemperature: number;
  minTemperature: number;
  maxPressure: number;
  minPressure: number;
  qualityPassRate: number;
  equipmentNormalRate: number;
}

// 预热记录对比数据
export interface PreheatingRecordComparison {
  current: PreheatingRecordVO;
  previous?: PreheatingRecordVO;
  temperatureDeviation: number;
  pressureDeviation: number;
  durationDeviation: number;
  qualityImprovement: boolean;
}

// 预热记录告警信息
export interface PreheatingRecordAlert {
  id: string;
  recordId: string;
  alertType: string;
  alertLevel: 'low' | 'medium' | 'high' | 'critical';
  alertMessage: string;
  alertTime: string;
  isHandled: boolean;
  handlerName?: string;
  handleTime?: string;
  handleComments?: string;
}
