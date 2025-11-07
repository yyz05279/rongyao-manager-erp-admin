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
 * 说明：在公司级子项库中创建新的子项模板，itemCode不传时后台会自动生成唯一编号（格式：ITEM-00001）
 * @param data 子项表单数据
 * @returns 返回创建的子项模板ID
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

