/**
 * 子系统管理模块 - API接口
 */
import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import {
  SubsystemQuery,
  SubsystemVO,
  SubsystemForm,
  SubItemQuery,
  SubItemVO,
  SubItemForm,
  SubsystemMaterialQuery,
  SubsystemMaterialVO,
  SubsystemMaterialForm,
  SubsystemStatistics,
  SubsystemDetail,
  PageResult
} from './types';

// ==================== 子系统管理 ====================

/**
 * 查询子系统列表
 */
export const listSubsystem = (query?: SubsystemQuery): AxiosPromise<PageResult<SubsystemVO>> => {
  return request({
    url: '/erp/subsystem/list',
    method: 'get',
    params: query
  });
};

/**
 * 获取子系统详情
 */
export const getSubsystem = (id: string | number): AxiosPromise<SubsystemVO> => {
  return request({
    url: `/erp/subsystem/${id}`,
    method: 'get'
  });
};

/**
 * 获取子系统完整详情（包含子项和物料）
 */
export const getSubsystemDetail = (id: string | number): AxiosPromise<SubsystemDetail> => {
  return request({
    url: `/erp/subsystem/${id}/detail`,
    method: 'get'
  });
};

/**
 * 新增子系统
 */
export const addSubsystem = (data: SubsystemForm): AxiosPromise<SubsystemVO> => {
  return request({
    url: '/erp/subsystem',
    method: 'post',
    data
  });
};

/**
 * 修改子系统
 */
export const updateSubsystem = (data: SubsystemForm): AxiosPromise<SubsystemVO> => {
  return request({
    url: '/erp/subsystem',
    method: 'put',
    data
  });
};

/**
 * 删除子系统
 */
export const delSubsystem = (ids: string | number | Array<string | number>): AxiosPromise<void> => {
  return request({
    url: `/erp/subsystem/${ids}`,
    method: 'delete'
  });
};

/**
 * 导出子系统列表
 */
export const exportSubsystem = (query?: SubsystemQuery): AxiosPromise<Blob> => {
  return request({
    url: '/erp/subsystem/export',
    method: 'get',
    params: query,
    responseType: 'blob'
  });
};

/**
 * 获取子系统统计信息
 */
export const getSubsystemStatistics = (): AxiosPromise<SubsystemStatistics> => {
  return request({
    url: '/erp/subsystem/statistics',
    method: 'get'
  });
};

// ==================== 子项管理 ====================

/**
 * 查询子项列表
 */
export const listSubItem = (query: SubItemQuery): AxiosPromise<PageResult<SubItemVO>> => {
  return request({
    url: '/erp/subsystem/subitem/list',
    method: 'get',
    params: query
  });
};

/**
 * 获取子项详情
 */
export const getSubItem = (id: string | number): AxiosPromise<SubItemVO> => {
  return request({
    url: `/erp/subsystem/subitem/${id}`,
    method: 'get'
  });
};

/**
 * 新增子项
 */
export const addSubItem = (data: SubItemForm): AxiosPromise<SubItemVO> => {
  return request({
    url: '/erp/subsystem/subitem',
    method: 'post',
    data
  });
};

/**
 * 修改子项
 */
export const updateSubItem = (data: SubItemForm): AxiosPromise<SubItemVO> => {
  return request({
    url: '/erp/subsystem/subitem',
    method: 'put',
    data
  });
};

/**
 * 删除子项
 */
export const delSubItem = (ids: string | number | Array<string | number>): AxiosPromise<void> => {
  return request({
    url: `/erp/subsystem/subitem/${ids}`,
    method: 'delete'
  });
};

// ==================== 物料管理 ====================

/**
 * 查询子系统物料列表
 */
export const listSubsystemMaterial = (query: SubsystemMaterialQuery): AxiosPromise<PageResult<SubsystemMaterialVO>> => {
  return request({
    url: '/erp/subsystem/material/list',
    method: 'get',
    params: query
  });
};

/**
 * 获取子系统物料详情
 */
export const getSubsystemMaterial = (id: string | number): AxiosPromise<SubsystemMaterialVO> => {
  return request({
    url: `/erp/subsystem/material/${id}`,
    method: 'get'
  });
};

/**
 * 新增子系统物料
 */
export const addSubsystemMaterial = (data: SubsystemMaterialForm): AxiosPromise<SubsystemMaterialVO> => {
  return request({
    url: '/erp/subsystem/material',
    method: 'post',
    data
  });
};

/**
 * 修改子系统物料
 */
export const updateSubsystemMaterial = (data: SubsystemMaterialForm): AxiosPromise<SubsystemMaterialVO> => {
  return request({
    url: '/erp/subsystem/material',
    method: 'put',
    data
  });
};

/**
 * 删除子系统物料
 */
export const delSubsystemMaterial = (ids: string | number | Array<string | number>): AxiosPromise<void> => {
  return request({
    url: `/erp/subsystem/material/${ids}`,
    method: 'delete'
  });
};

/**
 * 导出子系统物料列表
 */
export const exportSubsystemMaterial = (query: SubsystemMaterialQuery): AxiosPromise<Blob> => {
  return request({
    url: '/erp/subsystem/material/export',
    method: 'get',
    params: query,
    responseType: 'blob'
  });
};

