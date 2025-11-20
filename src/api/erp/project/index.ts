/**
 * 通用项目管理模块 - API接口
 * 注意：此模块为通用项目管理，与 saltprocess/project（盐化工艺项目）模块功能互补
 * - saltprocess/project: 专门用于盐化工艺项目的工艺流程管理
 * - erp/project: 通用项目管理，适用于各种类型的企业项目
 */
import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import {
  ProjectQuery,
  ProjectVO,
  ProjectForm,
  ProjectMember,
  ProjectMemberForm,
  ProjectRole,
  ProjectProgress,
  ProjectMilestone,
  ProjectMilestoneForm,
  ProjectTask,
  ProjectTaskForm,
  ProjectStatistics,
  ProjectDashboard,
  ProjectExportParams
} from './types';
import { ApiResponse, PageResult } from '../types';

// ==================== 项目基础管理接口 ====================

/**
 * 查询项目列表
 */
export const listProject = (query?: ProjectQuery): AxiosPromise<PageResult<ProjectVO>> => {
  return request({
    url: '/erp/project/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询项目简化列表（用于下拉选择）
 */
export const listProjectSimple = (): AxiosPromise<Array<{ id: number; projectName: string; projectCode: string }>> => {
  return request({
    url: '/erp/project/simple',
    method: 'get'
  });
};

/**
 * 获取项目详情
 */
export const getProject = (id: string): AxiosPromise<ProjectVO> => {
  return request({
    url: `/erp/project/${id}`,
    method: 'get'
  });
};

/**
 * 创建项目
 */
export const createProject = (data: ProjectForm): AxiosPromise<ProjectVO> => {
  return request({
    url: '/erp/project',
    method: 'post',
    data
  });
};

/**
 * 更新项目
 */
export const updateProject = (data: ProjectForm): AxiosPromise<ProjectVO> => {
  return request({
    url: '/erp/project',
    method: 'put',
    data
  });
};

/**
 * 删除项目
 */
export const deleteProject = (ids: string[]): AxiosPromise<void> => {
  return request({
    url: `/erp/project/${ids.join(',')}`,
    method: 'delete'
  });
};

// ==================== 项目状态管理接口 ====================

/**
 * 更新项目状态
 */
export const updateProjectStatus = (id: string, status: string): AxiosPromise<void> => {
  return request({
    url: `/erp/project/${id}/status`,
    method: 'put',
    data: { status }
  });
};

/**
 * 启动项目
 */
export const startProject = (id: string): AxiosPromise<void> => {
  return request({
    url: `/erp/project/${id}/start`,
    method: 'post'
  });
};

/**
 * 暂停项目
 */
export const pauseProject = (id: string, reason?: string): AxiosPromise<void> => {
  return request({
    url: `/erp/project/${id}/pause`,
    method: 'post',
    data: { reason }
  });
};

/**
 * 完成项目
 */
export const completeProject = (id: string, summary?: string): AxiosPromise<void> => {
  return request({
    url: `/erp/project/${id}/complete`,
    method: 'post',
    data: { summary }
  });
};

/**
 * 取消项目
 */
export const cancelProject = (id: string, reason?: string): AxiosPromise<void> => {
  return request({
    url: `/erp/project/${id}/cancel`,
    method: 'post',
    data: { reason }
  });
};

// ==================== 项目成员管理接口 ====================

/**
 * 获取项目成员列表
 */
export const getProjectMembers = (projectId: string): AxiosPromise<ProjectMember[]> => {
  return request({
    url: `/erp/project/${projectId}/members`,
    method: 'get'
  });
};

/**
 * 添加项目成员
 */
export const addProjectMember = (data: ProjectMemberForm): AxiosPromise<ProjectMember> => {
  return request({
    url: `/erp/project/${data.projectId}/members`,
    method: 'post',
    data
  });
};

/**
 * 更新成员角色
 */
export const updateMemberRole = (projectId: string, memberId: string, roleId: string): AxiosPromise<void> => {
  return request({
    url: `/erp/project/${projectId}/members/${memberId}`,
    method: 'put',
    data: { roleId }
  });
};

/**
 * 移除项目成员
 */
export const removeProjectMember = (projectId: string, memberId: string): AxiosPromise<void> => {
  return request({
    url: `/erp/project/${projectId}/members/${memberId}`,
    method: 'delete'
  });
};

/**
 * 批量添加项目成员
 */
export const batchAddMembers = (projectId: string, members: ProjectMemberForm[]): AxiosPromise<ProjectMember[]> => {
  return request({
    url: `/erp/project/${projectId}/members/batch`,
    method: 'post',
    data: { members }
  });
};

// ==================== 角色权限管理接口 ====================

/**
 * 获取项目角色列表
 */
export const getProjectRoles = (): AxiosPromise<ProjectRole[]> => {
  return request({
    url: '/erp/project/roles',
    method: 'get'
  });
};

/**
 * 分配成员角色
 */
export const assignMemberRole = (projectId: string, memberId: string, roleId: string): AxiosPromise<void> => {
  return request({
    url: `/erp/project/${projectId}/members/${memberId}/role`,
    method: 'put',
    data: { roleId }
  });
};

// ==================== 项目进度管理接口 ====================

/**
 * 获取项目进度
 */
export const getProjectProgress = (projectId: string): AxiosPromise<ProjectProgress> => {
  return request({
    url: `/erp/project/${projectId}/progress`,
    method: 'get'
  });
};

/**
 * 更新项目进度
 */
export const updateProjectProgress = (projectId: string, progress: number): AxiosPromise<void> => {
  return request({
    url: `/erp/project/${projectId}/progress`,
    method: 'put',
    data: { progress }
  });
};

// ==================== 里程碑管理接口 ====================

/**
 * 获取项目里程碑
 */
export const getProjectMilestones = (projectId: string): AxiosPromise<ProjectMilestone[]> => {
  return request({
    url: `/erp/project/${projectId}/milestones`,
    method: 'get'
  });
};

/**
 * 创建里程碑
 */
export const createMilestone = (data: ProjectMilestoneForm): AxiosPromise<ProjectMilestone> => {
  return request({
    url: `/erp/project/${data.projectId}/milestones`,
    method: 'post',
    data
  });
};

/**
 * 更新里程碑
 */
export const updateMilestone = (projectId: string, milestoneId: string, data: Partial<ProjectMilestoneForm>): AxiosPromise<ProjectMilestone> => {
  return request({
    url: `/erp/project/${projectId}/milestones/${milestoneId}`,
    method: 'put',
    data
  });
};

/**
 * 删除里程碑
 */
export const deleteMilestone = (projectId: string, milestoneId: string): AxiosPromise<void> => {
  return request({
    url: `/erp/project/${projectId}/milestones/${milestoneId}`,
    method: 'delete'
  });
};

// ==================== 任务管理接口 ====================

/**
 * 获取项目任务列表
 */
export const getProjectTasks = (projectId: string): AxiosPromise<ProjectTask[]> => {
  return request({
    url: `/erp/project/${projectId}/tasks`,
    method: 'get'
  });
};

/**
 * 创建项目任务
 */
export const createTask = (data: ProjectTaskForm): AxiosPromise<ProjectTask> => {
  return request({
    url: `/erp/project/${data.projectId}/tasks`,
    method: 'post',
    data
  });
};

/**
 * 更新任务
 */
export const updateTask = (projectId: string, taskId: string, data: Partial<ProjectTaskForm>): AxiosPromise<ProjectTask> => {
  return request({
    url: `/erp/project/${projectId}/tasks/${taskId}`,
    method: 'put',
    data
  });
};

/**
 * 删除任务
 */
export const deleteTask = (projectId: string, taskId: string): AxiosPromise<void> => {
  return request({
    url: `/erp/project/${projectId}/tasks/${taskId}`,
    method: 'delete'
  });
};

// ==================== 统计分析接口 ====================

/**
 * 获取项目统计数据
 */
export const getProjectStatistics = (period?: string): AxiosPromise<ProjectStatistics> => {
  return request({
    url: '/erp/project/statistics',
    method: 'get',
    params: { period }
  });
};

/**
 * 获取单个项目统计
 */
export const getProjectStatisticsById = (projectId: string): AxiosPromise<ProjectStatistics> => {
  return request({
    url: `/erp/project/${projectId}/statistics`,
    method: 'get'
  });
};

/**
 * 获取项目仪表板数据
 */
export const getProjectDashboard = (): AxiosPromise<ProjectDashboard> => {
  return request({
    url: '/erp/project/dashboard',
    method: 'get'
  });
};

// ==================== 导出接口 ====================

/**
 * 导出项目列表
 */
export const exportProjectList = (query?: ProjectQuery): AxiosPromise<Blob> => {
  return request({
    url: '/erp/project/export',
    method: 'get',
    params: query,
    responseType: 'blob'
  });
};

/**
 * 导出项目详情报告
 */
export const exportProjectReport = (projectId: string, params?: ProjectExportParams): AxiosPromise<Blob> => {
  return request({
    url: `/erp/project/${projectId}/export`,
    method: 'get',
    params,
    responseType: 'blob'
  });
};
