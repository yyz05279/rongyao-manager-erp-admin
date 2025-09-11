/**
 * 质量管理模块 - API接口
 */
import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import {
  QualityInspectionQuery,
  QualityInspectionVO,
  QualityInspectionForm,
  QualityTestItemForm,
  BatchQuery,
  BatchVO,
  BatchForm,
  NonconformityQuery,
  NonconformityVO,
  NonconformityForm,
  QualityStandardQuery,
  QualityStandardVO,
  QualityStatistics,
  QualityTrendAnalysis,
  TestItemStatistics,
  QualityReport
} from './types';
import { ApiResponse, PageResult } from '../types';

// 质量检验管理接口

/**
 * 查询质量检验列表
 */
export const listQualityInspection = (query?: QualityInspectionQuery): AxiosPromise<PageResult<QualityInspectionVO>> => {
  return request({
    url: '/erp/saltprocess/quality/inspection/list',
    method: 'get',
    params: query
  });
};

/**
 * 获取质量检验详情
 */
export const getQualityInspection = (id: string): AxiosPromise<QualityInspectionVO> => {
  return request({
    url: `/erp/saltprocess/quality/inspection/${id}`,
    method: 'get'
  });
};

/**
 * 创建质量检验
 */
export const createQualityInspection = (data: QualityInspectionForm): AxiosPromise<QualityInspectionVO> => {
  return request({
    url: '/erp/saltprocess/quality/inspection',
    method: 'post',
    data
  });
};

/**
 * 更新质量检验
 */
export const updateQualityInspection = (data: QualityInspectionForm): AxiosPromise<QualityInspectionVO> => {
  return request({
    url: '/erp/saltprocess/quality/inspection',
    method: 'put',
    data
  });
};

/**
 * 删除质量检验
 */
export const deleteQualityInspection = (ids: string[]): AxiosPromise<void> => {
  return request({
    url: `/erp/saltprocess/quality/inspection/${ids.join(',')}`,
    method: 'delete'
  });
};

/**
 * 开始检验
 */
export const startInspection = (id: string): AxiosPromise<void> => {
  return request({
    url: `/erp/saltprocess/quality/inspection/${id}/start`,
    method: 'post'
  });
};

/**
 * 完成检验
 */
export const completeInspection = (id: string): AxiosPromise<void> => {
  return request({
    url: `/erp/saltprocess/quality/inspection/${id}/complete`,
    method: 'post'
  });
};

/**
 * 提交检验项目结果
 */
export const submitTestItemResults = (inspectionId: string, testItems: QualityTestItemForm[]): AxiosPromise<void> => {
  return request({
    url: `/erp/saltprocess/quality/inspection/${inspectionId}/test-items`,
    method: 'post',
    data: testItems
  });
};

/**
 * 生成检验证书
 */
export const generateInspectionCertificate = (id: string): AxiosPromise<string> => {
  return request({
    url: `/erp/saltprocess/quality/inspection/${id}/certificate`,
    method: 'post'
  });
};

// 批次管理接口

/**
 * 查询批次列表
 */
export const listBatch = (query?: BatchQuery): AxiosPromise<PageResult<BatchVO>> => {
  return request({
    url: '/erp/saltprocess/quality/batch/list',
    method: 'get',
    params: query
  });
};

/**
 * 获取批次详情
 */
export const getBatch = (id: string): AxiosPromise<BatchVO> => {
  return request({
    url: `/erp/saltprocess/quality/batch/${id}`,
    method: 'get'
  });
};

/**
 * 创建批次
 */
export const createBatch = (data: BatchForm): AxiosPromise<BatchVO> => {
  return request({
    url: '/erp/saltprocess/quality/batch',
    method: 'post',
    data
  });
};

/**
 * 更新批次
 */
export const updateBatch = (data: BatchForm): AxiosPromise<BatchVO> => {
  return request({
    url: '/erp/saltprocess/quality/batch',
    method: 'put',
    data
  });
};

/**
 * 删除批次
 */
export const deleteBatch = (ids: string[]): AxiosPromise<void> => {
  return request({
    url: `/erp/saltprocess/quality/batch/${ids.join(',')}`,
    method: 'delete'
  });
};

/**
 * 更新批次状态
 */
export const updateBatchStatus = (id: string, status: string): AxiosPromise<void> => {
  return request({
    url: `/erp/saltprocess/quality/batch/${id}/status`,
    method: 'put',
    data: { status }
  });
};

/**
 * 批次放行
 */
export const releaseBatch = (id: string): AxiosPromise<void> => {
  return request({
    url: `/erp/saltprocess/quality/batch/${id}/release`,
    method: 'post'
  });
};

/**
 * 批次隔离
 */
export const quarantineBatch = (id: string, reason: string): AxiosPromise<void> => {
  return request({
    url: `/erp/saltprocess/quality/batch/${id}/quarantine`,
    method: 'post',
    data: { reason }
  });
};

/**
 * 获取批次追溯信息
 */
export const getBatchTraceability = (id: string): AxiosPromise<any> => {
  return request({
    url: `/erp/saltprocess/quality/batch/${id}/traceability`,
    method: 'get'
  });
};

// 不合格品管理接口

/**
 * 查询不合格品列表
 */
export const listNonconformity = (query?: NonconformityQuery): AxiosPromise<PageResult<NonconformityVO>> => {
  return request({
    url: '/erp/saltprocess/quality/nonconformity/list',
    method: 'get',
    params: query
  });
};

/**
 * 获取不合格品详情
 */
export const getNonconformity = (id: string): AxiosPromise<NonconformityVO> => {
  return request({
    url: `/erp/saltprocess/quality/nonconformity/${id}`,
    method: 'get'
  });
};

/**
 * 创建不合格品记录
 */
export const createNonconformity = (data: NonconformityForm): AxiosPromise<NonconformityVO> => {
  return request({
    url: '/erp/saltprocess/quality/nonconformity',
    method: 'post',
    data
  });
};

/**
 * 更新不合格品记录
 */
export const updateNonconformity = (data: NonconformityForm): AxiosPromise<NonconformityVO> => {
  return request({
    url: '/erp/saltprocess/quality/nonconformity',
    method: 'put',
    data
  });
};

/**
 * 删除不合格品记录
 */
export const deleteNonconformity = (ids: string[]): AxiosPromise<void> => {
  return request({
    url: `/erp/saltprocess/quality/nonconformity/${ids.join(',')}`,
    method: 'delete'
  });
};

/**
 * 处理不合格品
 */
export const handleNonconformity = (id: string, action: string, handlerId: string, result?: string): AxiosPromise<void> => {
  return request({
    url: `/erp/saltprocess/quality/nonconformity/${id}/handle`,
    method: 'post',
    data: { action, handlerId, result }
  });
};

/**
 * 关闭不合格品
 */
export const closeNonconformity = (id: string): AxiosPromise<void> => {
  return request({
    url: `/erp/saltprocess/quality/nonconformity/${id}/close`,
    method: 'post'
  });
};

// 质量标准管理接口

/**
 * 查询质量标准列表
 */
export const listQualityStandard = (query?: QualityStandardQuery): AxiosPromise<PageResult<QualityStandardVO>> => {
  return request({
    url: '/erp/saltprocess/quality/standard/list',
    method: 'get',
    params: query
  });
};

/**
 * 获取质量标准详情
 */
export const getQualityStandard = (id: string): AxiosPromise<QualityStandardVO> => {
  return request({
    url: `/erp/saltprocess/quality/standard/${id}`,
    method: 'get'
  });
};

/**
 * 获取有效的质量标准
 */
export const getActiveQualityStandards = (productType?: string): AxiosPromise<QualityStandardVO[]> => {
  return request({
    url: '/erp/saltprocess/quality/standard/active',
    method: 'get',
    params: { productType }
  });
};

// 统计分析接口

/**
 * 获取质量统计数据
 */
export const getQualityStatistics = (period?: string): AxiosPromise<QualityStatistics> => {
  return request({
    url: '/erp/saltprocess/quality/statistics',
    method: 'get',
    params: { period }
  });
};

/**
 * 获取质量趋势分析
 */
export const getQualityTrendAnalysis = (period?: string): AxiosPromise<QualityTrendAnalysis[]> => {
  return request({
    url: '/erp/saltprocess/quality/analysis/trend',
    method: 'get',
    params: { period }
  });
};

/**
 * 获取检验项目统计
 */
export const getTestItemStatistics = (period?: string): AxiosPromise<TestItemStatistics[]> => {
  return request({
    url: '/erp/saltprocess/quality/analysis/test-items',
    method: 'get',
    params: { period }
  });
};

/**
 * 获取不合格品分析
 */
export const getNonconformityAnalysis = (period?: string): AxiosPromise<any> => {
  return request({
    url: '/erp/saltprocess/quality/analysis/nonconformity',
    method: 'get',
    params: { period }
  });
};

/**
 * 生成质量报告
 */
export const generateQualityReport = (reportType: string, params?: any): AxiosPromise<QualityReport> => {
  return request({
    url: '/erp/saltprocess/quality/report/generate',
    method: 'post',
    data: { reportType, ...params }
  });
};

// 导出接口

/**
 * 导出质量检验列表
 */
export const exportQualityInspectionList = (query?: QualityInspectionQuery): AxiosPromise<Blob> => {
  return request({
    url: '/erp/saltprocess/quality/inspection/export',
    method: 'get',
    params: query,
    responseType: 'blob'
  });
};

/**
 * 导出批次列表
 */
export const exportBatchList = (query?: BatchQuery): AxiosPromise<Blob> => {
  return request({
    url: '/erp/saltprocess/quality/batch/export',
    method: 'get',
    params: query,
    responseType: 'blob'
  });
};

/**
 * 导出不合格品列表
 */
export const exportNonconformityList = (query?: NonconformityQuery): AxiosPromise<Blob> => {
  return request({
    url: '/erp/saltprocess/quality/nonconformity/export',
    method: 'get',
    params: query,
    responseType: 'blob'
  });
};

/**
 * 导出检验证书
 */
export const exportInspectionCertificate = (id: string): AxiosPromise<Blob> => {
  return request({
    url: `/erp/saltprocess/quality/inspection/${id}/certificate/export`,
    method: 'get',
    responseType: 'blob'
  });
};

/**
 * 导出质量报告
 */
export const exportQualityReport = (reportType: string, params?: any): AxiosPromise<Blob> => {
  return request({
    url: '/erp/saltprocess/quality/report/export',
    method: 'post',
    data: { reportType, ...params },
    responseType: 'blob'
  });
};
