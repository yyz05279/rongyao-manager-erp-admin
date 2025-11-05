/**
 * 子项模板管理模块 - API接口
 *
 * @author haitang
 * @version v1.0
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

// ==================== 子项模板接口 ====================

/**
 * 查询子项模板列表
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
 * 根据模板ID查询子项列表
 * @param templateId 子系统模板ID
 * @returns 子项列表
 */
export const listItemTemplateByTemplateId = (templateId: number): AxiosPromise<SubsystemItemTemplateVO[]> => {
  return request({
    url: `/erp/subsystem/item-template/list-by-template/${templateId}`,
    method: 'get'
  });
};

/**
 * 查询子项模板详情
 * @param id 子项模板ID
 * @returns 子项详情
 */
export const getItemTemplate = (id: number): AxiosPromise<SubsystemItemTemplateVO> => {
  return request({
    url: `/erp/subsystem/item-template/${id}`,
    method: 'get'
  });
};

/**
 * 新增子项模板
 * 说明：itemCode不传时，后台会自动生成唯一编号
 * @param data 子项表单数据
 */
export const addItemTemplate = (data: SubsystemItemTemplateForm): AxiosPromise<void> => {
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
export const delItemTemplate = (ids: number | number[]): AxiosPromise<void> => {
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
 * @param templateId 子系统模板ID
 * @returns 生成的子项编号
 */
export const generateItemCode = (templateId: number): AxiosPromise<string> => {
  return request({
    url: `/erp/subsystem/item-template/generate-code/${templateId}`,
    method: 'get'
  });
};

/**
 * 获取子项的物料列表
 * @param itemTemplateId 子项模板ID
 * @returns 物料列表
 */
export const getItemMaterials = (itemTemplateId: number): AxiosPromise<any[]> => {
  return request({
    url: `/erp/subsystem/item-template/${itemTemplateId}/materials`,
    method: 'get'
  });
};

