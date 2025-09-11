/**
 * 二元化盐记录管理模块 - 类型定义
 */

// 二元化盐记录查询参数
export interface BinaryRecordQuery {
  pageNum?: number;
  pageSize?: number;
  recordCode?: string;
  batchNumber?: string;
  projectId?: number;
  recordDate?: string;
  qualityGrade?: number;
  operatorId?: number;
  startDate?: string;
  endDate?: string;
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
