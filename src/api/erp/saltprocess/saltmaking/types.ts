/**
 * 化盐工艺管理模块 - 类型定义
 */
import { PageQuery, TaskStatus, SaltType, ControlMode, RatioStatus, InspectionResult } from '../types';

// 化盐任务状态
export enum SaltmakingTaskStatus {
  PENDING = 'PENDING',             // 待开始
  IN_PROGRESS = 'IN_PROGRESS',     // 进行中
  COMPLETED = 'COMPLETED',         // 已完成
  FAILED = 'FAILED',               // 失败
  CANCELLED = 'CANCELLED'          // 已取消
}

// 化盐阶段
export enum SaltmakingPhase {
  PREPARATION = 'PREPARATION',     // 准备阶段
  FEEDING = 'FEEDING',             // 投料阶段
  REACTION = 'REACTION',           // 反应阶段
  STABILIZATION = 'STABILIZATION', // 稳定阶段
  COMPLETION = 'COMPLETION'        // 完成阶段
}

// 化盐任务查询参数
export interface SaltmakingTaskQuery extends PageQuery {
  projectId?: string;
  taskCode?: string;
  status?: SaltmakingTaskStatus;
  saltType?: SaltType;
  reactorId?: string;
  operatorId?: string;
  startTime?: string;
  endTime?: string;
}

// 化盐任务信息
export interface SaltmakingTaskVO {
  id: string;
  taskCode: string;
  projectId: string;
  projectName: string;
  reactorId: string;
  reactorName: string;
  tankName?: string;
  saltType: SaltType;
  targetOutput: number; // kg
  currentOutput: number; // kg
  status: SaltmakingTaskStatus;
  currentPhase: SaltmakingPhase;
  progress: number;
  operatorId: string;
  operatorName: string;
  plannedStartTime: string;
  plannedEndTime: string;
  actualStartTime?: string;
  actualEndTime?: string;
  targetTemperature: number;
  currentTemperature?: number;
  targetPressure: number;
  currentPressure?: number;
  stirringSpeed: number;
  currentStirringSpeed?: number;
  reactionTime?: number;
  phRange?: string;
  targetDensity?: number;
  ratioConfig: RatioConfigItem[];
  remarks?: string;
  createTime: string;
  updateTime: string;
}

// 化盐任务表单
export interface SaltmakingTaskForm {
  id?: string;
  projectId: string;
  reactorId: string;
  saltType: SaltType;
  targetOutput: number;
  operatorId: string;
  plannedStartTime: string;
  plannedEndTime: string;
  targetTemperature: number;
  targetPressure: number;
  stirringSpeed: number;
  ratioConfigId: string;
  remarks?: string;
}

// 配比配置项
export interface RatioConfigItem {
  component: string;
  componentName: string;
  targetRatio: number;
  tolerance: number;
  priority: number;
  unit: string;
}

// 化盐配比配置（别名，用于兼容）
export type SaltmakingRatioConfig = RatioConfigItem;

// 化盐数据记录
export interface SaltmakingDataVO {
  id: string;
  taskId: string;
  recordTime: string;
  phase: SaltmakingPhase;
  temperature: number;
  pressure: number;
  stirringSpeed: number;
  stirringPower: number;
  flowRate: number;
  ratioData: RatioDataItem[];
  controlMode: ControlMode;
  equipmentStatus: string;
  isAbnormal: boolean;
  abnormalReason?: string;
  operatorId: string;
  operatorName: string;
  remarks?: string;
}

// 配比数据项
export interface RatioDataItem {
  component: string;
  componentName: string;
  targetRatio: number;
  currentRatio: number;
  deviation: number;
  targetAmount: number;
  actualAmount: number;
  status: RatioStatus;
  unit: string;
}

// 化盐数据表单
export interface SaltmakingDataForm {
  taskId: string;
  recordTime: string;
  temperature: number;
  pressure: number;
  stirringSpeed: number;
  stirringPower: number;
  flowRate: number;
  ratioData: RatioDataItem[];
  controlMode: ControlMode;
  equipmentStatus: string;
  operatorId: string;
  remarks?: string;
}

// 实时监控数据
export interface SaltmakingRealtimeData {
  taskId: string;
  currentPhase: SaltmakingPhase;
  temperature: number;
  pressure: number;
  stirringSpeed: number;
  stirringPower: number;
  flowRate: number;
  ratioStatus: RatioStatusSummary;
  equipmentStatus: string;
  controlMode: ControlMode;
  alerts: SaltmakingAlert[];
  recordTime: string;
}

// 配比状态汇总
export interface RatioStatusSummary {
  totalComponents: number;
  normalComponents: number;
  warningComponents: number;
  errorComponents: number;
  overallStatus: RatioStatus;
  details: RatioDataItem[];
}

// 化盐报警
export interface SaltmakingAlert {
  id: string;
  taskId: string;
  alertType: 'TEMPERATURE' | 'PRESSURE' | 'RATIO' | 'EQUIPMENT' | 'FLOW' | 'STIRRING';
  level: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  message: string;
  currentValue?: number;
  targetValue?: number;
  threshold?: number;
  component?: string;
  status: 'ACTIVE' | 'HANDLED' | 'CLOSED';
  createTime: string;
  handledTime?: string;
  handledBy?: string;
  handlingAction?: string;
}

// 配比调整记录
export interface RatioAdjustmentRecord {
  id: string;
  taskId: string;
  component: string;
  componentName: string;
  adjustmentType: 'INCREASE' | 'DECREASE';
  adjustmentAmount: number;
  beforeRatio: number;
  afterRatio: number;
  reason: string;
  operatorId: string;
  operatorName: string;
  adjustmentTime: string;
  result: 'SUCCESS' | 'FAILED';
  remarks?: string;
}

// 配比调整表单
export interface RatioAdjustmentForm {
  taskId: string;
  component: string;
  adjustmentType: 'INCREASE' | 'DECREASE';
  adjustmentAmount: number;
  reason: string;
  operatorId: string;
}

// 化盐工艺参数
export interface SaltmakingProcessParams {
  taskId: string;
  targetTemperature: number;
  currentTemperature: number;
  targetPressure: number;
  currentPressure: number;
  targetStirringSpeed: number;
  currentStirringSpeed: number;
  targetFlowRate: number;
  currentFlowRate: number;
  controlMode: ControlMode;
  safetyLimits: SaltmakingSafetyLimits;
  recordTime: string;
}

// 化盐安全限制
export interface SaltmakingSafetyLimits {
  maxTemperature: number;
  minTemperature: number;
  maxPressure: number;
  minPressure: number;
  maxStirringSpeed: number;
  minStirringSpeed: number;
  maxFlowRate: number;
  minFlowRate: number;
}

// 化盐巡检
export interface SaltmakingInspectionVO {
  id: string;
  taskId: string;
  inspectionCode: string;
  inspectorId: string;
  inspectorName: string;
  inspectionTime: string;
  checkPoints: SaltmakingCheckPoint[];
  ratioCheck: RatioCheckResult[];
  overallResult: InspectionResult;
  issues: SaltmakingInspectionIssue[];
  photos: string[];
  remarks?: string;
  createTime: string;
}

// 化盐检查点
export interface SaltmakingCheckPoint {
  pointId: string;
  pointName: string;
  checkType: 'VISUAL' | 'MEASUREMENT' | 'FUNCTIONAL' | 'RATIO';
  standardValue?: string;
  actualValue?: string;
  unit?: string;
  result: InspectionResult;
  remarks?: string;
}

// 配比检查结果
export interface RatioCheckResult {
  component: string;
  componentName: string;
  targetRatio: number;
  actualRatio: number;
  deviation: number;
  tolerance: number;
  result: InspectionResult;
  adjustmentNeeded: boolean;
}

// 化盐巡检问题
export interface SaltmakingInspectionIssue {
  issueId: string;
  issueType: 'EQUIPMENT' | 'PROCESS' | 'RATIO' | 'SAFETY' | 'QUALITY';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  location?: string;
  component?: string;
  photos: string[];
  handlingPlan?: string;
  handlingStatus: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';
  handledBy?: string;
  handledTime?: string;
}

// 化盐统计
export interface SaltmakingStatistics {
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  averageDuration: number; // 分钟
  averageOutput: number; // kg
  outputEfficiency: number; // %
  qualityPassRate: number; // %
  ratioAccuracy: number; // %
  energyConsumption: number; // kWh
  period: string;
}

// 化盐设备状态
export interface SaltmakingEquipmentStatus {
  equipmentId: string;
  equipmentName: string;
  equipmentType: 'REACTOR' | 'STIRRER' | 'PUMP' | 'VALVE' | 'SENSOR' | 'CONTROLLER';
  status: 'NORMAL' | 'WARNING' | 'ERROR' | 'OFFLINE' | 'MAINTENANCE';
  temperature?: number;
  pressure?: number;
  power?: number;
  speed?: number;
  efficiency?: number;
  lastMaintenanceTime?: string;
  nextMaintenanceTime?: string;
  operatingHours: number;
  faultHistory: SaltmakingEquipmentFault[];
  lastUpdateTime: string;
}

// 化盐设备故障
export interface SaltmakingEquipmentFault {
  faultId: string;
  faultType: string;
  faultCode: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  occurTime: string;
  resolveTime?: string;
  resolveAction?: string;
  resolvedBy?: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
}

// 化盐质量检测
export interface SaltmakingQualityVO {
  id: string;
  taskId: string;
  testTime: string;
  testType: string;
  testItem: string;
  testValue: number;
  standardValue: number;
  unit: string;
  result: 'PASS' | 'FAIL' | 'WARNING';
  testerName: string;
  remarks?: string;
  createTime: string;
}

// 化盐报告
export interface SaltmakingReport {
  taskId: string;
  taskCode: string;
  projectName: string;
  reactorName: string;
  saltType: SaltType;
  operatorName: string;
  startTime: string;
  endTime: string;
  duration: number; // 分钟
  targetOutput: number;
  actualOutput: number;
  outputEfficiency: number;
  ratioAccuracy: number;
  qualityResult: 'PASS' | 'FAIL';
  energyConsumption: number;
  issues: string[];
  recommendations: string[];
  generateTime: string;
}
