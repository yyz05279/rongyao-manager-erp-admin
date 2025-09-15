/**
 * 二元化盐记录管理模块 - API接口
 * 根据化盐项目数据记录系统API接口文档实现
 */
import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import {
  BinaryRecordQuery,
  BinaryRecordVO,
  BinaryRecordForm,
  BatchImportResult,
  ValidationResult,
  StatisticsQuery,
  StatisticsApiResponse,
  ApiResponse,
  DeleteParams,
  ExportParams,
  BinaryRecordTemplateExportParams
} from './types';

/**
 * 查询二元化盐记录列表
 */
export const listBinaryRecord = (query?: BinaryRecordQuery): AxiosPromise<any> => {
  return request({
    url: '/erp/saltprocess/binary-record/list',
    method: 'get',
    params: query
  });
};

// 兼容新的命名方式
export const listBinaryRecords = listBinaryRecord;

/**
 * 获取二元化盐记录详情
 */
export const getBinaryRecord = (id: string | number): AxiosPromise<BinaryRecordVO> => {
  return request({
    url: '/erp/saltprocess/binary-record/' + id,
    method: 'get'
  });
};

/**
 * 新增二元化盐记录
 */
export const addBinaryRecord = (data: BinaryRecordForm): AxiosPromise<ApiResponse<BinaryRecordVO>> => {
  return request({
    url: '/erp/saltprocess/binary-record',
    method: 'post',
    data
  });
};

/**
 * 修改二元化盐记录
 */
export const updateBinaryRecord = (data: BinaryRecordForm): AxiosPromise<ApiResponse> => {
  return request({
    url: '/erp/saltprocess/binary-record',
    method: 'put',
    data
  });
};

/**
 * 删除二元化盐记录
 */
export const delBinaryRecord = (ids: string | number | Array<string | number>): AxiosPromise<ApiResponse> => {
  return request({
    url: '/erp/saltprocess/binary-record/' + ids,
    method: 'delete'
  });
};

// 兼容新的命名方式
export const deleteBinaryRecord = delBinaryRecord;

/**
 * 批量删除二元化盐记录
 */
export const batchDeleteBinaryRecords = (params: DeleteParams): AxiosPromise<ApiResponse> => {
  return request({
    url: '/erp/saltprocess/binary-record/batch',
    method: 'delete',
    data: params
  });
};

/**
 * 根据批次号查询二元化盐记录
 */
export const getBinaryRecordByBatchNumber = (batchNumber: string): AxiosPromise<BinaryRecordVO[]> => {
  return request({
    url: '/erp/saltprocess/binary-record/batch/' + batchNumber,
    method: 'get'
  });
};

/**
 * 根据项目ID查询二元化盐记录
 */
export const getBinaryRecordByProjectId = (projectId: string | number): AxiosPromise<BinaryRecordVO[]> => {
  return request({
    url: '/erp/saltprocess/binary-record/project/' + projectId,
    method: 'get'
  });
};

/**
 * 根据日期范围查询二元化盐记录
 */
export const getBinaryRecordByDateRange = (startDate: string, endDate: string): AxiosPromise<BinaryRecordVO[]> => {
  return request({
    url: '/erp/saltprocess/binary-record/date-range',
    method: 'get',
    params: { startDate, endDate }
  });
};

/**
 * 根据质量等级查询二元化盐记录
 */
export const getBinaryRecordByQualityGrade = (qualityGrade: number): AxiosPromise<BinaryRecordVO[]> => {
  return request({
    url: '/erp/saltprocess/binary-record/quality-grade/' + qualityGrade,
    method: 'get'
  });
};

/**
 * 查询最新二元化盐记录
 */
export const getLatestBinaryRecord = (projectId: string | number): AxiosPromise<BinaryRecordVO> => {
  return request({
    url: '/erp/saltprocess/binary-record/latest/' + projectId,
    method: 'get'
  });
};

/**
 * 统计二元化盐记录数量
 */
export const countBinaryRecord = (startDate: string, endDate: string): AxiosPromise<number> => {
  return request({
    url: '/erp/saltprocess/binary-record/count',
    method: 'get',
    params: { startDate, endDate }
  });
};

/**
 * 导出二元化盐记录
 */
export const exportBinaryRecord = (query?: ExportParams): AxiosPromise<Blob> => {
  return request({
    url: '/erp/saltprocess/binary-record/export',
    method: 'post',
    data: query,
    responseType: 'blob'
  });
};

/**
 * 基于模版导出二元化盐记录
 * 根据接口文档：POST /erp/saltprocess/binary-record/export-template
 */
export const exportBinaryRecordTemplate = (query?: BinaryRecordTemplateExportParams): AxiosPromise<Blob> => {
  return request({
    url: '/erp/saltprocess/binary-record/export-template',
    method: 'post',
    data: query,
    responseType: 'blob'
  });
};

// 兼容新的命名方式
export const exportBinaryRecords = exportBinaryRecord;

/**
 * 导入二元化盐记录（文件上传方式）
 */
export const importBinaryRecord = (file: File): AxiosPromise<void> => {
  const formData = new FormData();
  formData.append('file', file);
  return request({
    url: '/erp/saltprocess/binary-record/import',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

/**
 * 批量导入二元化盐记录（数据提交方式）
 */
export const batchImportBinaryRecord = (data: BinaryRecordForm[]): AxiosPromise<BatchImportResult> => {
  return request({
    url: '/erp/saltprocess/binary-record/batch-import',
    method: 'post',
    data: {
      records: data
    }
  });
};

/**
 * 验证批量导入数据
 */
export const validateBatchImportData = (data: BinaryRecordForm[]): AxiosPromise<ValidationResult> => {
  return request({
    url: '/erp/saltprocess/binary-record/validate-batch',
    method: 'post',
    data: {
      records: data
    }
  });
};

/**
 * 获取导入模板
 */
export const getBinaryRecordImportTemplate = (): AxiosPromise<void> => {
  return request({
    url: '/erp/saltprocess/binary-record/importTemplate',
    method: 'post',
    responseType: 'blob'
  });
};

/**
 * 根据批次号查询记录
 */
export const getBinaryMakingRecordByBatch = (batchNumber: string): AxiosPromise<BinaryMakingRecordVO[]> => {
  return request({
    url: '/erp/saltprocess/binary-making-record/batch/' + batchNumber,
    method: 'get'
  });
};

/**
 * 根据质量等级查询记录
 */
export const getBinaryMakingRecordByQualityGrade = (qualityGrade: number): AxiosPromise<BinaryMakingRecordVO[]> => {
  return request({
    url: '/erp/saltprocess/binary-making-record/quality-grade/' + qualityGrade,
    method: 'get'
  });
};

/**
 * 统计总产量
 */
export const getTotalOutput = (startDate: string, endDate: string): AxiosPromise<{ totalOutput: number }> => {
  return request({
    url: '/erp/saltprocess/binary-making-record/total-output',
    method: 'get',
    params: { startDate, endDate }
  });
};

/**
 * 统计平均产出率
 */
export const getAvgYieldRate = (startDate: string, endDate: string): AxiosPromise<{ avgYieldRate: number }> => {
  return request({
    url: '/erp/saltprocess/binary-making-record/avg-yield-rate',
    method: 'get',
    params: { startDate, endDate }
  });
};

/**
 * 统计总成本
 */
export const getTotalCost = (projectId: number): AxiosPromise<{ totalCost: number }> => {
  return request({
    url: '/erp/saltprocess/binary-making-record/total-cost/' + projectId,
    method: 'get'
  });
};

/**
 * 批量更新二元化盐记录状态
 */
export const batchUpdateBinaryRecordStatus = (ids: Array<string | number>, status: number): AxiosPromise<void> => {
  return request({
    url: '/erp/saltprocess/binary-record/batch-status',
    method: 'put',
    data: { ids, status }
  });
};

/**
 * 获取二元化盐记录统计信息
 */
export const getBinaryRecordStatistics = (startDate?: string, endDate?: string): AxiosPromise<any> => {
  return request({
    url: '/erp/saltprocess/binary-record/statistics',
    method: 'get',
    params: { startDate, endDate }
  });
};

/**
 * 获取配比分析数据
 */
export const getBinaryRatioAnalysis = (recordId: string | number): AxiosPromise<any> => {
  return request({
    url: '/erp/saltprocess/binary-record/ratio-analysis/' + recordId,
    method: 'get'
  });
};

/**
 * 获取产量趋势数据
 */
export const getBinaryOutputTrend = (startDate: string, endDate: string): AxiosPromise<any[]> => {
  return request({
    url: '/erp/saltprocess/binary-record/output-trend',
    method: 'get',
    params: { startDate, endDate }
  });
};

/**
 * 获取质量分析数据
 */
export const getBinaryQualityAnalysis = (startDate: string, endDate: string): AxiosPromise<any> => {
  return request({
    url: '/erp/saltprocess/binary-record/quality-analysis',
    method: 'get',
    params: { startDate, endDate }
  });
};

/**
 * 验证二元化盐记录数据
 */
export const validateBinaryRecord = (data: BinaryRecordForm): AxiosPromise<any> => {
  return request({
    url: '/erp/saltprocess/binary-record/validate',
    method: 'post',
    data
  });
};

/**
 * 复制二元化盐记录
 */
export const copyBinaryRecord = (id: string | number): AxiosPromise<BinaryRecordVO> => {
  return request({
    url: '/erp/saltprocess/binary-record/copy/' + id,
    method: 'post'
  });
};

/**
 * 获取二元化盐记录审核历史
 */
export const getBinaryRecordAuditHistory = (id: string | number): AxiosPromise<any[]> => {
  return request({
    url: '/erp/saltprocess/binary-record/audit-history/' + id,
    method: 'get'
  });
};

/**
 * 审核二元化盐记录
 */
export const auditBinaryRecord = (id: string | number, auditData: any): AxiosPromise<void> => {
  return request({
    url: '/erp/saltprocess/binary-record/audit/' + id,
    method: 'post',
    data: auditData
  });
};

/**
 * 获取成本分析数据
 */
export const getBinaryCostAnalysis = (startDate: string, endDate: string): AxiosPromise<any> => {
  return request({
    url: '/erp/saltprocess/binary-record/cost-analysis',
    method: 'get',
    params: { startDate, endDate }
  });
};

/**
 * 获取效率分析数据
 */
export const getBinaryEfficiencyAnalysis = (startDate: string, endDate: string): AxiosPromise<any> => {
  return request({
    url: '/erp/saltprocess/binary-record/efficiency-analysis',
    method: 'get',
    params: { startDate, endDate }
  });
};

/**
 * 获取配比优化建议
 */
export const getBinaryRatioOptimization = (recordId: string | number): AxiosPromise<any> => {
  return request({
    url: '/erp/saltprocess/binary-record/ratio-optimization/' + recordId,
    method: 'get'
  });
};

/**
 * 获取统计分析数据（用于统计分析组件）
 */
export const getStatisticsData = (query?: StatisticsQuery): AxiosPromise<StatisticsApiResponse> => {
  return request({
    url: '/erp/saltprocess/binary-record/statistics-data',
    method: 'get',
    params: query
  });
};

/**
 * 生成记录编码
 */
export const generateRecordCode = (projectId: number, recordDate: string): AxiosPromise<ApiResponse<string>> => {
  return request({
    url: '/erp/saltprocess/binary-record/generate-code',
    method: 'get',
    params: { projectId, recordDate }
  });
};

/**
 * 检查记录编码是否存在
 */
export const checkRecordCodeExists = (recordCode: string): AxiosPromise<ApiResponse<boolean>> => {
  return request({
    url: '/erp/saltprocess/binary-record/check-code',
    method: 'get',
    params: { recordCode }
  });
};

/**
 * 获取项目列表（用于下拉选择）
 */
export const getProjectList = (): AxiosPromise<ApiResponse<Array<{id: number, name: string}>>> => {
  return request({
    url: '/erp/saltprocess/binary-record/projects',
    method: 'get'
  });
};

/**
 * 获取操作员列表（用于下拉选择）
 */
export const getOperatorList = (): AxiosPromise<ApiResponse<Array<{id: number, name: string}>>> => {
  return request({
    url: '/erp/saltprocess/binary-record/operators',
    method: 'get'
  });
};

/**
 * 下载导入模板
 */
export const downloadTemplate = (): AxiosPromise<Blob> => {
  return request({
    url: '/erp/saltprocess/binary-record/template',
    method: 'get',
    responseType: 'blob'
  });
};
