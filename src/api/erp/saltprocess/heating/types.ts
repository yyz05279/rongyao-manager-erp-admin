/**
 * 提温工艺管理模块 - 类型定义
 */
import { PageQuery, TaskStatus, TemperatureLocation, ControlMode, InspectionResult } from '../types';

// 提温任务状态
export enum HeatingTaskStatus {
  PENDING = 'PENDING',             // 待开始
  IN_PROGRESS = 'IN_PROGRESS',     // 进行中
  COMPLETED = 'COMPLETED',         // 已完成
  FAILED = 'FAILED',               // 失败
  CANCELLED = 'CANCELLED'          // 已取消
}

// 提温阶段状态
export enum HeatingStageStatus {
  NOT_STARTED = 'NOT_STARTED',     // 未开始
  IN_PROGRESS = 'IN_PROGRESS',     // 进行中
  COMPLETED = 'COMPLETED',         // 已完成
  PAUSED = 'PAUSED',               // 已暂停
  FAILED = 'FAILED'                // 失败
}

// 提温任务查询参数
export interface HeatingTaskQuery extends PageQuery {
  projectId?: string;
  taskCode?: string;
  status?: HeatingTaskStatus;
  heatingVesselId?: string;
  operatorId?: string;
  startTime?: string;
  endTime?: string;
}

// 提温任务信息
export interface HeatingTaskVO {
  id: string;
  taskCode: string;
  projectId: string;
  projectName: string;
  heatingVesselId: string;
  heatingVesselName: string;
  tankId?: string;
  tankName?: string;
  status: HeatingTaskStatus;
  currentStage: number;
  totalStages: number;
  progress: number;
  operatorId: string;
  operatorName: string;
  plannedStartTime: string;
  plannedEndTime: string;
  actualStartTime?: string;
  actualEndTime?: string;
  finalTargetTemperature: number;
  finalTemperature?: number;
  currentTemperature?: number;
  currentHeatingRate?: number;
  heatingRate?: number;
  holdingTime: number; // 保温时间（分钟）
  stages: HeatingStageVO[];
  remarks?: string;
  createTime: string;
  updateTime: string;
}

// 提温任务表单
export interface HeatingTaskForm {
  id?: string;
  projectId: string;
  heatingVesselId: string;
  operatorId: string;
  plannedStartTime: string;
  plannedEndTime: string;
  finalTargetTemperature: number;
  holdingTime: number;
  stageConfigId: string;
  remarks?: string;
}

// 提温阶段信息
export interface HeatingStageVO {
  id: string;
  taskId: string;
  stageNumber: number;
  stageName: string;
  startTemperature: number;
  endTemperature: number;
  targetHeatingRate: number; // °C/min
  actualHeatingRate?: number;
  duration: number; // 分钟
  status: HeatingStageStatus;
  startTime?: string;
  endTime?: string;
  actualDuration?: number;
  isHoldingStage: boolean; // 是否为保温阶段
  holdingDuration?: number; // 保温时长
  remarks?: string;
}

// 提温阶段配置
export interface HeatingStageConfig {
  id: string;
  configName: string;
  description?: string;
  stages: HeatingStageConfigItem[];
  isDefault: boolean;
  createTime: string;
}

export interface HeatingStageConfigItem {
  stageNumber: number;
  stageName: string;
  startTemperature: number;
  endTemperature: number;
  heatingRate: number;
  duration: number;
  isHoldingStage: boolean;
  holdingDuration?: number;
}

// 提温数据记录
export interface HeatingDataVO {
  id: string;
  taskId: string;
  stageId: string;
  recordTime: string;
  temperature: number;
  targetTemperature: number;
  location: TemperatureLocation;
  heatingPower: number;
  heatingRate: number;
  pressure?: number;
  controlMode: ControlMode;
  equipmentStatus: string;
  isAbnormal: boolean;
  abnormalReason?: string;
  operatorId: string;
  operatorName: string;
  remarks?: string;
}

// 提温数据表单
export interface HeatingDataForm {
  taskId: string;
  stageId: string;
  recordTime: string;
  temperature: number;
  targetTemperature: number;
  location: TemperatureLocation;
  heatingPower: number;
  heatingRate: number;
  pressure?: number;
  controlMode: ControlMode;
  equipmentStatus: string;
  operatorId: string;
  remarks?: string;
}

// 提温实时数据
export interface HeatingRealtimeData {
  taskId: string;
  currentStage: number;
  stageName: string;
  temperature: number;
  targetTemperature: number;
  heatingPower: number;
  heatingRate: number;
  pressure?: number;
  controlMode: ControlMode;
  equipmentStatus: string;
  remainingTime: number; // 剩余时间（分钟）
  stageProgress: number; // 当前阶段进度
  alerts: HeatingAlert[];
  recordTime: string;
}

// 提温报警
export interface HeatingAlert {
  id: string;
  taskId: string;
  stageId?: string;
  alertType: 'TEMPERATURE' | 'HEATING_RATE' | 'POWER' | 'EQUIPMENT' | 'TIME' | 'PRESSURE';
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
export interface HeatingTemperatureCurveData {
  taskId: string;
  dataPoints: HeatingTemperatureDataPoint[];
  targetCurve: HeatingTargetCurve[];
  stageMarkers: HeatingStageMarker[];
  alertPoints: HeatingAlertPoint[];
}

export interface HeatingTemperatureDataPoint {
  timestamp: string;
  temperature: number;
  targetTemperature: number;
  heatingPower: number;
  stageNumber: number;
}

export interface HeatingTargetCurve {
  timestamp: string;
  targetTemperature: number;
  stageNumber: number;
}

export interface HeatingStageMarker {
  timestamp: string;
  stageNumber: number;
  stageName: string;
  temperature: number;
  eventType: 'STAGE_START' | 'STAGE_END' | 'HOLDING_START' | 'HOLDING_END';
}

export interface HeatingAlertPoint {
  timestamp: string;
  temperature: number;
  alertType: string;
  message: string;
  level: string;
}

// 提温巡检
export interface HeatingInspectionVO {
  id: string;
  taskId: string;
  stageId?: string;
  inspectionCode: string;
  inspectorId: string;
  inspectorName: string;
  inspectionTime: string;
  checkPoints: HeatingCheckPoint[];
  temperatureCheck: TemperatureCheckResult[];
  overallResult: InspectionResult;
  issues: HeatingInspectionIssue[];
  photos: string[];
  remarks?: string;
  createTime: string;
}

// 提温检查点
export interface HeatingCheckPoint {
  pointId: string;
  pointName: string;
  checkType: 'VISUAL' | 'MEASUREMENT' | 'FUNCTIONAL' | 'TEMPERATURE';
  standardValue?: string;
  actualValue?: string;
  unit?: string;
  result: InspectionResult;
  remarks?: string;
}

// 温度检查结果
export interface TemperatureCheckResult {
  location: TemperatureLocation;
  targetTemperature: number;
  actualTemperature: number;
  deviation: number;
  tolerance: number;
  result: InspectionResult;
  adjustmentNeeded: boolean;
}

// 提温巡检问题
export interface HeatingInspectionIssue {
  issueId: string;
  issueType: 'EQUIPMENT' | 'PROCESS' | 'TEMPERATURE' | 'SAFETY' | 'QUALITY';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  location?: string;
  stageNumber?: number;
  photos: string[];
  handlingPlan?: string;
  handlingStatus: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';
  handledBy?: string;
  handledTime?: string;
}

// 提温工艺参数
export interface HeatingProcessParams {
  taskId: string;
  currentStage: number;
  targetTemperature: number;
  currentTemperature: number;
  targetHeatingRate: number;
  actualHeatingRate: number;
  heatingPower: number;
  maxPower: number;
  controlMode: ControlMode;
  safetyLimits: HeatingSafetyLimits;
  recordTime: string;
}

// 提温安全限制
export interface HeatingSafetyLimits {
  maxTemperature: number;
  minTemperature: number;
  maxHeatingRate: number;
  minHeatingRate: number;
  maxPower: number;
  minPower: number;
  maxPressure?: number;
  minPressure?: number;
}

// 提温统计
export interface HeatingStatistics {
  totalTasks: number;
  completedTasks: number;
  failedTasks: number;
  averageDuration: number; // 分钟
  averageHeatingRate: number; // °C/min
  temperatureAccuracy: number; // %
  energyEfficiency: number; // %
  onTimeCompletionRate: number; // %
  energyConsumption: number; // kWh
  period: string;
}

// 提温设备状态
export interface HeatingEquipmentStatus {
  equipmentId: string;
  equipmentName: string;
  equipmentType: 'HEATER' | 'CONTROLLER' | 'SENSOR' | 'VALVE' | 'PUMP';
  status: 'NORMAL' | 'WARNING' | 'ERROR' | 'OFFLINE' | 'MAINTENANCE';
  temperature?: number;
  power?: number;
  efficiency?: number;
  lastMaintenanceTime?: string;
  nextMaintenanceTime?: string;
  operatingHours: number;
  faultHistory: HeatingEquipmentFault[];
  lastUpdateTime: string;
}

// 提温设备故障
export interface HeatingEquipmentFault {
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

// 提温报告
export interface HeatingReport {
  taskId: string;
  taskCode: string;
  projectName: string;
  heatingVesselName: string;
  operatorName: string;
  startTime: string;
  endTime: string;
  duration: number; // 分钟
  finalTargetTemperature: number;
  finalActualTemperature: number;
  temperatureDeviation: number;
  averageHeatingRate: number;
  energyConsumption: number;
  stageResults: HeatingStageResult[];
  qualityResult: 'PASS' | 'FAIL';
  issues: string[];
  recommendations: string[];
  generateTime: string;
}

// 提温能源数据
export interface HeatingEnergyData {
  taskId: string;
  totalEnergyConsumption: number; // kWh
  averagePower: number; // kW
  peakPower: number; // kW
  energyEfficiency: number; // %
  costPerKwh: number;
  totalCost: number;
  recordTime: string;
}

// 提温阶段结果
export interface HeatingStageResult {
  stageNumber: number;
  stageName: string;
  targetTemperature: number;
  actualTemperature: number;
  targetDuration: number;
  actualDuration: number;
  targetHeatingRate: number;
  actualHeatingRate: number;
  energyConsumption: number;
  result: 'PASS' | 'FAIL';
}
