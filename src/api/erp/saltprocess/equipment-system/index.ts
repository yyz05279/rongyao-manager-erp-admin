/**
 * 项目设备系统管理 - API接口
 * 基于后端 API v1.0 文档
 */
import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import {
  ProjectEquipmentSystemQuery,
  ProjectEquipmentSystemVO,
  ProjectEquipmentSystemForm,
  ProjectEquipmentSystemFullForm,
  ProjectEquipmentSystemDetailVO,
  PageResult
} from './types';

/**
 * 查询项目设备系统列表（分页）
 * @param query 查询参数
 */
export const listProjectEquipmentSystem = (query?: ProjectEquipmentSystemQuery): AxiosPromise<PageResult<ProjectEquipmentSystemVO>> => {
  return request({
    url: '/erp/saltprocess/projectEquipmentSystem/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询项目设备系统详情
 * @param id 设备系统ID
 */
export const getProjectEquipmentSystem = (id: string | number): AxiosPromise<ProjectEquipmentSystemDetailVO> => {
  return request({
    url: `/erp/saltprocess/projectEquipmentSystem/${id}`,
    method: 'get'
  });
};

/**
 * 新增项目设备系统
 * @param data 设备系统表单数据
 */
export const addProjectEquipmentSystem = (data: ProjectEquipmentSystemForm): AxiosPromise<void> => {
  return request({
    url: '/erp/saltprocess/projectEquipmentSystem',
    method: 'post',
    data
  });
};

/**
 * 修改项目设备系统（基本编辑）
 * @param data 设备系统表单数据
 */
export const updateProjectEquipmentSystem = (data: ProjectEquipmentSystemForm): AxiosPromise<void> => {
  return request({
    url: '/erp/saltprocess/projectEquipmentSystem',
    method: 'put',
    data
  });
};

/**
 * 完整编辑项目设备系统（支持级联更新子系统）
 * @param data 设备系统完整编辑表单数据
 * @description 支持级联删除旧的子系统、子项、物料，并创建新的子系统、子项、物料
 */
export const updateProjectEquipmentSystemFull = (data: ProjectEquipmentSystemFullForm): AxiosPromise<void> => {
  return request({
    url: '/erp/saltprocess/projectEquipmentSystem/full',
    method: 'put',
    data
  });
};

/**
 * 删除项目设备系统
 * @param ids 设备系统ID数组（逗号分隔）
 */
export const delProjectEquipmentSystem = (ids: string | number | Array<string | number>): AxiosPromise<void> => {
  return request({
    url: `/erp/saltprocess/projectEquipmentSystem/${ids}`,
    method: 'delete'
  });
};

/**
 * 导出项目设备系统列表
 * @param query 查询参数
 */
export const exportProjectEquipmentSystem = (query?: ProjectEquipmentSystemQuery): AxiosPromise<Blob> => {
  return request({
    url: '/erp/saltprocess/projectEquipmentSystem/export',
    method: 'post',
    params: query,
    responseType: 'blob'
  });
};

/**
 * 生成设备系统编号
 * @param projectId 项目ID（使用 string 类型避免 Long 精度丢失）
 */
export const generateSystemCode = (projectId: string): AxiosPromise<string> => {
  return request({
    url: '/erp/saltprocess/projectEquipmentSystem/generate-code',
    method: 'get',
    params: { projectId }
  });
};

/**
 * 更新设备系统状态
 * @param id 设备系统ID
 * @param status 状态值
 */
export const updateSystemStatus = (id: string | number, status: string): AxiosPromise<void> => {
  return request({
    url: `/erp/saltprocess/projectEquipmentSystem/${id}/status`,
    method: 'put',
    params: { status }
  });
};

/**
 * 复制设备系统
 * @param id 源设备系统ID
 */
export const copyProjectEquipmentSystem = (id: string | number): AxiosPromise<string> => {
  return request({
    url: `/erp/saltprocess/projectEquipmentSystem/${id}/copy`,
    method: 'post'
  });
};

/**
 * 从模板创建设备系统
 * @param projectId 项目ID（使用 string 类型避免 Long 精度丢失）
 * @param templateId 模板ID（使用 string 类型避免 Long 精度丢失）
 */
export const createFromTemplate = (projectId: string, templateId: string): AxiosPromise<string> => {
  return request({
    url: '/erp/saltprocess/projectEquipmentSystem/create-from-template',
    method: 'post',
    params: { projectId, templateId }
  });
};

/**
 * 批量从模板创建项目设备系统
 * @param data 创建参数 { projectId: string, templateIds: string[] }
 * @description 使用 string 类型避免后端 Long 类型 ID 精度丢失
 */
export const createFromTemplates = (data: { projectId: string; templateIds: string[] }): AxiosPromise<string[]> => {
  return request({
    url: '/erp/saltprocess/projectEquipmentSystem/create-from-templates',
    method: 'post',
    data
  });
};

/**
 * 发布项目设备系统
 * @param id 项目设备系统ID
 * @returns 发布结果
 * @description 将草稿状态的项目设备系统发布为活跃状态
 */
export const publishProjectSystem = (id: string | number): AxiosPromise<void> => {
  return request({
    url: `/erp/saltprocess/projectEquipmentSystem/${id}/publish`,
    method: 'post'
  });
};

/**
 * 批量新增子系统数据接口
 */
export interface BatchAddSubsystemForm {
  templateId: string | number;          // 子系统模板ID
  subsystemName: string;                // 子系统名称
  subsystemCode?: string;               // 子系统编码（可选）
  category?: string;                    // 子系统分类（可选）
  subsystemType?: string;               // 子系统类型（可选）
  description?: string;                 // 描述（可选）
  status?: string;                      // 状态（可选）
  sequenceNumber?: number;              // 序号（可选）
  remarks?: string;                     // 备注（可选）
}

/**
 * 批量新增子系统模板到项目设备系统
 * @param systemId 项目设备系统ID
 * @param subsystemsData 子系统配置对象数组
 * @description 从子系统模板批量创建项目子系统
 */
export const batchAddSubsystemTemplates = (
  systemId: string | number,
  subsystemsData: BatchAddSubsystemForm[]
): AxiosPromise<void> => {
  return request({
    url: `/erp/saltprocess/projectEquipmentSystem/${systemId}/subsystems/batch`,
    method: 'post',
    data: subsystemsData
  });
};

