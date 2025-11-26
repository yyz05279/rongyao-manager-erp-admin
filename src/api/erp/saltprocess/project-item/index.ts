/**
 * 项目子项和物料查询 - API接口
 * 基于接口文档: 项目子项和物料查询接口文档.md
 */
import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import type { PageResult } from '../types';

// ==================== 类型定义 ====================

/**
 * 项目子项查询参数
 */
export interface ProjectItemQuery {
  pageNum?: number;                 // 页码
  pageSize?: number;                // 每页数量
  projectSystemId?: string | number; // 项目设备系统ID
  projectSubsystemId?: string | number; // 项目子系统ID
  itemName?: string;                // 子项名称
  status?: string;                  // 状态(DRAFT/ACTIVE)
}

/**
 * 项目子项VO
 */
export interface ProjectItemVO {
  id: string | number;
  projectSystemId: string | number;
  projectSubsystemId: string | number;
  itemCode: string;
  itemName: string;
  itemType?: string;
  specification?: string;
  quantity: number | string;
  unit: string;
  status: string;
  sequenceNumber?: number;
  createTime?: string;
}

/**
 * 项目物料查询参数
 */
export interface ProjectMaterialQuery {
  pageNum?: number;                 // 页码
  pageSize?: number;                // 每页数量
  projectItemId?: string | number;  // 项目子项ID
  materialCode?: string;            // 物料编码
  materialName?: string;            // 物料名称
  status?: string;                  // 状态
}

/**
 * 项目物料VO
 */
export interface ProjectMaterialVO {
  id: string | number;
  projectItemId: string | number;
  materialCode: string;
  materialName: string;
  specification?: string;
  materialType?: string;
  unit: string;
  quantity: number | string;
  manufacturer?: string;
  model?: string;
  status: string;
}

/**
 * 项目子系统下的子项列表项
 */
export interface ProjectSubsystemItemVO {
  id: string | number;
  itemCode: string;
  itemName: string;
  quantity: number | string;
  unit: string;
  status: string;
}

/**
 * 项目子项下的物料列表项
 */
export interface ProjectItemMaterialVO {
  id: string | number;
  materialCode: string;
  materialName: string;
  quantity: number | string;
  unit: string;
}

// ==================== API接口 ====================

/**
 * 查询项目子项列表（分页）
 */
export const listProjectItem = (query?: ProjectItemQuery): AxiosPromise<PageResult<ProjectItemVO>> => {
  return request({
    url: '/erp/saltprocess/projectItem/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询项目子项详情
 */
export const getProjectItem = (id: string | number): AxiosPromise<ProjectItemVO> => {
  return request({
    url: `/erp/saltprocess/projectItem/${id}`,
    method: 'get'
  });
};

/**
 * 查询项目物料列表（分页）
 */
export const listProjectMaterial = (query?: ProjectMaterialQuery): AxiosPromise<PageResult<ProjectMaterialVO>> => {
  return request({
    url: '/erp/saltprocess/projectMaterial/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询项目物料详情
 */
export const getProjectMaterial = (id: string | number): AxiosPromise<ProjectMaterialVO> => {
  return request({
    url: `/erp/saltprocess/projectMaterial/${id}`,
    method: 'get'
  });
};

/**
 * 查询项目子系统下的子项列表
 */
export const getSubsystemItems = (projectSubsystemId: string | number): AxiosPromise<ProjectSubsystemItemVO[]> => {
  return request({
    url: `/erp/saltprocess/projectEquipmentSystem/subsystem/${projectSubsystemId}/items`,
    method: 'get'
  });
};

/**
 * 查询项目子项下的物料列表
 */
export const getItemMaterials = (projectItemId: string | number): AxiosPromise<ProjectItemMaterialVO[]> => {
  return request({
    url: `/erp/saltprocess/projectEquipmentSystem/item/${projectItemId}/materials`,
    method: 'get'
  });
};

