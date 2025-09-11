/**
 * 项目管理模块 - 类型定义
 */
import { PageQuery, ProjectStatus, ProjectType, QualityResult } from '../types';

// 项目查询参数
export interface SaltProjectQuery extends PageQuery {
  projectName?: string;
  projectCode?: string;
  status?: ProjectStatus;
  projectType?: ProjectType;
  managerId?: string;
  startDate?: string;
  endDate?: string;
}

// 项目基本信息
export interface SaltProjectVO {
  id: string;
  projectCode: string;
  projectName: string;
  projectType: ProjectType;
  status: ProjectStatus;
  progress: number;
  currentPhase: string;
  managerId: string;
  managerName: string;
  startDate: string;
  endDate?: string;
  description?: string;
  processConfig?: ProcessConfig;
  qualityStandards?: QualityStandard[];
  resourcePlan?: ResourcePlan;
  createTime: string;
  updateTime: string;
  createBy: string;
  updateBy?: string;
}

// 项目表单数据
export interface SaltProjectForm {
  id?: string;
  projectName: string;
  projectType: ProjectType;
  managerId: string;
  startDate: string;
  endDate?: string;
  description?: string;
  processConfigId?: string;
  qualityStandardId?: string;
  resourcePlanId?: string;
}

// 工艺配置
export interface ProcessConfig {
  id: string;
  configName: string;
  projectType: ProjectType;
  preheatingConfig: PreheatingConfig;
  saltmakingConfig: SaltmakingConfig;
  heatingConfig: HeatingConfig;
  isDefault: boolean;
  createTime: string;
}

export interface PreheatingConfig {
  targetTemperature: number;
  targetPressure: number;
  tolerance: number;
  duration: number; // 分钟
  heatingRate: number; // °C/min
}

export interface SaltmakingConfig {
  targetTemperature: number;
  targetPressure: number;
  stirringSpeed: number;
  ratioConfig: RatioConfigItem[];
  reactionTime: number; // 分钟
}

export interface HeatingConfig {
  stages: HeatingStage[];
  finalTemperature: number;
  holdingTime: number; // 分钟
}

export interface HeatingStage {
  stageName: string;
  startTemperature: number;
  endTemperature: number;
  heatingRate: number; // °C/min
  duration: number; // 分钟
}

export interface RatioConfigItem {
  component: string;
  componentName: string;
  targetRatio: number;
  tolerance: number;
  priority: number;
}

// 质量标准
export interface QualityStandard {
  id: string;
  standardName: string;
  projectType: ProjectType;
  testItems: QualityTestStandard[];
  isDefault: boolean;
  createTime: string;
}

export interface QualityTestStandard {
  itemName: string;
  itemCode: string;
  standardValue: string;
  tolerance: string;
  unit: string;
  testMethod: string;
  isRequired: boolean;
}

// 资源计划
export interface ResourcePlan {
  id: string;
  planName: string;
  personnelPlan: PersonnelPlan[];
  equipmentPlan: EquipmentPlan[];
  materialPlan: MaterialPlan[];
  createTime: string;
}

export interface PersonnelPlan {
  roleId: string;
  roleName: string;
  requiredCount: number;
  assignedPersonnel: PersonnelAssignment[];
}

export interface PersonnelAssignment {
  userId: string;
  userName: string;
  workShift: string;
  startDate: string;
  endDate: string;
}

export interface EquipmentPlan {
  equipmentId: string;
  equipmentName: string;
  equipmentType: string;
  requiredDuration: number; // 小时
  scheduledStartTime: string;
  scheduledEndTime: string;
}

export interface MaterialPlan {
  materialId: string;
  materialName: string;
  specification: string;
  requiredQuantity: number;
  unit: string;
  estimatedCost: number;
  supplierId?: string;
  supplierName?: string;
}

// 项目统计信息
export interface ProjectStatistics {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  suspendedProjects: number;
  averageProgress: number;
  onTimeCompletionRate: number;
  qualityPassRate: number;
  totalOutput: number;
  period: string;
}

// 项目进度信息
export interface ProjectProgress {
  projectId: string;
  currentPhase: string;
  phaseProgress: PhaseProgress[];
  overallProgress: number;
  estimatedCompletionDate: string;
  actualCompletionDate?: string;
  isOnSchedule: boolean;
  delayDays?: number;
}

export interface PhaseProgress {
  phaseName: string;
  phaseCode: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'DELAYED';
  progress: number;
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  dependencies: string[];
}

// 项目任务
export interface ProjectTask {
  id: string;
  projectId: string;
  taskName: string;
  taskType: 'PREHEATING' | 'SALTMAKING' | 'HEATING' | 'QUALITY_CHECK' | 'OTHER';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  assigneeId: string;
  assigneeName: string;
  plannedStartTime: string;
  plannedEndTime: string;
  actualStartTime?: string;
  actualEndTime?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  description?: string;
  dependencies: string[];
  createTime: string;
}

// 项目风险
export interface ProjectRisk {
  id: string;
  projectId: string;
  riskName: string;
  riskType: 'TECHNICAL' | 'SCHEDULE' | 'COST' | 'QUALITY' | 'SAFETY';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  probability: number; // 0-100
  impact: number; // 0-100
  riskScore: number;
  description: string;
  mitigationPlan?: string;
  contingencyPlan?: string;
  ownerId: string;
  ownerName: string;
  status: 'IDENTIFIED' | 'ASSESSED' | 'MITIGATED' | 'CLOSED';
  createTime: string;
  updateTime: string;
}

// 项目变更
export interface ProjectChange {
  id: string;
  projectId: string;
  changeType: 'SCOPE' | 'SCHEDULE' | 'COST' | 'QUALITY' | 'RESOURCE';
  changeTitle: string;
  changeDescription: string;
  changeReason: string;
  impact: string;
  requesterId: string;
  requesterName: string;
  requestTime: string;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  approverId?: string;
  approverName?: string;
  approvalTime?: string;
  approvalComments?: string;
  implementationPlan?: string;
  implementationStatus?: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
}
