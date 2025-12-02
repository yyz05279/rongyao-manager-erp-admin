/**
 * 化盐工艺管理模块 - API接口
 */
import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import {
  SaltmakingTaskQuery,
  SaltmakingTaskVO,
  SaltmakingTaskForm,
  SaltmakingDataVO,
  SaltmakingDataForm,
  SaltmakingRealtimeData,
  SaltmakingAlert,
  RatioAdjustmentRecord,
  RatioAdjustmentForm,
  SaltmakingProcessParams,
  SaltmakingInspectionVO,
  SaltmakingStatistics,
  SaltmakingEquipmentStatus,
  SaltmakingReport,
  RatioConfigItem
} from './types';
import { ApiResponse, PageResult } from '../types';

// 化盐任务管理接口

/**
 * 查询化盐任务列表
 */
export const listSaltmakingTask = (query?: SaltmakingTaskQuery): AxiosPromise<PageResult<SaltmakingTaskVO>> => {
  return request({
    url: '/erp/saltprocess/saltmaking/task/list',
    method: 'get',
    params: query
  });
};

/**
 * 获取化盐任务详情
 */
export const getSaltmakingTask = (id: string): AxiosPromise<SaltmakingTaskVO> => {
  return request({
    url: `/erp/saltprocess/saltmaking/task/${id}`,
    method: 'get'
  });
};

/**
 * 创建化盐任务
 */
export const createSaltmakingTask = (data: SaltmakingTaskForm): AxiosPromise<SaltmakingTaskVO> => {
  return request({
    url: '/erp/saltprocess/saltmaking/task',
    method: 'post',
    data
  });
};

/**
 * 更新化盐任务
 */
export const updateSaltmakingTask = (data: SaltmakingTaskForm): AxiosPromise<SaltmakingTaskVO> => {
  return request({
    url: '/erp/saltprocess/saltmaking/task',
    method: 'put',
    data
  });
};

/**
 * 删除化盐任务
 */
export const deleteSaltmakingTask = (ids: string[]): AxiosPromise<void> => {
  return request({
    url: `/erp/saltprocess/saltmaking/task/${ids.join(',')}`,
    method: 'delete'
  });
};

/**
 * 启动化盐任务
 */
export const startSaltmakingTask = (id: string): AxiosPromise<void> => {
  return request({
    url: `/erp/saltprocess/saltmaking/task/${id}/start`,
    method: 'post'
  });
};

/**
 * 暂停化盐任务
 */
export const pauseSaltmakingTask = (id: string): AxiosPromise<void> => {
  return request({
    url: `/erp/saltprocess/saltmaking/task/${id}/pause`,
    method: 'post'
  });
};

/**
 * 完成化盐任务
 */
export const completeSaltmakingTask = (id: string): AxiosPromise<void> => {
  return request({
    url: `/erp/saltprocess/saltmaking/task/${id}/complete`,
    method: 'post'
  });
};

/**
 * 取消化盐任务
 */
export const cancelSaltmakingTask = (id: string, reason?: string): AxiosPromise<void> => {
  return request({
    url: `/erp/saltprocess/saltmaking/task/${id}/cancel`,
    method: 'post',
    data: { reason }
  });
};

/**
 * 切换任务阶段
 */
export const switchTaskPhase = (id: string, phase: string): AxiosPromise<void> => {
  return request({
    url: `/erp/saltprocess/saltmaking/task/${id}/phase`,
    method: 'put',
    data: { phase }
  });
};

// 化盐数据记录接口

/**
 * 查询化盐数据记录
 */
export const listSaltmakingData = (taskId: string, startTime?: string, endTime?: string): AxiosPromise<SaltmakingDataVO[]> => {
  return request({
    url: '/erp/saltprocess/saltmaking/data/list',
    method: 'get',
    params: { taskId, startTime, endTime }
  });
};

/**
 * 添加化盐数据记录
 */
export const addSaltmakingData = (data: SaltmakingDataForm): AxiosPromise<SaltmakingDataVO> => {
  return request({
    url: '/erp/saltprocess/saltmaking/data',
    method: 'post',
    data
  });
};

/**
 * 批量添加化盐数据记录
 */
export const batchAddSaltmakingData = (dataList: SaltmakingDataForm[]): AxiosPromise<void> => {
  return request({
    url: '/erp/saltprocess/saltmaking/data/batch',
    method: 'post',
    data: dataList
  });
};

// 实时监控接口

/**
 * 获取化盐实时数据
 */
export const getSaltmakingRealtimeData = (taskId: string): AxiosPromise<SaltmakingRealtimeData> => {
  return request({
    url: `/erp/saltprocess/saltmaking/realtime/${taskId}`,
    method: 'get'
  });
};

/**
 * 获取配比实时状态
 */
export const getRatioRealtimeStatus = (taskId: string): AxiosPromise<any> => {
  return request({
    url: `/erp/saltprocess/saltmaking/ratio/realtime/${taskId}`,
    method: 'get'
  });
};

// 配比控制接口

/**
 * 获取配比配置
 */
export const getRatioConfig = (configId: string): AxiosPromise<RatioConfigItem[]> => {
  return request({
    url: `/erp/saltprocess/saltmaking/ratio/config/${configId}`,
    method: 'get'
  });
};

/**
 * 调整配比
 */
export const adjustRatio = (data: RatioAdjustmentForm): AxiosPromise<RatioAdjustmentRecord> => {
  return request({
    url: '/erp/saltprocess/saltmaking/ratio/adjust',
    method: 'post',
    data
  });
};

/**
 * 获取配比调整记录
 */
export const getRatioAdjustmentHistory = (taskId: string): AxiosPromise<RatioAdjustmentRecord[]> => {
  return request({
    url: `/erp/saltprocess/saltmaking/ratio/adjustment/history/${taskId}`,
    method: 'get'
  });
};

/**
 * 重置配比
 */
export const resetRatio = (taskId: string): AxiosPromise<void> => {
  return request({
    url: `/erp/saltprocess/saltmaking/ratio/reset/${taskId}`,
    method: 'post'
  });
};

// 报警管理接口

/**
 * 获取化盐报警列表
 */
export const getSaltmakingAlerts = (taskId?: string, status?: string): AxiosPromise<SaltmakingAlert[]> => {
  return request({
    url: '/erp/saltprocess/saltmaking/alert/list',
    method: 'get',
    params: { taskId, status }
  });
};

/**
 * 处理报警
 */
export const handleSaltmakingAlert = (alertId: string, action: string): AxiosPromise<void> => {
  return request({
    url: `/erp/saltprocess/saltmaking/alert/${alertId}/handle`,
    method: 'post',
    data: { action }
  });
};

/**
 * 关闭报警
 */
export const closeSaltmakingAlert = (alertId: string): AxiosPromise<void> => {
  return request({
    url: `/erp/saltprocess/saltmaking/alert/${alertId}/close`,
    method: 'post'
  });
};

// 工艺参数接口

/**
 * 获取工艺参数
 */
export const getSaltmakingProcessParams = (taskId: string): AxiosPromise<SaltmakingProcessParams> => {
  return request({
    url: `/erp/saltprocess/saltmaking/params/${taskId}`,
    method: 'get'
  });
};

/**
 * 更新工艺参数
 */
export const updateSaltmakingProcessParams = (taskId: string, params: Partial<SaltmakingProcessParams>): AxiosPromise<void> => {
  return request({
    url: `/erp/saltprocess/saltmaking/params/${taskId}`,
    method: 'put',
    data: params
  });
};

// 巡检管理接口

/**
 * 查询化盐巡检记录
 */
export const listSaltmakingInspection = (taskId?: string): AxiosPromise<SaltmakingInspectionVO[]> => {
  return request({
    url: '/erp/saltprocess/saltmaking/inspection/list',
    method: 'get',
    params: { taskId }
  });
};

/**
 * 创建化盐巡检记录
 */
export const createSaltmakingInspection = (data: any): AxiosPromise<SaltmakingInspectionVO> => {
  return request({
    url: '/erp/saltprocess/saltmaking/inspection',
    method: 'post',
    data
  });
};

// 设备状态接口

/**
 * 获取化盐设备状态
 */
export const getSaltmakingEquipmentStatus = (taskId?: string): AxiosPromise<SaltmakingEquipmentStatus[]> => {
  return request({
    url: '/erp/saltprocess/saltmaking/equipment/status',
    method: 'get',
    params: { taskId }
  });
};

/**
 * 更新设备状态
 */
export const updateSaltmakingEquipmentStatus = (equipmentId: string, status: string): AxiosPromise<void> => {
  return request({
    url: `/erp/saltprocess/saltmaking/equipment/${equipmentId}/status`,
    method: 'put',
    data: { status }
  });
};

// 统计分析接口

/**
 * 获取化盐统计数据
 */
export const getSaltmakingStatistics = (period?: string): AxiosPromise<SaltmakingStatistics> => {
  return request({
    url: '/erp/saltprocess/saltmaking/statistics',
    method: 'get',
    params: { period }
  });
};

/**
 * 生成化盐报告
 */
export const generateSaltmakingReport = (taskId: string): AxiosPromise<SaltmakingReport> => {
  return request({
    url: `/erp/saltprocess/saltmaking/report/${taskId}`,
    method: 'get'
  });
};

// 导出接口

/**
 * 导出化盐任务列表
 */
export const exportSaltmakingTaskList = (query?: SaltmakingTaskQuery): AxiosPromise<Blob> => {
  return request({
    url: '/erp/saltprocess/saltmaking/task/export',
    method: 'get',
    params: query,
    responseType: 'blob'
  });
};

/**
 * 导出化盐数据
 */
export const exportSaltmakingData = (taskId: string, startTime?: string, endTime?: string): AxiosPromise<Blob> => {
  return request({
    url: '/erp/saltprocess/saltmaking/data/export',
    method: 'get',
    params: { taskId, startTime, endTime },
    responseType: 'blob'
  });
};

/**
 * 导出化盐报告
 */
export const exportSaltmakingReport = (taskId: string): AxiosPromise<Blob> => {
  return request({
    url: `/erp/saltprocess/saltmaking/report/${taskId}/export`,
    method: 'get',
    responseType: 'blob'
  });
};

/**
 * 获取实时数据
 */
export const getRealtimeData = (taskId: string): AxiosPromise<any> => {
  return request({
    url: `/erp/saltprocess/saltmaking/realtime/${taskId}`,
    method: 'get'
  });
};

/**
 * 获取制盐图表数据
 */
export const getSaltmakingChartData = (taskId: string): AxiosPromise<any> => {
  return request({
    url: `/erp/saltprocess/saltmaking/chart/${taskId}`,
    method: 'get'
  });
};

/**
 * 获取制盐比例数据
 */
export const getSaltmakingRatioData = (taskId: string): AxiosPromise<any> => {
  return request({
    url: `/erp/saltprocess/saltmaking/ratio/${taskId}`,
    method: 'get'
  });
};

/**
 * 获取制盐比例配置
 */
export const getSaltmakingRatioConfig = (): AxiosPromise<any> => {
  return request({
    url: '/erp/saltprocess/saltmaking/ratio/config',
    method: 'get'
  });
};

/**
 * 获取制盐质量列表
 */
export const listSaltmakingQuality = (taskId?: string): AxiosPromise<any> => {
  return request({
    url: '/erp/saltprocess/saltmaking/quality/list',
    method: 'get',
    params: { taskId }
  });
};
