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

/**
 * 项目子项表单数据（用于新增和编辑）
 */
export interface ProjectItemForm {
  id?: string | number;                // 主键ID（编辑时必填）
  projectSubsystemId?: string | number; // 项目子系统ID（自动注入）
  projectSystemId?: string | number;    // 项目设备系统ID（自动注入）
  projectId?: string | number;          // 项目ID（自动注入）
  templateId?: string | number;         // 子项模板ID
  itemCode: string;                     // 子项编码（必填）
  itemName: string;                     // 子项名称（必填）
  itemType?: string;                    // 子项类型
  specification?: string;               // 规格型号
  description?: string;                 // 描述
  quantity?: number;                    // 数量
  unit?: string;                        // 单位
  unitWeight?: number;                  // 单重(kg)
  totalWeight?: number;                 // 总重(kg)
  materialCount?: number;               // 物料数量
  parentItemId?: string | number;       // 父子项ID
  status?: string;                      // 状态
  sequenceNumber?: number;              // 排序号
  remarks?: string;                     // 备注
  version?: number;                     // 版本号（乐观锁）
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

// ==================== 子项管理接口 ====================

/**
 * 新增项目子项（支持批量）
 * @param projectSubsystemId 项目子系统ID
 * @param data 子项数据数组
 */
export const addProjectItems = (
  projectSubsystemId: string | number,
  data: ProjectItemForm[]
): AxiosPromise<void> => {
  return request({
    url: `/erp/saltprocess/projectEquipmentSystem/subsystem/${projectSubsystemId}/items`,
    method: 'post',
    data
  });
};

/**
 * 编辑项目子项
 * @param projectSubsystemId 项目子系统ID
 * @param itemId 子项ID
 * @param data 子项数据
 */
export const updateProjectItem = (
  projectSubsystemId: string | number,
  itemId: string | number,
  data: ProjectItemForm
): AxiosPromise<void> => {
  return request({
    url: `/erp/saltprocess/projectEquipmentSystem/subsystem/${projectSubsystemId}/items/${itemId}`,
    method: 'put',
    data
  });
};

/**
 * 删除项目子项（支持批量）
 * @param projectSubsystemId 项目子系统ID
 * @param itemIds 子项ID（单个或数组）
 */
export const deleteProjectItems = (
  projectSubsystemId: string | number,
  itemIds: string | number | Array<string | number>
): AxiosPromise<void> => {
  const ids = Array.isArray(itemIds) ? itemIds.join(',') : itemIds;
  return request({
    url: `/erp/saltprocess/projectEquipmentSystem/subsystem/${projectSubsystemId}/items/${ids}`,
    method: 'delete'
  });
};

