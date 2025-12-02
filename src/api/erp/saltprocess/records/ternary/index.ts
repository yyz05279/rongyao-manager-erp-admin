/**
 * 三元化盐记录管理模块 - API接口
 */
import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import {
  TernaryRecordQuery,
  TernaryRecordVO,
  TernaryRecordForm
} from './types';
import { PageResult } from '../../types';

/**
 * 查询三元化盐记录列表
 */
export const listTernaryRecord = (query?: TernaryRecordQuery): AxiosPromise<PageResult<TernaryRecordVO>> => {
  return request({
    url: '/erp/saltprocess/ternary-record/list',
    method: 'get',
    params: query
  });
};

/**
 * 获取三元化盐记录详情
 */
export const getTernaryRecord = (id: string | number): AxiosPromise<TernaryRecordVO> => {
  return request({
    url: '/erp/saltprocess/ternary-record/' + id,
    method: 'get'
  });
};

/**
 * 新增三元化盐记录
 */
export const addTernaryRecord = (data: Partial<TernaryRecordForm>): AxiosPromise<TernaryRecordVO> => {
  return request({
    url: '/erp/saltprocess/ternary-record',
    method: 'post',
    data
  });
};

/**
 * 修改三元化盐记录
 */
export const updateTernaryRecord = (data: Partial<TernaryRecordForm>): AxiosPromise<void> => {
  return request({
    url: '/erp/saltprocess/ternary-record',
    method: 'put',
    data
  });
};

/**
 * 删除三元化盐记录
 */
export const delTernaryRecord = (ids: string | number | Array<string | number>): AxiosPromise<void> => {
  return request({
    url: '/erp/saltprocess/ternary-record/' + ids,
    method: 'delete'
  });
};

/**
 * 根据批次号查询三元化盐记录
 */
export const getTernaryRecordByBatchNumber = (batchNumber: string): AxiosPromise<TernaryRecordVO[]> => {
  return request({
    url: '/erp/saltprocess/ternary-record/batch/' + batchNumber,
    method: 'get'
  });
};

/**
 * 根据项目ID查询三元化盐记录
 */
export const getTernaryRecordByProjectId = (projectId: string | number): AxiosPromise<TernaryRecordVO[]> => {
  return request({
    url: '/erp/saltprocess/ternary-record/project/' + projectId,
    method: 'get'
  });
};

/**
 * 根据稳定性指数范围查询三元化盐记录
 */
export const getTernaryRecordByStabilityRange = (minIndex: number, maxIndex: number): AxiosPromise<TernaryRecordVO[]> => {
  return request({
    url: '/erp/saltprocess/ternary-record/stability-range',
    method: 'get',
    params: { minIndex, maxIndex }
  });
};

/**
 * 查询最新三元化盐记录
 */
export const getLatestTernaryRecord = (projectId: string | number): AxiosPromise<TernaryRecordVO> => {
  return request({
    url: '/erp/saltprocess/ternary-record/latest/' + projectId,
    method: 'get'
  });
};

/**
 * 统计三元化盐记录数量
 */
export const countTernaryRecord = (startDate: string, endDate: string): AxiosPromise<number> => {
  return request({
    url: '/erp/saltprocess/ternary-record/count',
    method: 'get',
    params: { startDate, endDate }
  });
};

/**
 * 导出三元化盐记录
 */
export const exportTernaryRecord = (query?: TernaryRecordQuery): AxiosPromise<void> => {
  return request({
    url: '/erp/saltprocess/ternary-record/export',
    method: 'post',
    data: query,
    responseType: 'blob'
  });
};

/**
 * 导入三元化盐记录
 */
export const importTernaryRecord = (file: File): AxiosPromise<void> => {
  const formData = new FormData();
  formData.append('file', file);
  return request({
    url: '/erp/saltprocess/ternary-record/import',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

// 兼容新的命名方式
export const importTernaryRecords = importTernaryRecord;

/**
 * 获取导入模板
 */
export const getTernaryRecordImportTemplate = (): AxiosPromise<void> => {
  return request({
    url: '/erp/saltprocess/ternary-record/importTemplate',
    method: 'post',
    responseType: 'blob'
  });
};

/**
 * 获取三元化盐记录统计信息
 */
export const getTernaryRecordStatistics = (startDate?: string, endDate?: string): AxiosPromise<any> => {
  return request({
    url: '/erp/saltprocess/ternary-record/statistics',
    method: 'get',
    params: { startDate, endDate }
  });
};

/**
 * 获取三元配比分析数据
 */
export const getTernaryRatioAnalysis = (recordId: string | number): AxiosPromise<any> => {
  return request({
    url: '/erp/saltprocess/ternary-record/ratio-analysis/' + recordId,
    method: 'get'
  });
};

/**
 * 获取稳定性分析数据
 */
export const getTernaryStabilityAnalysis = (startDate: string, endDate: string): AxiosPromise<any> => {
  return request({
    url: '/erp/saltprocess/ternary-record/stability-analysis',
    method: 'get',
    params: { startDate, endDate }
  });
};

/**
 * 获取稳定性趋势数据
 */
export const getTernaryStabilityTrend = (recordId: string | number): AxiosPromise<any[]> => {
  return request({
    url: '/erp/saltprocess/ternary-record/stability-trend/' + recordId,
    method: 'get'
  });
};

/**
 * 获取三元化盐质量分析数据
 */
export const getTernaryQualityAnalysis = (startDate: string, endDate: string): AxiosPromise<any> => {
  return request({
    url: '/erp/saltprocess/ternary-record/quality-analysis',
    method: 'get',
    params: { startDate, endDate }
  });
};

/**
 * 验证三元化盐记录数据
 */
export const validateTernaryRecord = (data: TernaryRecordForm): AxiosPromise<any> => {
  return request({
    url: '/erp/saltprocess/ternary-record/validate',
    method: 'post',
    data
  });
};

/**
 * 复制三元化盐记录
 */
export const copyTernaryRecord = (id: string | number): AxiosPromise<TernaryRecordVO> => {
  return request({
    url: '/erp/saltprocess/ternary-record/copy/' + id,
    method: 'post'
  });
};

/**
 * 获取三元化盐记录审核历史
 */
export const getTernaryRecordAuditHistory = (id: string | number): AxiosPromise<any[]> => {
  return request({
    url: '/erp/saltprocess/ternary-record/audit-history/' + id,
    method: 'get'
  });
};

/**
 * 审核三元化盐记录
 */
export const auditTernaryRecord = (id: string | number, auditData: any): AxiosPromise<void> => {
  return request({
    url: '/erp/saltprocess/ternary-record/audit/' + id,
    method: 'post',
    data: auditData
  });
};

/**
 * 获取三元配比优化建议
 */
export const getTernaryRatioOptimization = (recordId: string | number): AxiosPromise<any> => {
  return request({
    url: '/erp/saltprocess/ternary-record/ratio-optimization/' + recordId,
    method: 'get'
  });
};

/**
 * 获取稳定性预测数据
 */
export const getTernaryStabilityPrediction = (recordId: string | number): AxiosPromise<any> => {
  return request({
    url: '/erp/saltprocess/ternary-record/stability-prediction/' + recordId,
    method: 'get'
  });
};

/**
 * 获取三元化盐成本效益分析
 */
export const getTernaryCostBenefitAnalysis = (startDate: string, endDate: string): AxiosPromise<any> => {
  return request({
    url: '/erp/saltprocess/ternary-record/cost-benefit-analysis',
    method: 'get',
    params: { startDate, endDate }
  });
};

/**
 * 获取三元化盐工艺优化建议
 */
export const getTernaryProcessOptimization = (recordId: string | number): AxiosPromise<any> => {
  return request({
    url: '/erp/saltprocess/ternary-record/process-optimization/' + recordId,
    method: 'get'
  });
};

/**
 * 批量更新三元化盐记录稳定性评级
 */
export const batchUpdateTernaryStabilityRating = (ids: Array<string | number>): AxiosPromise<void> => {
  return request({
    url: '/erp/saltprocess/ternary-record/batch-stability-rating',
    method: 'put',
    data: { ids }
  });
};
