/**
 * 预热管理模块 - API接口
 */
import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import {
  PreheatingTaskQuery,
  PreheatingTaskVO,
  PreheatingTaskForm,
  PreheatingDataVO,
  PreheatingDataForm,
  RealtimeData,
  PreheatingAlert,
  TemperatureCurveData,
  PressureCurveData,
  PreheatingInspectionVO,
  PreheatingInspectionForm,
  PreheatingStatistics,
  PreheatingEquipmentStatus,
  PreheatingProcessParams,
  PreheatingReport
} from './types';
import { ApiResponse, PageResult } from '../types';

// 预热任务管理接口

/**
 * 查询预热任务列表
 */
export const listPreheatingTask = (query?: PreheatingTaskQuery): AxiosPromise<PageResult<PreheatingTaskVO>> => {
  return request({
    url: '/erp/saltprocess/preheating/task/list',
    method: 'get',
    params: query
  });
};

/**
 * 获取预热任务详情
 */
export const getPreheatingTask = (id: string): AxiosPromise<PreheatingTaskVO> => {
  return request({
    url: `/erp/saltprocess/preheating/task/${id}`,
    method: 'get'
  });
};

/**
 * 创建预热任务
 */
export const createPreheatingTask = (data: PreheatingTaskForm): AxiosPromise<PreheatingTaskVO> => {
  return request({
    url: '/erp/saltprocess/preheating/task',
    method: 'post',
    data
  });
};

/**
 * 更新预热任务
 */
export const updatePreheatingTask = (data: PreheatingTaskForm): AxiosPromise<PreheatingTaskVO> => {
  return request({
    url: '/erp/saltprocess/preheating/task',
    method: 'put',
    data
  });
};

/**
 * 删除预热任务
 */
export const deletePreheatingTask = (ids: string[]): AxiosPromise<void> => {
  return request({
    url: `/erp/saltprocess/preheating/task/${ids.join(',')}`,
    method: 'delete'
  });
};

/**
 * 启动预热任务
 */
export const startPreheatingTask = (id: string): AxiosPromise<void> => {
  return request({
    url: `/erp/saltprocess/preheating/task/${id}/start`,
    method: 'post'
  });
};

/**
 * 暂停预热任务
 */
export const pausePreheatingTask = (id: string): AxiosPromise<void> => {
  return request({
    url: `/erp/saltprocess/preheating/task/${id}/pause`,
    method: 'post'
  });
};

/**
 * 完成预热任务
 */
export const completePreheatingTask = (id: string): AxiosPromise<void> => {
  return request({
    url: `/erp/saltprocess/preheating/task/${id}/complete`,
    method: 'post'
  });
};

/**
 * 取消预热任务
 */
export const cancelPreheatingTask = (id: string, reason?: string): AxiosPromise<void> => {
  return request({
    url: `/erp/saltprocess/preheating/task/${id}/cancel`,
    method: 'post',
    data: { reason }
  });
};

// 预热数据记录接口

/**
 * 查询预热数据记录
 */
export const listPreheatingData = (taskId: string, startTime?: string, endTime?: string): AxiosPromise<PreheatingDataVO[]> => {
  return request({
    url: `/erp/saltprocess/preheating/data/list`,
    method: 'get',
    params: { taskId, startTime, endTime }
  });
};

/**
 * 添加预热数据记录
 */
export const addPreheatingData = (data: PreheatingDataForm): AxiosPromise<PreheatingDataVO> => {
  return request({
    url: '/erp/saltprocess/preheating/data',
    method: 'post',
    data
  });
};

/**
 * 批量添加预热数据记录
 */
export const batchAddPreheatingData = (dataList: PreheatingDataForm[]): AxiosPromise<void> => {
  return request({
    url: '/erp/saltprocess/preheating/data/batch',
    method: 'post',
    data: dataList
  });
};

// 实时监控接口

/**
 * 获取实时数据
 */
export const getRealtimeData = (taskId: string): AxiosPromise<RealtimeData> => {
  return request({
    url: `/erp/saltprocess/preheating/realtime/${taskId}`,
    method: 'get'
  });
};

/**
 * 获取温度曲线数据
 */
export const getTemperatureCurve = (taskId: string, startTime?: string, endTime?: string): AxiosPromise<TemperatureCurveData> => {
  return request({
    url: `/erp/saltprocess/preheating/curve/temperature/${taskId}`,
    method: 'get',
    params: { startTime, endTime }
  });
};

/**
 * 获取压力曲线数据
 */
export const getPressureCurve = (taskId: string, startTime?: string, endTime?: string): AxiosPromise<PressureCurveData> => {
  return request({
    url: `/erp/saltprocess/preheating/curve/pressure/${taskId}`,
    method: 'get',
    params: { startTime, endTime }
  });
};

// 报警管理接口

/**
 * 获取预热报警列表
 */
export const getPreheatingAlerts = (taskId?: string, status?: string): AxiosPromise<PreheatingAlert[]> => {
  return request({
    url: '/erp/saltprocess/preheating/alert/list',
    method: 'get',
    params: { taskId, status }
  });
};

/**
 * 处理报警
 */
export const handleAlert = (alertId: string, action: string): AxiosPromise<void> => {
  return request({
    url: `/erp/saltprocess/preheating/alert/${alertId}/handle`,
    method: 'post',
    data: { action }
  });
};

/**
 * 关闭报警
 */
export const closeAlert = (alertId: string): AxiosPromise<void> => {
  return request({
    url: `/erp/saltprocess/preheating/alert/${alertId}/close`,
    method: 'post'
  });
};

// 巡检管理接口

/**
 * 查询巡检记录
 */
export const listPreheatingInspection = (taskId?: string): AxiosPromise<PreheatingInspectionVO[]> => {
  return request({
    url: '/erp/saltprocess/preheating/inspection/list',
    method: 'get',
    params: { taskId }
  });
};

/**
 * 创建巡检记录
 */
export const createPreheatingInspection = (data: PreheatingInspectionForm): AxiosPromise<PreheatingInspectionVO> => {
  return request({
    url: '/erp/saltprocess/preheating/inspection',
    method: 'post',
    data
  });
};

/**
 * 获取巡检详情
 */
export const getPreheatingInspection = (id: string): AxiosPromise<PreheatingInspectionVO> => {
  return request({
    url: `/erp/saltprocess/preheating/inspection/${id}`,
    method: 'get'
  });
};

// 设备状态接口

/**
 * 获取预热设备状态
 */
export const getPreheatingEquipmentStatus = (taskId?: string): AxiosPromise<PreheatingEquipmentStatus[]> => {
  return request({
    url: '/erp/saltprocess/preheating/equipment/status',
    method: 'get',
    params: { taskId }
  });
};

/**
 * 更新设备状态
 */
export const updateEquipmentStatus = (equipmentId: string, status: string): AxiosPromise<void> => {
  return request({
    url: `/erp/saltprocess/preheating/equipment/${equipmentId}/status`,
    method: 'put',
    data: { status }
  });
};

// 工艺参数接口

/**
 * 获取工艺参数
 */
export const getProcessParams = (taskId: string): AxiosPromise<PreheatingProcessParams> => {
  return request({
    url: `/erp/saltprocess/preheating/params/${taskId}`,
    method: 'get'
  });
};

/**
 * 更新工艺参数
 */
export const updateProcessParams = (taskId: string, params: Partial<PreheatingProcessParams>): AxiosPromise<void> => {
  return request({
    url: `/erp/saltprocess/preheating/params/${taskId}`,
    method: 'put',
    data: params
  });
};

// 统计分析接口

/**
 * 获取预热统计数据
 */
export const getPreheatingStatistics = (period?: string): AxiosPromise<PreheatingStatistics> => {
  return request({
    url: '/erp/saltprocess/preheating/statistics',
    method: 'get',
    params: { period }
  });
};

/**
 * 生成预热报告
 */
export const generatePreheatingReport = (taskId: string): AxiosPromise<PreheatingReport> => {
  return request({
    url: `/erp/saltprocess/preheating/report/${taskId}`,
    method: 'get'
  });
};

// 导出接口

/**
 * 导出预热任务列表
 */
export const exportPreheatingTaskList = (query?: PreheatingTaskQuery): AxiosPromise<Blob> => {
  return request({
    url: '/erp/saltprocess/preheating/task/export',
    method: 'get',
    params: query,
    responseType: 'blob'
  });
};

/**
 * 导出预热数据
 */
export const exportPreheatingData = (taskId: string, startTime?: string, endTime?: string): AxiosPromise<Blob> => {
  return request({
    url: `/erp/saltprocess/preheating/data/export`,
    method: 'get',
    params: { taskId, startTime, endTime },
    responseType: 'blob'
  });
};

/**
 * 导出预热报告
 */
export const exportPreheatingReport = (taskId: string): AxiosPromise<Blob> => {
  return request({
    url: `/erp/saltprocess/preheating/report/${taskId}/export`,
    method: 'get',
    responseType: 'blob'
  });
};

/**
 * 获取项目列表
 */
export const getProjectList = (): AxiosPromise<any> => {
  return request({
    url: '/erp/saltprocess/project/list',
    method: 'get'
  });
};

/**
 * 获取罐列表
 */
export const getTankList = (): AxiosPromise<any> => {
  return request({
    url: '/erp/saltprocess/tank/list',
    method: 'get'
  });
};

/**
 * 获取操作员列表
 */
export const getOperatorList = (): AxiosPromise<any> => {
  return request({
    url: '/erp/saltprocess/operator/list',
    method: 'get'
  });
};
