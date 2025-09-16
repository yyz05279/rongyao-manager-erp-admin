/**
 * 二元化盐记录管理模块 - 类型定义
 */

// 二元化盐记录查询参数
export interface BinaryRecordQuery {
  pageNum?: number;
  pageSize?: number;
  recordCode?: string;
  batchNumber?: string;
  projectId?: number;          // 保留用于后端查询
  projectName?: string;        // 新增项目名称字段用于前端筛选
  recordDate?: string;
  startDate?: string;
  endDate?: string;
  shift?: number;              // 班次 (1-白班, 2-夜班)
  ratioStatus?: 'normal' | 'abnormal';  // 配比状态
  qualityGrade?: number;
  operatorId?: number;
  recorderName?: string;       // 记录人
  operatorName?: string;       // 操作人
  ratioDeviationRange?: [number, number];
  yieldRateRange?: [number, number];
}

// 二元化盐记录VO
export interface BinaryRecordVO {
  id: string;
  recordCode: string;
  batchNumber: string;
  projectId: number;
  recordDate: string;
  startTime: string;
  endTime: string;
  duration: number; // 持续时间(分钟)
  shift: number; // 1-白班, 2-夜班
  
  // NaNO3配比信息
  nano3TargetRatio: number; // 目标配比(%)
  nano3ActualRatio: number; // 实际配比(%)
  nano3TargetWeight: number; // 目标用量(kg)
  nano3ActualWeight: number; // 实际用量(kg)
  
  // KNO3配比信息
  kno3TargetRatio: number; // 目标配比(%)
  kno3ActualRatio: number; // 实际配比(%)
  kno3TargetWeight: number; // 目标用量(kg)
  kno3ActualWeight: number; // 实际用量(kg)
  
  // 配比偏差
  ratioDeviation: number; // 配比偏差(%)
  totalWeight: number; // 总重量(kg)
  totalSaltWeight?: number; // 总计化盐量(kg) - 包含累积值，由后台计算
  
  // 工艺参数
  reactionTemperature: number; // 反应温度(°C)
  reactionTime: number; // 反应时间(分钟)
  stirringSpeed: number; // 搅拌速度(rpm)
  heatingPower: number; // 加热功率(kW)
  phValue: number; // pH值
  density: number; // 密度(g/cm³)
  
  // 质量信息
  moistureContent: number; // 含水率(%)
  purity: number; // 纯度(%)
  qualityGrade: number; // 1-优秀, 2-良好, 3-合格, 4-不合格
  qualityCheckResult: number; // 1-合格, 0-不合格
  qualityIssues?: string;
  correctiveActions?: string;
  
  // 产量信息
  targetOutput: number; // 目标产量(kg)
  actualOutput: number; // 实际产量(kg)
  yieldRate: number; // 产出率(%)
  
  // 成本信息
  materialCost: number; // 原料成本
  energyCost: number; // 能源成本
  laborCost: number; // 人工成本
  totalCost: number; // 总成本
  
  // 操作员信息
  operatorId: number;
  operatorName: string;
  supervisorId?: number;
  supervisorName?: string;
  
  remarks?: string;
  createTime: string;
  updateTime: string;
  createBy: string;
  updateBy: string;
}

// 二元化盐记录表单
export interface BinaryRecordForm {
  id?: string;
  recordCode: string;
  batchNumber: string;
  projectId: number;
  projectName?: string;  // 新增项目名称字段用于前端表单
  recordDate: string;
  startTime: string;
  endTime: string;
  shift: number;
  
  // NaNO3配比信息
  nano3TargetRatio: number;
  nano3ActualRatio: number;
  nano3TargetWeight: number;
  nano3ActualWeight: number;
  
  // KNO3配比信息
  kno3TargetRatio: number;
  kno3ActualRatio: number;
  kno3TargetWeight: number;
  kno3ActualWeight: number;
  
  // 工艺参数
  reactionTemperature: number;
  reactionTime: number;
  stirringSpeed: number;
  heatingPower: number;
  phValue: number;
  density: number;
  
  // 质量信息
  moistureContent: number;
  purity: number;
  qualityGrade: number;
  qualityCheckResult: number;
  qualityIssues?: string;
  correctiveActions?: string;
  
  // 产量信息
  targetOutput: number;
  actualOutput: number;
  
  // 成本信息
  materialCost: number;
  energyCost: number;
  laborCost: number;

  // 新增字段 - 根据Excel表格结构
  moltenSaltLevel?: number; // 熔盐罐熔盐液位(m)
  moltenSaltTemperature?: number; // 熔盐罐熔盐温度(℃)
  gasConsumption?: number; // 每班天然气耗量(Nm³)
  powerConsumption?: number; // 每班用电量(KWh)
  staffCount?: number; // 人数
  recorderName?: string; // 记录人
  cumulativeSaltAmount?: number; // 累积化盐量(t)

  operatorId: number;
  supervisorId?: number;
  remarks?: string;
}

// 二元化盐记录统计信息
export interface BinaryRecordStatistics {
  totalRecords: number;
  todayRecords: number;
  weekRecords: number;
  monthRecords: number;
  averageYieldRate: number;
  averageRatioDeviation: number;
  qualityGradeDistribution: {
    excellent: number;
    good: number;
    qualified: number;
    unqualified: number;
  };
  totalOutput: number;
  totalCost: number;
  averageCostPerKg: number;
}

// 配比分析数据
export interface BinaryRatioAnalysis {
  recordId: string;
  nano3Analysis: {
    targetRatio: number;
    actualRatio: number;
    deviation: number;
    deviationPercentage: number;
    isWithinTolerance: boolean;
  };
  kno3Analysis: {
    targetRatio: number;
    actualRatio: number;
    deviation: number;
    deviationPercentage: number;
    isWithinTolerance: boolean;
  };
  overallDeviation: number;
  qualityImpact: string;
  recommendations: string[];
}

// 产量趋势数据点
export interface BinaryOutputTrendPoint {
  date: string;
  targetOutput: number;
  actualOutput: number;
  yieldRate: number;
  qualityGrade: number;
}

// 质量分析数据
export interface BinaryQualityAnalysis {
  period: string;
  totalRecords: number;
  qualityDistribution: {
    excellent: number;
    good: number;
    qualified: number;
    unqualified: number;
  };
  averagePurity: number;
  averageMoistureContent: number;
  qualityTrends: Array<{
    date: string;
    purity: number;
    moistureContent: number;
    qualityGrade: number;
  }>;
  qualityIssues: Array<{
    issue: string;
    frequency: number;
    impact: string;
  }>;
}

// 成本分析数据
export interface BinaryCostAnalysis {
  period: string;
  totalCost: number;
  costBreakdown: {
    materialCost: number;
    energyCost: number;
    laborCost: number;
  };
  costPerKg: number;
  costTrends: Array<{
    date: string;
    totalCost: number;
    costPerKg: number;
  }>;
  costOptimizationSuggestions: string[];
}

// 效率分析数据
export interface BinaryEfficiencyAnalysis {
  period: string;
  averageYieldRate: number;
  averageReactionTime: number;
  averageEnergyConsumption: number;
  efficiencyTrends: Array<{
    date: string;
    yieldRate: number;
    reactionTime: number;
    energyConsumption: number;
  }>;
  efficiencyBottlenecks: string[];
  improvementSuggestions: string[];
}

// 配比优化建议
export interface BinaryRatioOptimization {
  recordId: string;
  currentRatio: {
    nano3: number;
    kno3: number;
  };
  optimizedRatio: {
    nano3: number;
    kno3: number;
  };
  expectedImprovements: {
    yieldRateIncrease: number;
    qualityImprovement: string;
    costReduction: number;
  };
  implementationSteps: string[];
  riskAssessment: string[];
}

// 二元化盐质量等级枚举
export enum BinaryQualityGrade {
  EXCELLENT = 1,
  GOOD = 2,
  QUALIFIED = 3,
  UNQUALIFIED = 4
}

// 二元化盐记录验证结果
export interface BinaryRecordValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  ratioValidation: {
    nano3Valid: boolean;
    kno3Valid: boolean;
    totalRatioValid: boolean;
  };
  qualityValidation: {
    purityValid: boolean;
    moistureValid: boolean;
    densityValid: boolean;
  };
}

// 二元化盐记录审核信息
export interface BinaryRecordAudit {
  id: string;
  recordId: string;
  auditType: string;
  auditStatus: number; // 1-通过, 2-拒绝, 3-待审核
  auditResult: string;
  auditComments?: string;
  auditorId: number;
  auditorName: string;
  auditTime: string;
}

// 二元化盐记录导入结果
export interface BinaryRecordImportResult {
  successCount: number;
  failureCount: number;
  totalCount: number;
  errors: Array<{
    row: number;
    message: string;
  }>;
}

// 二元化盐记录对比数据
export interface BinaryRecordComparison {
  current: BinaryRecordVO;
  previous?: BinaryRecordVO;
  ratioDeviation: number;
  yieldRateChange: number;
  qualityChange: number;
  costChange: number;
  improvements: string[];
  regressions: string[];
}

/**
 * 批量导入结果
 */
export interface BatchImportResult {
  success?: boolean; // 可选字段，某些API可能不返回
  message?: string;  // 可选字段，某些API可能不返回
  totalCount: number;
  successCount: number;
  failureCount: number;
  skippedCount?: number; // 可选字段，某些API可能不返回
  errors: ImportError[];
  warnings?: ImportWarning[]; // 可选字段，某些API可能不返回
}

/**
 * 导入错误信息
 */
export interface ImportError {
  rowIndex: number;
  field: string;
  value: any;
  message: string;
  errorType: 'validation' | 'business' | 'duplicate' | 'format';
}

/**
 * 导入警告信息
 */
export interface ImportWarning {
  rowIndex: number;
  field: string;
  value: any;
  message: string;
  warningType: 'ratio' | 'range' | 'suggestion';
}

/**
 * 数据验证结果
 */
export interface ValidationResult {
  isValid: boolean;
  totalCount: number;
  validCount: number;
  invalidCount: number;
  errors: ImportError[];
  warnings: ImportWarning[];
}

/**
 * 导入进度信息
 */
export interface ImportProgress {
  current: number;
  total: number;
  percentage: number;
  status: 'processing' | 'validating' | 'importing' | 'completed' | 'failed';
  message: string;
}

// API响应基础结构
export interface ApiResponse<T = any> {
  code: number;
  msg: string;
  data: T;
}

// 分页响应结构
export interface PageResponse<T = any> {
  total: number;
  rows: T[];
}

// 二元化盐记录列表响应
export type BinaryRecordListResponse = ApiResponse<PageResponse<BinaryRecordVO>>;

// 二元化盐记录详情响应
export type BinaryRecordDetailResponse = ApiResponse<BinaryRecordVO>;

// 删除操作参数
export interface DeleteParams {
  ids: string[];              // 要删除的记录ID数组
}

// 导出参数
export interface ExportParams extends Omit<BinaryRecordQuery, 'pageNum' | 'pageSize'> {
  exportType?: 'excel' | 'csv'; // 导出类型
  fileName?: string;          // 文件名
}

// 基于模版的导出参数（根据接口文档定义）
export interface BinaryRecordTemplateExportParams {
  taskId?: number;            // 任务ID
  projectId?: number;         // 项目ID
  batchNumber?: string;       // 批次号
  recordDate?: string;        // 记录日期 (YYYY-MM-DD)
  startDate?: string;         // 开始日期 (YYYY-MM-DD)
  endDate?: string;           // 结束日期 (YYYY-MM-DD)
  shift?: number;             // 班次：1-白班,2-夜班
  operatorId?: number;        // 操作员ID
  qualityGrade?: number;      // 质量等级
  qualityCheckResult?: number; // 质检结果
}

// 统计分析查询参数
export interface StatisticsQuery {
  startDate?: string;         // 开始日期
  endDate?: string;           // 结束日期
  projectId?: number;         // 项目ID
  timeRange?: '7days' | '30days' | '3months' | 'custom'; // 时间范围
}

// 统计分析数据结构
export interface StatisticsData {
  dates: string[];            // 日期数组
  nano3Data: number[];        // 硝酸钠用量数据
  kno3Data: number[];         // 硝酸钾用量数据
  gasData: number[];          // 天然气消耗数据
  powerData: number[];        // 电量消耗数据
  staffData: number[];        // 人员数据
}

// 统计概览数据
export interface OverviewStatistics {
  totalSalt: number;          // 总化盐量(t)
  avgGas: number;             // 平均气耗(Nm³)
  avgPower: number;           // 平均电耗(KWh)
  avgStaff: number;           // 平均人数
  normalRatio: number;        // 正常配比率(%)
}

// 统计分析响应
export interface StatisticsResponse {
  overview: OverviewStatistics;
  chartData: StatisticsData;
}

// 统计分析API响应
export type StatisticsApiResponse = ApiResponse<StatisticsResponse>;

// 配比状态枚举
export enum RatioStatus {
  NORMAL = 'normal',
  ABNORMAL = 'abnormal'
}

// 班次枚举
export enum Shift {
  DAY = 1,    // 白班
  NIGHT = 2   // 夜班
}
