/**
 * 子系统模板管理模块 - API接口
 * 模板与项目子系统的区别：不包含项目信息和负责人信息
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
 */
export const getSubsystemTemplate = (id: string | number): AxiosPromise<SubsystemTemplateDetailVO> => {
  return request({
    url: `/erp/subsystem/template/${id}`,
    method: 'get'
  });
};

/**
 * 新增子系统模板
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
 * @param data 模板表单数据
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
 * @param ids 模板ID数组（逗号分隔）
 */
export const delSubsystemTemplate = (ids: string | number | Array<string | number>): AxiosPromise<void> => {
  return request({
    url: `/erp/subsystem/template/${ids}`,
    method: 'delete'
  });
};

/**
 * 导出子系统模板列表
 * @param query 查询参数
 */
export const exportSubsystemTemplate = (query?: SubsystemTemplateQuery): AxiosPromise<Blob> => {
  return request({
    url: '/erp/subsystem/template/export',
    method: 'post',
    params: query,
    responseType: 'blob'
  });
};

/**
 * 生成子系统模板编号
 */
export const generateSubsystemTemplateCode = (): AxiosPromise<string> => {
  return request({
    url: '/erp/subsystem/template/generate-code',
    method: 'get'
  });
};

/**
 * 更新子系统模板状态
 * @param id 模板ID
 * @param status 状态值
 */
export const updateSubsystemTemplateStatus = (id: string | number, status: string): AxiosPromise<void> => {
  return request({
    url: `/erp/subsystem/template/${id}/status`,
    method: 'put',
    params: { status }
  });
};

/**
 * 复制子系统模板
 * @param id 源模板ID
 */
export const copySubsystemTemplate = (id: string | number): AxiosPromise<number> => {
  return request({
    url: `/erp/subsystem/template/${id}/copy`,
    method: 'post'
  });
};

/**
 * 校验子系统模板编号唯一性
 * @param subsystemCode 模板编号
 * @param excludeId 排除的ID（编辑时使用）
 */
export const checkSubsystemTemplateCodeUnique = (
  subsystemCode: string,
  excludeId?: string | number
): AxiosPromise<boolean> => {
  return request({
    url: '/erp/subsystem/template/check-code-unique',
    method: 'get',
    params: { subsystemCode, excludeId }
  });
};

