/**
 * 三元化盐记录管理模块 - 类型定义
 */

// 三元化盐记录查询参数
export interface TernaryRecordQuery {
  pageNum?: number;
  pageSize?: number;
  recordCode?: string;
  batchNumber?: string;
  projectId?: number;
  recordDate?: string;
  qualityGrade?: number;
  stabilityIndex?: number;
  operatorId?: number;
  startDate?: string;
  endDate?: string;
  stabilityRange?: [number, number];
  yieldRateRange?: [number, number];
}

// 三元化盐记录VO
export interface TernaryRecordVO {
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
  
  // NaNO2配比信息
  nano2TargetRatio: number; // 目标配比(%)
  nano2ActualRatio: number; // 实际配比(%)
  nano2TargetWeight: number; // 目标用量(kg)
  nano2ActualWeight: number; // 实际用量(kg)
  
  // 配比偏差
  ratioDeviation: number; // 配比偏差(%)
  totalWeight: number; // 总重量(kg)
  
  // 稳定性信息
  stabilityIndex: number; // 稳定性指数(0-10)
  thermalStability: number; // 热稳定性(°C)
  chemicalStability: number; // 化学稳定性(天)
  
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

// 三元化盐记录表单
export interface TernaryRecordForm {
  id?: string;
  recordCode: string;
  batchNumber: string;
  projectId: number;
  recordDate: string;
  startTime: string;
  endTime: string;
  duration?: number; // 持续时间(分钟)
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
  
  // NaNO2配比信息
  nano2TargetRatio: number;
  nano2ActualRatio: number;
  nano2TargetWeight: number;
  nano2ActualWeight: number;
  
  // 稳定性信息
  stabilityIndex: number;
  thermalStability: number;
  chemicalStability: number;
  
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

// 三元化盐记录统计信息
export interface TernaryRecordStatistics {
  totalRecords: number;
  todayRecords: number;
  weekRecords: number;
  monthRecords: number;
  averageStabilityIndex: number;
  averageYieldRate: number;
  averageRatioDeviation: number;
  stabilityDistribution: {
    excellent: number; // 8.0-10.0
    good: number; // 6.0-7.9
    needImprovement: number; // 0-5.9
  };
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

// 三元配比分析数据
export interface TernaryRatioAnalysis {
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
  nano2Analysis: {
    targetRatio: number;
    actualRatio: number;
    deviation: number;
    deviationPercentage: number;
    isWithinTolerance: boolean;
  };
  overallDeviation: number;
  stabilityImpact: string;
  qualityImpact: string;
  recommendations: string[];
}

// 稳定性分析数据
export interface TernaryStabilityAnalysis {
  period: string;
  totalRecords: number;
  averageStabilityIndex: number;
  stabilityDistribution: {
    excellent: number;
    good: number;
    needImprovement: number;
  };
  stabilityTrends: Array<{
    date: string;
    averageStabilityIndex: number;
    thermalStability: number;
    chemicalStability: number;
  }>;
  stabilityFactors: Array<{
    factor: string;
    impact: number;
    correlation: number;
  }>;
  improvementSuggestions: string[];
}

// 稳定性趋势数据点
export interface TernaryStabilityTrendPoint {
  time: string;
  stabilityIndex: number;
  thermalStability: number;
  chemicalStability: number;
  temperature: number;
  pressure: number;
}

// 三元化盐质量分析数据
export interface TernaryQualityAnalysis {
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
  averageStabilityIndex: number;
  qualityTrends: Array<{
    date: string;
    purity: number;
    moistureContent: number;
    stabilityIndex: number;
    qualityGrade: number;
  }>;
  qualityIssues: Array<{
    issue: string;
    frequency: number;
    impact: string;
    stabilityCorrelation: number;
  }>;
}

// 三元配比优化建议
export interface TernaryRatioOptimization {
  recordId: string;
  currentRatio: {
    nano3: number;
    kno3: number;
    nano2: number;
  };
  optimizedRatio: {
    nano3: number;
    kno3: number;
    nano2: number;
  };
  expectedImprovements: {
    stabilityIndexIncrease: number;
    yieldRateIncrease: number;
    qualityImprovement: string;
    costReduction: number;
  };
  implementationSteps: string[];
  riskAssessment: string[];
  validationRequirements: string[];
}

// 稳定性预测数据
export interface TernaryStabilityPrediction {
  recordId: string;
  currentStabilityIndex: number;
  predictedStabilityIndex: number;
  predictionConfidence: number;
  predictionFactors: Array<{
    factor: string;
    currentValue: number;
    optimalValue: number;
    impact: number;
  }>;
  recommendations: string[];
  timeframe: string;
}

// 三元化盐成本效益分析
export interface TernaryCostBenefitAnalysis {
  period: string;
  totalCost: number;
  costBreakdown: {
    materialCost: number;
    energyCost: number;
    laborCost: number;
  };
  costPerKg: number;
  stabilityBenefit: {
    extendedShelfLife: number;
    reducedWaste: number;
    improvedQuality: number;
  };
  costOptimizationOpportunities: Array<{
    opportunity: string;
    potentialSavings: number;
    implementationCost: number;
    paybackPeriod: number;
  }>;
}

// 三元化盐工艺优化建议
export interface TernaryProcessOptimization {
  recordId: string;
  currentProcess: {
    temperature: number;
    time: number;
    stirringSpeed: number;
    heatingPower: number;
  };
  optimizedProcess: {
    temperature: number;
    time: number;
    stirringSpeed: number;
    heatingPower: number;
  };
  expectedBenefits: {
    stabilityImprovement: number;
    energySavings: number;
    timeReduction: number;
    qualityEnhancement: string;
  };
  implementationPlan: string[];
  monitoringRequirements: string[];
}

// 三元化盐稳定性等级枚举
export enum TernaryStabilityLevel {
  EXCELLENT = 'excellent', // 8.0-10.0
  GOOD = 'good', // 6.0-7.9
  NEED_IMPROVEMENT = 'needImprovement' // 0-5.9
}

// 三元化盐记录验证结果
export interface TernaryRecordValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  ratioValidation: {
    nano3Valid: boolean;
    kno3Valid: boolean;
    nano2Valid: boolean;
    totalRatioValid: boolean;
  };
  stabilityValidation: {
    indexValid: boolean;
    thermalStabilityValid: boolean;
    chemicalStabilityValid: boolean;
  };
  qualityValidation: {
    purityValid: boolean;
    moistureValid: boolean;
    densityValid: boolean;
  };
}

// 三元化盐记录审核信息
export interface TernaryRecordAudit {
  id: string;
  recordId: string;
  auditType: string;
  auditStatus: number; // 1-通过, 2-拒绝, 3-待审核
  auditResult: string;
  auditComments?: string;
  stabilityAssessment: string;
  auditorId: number;
  auditorName: string;
  auditTime: string;
}
