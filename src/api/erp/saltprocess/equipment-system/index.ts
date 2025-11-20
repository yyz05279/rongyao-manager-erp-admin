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
 * 修改项目设备系统
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
 * @param projectId 项目ID
 */
export const generateSystemCode = (projectId: number): AxiosPromise<string> => {
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
export const copyProjectEquipmentSystem = (id: string | number): AxiosPromise<number> => {
  return request({
    url: `/erp/saltprocess/projectEquipmentSystem/${id}/copy`,
    method: 'post'
  });
};

/**
 * 从模板创建设备系统
 * @param projectId 项目ID
 * @param templateId 模板ID
 */
export const createFromTemplate = (projectId: number, templateId: number): AxiosPromise<number> => {
  return request({
    url: '/erp/saltprocess/projectEquipmentSystem/create-from-template',
    method: 'post',
    params: { projectId, templateId }
  });
};

/**
 * 批量从模板创建项目设备系统
 * @param data 创建参数 { projectId: number, templateIds: number[] }
 */
export const createFromTemplates = (data: { projectId: number; templateIds: number[] }): AxiosPromise<string[]> => {
  return request({
    url: '/erp/saltprocess/projectEquipmentSystem/create-from-templates',
    method: 'post',
    data
  });
};

