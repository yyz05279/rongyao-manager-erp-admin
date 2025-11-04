/**
 * 子系统管理模块 - API接口
 * 基于后端 API v1.1 文档
 */
import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import {
  SubsystemQuery,
  SubsystemVO,
  SubsystemForm,
  SubsystemDetailVO,
  SubsystemItemQuery,
  SubsystemItemVO,
  SubsystemItemForm,
  SubsystemMaterialQuery,
  SubsystemMaterialVO,
  SubsystemMaterialForm,
  PageResult
} from './types';

// ==================== 子系统管理接口 ====================

/**
 * 查询子系统列表
 * @param query 查询参数
 */
export const listSubsystem = (query?: SubsystemQuery): AxiosPromise<PageResult<SubsystemVO>> => {
  return request({
    url: '/erp/subsystem/list',
    method: 'get',
    params: query
  });
};

/**
 * 获取子系统详细信息
 * @param id 子系统ID
 */
export const getSubsystem = (id: string | number): AxiosPromise<SubsystemDetailVO> => {
  return request({
    url: `/erp/subsystem/${id}`,
    method: 'get'
  });
};

/**
 * 新增子系统
 * @param data 子系统表单数据
 */
export const addSubsystem = (data: SubsystemForm): AxiosPromise<void> => {
  return request({
    url: '/erp/subsystem',
    method: 'post',
    data
  });
};

/**
 * 修改子系统
 * @param data 子系统表单数据
 */
export const updateSubsystem = (data: SubsystemForm): AxiosPromise<void> => {
  return request({
    url: '/erp/subsystem',
    method: 'put',
    data
  });
};

/**
 * 删除子系统
 * @param ids 子系统ID数组（逗号分隔）
 */
export const delSubsystem = (ids: string | number | Array<string | number>): AxiosPromise<void> => {
  return request({
    url: `/erp/subsystem/${ids}`,
    method: 'delete'
  });
};

/**
 * 导出子系统列表
 * @param query 查询参数
 */
export const exportSubsystem = (query?: SubsystemQuery): AxiosPromise<Blob> => {
  return request({
    url: '/erp/subsystem/export',
    method: 'post',
    params: query,
    responseType: 'blob'
  });
};

/**
 * 生成子系统编号
 * @param projectCode 项目编号
 */
export const generateSubsystemCode = (projectCode: string): AxiosPromise<string> => {
  return request({
    url: '/erp/subsystem/generate-code',
    method: 'get',
    params: { projectCode }
  });
};

/**
 * 更新子系统状态
 * @param id 子系统ID
 * @param status 状态值
 */
export const updateSubsystemStatus = (id: string | number, status: string): AxiosPromise<void> => {
  return request({
    url: `/erp/subsystem/${id}/status`,
    method: 'put',
    params: { status }
  });
};

/**
 * 复制子系统
 * @param id 源子系统ID
 */
export const copySubsystem = (id: string | number): AxiosPromise<number> => {
  return request({
    url: `/erp/subsystem/${id}/copy`,
    method: 'post'
  });
};

/**
 * 校验子系统编号唯一性
 * @param subsystemCode 子系统编号
 * @param excludeId 排除的ID（编辑时使用）
 */
export const checkSubsystemCodeUnique = (
  subsystemCode: string,
  excludeId?: string | number
): AxiosPromise<boolean> => {
  return request({
    url: '/erp/subsystem/check-code-unique',
    method: 'get',
    params: { subsystemCode, excludeId }
  });
};

// ==================== 子项管理接口 ====================

/**
 * 查询子项列表
 * @param query 查询参数
 */
export const listSubsystemItem = (query?: SubsystemItemQuery): AxiosPromise<PageResult<SubsystemItemVO>> => {
  return request({
    url: '/erp/subsystem/item/list',
    method: 'get',
    params: query
  });
};

/**
 * 获取子项详细信息
 * @param id 子项ID
 */
export const getSubsystemItem = (id: string | number): AxiosPromise<SubsystemItemVO> => {
  return request({
    url: `/erp/subsystem/item/${id}`,
    method: 'get'
  });
};

/**
 * 新增子项
 * @param data 子项表单数据
 */
export const addSubsystemItem = (data: SubsystemItemForm): AxiosPromise<void> => {
  return request({
    url: '/erp/subsystem/item',
    method: 'post',
    data
  });
};

/**
 * 修改子项
 * @param data 子项表单数据
 */
export const updateSubsystemItem = (data: SubsystemItemForm): AxiosPromise<void> => {
  return request({
    url: '/erp/subsystem/item',
    method: 'put',
    data
  });
};

/**
 * 删除子项
 * @param ids 子项ID数组（逗号分隔）
 */
export const delSubsystemItem = (ids: string | number | Array<string | number>): AxiosPromise<void> => {
  return request({
    url: `/erp/subsystem/item/${ids}`,
    method: 'delete'
  });
};

/**
 * 批量新增子项
 * @param subsystemId 子系统ID
 * @param items 子项数组
 */
export const batchAddSubsystemItems = (
  subsystemId: number,
  items: SubsystemItemForm[]
): AxiosPromise<void> => {
  return request({
    url: '/erp/subsystem/item/batch',
    method: 'post',
    params: { subsystemId },
    data: items
  });
};

/**
 * 生成子项编号
 * @param subsystemCode 子系统编号
 */
export const generateSubsystemItemCode = (subsystemCode: string): AxiosPromise<string> => {
  return request({
    url: '/erp/subsystem/item/generate-code',
    method: 'get',
    params: { subsystemCode }
  });
};

/**
 * 获取子项树形结构
 * @param subsystemId 子系统ID
 */
export const getSubsystemItemTree = (subsystemId: number): AxiosPromise<SubsystemItemVO[]> => {
  return request({
    url: '/erp/subsystem/item/tree',
    method: 'get',
    params: { subsystemId }
  });
};

// ==================== 物料管理接口 ====================

/**
 * 查询物料列表
 * @param query 查询参数
 */
export const listSubsystemMaterial = (query?: SubsystemMaterialQuery): AxiosPromise<PageResult<SubsystemMaterialVO>> => {
  return request({
    url: '/erp/subsystem/material/list',
    method: 'get',
    params: query
  });
};

/**
 * 获取物料详细信息
 * @param id 物料ID
 */
export const getSubsystemMaterial = (id: string | number): AxiosPromise<SubsystemMaterialVO> => {
  return request({
    url: `/erp/subsystem/material/${id}`,
    method: 'get'
  });
};

/**
 * 添加物料
 * @param data 物料表单数据
 */
export const addSubsystemMaterial = (data: SubsystemMaterialForm): AxiosPromise<void> => {
  return request({
    url: '/erp/subsystem/material',
    method: 'post',
    data
  });
};

/**
 * 修改物料
 * @param data 物料表单数据
 */
export const updateSubsystemMaterial = (data: SubsystemMaterialForm): AxiosPromise<void> => {
  return request({
    url: '/erp/subsystem/material',
    method: 'put',
    data
  });
};

/**
 * 删除物料
 * @param ids 物料ID数组（逗号分隔）
 */
export const delSubsystemMaterial = (ids: string | number | Array<string | number>): AxiosPromise<void> => {
  return request({
    url: `/erp/subsystem/material/${ids}`,
    method: 'delete'
  });
};

/**
 * 批量添加物料
 * @param subsystemId 子系统ID
 * @param itemId 子项ID
 * @param materials 物料数组
 */
export const batchAddSubsystemMaterials = (
  subsystemId: number,
  itemId: number,
  materials: SubsystemMaterialForm[]
): AxiosPromise<void> => {
  return request({
    url: '/erp/subsystem/material/batch',
    method: 'post',
    params: { subsystemId, itemId },
    data: materials
  });
};

