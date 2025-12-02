/**
 * 预热管理模块 - 类型定义
 */
import { PageQuery, TaskStatus, TemperatureLocation, InspectionResult } from '../types';

// 预热任务状态
export enum PreheatingTaskStatus {
  PENDING = 'PENDING',             // 待开始
  IN_PROGRESS = 'IN_PROGRESS',     // 进行中
  COMPLETED = 'COMPLETED',         // 已完成
  FAILED = 'FAILED',               // 失败
  CANCELLED = 'CANCELLED'          // 已取消
}

// 预热任务查询参数
export interface PreheatingTaskQuery extends PageQuery {
  projectId?: string;
  taskCode?: string;
  status?: PreheatingTaskStatus;
  tankId?: string;
  operatorId?: string;
  startTime?: string;
  endTime?: string;
}

// 预热任务信息
export interface PreheatingTaskVO {
  id: string;
  taskCode: string;
  projectId: string;
  projectName: string;
  tankId: string;
  tankName: string;
  targetTemperature: number;
  targetPressure: number;
  tolerance: number;
  status: PreheatingTaskStatus;
  progress: number;
  operatorId: string;
  operatorName: string;
  plannedStartTime: string;
  plannedEndTime: string;
  actualStartTime?: string;
  actualEndTime?: string;
  currentTemperature?: number;
  currentPressure?: number;
  remarks?: string;
  createTime: string;
  updateTime: string;
}

// 预热任务表单
export interface PreheatingTaskForm {
  id?: string;
  projectId: string;
  tankId: string;
  targetTemperature: number;
  targetPressure: number;
  tolerance: number;
  duration?: number;
  heatingRate?: number;
  operatorId: string;
  plannedStartTime: string;
  plannedEndTime: string;
  stirringSpeed?: number;
  feedRate?: number;
  circulationFlow?: number;
  maxTemperatureLimit?: number;
  maxPressureLimit?: number;
  emergencyStopCondition?: string;
  remarks?: string;
}

// 预热数据记录
export interface PreheatingDataVO {
  id: string;
  taskId: string;
  recordTime: string;
  temperature: number;
  pressure: number;
  location: TemperatureLocation;
  equipmentStatus: string;
  isAbnormal: boolean;
  abnormalReason?: string;
  operatorId: string;
  operatorName: string;
  remarks?: string;
}

// 预热数据表单
export interface PreheatingDataForm {
  taskId: string;
  recordTime: string;
  temperature: number;
  pressure: number;
  location: TemperatureLocation;
  equipmentStatus: string;
  operatorId: string;
  remarks?: string;
}

// 实时数据
export interface RealtimeData {
  taskId: string;
  temperature: number;
  pressure: number;
  equipmentStatus: string;
  heatingPower: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
  recordTime: string;
  alerts: PreheatingAlert[];
}

// 预热报警
export interface PreheatingAlert {
  id: string;
  taskId: string;
  alertType: 'TEMPERATURE' | 'PRESSURE' | 'EQUIPMENT' | 'TIME';
  level: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  message: string;
  currentValue?: number;
  targetValue?: number;
  threshold?: number;
  status: 'ACTIVE' | 'HANDLED' | 'CLOSED';
  createTime: string;
  handledTime?: string;
  handledBy?: string;
  handlingAction?: string;
}

// 温度曲线数据
export interface TemperatureCurveData {
  taskId: string;
  dataPoints: TemperatureDataPoint[];
  targetLine: TargetTemperatureLine;
  alertPoints: AlertPoint[];
}

export interface TemperatureDataPoint {
  timestamp: string;
  topTemperature: number;
  middleTemperature: number;
  bottomTemperature: number;
  averageTemperature: number;
}

export interface TargetTemperatureLine {
  targetTemperature: number;
  upperLimit: number;
  lowerLimit: number;
}

export interface AlertPoint {
  timestamp: string;
  temperature: number;
  alertType: string;
  message: string;
}

// 压力曲线数据
export interface PressureCurveData {
  taskId: string;
  dataPoints: PressureDataPoint[];
  targetPressure: number;
  safetyLimit: number;
  alertPoints: PressureAlertPoint[];
}

export interface PressureDataPoint {
  timestamp: string;
  pressure: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
}

export interface PressureAlertPoint {
  timestamp: string;
  pressure: number;
  alertType: string;
  message: string;
}

// 预热巡检
export interface PreheatingInspectionVO {
  id: string;
  taskId: string;
  inspectionCode: string;
  inspectorId: string;
  inspectorName: string;
  inspectionTime: string;
  checkPoints: CheckPoint[];
  overallResult: InspectionResult;
  issues: InspectionIssue[];
  photos: string[];
  remarks?: string;
  createTime: string;
}

export interface CheckPoint {
  pointId: string;
  pointName: string;
  checkType: 'VISUAL' | 'MEASUREMENT' | 'FUNCTIONAL';
  standardValue?: string;
  actualValue?: string;
  unit?: string;
  result: InspectionResult;
  remarks?: string;
}

export interface InspectionIssue {
  issueId: string;
  issueType: 'EQUIPMENT' | 'PROCESS' | 'SAFETY' | 'QUALITY';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  location?: string;
  photos: string[];
  handlingPlan?: string;
  handlingStatus: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';
  handledBy?: string;
  handledTime?: string;
}

// 预热巡检表单
export interface PreheatingInspectionForm {
  taskId: string;
  inspectorId: string;
  inspectionTime: string;
  checkPoints: CheckPointForm[];
  issues: InspectionIssueForm[];
  photos: string[];
  remarks?: string;
}

export interface CheckPointForm {
  pointId: string;
  actualValue?: string;
  result: InspectionResult;
  remarks?: string;
}

export interface InspectionIssueForm {
  issueType: string;
  severity: string;
  description: string;
  location?: string;
  photos: string[];
  handlingPlan?: string;
}

// 预热统计
export interface PreheatingStatistics {
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  averageDuration: number; // 分钟
  averageTemperature: number;
  averagePressure: number;
  successRate: number;
  onTimeCompletionRate: number;
  energyConsumption: number;
  period: string;
}

// 设备状态
export interface PreheatingEquipmentStatus {
  equipmentId: string;
  equipmentName: string;
  equipmentType: 'HEATER' | 'PUMP' | 'VALVE' | 'SENSOR' | 'CONTROLLER';
  status: 'NORMAL' | 'WARNING' | 'ERROR' | 'OFFLINE' | 'MAINTENANCE';
  temperature?: number;
  pressure?: number;
  power?: number;
  efficiency?: number;
  lastMaintenanceTime?: string;
  nextMaintenanceTime?: string;
  operatingHours: number;
  faultHistory: EquipmentFault[];
  lastUpdateTime: string;
}

export interface EquipmentFault {
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

// 预热工艺参数
export interface PreheatingProcessParams {
  taskId: string;
  targetTemperature: number;
  currentTemperature: number;
  targetPressure: number;
  currentPressure: number;
  heatingRate: number; // °C/min
  heatingPower: number; // kW
  controlMode: 'AUTO' | 'MANUAL';
  safetyLimits: SafetyLimits;
  recordTime: string;
}

export interface SafetyLimits {
  maxTemperature: number;
  minTemperature: number;
  maxPressure: number;
  minPressure: number;
  maxHeatingRate: number;
  maxPower: number;
}

// 预热报告
export interface PreheatingReport {
  taskId: string;
  taskCode: string;
  projectName: string;
  tankName: string;
  operatorName: string;
  startTime: string;
  endTime: string;
  duration: number; // 分钟
  targetTemperature: number;
  finalTemperature: number;
  temperatureDeviation: number;
  targetPressure: number;
  finalPressure: number;
  pressureDeviation: number;
  energyConsumption: number;
  qualityResult: 'PASS' | 'FAIL';
  issues: string[];
  recommendations: string[];
  generateTime: string;
}
