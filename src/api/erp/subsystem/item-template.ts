/**
 * 子项模板管理模块 - API接口
 *
 * 独立架构模式：
 * - 子项模板是公司级基础数据，完全独立于子系统模板
 * - 支持独立创建、管理和复用
 * - 可被多个子系统模板关联使用
 *
 * @author haitang
 * @version v2.0
 * @date 2025-11-05
 */
import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import {
  SubsystemItemTemplateQuery,
  SubsystemItemTemplateVO,
  SubsystemItemTemplateForm,
  PageResult
} from './types';

// ==================== 子项模板接口（独立管理） ====================

/**
 * 查询子项模板列表
 * 说明：查询公司级子项库中的所有子项模板
 * @param query 查询参数
 * @returns 分页结果
 */
export const listItemTemplate = (query?: SubsystemItemTemplateQuery): AxiosPromise<PageResult<SubsystemItemTemplateVO>> => {
  return request({
    url: '/erp/subsystem/item-template/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询子项模板详情
 * @param id 子项模板ID
 * @returns 子项详情
 */
export const getItemTemplate = (id: string | number): AxiosPromise<SubsystemItemTemplateVO> => {
  return request({
    url: `/erp/subsystem/item-template/${id}`,
    method: 'get'
  });
};

/**
 * 新增子项模板
 * 说明：
 * - 在公司级子项库中创建新的子项模板
 * - itemCode不传时后台会自动生成唯一编号（格式：ITEM-00001）
 * - **必须传入 materials 字段**，至少包含一个物料信息
 * - 如果传入 templateId，则同时将子项关联到该子系统模板
 * - 物料的 template_id 会根据是否提供 templateId 自动设置
 *
 * @param data 子项表单数据（必须包含 materials 字段）
 * @returns 返回创建的子项模板ID
 *
 * @example
 * // 在子系统中创建子项并绑定物料
 * addItemTemplate({
 *   templateId: 123,
 *   itemName: "输送带组件",
 *   materials: [
 *     { materialId: 100, defaultQuantity: 2, isRequired: true }
 *   ]
 * });
 *
 * @example
 * // 独立创建子项并绑定物料
 * addItemTemplate({
 *   itemName: "控制柜",
 *   materials: [
 *     { materialId: 101, defaultQuantity: 5, isRequired: true }
 *   ]
 * });
 */
export const addItemTemplate = (data: SubsystemItemTemplateForm): AxiosPromise<number> => {
  return request({
    url: '/erp/subsystem/item-template',
    method: 'post',
    data
  });
};

/**
 * 批量新增子项模板
 * @param data 子项表单数据数组
 */
export const addItemTemplateBatch = (data: SubsystemItemTemplateForm[]): AxiosPromise<void> => {
  return request({
    url: '/erp/subsystem/item-template/batch',
    method: 'post',
    data
  });
};

/**
 * 修改子项模板
 * @param data 子项表单数据（必须包含id）
 */
export const updateItemTemplate = (data: SubsystemItemTemplateForm): AxiosPromise<void> => {
  return request({
    url: '/erp/subsystem/item-template',
    method: 'put',
    data
  });
};

/**
 * 删除子项模板
 * @param ids 子项模板ID（单个）或ID数组（多个用逗号分隔）
 */
export const delItemTemplate = (ids: string | number | Array<string | number>): AxiosPromise<void> => {
  const idStr = Array.isArray(ids) ? ids.join(',') : String(ids);
  return request({
    url: `/erp/subsystem/item-template/${idStr}`,
    method: 'delete'
  });
};

/**
 * 导出子项模板列表
 * @param query 查询参数
 * @returns Excel文件流
 */
export const exportItemTemplate = (query?: SubsystemItemTemplateQuery): AxiosPromise<Blob> => {
  return request({
    url: '/erp/subsystem/item-template/export',
    method: 'post',
    data: query,
    responseType: 'blob'
  });
};

/**
 * 生成子项编号
 * 说明：生成下一个可用的子项编号（格式：ITEM-00001）
 * @returns 生成的子项编号
 */
export const generateItemCode = (): AxiosPromise<string> => {
  return request({
    url: '/erp/subsystem/item-template/generate-code',
    method: 'get'
  });
};

/**
 * 查询子项模板的默认物料列表（模板级别）
 *
 * 说明：该接口查询子项模板的默认物料配置，即 template_id = NULL 的模板物料
 * 用途：在"子项模板管理"页面中使用，不涉及具体子系统
 * 数据特征：返回的物料记录的 templateId 字段为 null
 *
 * @param itemTemplateId 子项模板ID
 * @returns 模板物料列表
 */
export const getItemTemplateMaterials = (itemTemplateId: string | number): AxiosPromise<any[]> => {
  return request({
    url: `/erp/subsystem/item-template/${itemTemplateId}/materials`,
    method: 'get'
  });
};

/**
 * @deprecated 请使用 getItemTemplateMaterials 代替，函数名更清晰
 */
export const getItemMaterials = getItemTemplateMaterials;

// ==================== 子项模板物料管理接口（RESTful风格） ====================

/**
 * 批量新增子项模板的物料
 *
 * 接口路径: POST /erp/subsystem/item-template/{itemTemplateId}/materials
 *
 * 说明：
 * - 为指定的子项模板批量添加物料配置
 * - itemTemplateId 通过路径参数传递，不需要在请求体中包含
 * - 支持一次添加多个物料
 *
 * @param itemTemplateId 子项模板ID
 * @param data 物料数据数组
 * @returns Promise
 *
 * @example
 * await addItemMaterials(10, [
 *   { materialId: 100, defaultQuantity: 500, isRequired: true, remarks: "主要材料" },
 *   { materialId: 101, defaultQuantity: 4, isRequired: false, remarks: "辅助材料" }
 * ]);
 */
export const addItemMaterials = (
  itemTemplateId: number,
  data: Omit<SubsystemMaterialTemplateForm, 'itemTemplateId'>[]
): AxiosPromise<void> => {
  return request({
    url: `/erp/subsystem/item-template/${itemTemplateId}/materials`,
    method: 'post',
    data: data
  });
};

/**
 * 批量修改子项模板的物料
 *
 * 接口路径: PUT /erp/subsystem/item-template/{itemTemplateId}/materials
 *
 * 说明：
 * - 批量更新子项模板的物料配置
 * - 每个物料必须包含 id 字段用于定位
 * - 只要有一个物料更新失败，整个接口就返回失败
 * - 支持事务回滚，确保数据一致性
 *
 * @param itemTemplateId 子项模板ID
 * @param data 物料数据数组（每个物料必须包含id）
 * @returns Promise
 *
 * @example
 * await updateItemMaterials(10, [
 *   { id: 1, materialId: 100, defaultQuantity: 600, isRequired: true, remarks: "更新后的备注" },
 *   { id: 2, materialId: 101, defaultQuantity: 8, isRequired: false, remarks: "调整数量" }
 * ]);
 */
export const updateItemMaterials = (
  itemTemplateId: number,
  data: SubsystemMaterialTemplateForm[]
): AxiosPromise<void> => {
  return request({
    url: `/erp/subsystem/item-template/${itemTemplateId}/materials`,
    method: 'put',
    data: data
  });
};

/**
 * 删除子项模板的物料
 *
 * 接口路径: DELETE /erp/subsystem/item-template/{itemTemplateId}/materials/{ids}
 *
 * 说明：
 * - 删除子项模板的一个或多个物料配置
 * - 支持批量删除，多个ID用逗号分隔
 *
 * @param itemTemplateId 子项模板ID
 * @param ids 物料ID数组
 * @returns Promise
 *
 * @example
 * // 删除单个物料
 * await deleteItemMaterials(10, [1]);
 *
 * // 删除多个物料
 * await deleteItemMaterials(10, [1, 2, 3]);
 */
export const deleteItemMaterials = (
  itemTemplateId: number,
  ids: number[]
): AxiosPromise<void> => {
  const idStr = ids.join(',');
  return request({
    url: `/erp/subsystem/item-template/${itemTemplateId}/materials/${idStr}`,
    method: 'delete'
  });
};

