/**
 * 通用项目管理模块 - 类型定义
 * 注意：此模块为通用项目管理，与 saltprocess/project（盐化工艺项目）模块功能互补
 * - saltprocess/project: 专门用于盐化工艺项目的工艺流程管理
 * - erp/project: 通用项目管理，适用于各种类型的企业项目
 */
import { BaseQuery, BaseEntity } from '../types';

// 项目查询参数
export interface ProjectQuery extends BaseQuery {
  projectName?: string;
  projectCode?: string;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  managerId?: string;
  departmentId?: string;
  startDate?: string;
  endDate?: string;
  keyword?: string;
}

// 项目基本信息VO
export interface ProjectVO extends BaseEntity {
  id: string;
  projectCode: string;
  projectName: string;
  description?: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  progress: number;
  managerId: string;
  managerName: string;
  departmentId: string;
  departmentName: string;
  startDate: string;
  endDate?: string;
  plannedEndDate?: string;
  actualEndDate?: string;
  budget?: number;
  actualCost?: number;
  tags?: string[];
  attachments?: ProjectAttachment[];
  memberCount: number;
  taskCount: number;
  completedTaskCount: number;
}

// 项目表单数据
export interface ProjectForm {
  id?: string;
  projectName: string;
  description?: string;
  priority: ProjectPriority;
  managerId: string;
  departmentId: string;
  startDate: string;
  endDate?: string;
  plannedEndDate?: string;
  budget?: number;
  tags?: string[];
}

// 项目状态枚举
export enum ProjectStatus {
  DRAFT = 'DRAFT',                 // 草稿
  PLANNING = 'PLANNING',           // 规划中
  APPROVED = 'APPROVED',           // 已批准
  IN_PROGRESS = 'IN_PROGRESS',     // 进行中
  ON_HOLD = 'ON_HOLD',             // 暂停
  COMPLETED = 'COMPLETED',         // 已完成
  CANCELLED = 'CANCELLED',         // 已取消
  ARCHIVED = 'ARCHIVED'            // 已归档
}

// 项目优先级枚举
export enum ProjectPriority {
  LOW = 'LOW',                     // 低
  MEDIUM = 'MEDIUM',               // 中
  HIGH = 'HIGH',                   // 高
  URGENT = 'URGENT'                // 紧急
}

// 项目成员相关类型
export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  email?: string;
  phone?: string;
  roleId: string;
  roleName: string;
  roleCode: string;
  permissions: string[];
  joinDate: string;
  status: MemberStatus;
  workload?: number; // 工作量百分比
}

export interface ProjectMemberForm {
  projectId: string;
  userId: string;
  roleId: string;
  workload?: number;
}

export enum MemberStatus {
  ACTIVE = 'ACTIVE',               // 活跃
  INACTIVE = 'INACTIVE',           // 非活跃
  LEFT = 'LEFT'                    // 已离开
}

// 项目角色类型
export interface ProjectRole {
  id: string;
  roleCode: string;
  roleName: string;
  description?: string;
  permissions: string[];
  isDefault: boolean;
  sort: number;
}

// 项目进度相关类型
export interface ProjectProgress {
  projectId: string;
  overallProgress: number;
  phaseProgress: PhaseProgress[];
  milestones: ProjectMilestone[];
  isOnSchedule: boolean;
  delayDays?: number;
  estimatedCompletionDate?: string;
  lastUpdateTime: string;
}

export interface PhaseProgress {
  id: string;
  phaseName: string;
  phaseCode: string;
  status: PhaseStatus;
  progress: number;
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  dependencies: string[];
  tasks: ProjectTask[];
}

export enum PhaseStatus {
  NOT_STARTED = 'NOT_STARTED',     // 未开始
  IN_PROGRESS = 'IN_PROGRESS',     // 进行中
  COMPLETED = 'COMPLETED',         // 已完成
  DELAYED = 'DELAYED',             // 延期
  BLOCKED = 'BLOCKED'              // 阻塞
}

// 项目里程碑类型
export interface ProjectMilestone {
  id: string;
  projectId: string;
  milestoneName: string;
  description?: string;
  plannedDate: string;
  actualDate?: string;
  status: MilestoneStatus;
  progress: number;
  dependencies: string[];
  deliverables: string[];
  createTime: string;
}

export interface ProjectMilestoneForm {
  id?: string;
  projectId: string;
  milestoneName: string;
  description?: string;
  plannedDate: string;
  dependencies?: string[];
  deliverables?: string[];
}

export enum MilestoneStatus {
  PENDING = 'PENDING',             // 待开始
  IN_PROGRESS = 'IN_PROGRESS',     // 进行中
  COMPLETED = 'COMPLETED',         // 已完成
  OVERDUE = 'OVERDUE'              // 逾期
}

// 项目任务类型
export interface ProjectTask {
  id: string;
  projectId: string;
  taskName: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  progress: number;
  assigneeId?: string;
  assigneeName?: string;
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  dependencies: string[];
  tags?: string[];
  parentTaskId?: string;
  subtasks?: ProjectTask[];
  createTime: string;
  updateTime: string;
}

export interface ProjectTaskForm {
  id?: string;
  projectId: string;
  taskName: string;
  description?: string;
  priority: TaskPriority;
  assigneeId?: string;
  plannedStartDate: string;
  plannedEndDate: string;
  estimatedHours?: number;
  dependencies?: string[];
  tags?: string[];
  parentTaskId?: string;
}

export enum TaskStatus {
  TODO = 'TODO',                   // 待办
  IN_PROGRESS = 'IN_PROGRESS',     // 进行中
  REVIEW = 'REVIEW',               // 审核中
  COMPLETED = 'COMPLETED',         // 已完成
  CANCELLED = 'CANCELLED'          // 已取消
}

export enum TaskPriority {
  LOW = 'LOW',                     // 低
  MEDIUM = 'MEDIUM',               // 中
  HIGH = 'HIGH',                   // 高
  URGENT = 'URGENT'                // 紧急
}

// 项目附件类型
export interface ProjectAttachment {
  id: string;
  projectId: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  fileType: string;
  filePath: string;
  uploaderId: string;
  uploaderName: string;
  uploadTime: string;
  description?: string;
}

// 项目统计类型
export interface ProjectStatistics {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  delayedProjects: number;
  averageProgress: number;
  onTimeCompletionRate: number;
  budgetUtilizationRate: number;
  resourceUtilizationRate: number;
  period: string;
}

// 项目仪表板数据
export interface ProjectDashboard {
  overview: ProjectOverview;
  recentProjects: ProjectVO[];
  upcomingMilestones: ProjectMilestone[];
  myTasks: ProjectTask[];
  projectProgress: ProjectProgressChart[];
  resourceAllocation: ResourceAllocation[];
}

export interface ProjectOverview {
  totalProjects: number;
  activeProjects: number;
  completedThisMonth: number;
  delayedProjects: number;
  totalBudget: number;
  usedBudget: number;
  totalMembers: number;
  activeMembers: number;
}

export interface ProjectProgressChart {
  projectId: string;
  projectName: string;
  progress: number;
  status: ProjectStatus;
  endDate: string;
}

export interface ResourceAllocation {
  userId: string;
  userName: string;
  totalWorkload: number;
  availableCapacity: number;
  projects: Array<{
    projectId: string;
    projectName: string;
    workload: number;
  }>;
}

// 项目导出参数
export interface ProjectExportParams {
  format: 'excel' | 'pdf';
  includeDetails: boolean;
  includeTasks: boolean;
  includeMembers: boolean;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
}
