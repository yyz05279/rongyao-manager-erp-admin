/**
 * 子系统模板管理模块 - API接口
 * 模板与项目子系统的区别：不包含项目信息和负责人信息
 *
 * @author haitang
 * @version v1.0
 * @date 2025-11-05
 */
import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import {
  SubsystemTemplateQuery,
  SubsystemTemplateVO,
  SubsystemTemplateForm,
  SubsystemTemplateDetailVO,
  PageResult
} from './types';

// ==================== 子系统模板接口 ====================

/**
 * 查询子系统模板列表
 * @param query 查询参数
 * @returns 分页结果
 */
export const listSubsystemTemplate = (query?: SubsystemTemplateQuery): AxiosPromise<PageResult<SubsystemTemplateVO>> => {
  return request({
    url: '/erp/subsystem/template/list',
    method: 'get',
    params: query
  });
};

/**
 * 获取子系统模板详细信息
 * @param id 模板ID
 * @returns 模板详情
 */
export const getSubsystemTemplate = (id: string | number): AxiosPromise<SubsystemTemplateDetailVO> => {
  return request({
    url: `/erp/subsystem/template/${id}`,
    method: 'get'
  });
};

/**
 * 新增子系统模板
 * 说明：templateCode不传时，后台会自动生成唯一编号
 * @param data 模板表单数据
 */
export const addSubsystemTemplate = (data: SubsystemTemplateForm): AxiosPromise<void> => {
  return request({
    url: '/erp/subsystem/template',
    method: 'post',
    data
  });
};

/**
 * 修改子系统模板
 * 说明：后台会自动校验编号唯一性
 * @param data 模板表单数据（必须包含id）
 */
export const updateSubsystemTemplate = (data: SubsystemTemplateForm): AxiosPromise<void> => {
  return request({
    url: '/erp/subsystem/template',
    method: 'put',
    data
  });
};

/**
 * 删除子系统模板
 * @param ids 模板ID（单个）或ID数组（多个用逗号分隔）
 */
export const delSubsystemTemplate = (ids: string | number | Array<string | number>): AxiosPromise<void> => {
  const idStr = Array.isArray(ids) ? ids.join(',') : String(ids);
  return request({
    url: `/erp/subsystem/template/${idStr}`,
    method: 'delete'
  });
};

/**
 * 复制子系统模板
 * 说明：复制后自动生成新编号，模板名称添加"-副本"后缀，状态设为DRAFT
 * @param id 源模板ID
 * @returns 新创建的模板ID
 */
export const copySubsystemTemplate = (id: string | number): AxiosPromise<number> => {
  return request({
    url: `/erp/subsystem/template/copy/${id}`,
    method: 'post'
  });
};

/**
 * 发布子系统模板
 * 说明：将模板状态从DRAFT改为ACTIVE，发布后可用于创建项目子系统
 * @param id 模板ID
 */
export const publishSubsystemTemplate = (id: string | number): AxiosPromise<void> => {
  return request({
    url: `/erp/subsystem/template/publish/${id}`,
    method: 'put'
  });
};

/**
 * 导出子系统模板列表
 * @param query 查询参数
 * @returns Excel文件流
 */
export const exportSubsystemTemplate = (query?: SubsystemTemplateQuery): AxiosPromise<Blob> => {
  return request({
    url: '/erp/subsystem/template/export',
    method: 'post',
    data: query,
    responseType: 'blob'
  });
};

/**
 * 生成子系统模板编号
 * 说明：格式为 TPL-SS-yyyyMMdd-序号，仅用于预览，新增时不传templateCode即可自动生成
 * @returns 生成的模板编号
 */
export const generateSubsystemTemplateCode = (): AxiosPromise<string> => {
  return request({
    url: '/erp/subsystem/template/generate-code',
    method: 'get'
  });
};

