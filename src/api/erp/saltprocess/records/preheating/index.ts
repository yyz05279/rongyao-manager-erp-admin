/**
 * 预热记录管理模块 - API接口
 */
import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import {
  PreheatingRecordQuery,
  PreheatingRecordVO,
  PreheatingRecordForm
} from './types';
import { PageResult } from '../../types';

/**
 * 查询预热记录列表
 */
export const listPreheatingRecord = (query?: PreheatingRecordQuery): AxiosPromise<PageResult<PreheatingRecordVO>> => {
  return request({
    url: '/erp/saltprocess/preheating-record/list',
    method: 'get',
    params: query
  });
};

/**
 * 获取预热记录详情
 */
export const getPreheatingRecord = (id: string | number): AxiosPromise<PreheatingRecordVO> => {
  return request({
    url: '/erp/saltprocess/preheating-record/' + id,
    method: 'get'
  });
};

/**
 * 新增预热记录
 */
export const addPreheatingRecord = (data: PreheatingRecordForm): AxiosPromise<PreheatingRecordVO> => {
  return request({
    url: '/erp/saltprocess/preheating-record',
    method: 'post',
    data
  });
};

/**
 * 修改预热记录
 */
export const updatePreheatingRecord = (data: PreheatingRecordForm): AxiosPromise<void> => {
  return request({
    url: '/erp/saltprocess/preheating-record',
    method: 'put',
    data
  });
};

/**
 * 删除预热记录
 */
export const delPreheatingRecord = (ids: string | number | Array<string | number>): AxiosPromise<void> => {
  return request({
    url: '/erp/saltprocess/preheating-record/' + ids,
    method: 'delete'
  });
};

/**
 * 根据任务ID查询预热记录
 */
export const getPreheatingRecordByTaskId = (taskId: string | number): AxiosPromise<PreheatingRecordVO[]> => {
  return request({
    url: '/erp/saltprocess/preheating-record/task/' + taskId,
    method: 'get'
  });
};

/**
 * 根据项目ID查询预热记录
 */
export const getPreheatingRecordByProjectId = (projectId: string | number): AxiosPromise<PreheatingRecordVO[]> => {
  return request({
    url: '/erp/saltprocess/preheating-record/project/' + projectId,
    method: 'get'
  });
};

/**
 * 根据日期范围查询预热记录
 */
export const getPreheatingRecordByDateRange = (startDate: string, endDate: string): AxiosPromise<PreheatingRecordVO[]> => {
  return request({
    url: '/erp/saltprocess/preheating-record/date-range',
    method: 'get',
    params: { startDate, endDate }
  });
};

/**
 * 根据熔盐罐编号查询预热记录
 */
export const getPreheatingRecordByTankNumber = (tankNumber: string): AxiosPromise<PreheatingRecordVO[]> => {
  return request({
    url: '/erp/saltprocess/preheating-record/tank/' + tankNumber,
    method: 'get'
  });
};

/**
 * 查询最新预热记录
 */
export const getLatestPreheatingRecord = (taskId: string | number): AxiosPromise<PreheatingRecordVO> => {
  return request({
    url: '/erp/saltprocess/preheating-record/latest/' + taskId,
    method: 'get'
  });
};

/**
 * 统计总能耗
 */
export const getTotalEnergyConsumption = (startDate: string, endDate: string): AxiosPromise<{ totalEnergyConsumption: number }> => {
  return request({
    url: '/erp/saltprocess/preheating-record/total-energy-consumption',
    method: 'get',
    params: { startDate, endDate }
  });
};

/**
 * 统计平均加热效率
 */
export const getAvgHeatingEfficiency = (startDate: string, endDate: string): AxiosPromise<{ avgHeatingEfficiency: number }> => {
  return request({
    url: '/erp/saltprocess/preheating-record/avg-heating-efficiency',
    method: 'get',
    params: { startDate, endDate }
  });
};

/**
 * 导出预热记录
 */
export const exportPreheatingRecord = (query?: PreheatingRecordQuery): AxiosPromise<void> => {
  return request({
    url: '/erp/saltprocess/preheating-record/export',
    method: 'post',
    data: query,
    responseType: 'blob'
  });
};

/**
 * 导入预热记录
 */
export const importPreheatingRecord = (file: File): AxiosPromise<void> => {
  const formData = new FormData();
  formData.append('file', file);
  return request({
    url: '/erp/saltprocess/preheating-record/import',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

/**
 * 获取导入模板
 */
export const getPreheatingRecordImportTemplate = (): AxiosPromise<void> => {
  return request({
    url: '/erp/saltprocess/preheating-record/importTemplate',
    method: 'post',
    responseType: 'blob'
  });
};

/**
 * 批量更新预热记录状态
 */
export const batchUpdatePreheatingRecordStatus = (ids: Array<string | number>, status: number): AxiosPromise<void> => {
  return request({
    url: '/erp/saltprocess/preheating-record/batch-status',
    method: 'put',
    data: { ids, status }
  });
};

/**
 * 获取预热记录统计信息
 */
export const getPreheatingRecordStatistics = (startDate?: string, endDate?: string): AxiosPromise<any> => {
  return request({
    url: '/erp/saltprocess/preheating-record/statistics',
    method: 'get',
    params: { startDate, endDate }
  });
};

/**
 * 获取预热记录温度趋势数据
 */
export const getPreheatingTemperatureTrend = (recordId: string | number): AxiosPromise<any[]> => {
  return request({
    url: '/erp/saltprocess/preheating-record/temperature-trend/' + recordId,
    method: 'get'
  });
};

/**
 * 获取预热记录压力趋势数据
 */
export const getPreheatingPressureTrend = (recordId: string | number): AxiosPromise<any[]> => {
  return request({
    url: '/erp/saltprocess/preheating-record/pressure-trend/' + recordId,
    method: 'get'
  });
};

/**
 * 验证预热记录数据
 */
export const validatePreheatingRecord = (data: PreheatingRecordForm): AxiosPromise<any> => {
  return request({
    url: '/erp/saltprocess/preheating-record/validate',
    method: 'post',
    data
  });
};

/**
 * 复制预热记录
 */
export const copyPreheatingRecord = (id: string | number): AxiosPromise<PreheatingRecordVO> => {
  return request({
    url: '/erp/saltprocess/preheating-record/copy/' + id,
    method: 'post'
  });
};

/**
 * 获取预热记录审核历史
 */
export const getPreheatingRecordAuditHistory = (id: string | number): AxiosPromise<any[]> => {
  return request({
    url: '/erp/saltprocess/preheating-record/audit-history/' + id,
    method: 'get'
  });
};

/**
 * 审核预热记录
 */
export const auditPreheatingRecord = (id: string | number, auditData: any): AxiosPromise<void> => {
  return request({
    url: '/erp/saltprocess/preheating-record/audit/' + id,
    method: 'post',
    data: auditData
  });
};
