/**
 * 设备系统模板管理 - API接口
 * 基于后端 API v1.0 文档
 */
import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import {
  EquipmentSystemTemplateQuery,
  EquipmentSystemTemplateVO,
  EquipmentSystemTemplateForm,
  EquipmentSystemTemplateDetailVO,
  SubsystemTemplateUpdateForm,
  PageResult
} from './types';

/**
 * 查询设备系统模板列表（分页）
 * @param query 查询参数
 */
export const listEquipmentSystemTemplate = (query?: EquipmentSystemTemplateQuery): AxiosPromise<PageResult<EquipmentSystemTemplateVO>> => {
  return request({
    url: '/erp/saltprocess/equipmentSystemTemplate/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询设备系统模板详情
 * @param id 模板ID
 */
export const getEquipmentSystemTemplate = (id: string | number): AxiosPromise<EquipmentSystemTemplateDetailVO> => {
  return request({
    url: `/erp/saltprocess/equipmentSystemTemplate/${id}`,
    method: 'get'
  });
};

/**
 * 根据模板编码查询
 * @param templateCode 模板编码
 */
export const getEquipmentSystemTemplateByCode = (templateCode: string): AxiosPromise<EquipmentSystemTemplateVO> => {
  return request({
    url: `/erp/saltprocess/equipmentSystemTemplate/code/${templateCode}`,
    method: 'get'
  });
};

/**
 * 查询标准模板列表
 */
export const listStandardTemplates = (): AxiosPromise<EquipmentSystemTemplateVO[]> => {
  return request({
    url: '/erp/saltprocess/equipmentSystemTemplate/standard',
    method: 'get'
  });
};

/**
 * 查询启用状态的模板列表
 */
export const listActiveTemplates = (): AxiosPromise<EquipmentSystemTemplateVO[]> => {
  return request({
    url: '/erp/saltprocess/equipmentSystemTemplate/active',
    method: 'get'
  });
};

/**
 * 根据系统类型查询模板列表
 * @param systemType 系统类型
 */
export const listTemplatesByType = (systemType: string): AxiosPromise<EquipmentSystemTemplateVO[]> => {
  return request({
    url: `/erp/saltprocess/equipmentSystemTemplate/systemType/${systemType}`,
    method: 'get'
  });
};

/**
 * 新增设备系统模板
 * @param data 模板表单数据
 */
export const addEquipmentSystemTemplate = (data: EquipmentSystemTemplateForm): AxiosPromise<void> => {
  return request({
    url: '/erp/saltprocess/equipmentSystemTemplate',
    method: 'post',
    data
  });
};

/**
 * 修改设备系统模板
 * @param data 模板表单数据
 */
export const updateEquipmentSystemTemplate = (data: EquipmentSystemTemplateForm): AxiosPromise<void> => {
  return request({
    url: '/erp/saltprocess/equipmentSystemTemplate',
    method: 'put',
    data
  });
};

/**
 * 删除设备系统模板
 * @param ids 模板ID数组（逗号分隔）
 */
export const delEquipmentSystemTemplate = (ids: string | number | Array<string | number>): AxiosPromise<void> => {
  return request({
    url: `/erp/saltprocess/equipmentSystemTemplate/${ids}`,
    method: 'delete'
  });
};

/**
 * 导出设备系统模板列表
 * @param query 查询参数
 */
export const exportEquipmentSystemTemplate = (query?: EquipmentSystemTemplateQuery): AxiosPromise<Blob> => {
  return request({
    url: '/erp/saltprocess/equipmentSystemTemplate/export',
    method: 'post',
    params: query,
    responseType: 'blob'
  });
};

/**
 * 复制模板
 * @param id 源模板ID
 */
export const copyEquipmentSystemTemplate = (id: string | number): AxiosPromise<number> => {
  return request({
    url: `/erp/saltprocess/equipmentSystemTemplate/${id}/copy`,
    method: 'post'
  });
};

/**
 * 发布模板（将草稿状态改为启用）
 * @param id 模板ID
 */
export const publishEquipmentSystemTemplate = (id: string | number): AxiosPromise<void> => {
  return request({
    url: `/erp/saltprocess/equipmentSystemTemplate/${id}/publish`,
    method: 'put'
  });
};

/**
 * 归档模板
 * @param id 模板ID
 */
export const archiveEquipmentSystemTemplate = (id: string | number): AxiosPromise<void> => {
  return request({
    url: `/erp/saltprocess/equipmentSystemTemplate/${id}/archive`,
    method: 'put'
  });
};

/**
 * 获取子系统模版详情（用于设备系统模版详情页面）
 * @param id 子系统模版ID
 * @returns 子系统模版详情数据（包含子项列表）
 */
export const getSubsystemTemplateDetail = (id: string | number): AxiosPromise<any> => {
  return request({
    url: `/erp/saltprocess/equipmentSystemTemplate/subsystemTemplate/${id}`,
    method: 'get'
  });
};

/**
 * 修改子系统模版基本信息
 * @param data 子系统模版修改表单数据
 */
export const updateSubsystemTemplate = (data: SubsystemTemplateUpdateForm): AxiosPromise<void> => {
  return request({
    url: '/erp/saltprocess/equipmentSystemTemplate/subsystem',
    method: 'put',
    data
  });
};

/**
 * 获取指定子系统模版下的所有子项列表
 * @param subsystemTemplateId 设备系统模版与子系统的关联ID
 */
export const getEquipmentSystemSubsystemItems = (subsystemTemplateId: string | number): AxiosPromise<any[]> => {
  return request({
    url: `/erp/saltprocess/equipmentSystemTemplate/subsystem/${subsystemTemplateId}/items`,
    method: 'get'
  });
};

/**
 * 获取指定子项模版下的所有物料列表
 * @param itemTemplateId 设备系统模版与子项的关联ID
 */
export const getEquipmentSystemItemMaterials = (itemTemplateId: string | number): AxiosPromise<any[]> => {
  return request({
    url: `/erp/saltprocess/equipmentSystemTemplate/item/${itemTemplateId}/materials`,
    method: 'get'
  });
};

/**
 * 编辑设备系统模版关联的物料数据
 * @param itemTemplateId 子项模版ID
 * @param materialId 物料模板ID
 * @param data 物料模板数据
 */
export const updateEquipmentSystemItemMaterial = (
  itemTemplateId: string | number,
  materialId: string | number,
  data: any
): AxiosPromise<void> => {
  return request({
    url: `/erp/saltprocess/equipmentSystemTemplate/item/${itemTemplateId}/materials/${materialId}`,
    method: 'put',
    data
  });
};

/**
 * 删除设备系统模版关联的物料数据（支持批量删除）
 * @param itemTemplateId 子项模版ID
 * @param materialIds 物料模板ID数组（逗号分隔）
 */
export const deleteEquipmentSystemItemMaterials = (
  itemTemplateId: string | number,
  materialIds: string | number | Array<string | number>
): AxiosPromise<void> => {
  // 处理数组格式，转换为逗号分隔的字符串
  const ids = Array.isArray(materialIds) ? materialIds.join(',') : materialIds;
  return request({
    url: `/erp/saltprocess/equipmentSystemTemplate/item/${itemTemplateId}/materials/${ids}`,
    method: 'delete'
  });
};

/**
 * 从基础物料库复制新增物料模板
 * @param itemTemplateId 子项模版ID
 * @param materialId 基础物料ID
 */
export const addEquipmentSystemItemMaterialFromBase = (
  itemTemplateId: string | number,
  materialId: string | number
): AxiosPromise<void> => {
  return request({
    url: `/erp/saltprocess/equipmentSystemTemplate/item/${itemTemplateId}/materials/from-base/${materialId}`,
    method: 'post'
  });
};

