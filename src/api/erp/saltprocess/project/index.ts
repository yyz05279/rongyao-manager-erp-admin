/**
 * 项目管理模块 - API接口
 */
import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import {
  SaltProjectQuery,
  SaltProjectVO,
  SaltProjectForm,
  ProjectStatistics,
  ProjectProgress,
  ProjectTask,
  ProjectRisk,
  ProjectChange,
  ProcessConfig,
  QualityStandard,
  ResourcePlan
} from './types';
import { ApiResponse, PageResult } from '../types';

// 项目基础CRUD接口

/**
 * 查询项目列表
 */
export const listSaltProject = (query?: SaltProjectQuery): AxiosPromise<PageResult<SaltProjectVO>> => {
  return request({
    url: '/erp/saltprocess/project/list',
    method: 'get',
    params: query
  });
};

/**
 * 获取项目详情
 */
export const getSaltProject = (id: string): AxiosPromise<SaltProjectVO> => {
  return request({
    url: `/erp/saltprocess/project/${id}`,
    method: 'get'
  });
};

/**
 * 创建项目
 */
export const createSaltProject = (data: SaltProjectForm): AxiosPromise<SaltProjectVO> => {
  return request({
    url: '/erp/saltprocess/project',
    method: 'post',
    data
  });
};

/**
 * 更新项目
 */
export const updateSaltProject = (data: SaltProjectForm): AxiosPromise<SaltProjectVO> => {
  return request({
    url: '/erp/saltprocess/project',
    method: 'put',
    data
  });
};

/**
 * 删除项目
 */
export const deleteSaltProject = (ids: string[]): AxiosPromise<void> => {
  return request({
    url: `/erp/saltprocess/project/${ids.join(',')}`,
    method: 'delete'
  });
};

// 项目业务接口

/**
 * 更新项目状态
 */
export const updateProjectStatus = (id: string, status: string): AxiosPromise<void> => {
  return request({
    url: `/erp/saltprocess/project/${id}/status`,
    method: 'put',
    data: { status }
  });
};

/**
 * 更新项目进度
 */
export const updateProjectProgress = (id: string, progress: number): AxiosPromise<void> => {
  return request({
    url: `/erp/saltprocess/project/${id}/progress`,
    method: 'put',
    data: { progress }
  });
};

/**
 * 获取项目统计信息
 */
export const getProjectStatistics = (period?: string): AxiosPromise<ProjectStatistics> => {
  return request({
    url: '/erp/saltprocess/project/statistics',
    method: 'get',
    params: { period }
  });
};

/**
 * 生成项目编码
 */
export const generateProjectCode = (): AxiosPromise<string> => {
  return request({
    url: '/erp/saltprocess/project/generate-code',
    method: 'get'
  });
};

/**
 * 复制项目
 */
export const copyProject = (id: string, newProjectName: string): AxiosPromise<SaltProjectVO> => {
  return request({
    url: `/erp/saltprocess/project/${id}/copy`,
    method: 'post',
    data: { newProjectName }
  });
};

// 项目进度管理

/**
 * 获取项目进度详情
 */
export const getProjectProgress = (id: string): AxiosPromise<ProjectProgress> => {
  return request({
    url: `/erp/saltprocess/project/${id}/progress`,
    method: 'get'
  });
};

/**
 * 更新阶段进度
 */
export const updatePhaseProgress = (projectId: string, phaseCode: string, progress: number): AxiosPromise<void> => {
  return request({
    url: `/erp/saltprocess/project/${projectId}/phase/${phaseCode}/progress`,
    method: 'put',
    data: { progress }
  });
};

// 项目任务管理

/**
 * 获取项目任务列表
 */
export const getProjectTasks = (projectId: string): AxiosPromise<ProjectTask[]> => {
  return request({
    url: `/erp/saltprocess/project/${projectId}/tasks`,
    method: 'get'
  });
};

/**
 * 创建项目任务
 */
export const createProjectTask = (data: Partial<ProjectTask>): AxiosPromise<ProjectTask> => {
  return request({
    url: '/erp/saltprocess/project/task',
    method: 'post',
    data
  });
};

/**
 * 更新任务状态
 */
export const updateTaskStatus = (taskId: string, status: string): AxiosPromise<void> => {
  return request({
    url: `/erp/saltprocess/project/task/${taskId}/status`,
    method: 'put',
    data: { status }
  });
};

// 项目风险管理

/**
 * 获取项目风险列表
 */
export const getProjectRisks = (projectId: string): AxiosPromise<ProjectRisk[]> => {
  return request({
    url: `/erp/saltprocess/project/${projectId}/risks`,
    method: 'get'
  });
};

/**
 * 创建项目风险
 */
export const createProjectRisk = (data: Partial<ProjectRisk>): AxiosPromise<ProjectRisk> => {
  return request({
    url: '/erp/saltprocess/project/risk',
    method: 'post',
    data
  });
};

/**
 * 更新风险状态
 */
export const updateRiskStatus = (riskId: string, status: string): AxiosPromise<void> => {
  return request({
    url: `/erp/saltprocess/project/risk/${riskId}/status`,
    method: 'put',
    data: { status }
  });
};

// 项目变更管理

/**
 * 获取项目变更列表
 */
export const getProjectChanges = (projectId: string): AxiosPromise<ProjectChange[]> => {
  return request({
    url: `/erp/saltprocess/project/${projectId}/changes`,
    method: 'get'
  });
};

/**
 * 创建变更请求
 */
export const createProjectChange = (data: Partial<ProjectChange>): AxiosPromise<ProjectChange> => {
  return request({
    url: '/erp/saltprocess/project/change',
    method: 'post',
    data
  });
};

/**
 * 审批变更请求
 */
export const approveProjectChange = (changeId: string, approved: boolean, comments?: string): AxiosPromise<void> => {
  return request({
    url: `/erp/saltprocess/project/change/${changeId}/approve`,
    method: 'put',
    data: { approved, comments }
  });
};

// 配置管理接口

/**
 * 获取工艺配置列表
 */
export const getProcessConfigs = (projectType?: string): AxiosPromise<ProcessConfig[]> => {
  return request({
    url: '/erp/saltprocess/project/process-config',
    method: 'get',
    params: { projectType }
  });
};

/**
 * 获取质量标准列表
 */
export const getQualityStandards = (projectType?: string): AxiosPromise<QualityStandard[]> => {
  return request({
    url: '/erp/saltprocess/project/quality-standard',
    method: 'get',
    params: { projectType }
  });
};

/**
 * 获取资源计划列表
 */
export const getResourcePlans = (): AxiosPromise<ResourcePlan[]> => {
  return request({
    url: '/erp/saltprocess/project/resource-plan',
    method: 'get'
  });
};

// 导出接口

/**
 * 导出项目列表
 */
export const exportProjectList = (query?: SaltProjectQuery): AxiosPromise<Blob> => {
  return request({
    url: '/erp/saltprocess/project/export',
    method: 'get',
    params: query,
    responseType: 'blob'
  });
};

/**
 * 导出项目详情报告
 */
export const exportProjectReport = (id: string): AxiosPromise<Blob> => {
  return request({
    url: `/erp/saltprocess/project/${id}/export`,
    method: 'get',
    responseType: 'blob'
  });
};

/**
 * 获取项目简化列表（用于下拉选择）
 */
export const getProjectSimpleList = async (): Promise<{ data: { id: string; name: string }[] }> => {
  const response: any = await request({
    url: '/erp/saltprocess/project/simple-list',
    method: 'get'
  });

  // 确保返回的数据格式正确
  const projects = response.data || [];
  const simplifiedList = projects.map((project: any) => ({
    id: String(project.id || project.projectId || ''),
    name: project.name || project.projectName || `项目${project.id}`
  }));

  console.log('📋 项目简化列表数据:', {
    原始数据数量: projects.length,
    转换后数据: simplifiedList
  });

  return { data: simplifiedList };
};

/**
 * 获取用户简化列表（用于负责人下拉选择）
 */
export const getUserSimpleList = async (): Promise<{ data: { id: number; name: string }[] }> => {
  const response: any = await request({
    url: '/system/user/simple-list',
    method: 'get'
  });

  // 转换后端UserVO数据结构为简化格式
  const users = response.data || [];
  const simplifiedList = users.map((user: any) => ({
    id: user.userId,
    name: user.nickName || user.userName || `用户${user.userId}`
  }));

  console.log('📋 用户简化列表数据:', {
    原始数据数量: users.length,
    转换后数据: simplifiedList
  });

  return { data: simplifiedList };
};
