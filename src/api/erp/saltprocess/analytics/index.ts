/**
 * 数据分析模块 - API接口
 */
import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import {
  ProductionStatistics,
  QualityAnalytics,
  CostAnalytics,
  EquipmentAnalytics,
  PersonnelAnalytics,
  DashboardData,
  AnalysisPeriod,
  AnalysisQueryParams,
  ReportGenerationParams,
  AnalyticsReport
} from './types';
import { ApiResponse } from '../types';

// 生产分析接口

/**
 * 获取生产统计数据
 */
export const getProductionStatistics = (period: AnalysisPeriod, startDate?: string, endDate?: string): AxiosPromise<ProductionStatistics> => {
  return request({
    url: '/erp/saltprocess/analytics/production/statistics',
    method: 'get',
    params: { period, startDate, endDate }
  });
};

/**
 * 获取生产趋势分析
 * @param params 查询参数（支持 period, startDate, endDate, type 等）
 */
export const getProductionTrend = (params: AnalysisQueryParams | AnalysisPeriod, startDate?: string, endDate?: string): AxiosPromise<any> => {
  // 支持两种调用方式：对象参数或位置参数
  const queryParams = typeof params === 'object' && !('toString' in params)
    ? params
    : { period: params, startDate, endDate };

  return request({
    url: '/erp/saltprocess/analytics/production/trend',
    method: 'get',
    params: queryParams
  });
};

/**
 * 获取产能分析
 */
export const getCapacityAnalysis = (params: AnalysisQueryParams | AnalysisPeriod): AxiosPromise<any> => {
  const queryParams = typeof params === 'object' && !('toString' in params)
    ? params
    : { period: params };
  return request({
    url: '/erp/saltprocess/analytics/production/capacity',
    method: 'get',
    params: queryParams
  });
};

/**
 * 获取效率分析
 */
export const getEfficiencyAnalysis = (params: AnalysisQueryParams | AnalysisPeriod): AxiosPromise<any> => {
  const queryParams = typeof params === 'object' && !('toString' in params)
    ? params
    : { period: params };
  return request({
    url: '/erp/saltprocess/analytics/production/efficiency',
    method: 'get',
    params: queryParams
  });
};

// 质量分析接口

/**
 * 获取质量分析数据
 */
export const getQualityAnalytics = (period: AnalysisPeriod, startDate?: string, endDate?: string): AxiosPromise<QualityAnalytics> => {
  return request({
    url: '/erp/saltprocess/analytics/quality/statistics',
    method: 'get',
    params: { period, startDate, endDate }
  });
};

/**
 * 获取质量趋势分析
 */
export const getQualityTrend = (period: AnalysisPeriod): AxiosPromise<any> => {
  return request({
    url: '/erp/saltprocess/analytics/quality/trend',
    method: 'get',
    params: { period }
  });
};

/**
 * 获取缺陷分析
 */
export const getDefectAnalysis = (period: AnalysisPeriod): AxiosPromise<any> => {
  return request({
    url: '/erp/saltprocess/analytics/quality/defect',
    method: 'get',
    params: { period }
  });
};

/**
 * 获取工艺能力分析
 */
export const getProcessCapabilityAnalysis = (period: AnalysisPeriod): AxiosPromise<any> => {
  return request({
    url: '/erp/saltprocess/analytics/quality/capability',
    method: 'get',
    params: { period }
  });
};

// 成本分析接口

/**
 * 获取成本分析数据
 */
export const getCostAnalytics = (period: AnalysisPeriod, startDate?: string, endDate?: string): AxiosPromise<CostAnalytics> => {
  return request({
    url: '/erp/saltprocess/analytics/cost/statistics',
    method: 'get',
    params: { period, startDate, endDate }
  });
};

/**
 * 获取成本趋势分析
 */
export const getCostTrend = (period: AnalysisPeriod): AxiosPromise<any> => {
  return request({
    url: '/erp/saltprocess/analytics/cost/trend',
    method: 'get',
    params: { period }
  });
};

/**
 * 获取成本分解分析
 */
export const getCostBreakdownAnalysis = (period: AnalysisPeriod): AxiosPromise<any> => {
  return request({
    url: '/erp/saltprocess/analytics/cost/breakdown',
    method: 'get',
    params: { period }
  });
};

/**
 * 获取成本对比分析
 */
export const getCostComparisonAnalysis = (period: AnalysisPeriod): AxiosPromise<any> => {
  return request({
    url: '/erp/saltprocess/analytics/cost/comparison',
    method: 'get',
    params: { period }
  });
};

// 设备分析接口

/**
 * 获取设备分析数据
 */
export const getEquipmentAnalytics = (period: AnalysisPeriod, startDate?: string, endDate?: string): AxiosPromise<EquipmentAnalytics> => {
  return request({
    url: '/erp/saltprocess/analytics/equipment/statistics',
    method: 'get',
    params: { period, startDate, endDate }
  });
};

/**
 * 获取设备利用率分析
 */
export const getEquipmentUtilizationAnalysis = (period: AnalysisPeriod): AxiosPromise<any> => {
  return request({
    url: '/erp/saltprocess/analytics/equipment/utilization',
    method: 'get',
    params: { period }
  });
};

/**
 * 获取设备故障分析
 */
export const getEquipmentFaultAnalysis = (period: AnalysisPeriod): AxiosPromise<any> => {
  return request({
    url: '/erp/saltprocess/analytics/equipment/fault',
    method: 'get',
    params: { period }
  });
};

/**
 * 获取设备维护分析
 */
export const getEquipmentMaintenanceAnalysis = (period: AnalysisPeriod): AxiosPromise<any> => {
  return request({
    url: '/erp/saltprocess/analytics/equipment/maintenance',
    method: 'get',
    params: { period }
  });
};

// 人员分析接口

/**
 * 获取人员分析数据
 */
export const getPersonnelAnalytics = (period: AnalysisPeriod, startDate?: string, endDate?: string): AxiosPromise<PersonnelAnalytics> => {
  return request({
    url: '/erp/saltprocess/analytics/personnel/statistics',
    method: 'get',
    params: { period, startDate, endDate }
  });
};

/**
 * 获取人员绩效分析
 */
export const getPersonnelPerformanceAnalysis = (period: AnalysisPeriod): AxiosPromise<any> => {
  return request({
    url: '/erp/saltprocess/analytics/personnel/performance',
    method: 'get',
    params: { period }
  });
};

/**
 * 获取技能分析
 */
export const getSkillAnalysis = (): AxiosPromise<any> => {
  return request({
    url: '/erp/saltprocess/analytics/personnel/skill',
    method: 'get'
  });
};

/**
 * 获取工作负荷分析
 */
export const getWorkloadAnalysis = (period: AnalysisPeriod): AxiosPromise<any> => {
  return request({
    url: '/erp/saltprocess/analytics/personnel/workload',
    method: 'get',
    params: { period }
  });
};

// 综合分析接口

/**
 * 获取仪表板数据
 */
export const getDashboardData = (params: AnalysisQueryParams | AnalysisPeriod | string): AxiosPromise<DashboardData> => {
  const queryParams = typeof params === 'object' && !('toString' in params)
    ? params
    : { period: params };
  return request({
    url: '/erp/saltprocess/analytics/dashboard',
    method: 'get',
    params: queryParams
  });
};

/**
 * 获取KPI指标
 */
export const getKPIMetrics = (params: AnalysisQueryParams | AnalysisPeriod | string): AxiosPromise<any> => {
  const queryParams = typeof params === 'object' && !('toString' in params)
    ? params
    : { period: params };
  return request({
    url: '/erp/saltprocess/analytics/kpi',
    method: 'get',
    params: queryParams
  });
};

/**
 * 获取分析KPI数据（仪表板用）
 */
export const getAnalyticsKPI = (params?: any): AxiosPromise<any> => {
  return request({
    url: '/erp/saltprocess/analytics/dashboard/kpi',
    method: 'get',
    params
  });
};

/**
 * 获取质量分布数据
 */
export const getQualityDistribution = (params?: any): AxiosPromise<any> => {
  return request({
    url: '/erp/saltprocess/analytics/quality/distribution',
    method: 'get',
    params
  });
};

/**
 * 获取能源分析数据
 */
export const getEnergyAnalysis = (params?: any): AxiosPromise<any> => {
  return request({
    url: '/erp/saltprocess/analytics/energy/analysis',
    method: 'get',
    params
  });
};

/**
 * 获取设备利用率数据
 */
export const getEquipmentUtilization = (params?: any): AxiosPromise<any> => {
  return request({
    url: '/erp/saltprocess/analytics/equipment/utilization',
    method: 'get',
    params
  });
};

/**
 * 获取异常分析数据
 */
export const getAnomalyAnalysis = (params?: any): AxiosPromise<any> => {
  return request({
    url: '/erp/saltprocess/analytics/anomaly/analysis',
    method: 'get',
    params
  });
};

/**
 * 获取生产数据列表
 */
export const getProductionData = (params?: any): AxiosPromise<any> => {
  return request({
    url: '/erp/saltprocess/analytics/production/data',
    method: 'get',
    params
  });
};

/**
 * 获取质量数据列表
 */
export const getQualityData = (params?: any): AxiosPromise<any> => {
  return request({
    url: '/erp/saltprocess/analytics/quality/data',
    method: 'get',
    params
  });
};

/**
 * 获取能源数据列表
 */
export const getEnergyData = (params?: any): AxiosPromise<any> => {
  return request({
    url: '/erp/saltprocess/analytics/energy/data',
    method: 'get',
    params
  });
};

/**
 * 获取异常数据列表
 */
export const getAnomalyData = (params?: any): AxiosPromise<any> => {
  return request({
    url: '/erp/saltprocess/analytics/anomaly/data',
    method: 'get',
    params
  });
};

/**
 * 获取综合分析报告
 */
export const getComprehensiveAnalysis = (period: AnalysisPeriod, startDate?: string, endDate?: string): AxiosPromise<any> => {
  return request({
    url: '/erp/saltprocess/analytics/comprehensive',
    method: 'get',
    params: { period, startDate, endDate }
  });
};

// 预测分析接口

/**
 * 获取生产预测
 */
export const getProductionForecast = (days: number): AxiosPromise<any> => {
  return request({
    url: '/erp/saltprocess/analytics/forecast/production',
    method: 'get',
    params: { days }
  });
};

/**
 * 获取质量预测
 */
export const getQualityForecast = (days: number): AxiosPromise<any> => {
  return request({
    url: '/erp/saltprocess/analytics/forecast/quality',
    method: 'get',
    params: { days }
  });
};

/**
 * 获取成本预测
 */
export const getCostForecast = (days: number): AxiosPromise<any> => {
  return request({
    url: '/erp/saltprocess/analytics/forecast/cost',
    method: 'get',
    params: { days }
  });
};

/**
 * 获取设备维护预测
 */
export const getMaintenanceForecast = (days: number): AxiosPromise<any> => {
  return request({
    url: '/erp/saltprocess/analytics/forecast/maintenance',
    method: 'get',
    params: { days }
  });
};

// 报告生成接口

/**
 * 生成分析报告
 */
export const generateAnalyticsReport = (params: ReportGenerationParams): AxiosPromise<AnalyticsReport> => {
  return request({
    url: '/erp/saltprocess/analytics/report/generate',
    method: 'post',
    data: params
  });
};

/**
 * 获取报告列表
 */
export const getReportList = (reportType?: string): AxiosPromise<any> => {
  return request({
    url: '/erp/saltprocess/analytics/report/list',
    method: 'get',
    params: { reportType }
  });
};

/**
 * 获取报告详情
 */
export const getReportDetail = (reportId: string): AxiosPromise<AnalyticsReport> => {
  return request({
    url: `/erp/saltprocess/analytics/report/${reportId}`,
    method: 'get'
  });
};

/**
 * 删除报告
 */
export const deleteReport = (reportId: string): AxiosPromise<void> => {
  return request({
    url: `/erp/saltprocess/analytics/report/${reportId}`,
    method: 'delete'
  });
};

// 导出接口

/**
 * 导出生产统计数据
 */
export const exportProductionStatistics = (period: AnalysisPeriod, startDate?: string, endDate?: string): AxiosPromise<Blob> => {
  return request({
    url: '/erp/saltprocess/analytics/production/export',
    method: 'get',
    params: { period, startDate, endDate },
    responseType: 'blob'
  });
};

/**
 * 导出质量分析数据
 */
export const exportQualityAnalytics = (period: AnalysisPeriod, startDate?: string, endDate?: string): AxiosPromise<Blob> => {
  return request({
    url: '/erp/saltprocess/analytics/quality/export',
    method: 'get',
    params: { period, startDate, endDate },
    responseType: 'blob'
  });
};

/**
 * 导出成本分析数据
 */
export const exportCostAnalytics = (period: AnalysisPeriod, startDate?: string, endDate?: string): AxiosPromise<Blob> => {
  return request({
    url: '/erp/saltprocess/analytics/cost/export',
    method: 'get',
    params: { period, startDate, endDate },
    responseType: 'blob'
  });
};

/**
 * 导出分析报告
 */
export const exportAnalyticsReport = (reportId: string, format: 'PDF' | 'EXCEL' | 'WORD'): AxiosPromise<Blob> => {
  return request({
    url: `/erp/saltprocess/analytics/report/${reportId}/export`,
    method: 'get',
    params: { format },
    responseType: 'blob'
  });
};
