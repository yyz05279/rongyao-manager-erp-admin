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

// ==================== 物料管理接口 ====================

/**
 * 物料表单数据（用于新增和编辑）
 */
export interface ProjectMaterialForm {
  id?: string | number;                // 物料ID（编辑时必填）
  materialCode?: string;               // 物料编码
  materialName: string;                // 物料名称（必填）
  specification?: string;              // 规格型号
  materialType?: string;               // 物料类型
  materialCategory?: string;           // 物料类别
  quantity?: number;                   // 数量
  unit?: string;                       // 单位
  unitWeight?: number;                 // 单重(kg)
  totalWeight?: number;                // 总重(kg)
  manufacturer?: string;               // 制造商
  model?: string;                      // 型号
  serialNumber?: string;               // 序列号
  packageType?: string;                // 包装方式
  packageQuantity?: number;            // 包装件数
  isFragile?: boolean;                 // 是否易碎
  isHazardous?: boolean;               // 是否危险品
  storageRequirement?: string;         // 存储要求
  status?: string;                     // 状态
  sequenceNumber?: number;             // 排序号
  remarks?: string;                    // 备注
  remarks1?: string;                   // 备注1
  remarks2?: string;                   // 备注2
}

/**
 * 批量物料操作结果
 */
export interface BatchMaterialResult {
  totalCount: number;                  // 总数
  successCount: number;                // 成功数
  failureCount: number;                // 失败数
  insertCount?: number;                // 新增数
  updateCount?: number;                // 更新数
  deleteCount?: number;                // 删除数
  failures?: Array<{                   // 失败详情
    rowNumber: number;
    recordId?: string | number;
    errorMessage: string;
    errorField?: string;
  }>;
  message: string;                     // 操作信息
}

/**
 * 根据《前端编辑物料请求调整指南》过滤冗余字段与空值
 * - 移除：id、projectItemId、projectSubsystemId、projectSystemId、projectId、createTime、updateTime、version
 * - 过滤：undefined 与 null
 */
const filterMaterialPayloadBase = (raw: Record<string, any>): Record<string, any> => {
  const redundant = new Set([
    'id',
    'projectItemId',
    'projectSubsystemId',
    'projectSystemId',
    'projectId',
    'createTime',
    'updateTime',
    'version'
  ]);
  const payload: Record<string, any> = {};
  Object.keys(raw || {}).forEach((key) => {
    if (redundant.has(key)) return;
    const val = (raw as any)[key];
    if (val === undefined || val === null) return; // 过滤 undefined / null
    payload[key] = val;
  });
  return payload;
};

/**
 * 过滤编辑(单条 PUT)的 payload：不允许包含 id
 */
const buildMaterialUpdatePayload = (data: ProjectMaterialForm): Record<string, any> => {
  // 若 data 内部意外包含 id，会被基础过滤移除
  return filterMaterialPayloadBase(data as unknown as Record<string, any>);
};

/**
 * 过滤批量保存(POST upsert)的 payload：允许包含 id 用于区分新增/更新
 */
const buildMaterialUpsertPayload = (data: ProjectMaterialForm): Record<string, any> => {
  const baseRemoved = filterMaterialPayloadBase(data as unknown as Record<string, any>);
  // 对于批量 upsert，保留 id（如果存在）
  if (data.id !== undefined && data.id !== null) {
    baseRemoved.id = data.id;
  }
  return baseRemoved;
};

/**
 * 编辑项目物料（PUT）
 * - 路径参数携带 projectItemId 与 materialId
 * - 请求体仅包含需要修改的字段
 */
export const updateProjectMaterial = (
  projectItemId: string | number,
  materialId: string | number,
  data: ProjectMaterialForm
): AxiosPromise<void> => {
  const payload = buildMaterialUpdatePayload(data);
  return request({
    url: `/erp/saltprocess/projectEquipmentSystem/item/${projectItemId}/materials/${materialId}`,
    method: 'put',
    data: payload
  });
};

/**
 * 删除项目物料（支持批量）
 * @param projectItemId 项目子项ID
 * @param materialIds 物料ID（单个或数组）
 */
export const deleteProjectMaterials = (
  projectItemId: string | number,
  materialIds: string | number | Array<string | number>
): AxiosPromise<void> => {
  const ids = Array.isArray(materialIds) ? materialIds.join(',') : materialIds;
  return request({
    url: `/erp/saltprocess/projectEquipmentSystem/item/${projectItemId}/materials/${ids}`,
    method: 'delete'
  });
};

/**
 * 批量保存项目物料（Upsert，POST）
 * - 路径参数携带 projectItemId
 * - 请求体数组元素仅包含需要保存的字段；如为更新，需包含 id
 */
export const batchSaveProjectMaterials = (
  projectItemId: string | number,
  data: ProjectMaterialForm[]
): AxiosPromise<BatchMaterialResult> => {
  const payload = Array.isArray(data) ? data.map((d) => buildMaterialUpsertPayload(d)) : [];
  return request({
    url: `/erp/saltprocess/projectEquipmentSystem/item/${projectItemId}/materials/batch`,
    method: 'post',
    data: payload
  });
};

