/**
 * 物料模板管理模块 - API接口
 *
 * @author haitang
 * @version v1.0
 * @date 2025-11-05
 */
import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import {
  SubsystemMaterialTemplateQuery,
  SubsystemMaterialTemplateVO,
  SubsystemMaterialTemplateForm,
  PageResult
} from './types';

// ==================== 物料模板接口 ====================

/**
 * 查询物料模板列表
 * @param query 查询参数
 * @returns 分页结果
 */
export const listMaterialTemplate = (query?: SubsystemMaterialTemplateQuery): AxiosPromise<PageResult<SubsystemMaterialTemplateVO>> => {
  return request({
    url: '/erp/subsystem/material-template/list',
    method: 'get',
    params: query
  });
};

/**
 * 根据子项ID查询物料列表
 * @param itemTemplateId 子项模板ID
 * @returns 物料列表
 */
export const listMaterialTemplateByItemId = (itemTemplateId: number): AxiosPromise<SubsystemMaterialTemplateVO[]> => {
  return request({
    url: `/erp/subsystem/material-template/list-by-item/${itemTemplateId}`,
    method: 'get'
  });
};

/**
 * 根据模板ID查询所有物料
 * @param templateId 子系统模板ID
 * @returns 物料列表
 */
export const listMaterialTemplateByTemplateId = (templateId: number): AxiosPromise<SubsystemMaterialTemplateVO[]> => {
  return request({
    url: `/erp/subsystem/material-template/list-by-template/${templateId}`,
    method: 'get'
  });
};

/**
 * 查询物料模板详情
 * @param id 物料模板ID
 * @returns 物料详情
 */
export const getMaterialTemplate = (id: number): AxiosPromise<SubsystemMaterialTemplateVO> => {
  return request({
    url: `/erp/subsystem/material-template/${id}`,
    method: 'get'
  });
};

/**
 * 新增物料模板
 * 说明：物料信息会自动从基础物料库获取
 * @param data 物料表单数据
 */
export const addMaterialTemplate = (data: SubsystemMaterialTemplateForm): AxiosPromise<void> => {
  return request({
    url: '/erp/subsystem/material-template',
    method: 'post',
    data
  });
};

/**
 * 批量新增物料模板
 * @param data 物料表单数据数组
 */
export const addMaterialTemplateBatch = (data: SubsystemMaterialTemplateForm[]): AxiosPromise<void> => {
  return request({
    url: '/erp/subsystem/material-template/batch',
    method: 'post',
    data
  });
};

/**
 * 修改物料模板
 * @param data 物料表单数据（必须包含id）
 */
export const updateMaterialTemplate = (data: SubsystemMaterialTemplateForm): AxiosPromise<void> => {
  return request({
    url: '/erp/subsystem/material-template',
    method: 'put',
    data
  });
};

/**
 * 删除物料模板
 * @param ids 物料模板ID（单个）或ID数组（多个用逗号分隔）
 */
export const delMaterialTemplate = (ids: number | number[]): AxiosPromise<void> => {
  const idStr = Array.isArray(ids) ? ids.join(',') : String(ids);
  return request({
    url: `/erp/subsystem/material-template/${idStr}`,
    method: 'delete'
  });
};

/**
 * 导出物料模板列表
 * @param query 查询参数
 * @returns Excel文件流
 */
export const exportMaterialTemplate = (query?: SubsystemMaterialTemplateQuery): AxiosPromise<Blob> => {
  return request({
    url: '/erp/subsystem/material-template/export',
    method: 'post',
    data: query,
    responseType: 'blob'
  });
};

