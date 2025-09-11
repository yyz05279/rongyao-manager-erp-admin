/**
 * 提温工艺管理模块 - API接口
 */
import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import {
  HeatingTaskQuery,
  HeatingTaskVO,
  HeatingTaskForm,
  HeatingStageVO,
  HeatingStageConfig,
  HeatingDataVO,
  HeatingDataForm,
  HeatingRealtimeData,
  HeatingAlert,
  HeatingTemperatureCurveData,
  HeatingInspectionVO,
  HeatingProcessParams,
  HeatingStatistics,
  HeatingEquipmentStatus,
  HeatingReport
} from './types';
import { ApiResponse, PageResult } from '../types';

// 提温任务管理接口

/**
 * 查询提温任务列表
 */
export const listHeatingTask = (query?: HeatingTaskQuery): AxiosPromise<PageResult<HeatingTaskVO>> => {
  return request({
    url: '/erp/saltprocess/heating/task/list',
    method: 'get',
    params: query
  });
};

/**
 * 获取提温任务详情
 */
export const getHeatingTask = (id: string): AxiosPromise<HeatingTaskVO> => {
  return request({
    url: `/erp/saltprocess/heating/task/${id}`,
    method: 'get'
  });
};

/**
 * 创建提温任务
 */
export const createHeatingTask = (data: HeatingTaskForm): AxiosPromise<HeatingTaskVO> => {
  return request({
    url: '/erp/saltprocess/heating/task',
    method: 'post',
    data
  });
};

/**
 * 更新提温任务
 */
export const updateHeatingTask = (data: HeatingTaskForm): AxiosPromise<HeatingTaskVO> => {
  return request({
    url: '/erp/saltprocess/heating/task',
    method: 'put',
    data
  });
};

/**
 * 删除提温任务
 */
export const deleteHeatingTask = (ids: string[]): AxiosPromise<void> => {
  return request({
    url: `/erp/saltprocess/heating/task/${ids.join(',')}`,
    method: 'delete'
  });
};

/**
 * 启动提温任务
 */
export const startHeatingTask = (id: string): AxiosPromise<void> => {
  return request({
    url: `/erp/saltprocess/heating/task/${id}/start`,
    method: 'post'
  });
};

/**
 * 暂停提温任务
 */
export const pauseHeatingTask = (id: string): AxiosPromise<void> => {
  return request({
    url: `/erp/saltprocess/heating/task/${id}/pause`,
    method: 'post'
  });
};

/**
 * 完成提温任务
 */
export const completeHeatingTask = (id: string): AxiosPromise<void> => {
  return request({
    url: `/erp/saltprocess/heating/task/${id}/complete`,
    method: 'post'
  });
};

/**
 * 取消提温任务
 */
export const cancelHeatingTask = (id: string, reason?: string): AxiosPromise<void> => {
  return request({
    url: `/erp/saltprocess/heating/task/${id}/cancel`,
    method: 'post',
    data: { reason }
  });
};

// 提温阶段管理接口

/**
 * 获取任务阶段列表
 */
export const getHeatingStages = (taskId: string): AxiosPromise<HeatingStageVO[]> => {
  return request({
    url: `/erp/saltprocess/heating/task/${taskId}/stages`,
    method: 'get'
  });
};

/**
 * 启动下一阶段
 */
export const startNextStage = (taskId: string): AxiosPromise<void> => {
  return request({
    url: `/erp/saltprocess/heating/task/${taskId}/next-stage`,
    method: 'post'
  });
};

/**
 * 跳过当前阶段
 */
export const skipCurrentStage = (taskId: string, reason: string): AxiosPromise<void> => {
  return request({
    url: `/erp/saltprocess/heating/task/${taskId}/skip-stage`,
    method: 'post',
    data: { reason }
  });
};

/**
 * 重新开始阶段
 */
export const restartStage = (taskId: string, stageId: string): AxiosPromise<void> => {
  return request({
    url: `/erp/saltprocess/heating/task/${taskId}/restart-stage/${stageId}`,
    method: 'post'
  });
};

// 阶段配置管理接口

/**
 * 获取阶段配置列表
 */
export const getHeatingStageConfigs = (): AxiosPromise<HeatingStageConfig[]> => {
  return request({
    url: '/erp/saltprocess/heating/stage-config/list',
    method: 'get'
  });
};

/**
 * 获取阶段配置详情
 */
export const getHeatingStageConfig = (id: string): AxiosPromise<HeatingStageConfig> => {
  return request({
    url: `/erp/saltprocess/heating/stage-config/${id}`,
    method: 'get'
  });
};

// 提温数据记录接口

/**
 * 查询提温数据记录
 */
export const listHeatingData = (taskId: string, stageId?: string, startTime?: string, endTime?: string): AxiosPromise<HeatingDataVO[]> => {
  return request({
    url: '/erp/saltprocess/heating/data/list',
    method: 'get',
    params: { taskId, stageId, startTime, endTime }
  });
};

/**
 * 添加提温数据记录
 */
export const addHeatingData = (data: HeatingDataForm): AxiosPromise<HeatingDataVO> => {
  return request({
    url: '/erp/saltprocess/heating/data',
    method: 'post',
    data
  });
};

/**
 * 批量添加提温数据记录
 */
export const batchAddHeatingData = (dataList: HeatingDataForm[]): AxiosPromise<void> => {
  return request({
    url: '/erp/saltprocess/heating/data/batch',
    method: 'post',
    data: dataList
  });
};

// 实时监控接口

/**
 * 获取提温实时数据
 */
export const getHeatingRealtimeData = (taskId: string): AxiosPromise<HeatingRealtimeData> => {
  return request({
    url: `/erp/saltprocess/heating/realtime/${taskId}`,
    method: 'get'
  });
};

/**
 * 获取温度曲线数据
 */
export const getHeatingTemperatureCurve = (taskId: string, startTime?: string, endTime?: string): AxiosPromise<HeatingTemperatureCurveData> => {
  return request({
    url: `/erp/saltprocess/heating/curve/temperature/${taskId}`,
    method: 'get',
    params: { startTime, endTime }
  });
};

// 报警管理接口

/**
 * 获取提温报警列表
 */
export const getHeatingAlerts = (taskId?: string, status?: string): AxiosPromise<HeatingAlert[]> => {
  return request({
    url: '/erp/saltprocess/heating/alert/list',
    method: 'get',
    params: { taskId, status }
  });
};

/**
 * 处理报警
 */
export const handleHeatingAlert = (alertId: string, action: string): AxiosPromise<void> => {
  return request({
    url: `/erp/saltprocess/heating/alert/${alertId}/handle`,
    method: 'post',
    data: { action }
  });
};

/**
 * 关闭报警
 */
export const closeHeatingAlert = (alertId: string): AxiosPromise<void> => {
  return request({
    url: `/erp/saltprocess/heating/alert/${alertId}/close`,
    method: 'post'
  });
};

// 巡检管理接口

/**
 * 查询提温巡检记录
 */
export const listHeatingInspection = (taskId?: string): AxiosPromise<HeatingInspectionVO[]> => {
  return request({
    url: '/erp/saltprocess/heating/inspection/list',
    method: 'get',
    params: { taskId }
  });
};

/**
 * 创建提温巡检记录
 */
export const createHeatingInspection = (data: any): AxiosPromise<HeatingInspectionVO> => {
  return request({
    url: '/erp/saltprocess/heating/inspection',
    method: 'post',
    data
  });
};

/**
 * 获取巡检详情
 */
export const getHeatingInspection = (id: string): AxiosPromise<HeatingInspectionVO> => {
  return request({
    url: `/erp/saltprocess/heating/inspection/${id}`,
    method: 'get'
  });
};

// 设备状态接口

/**
 * 获取提温设备状态
 */
export const getHeatingEquipmentStatus = (taskId?: string): AxiosPromise<HeatingEquipmentStatus[]> => {
  return request({
    url: '/erp/saltprocess/heating/equipment/status',
    method: 'get',
    params: { taskId }
  });
};

/**
 * 更新设备状态
 */
export const updateHeatingEquipmentStatus = (equipmentId: string, status: string): AxiosPromise<void> => {
  return request({
    url: `/erp/saltprocess/heating/equipment/${equipmentId}/status`,
    method: 'put',
    data: { status }
  });
};

// 工艺参数接口

/**
 * 获取工艺参数
 */
export const getHeatingProcessParams = (taskId: string): AxiosPromise<HeatingProcessParams> => {
  return request({
    url: `/erp/saltprocess/heating/params/${taskId}`,
    method: 'get'
  });
};

/**
 * 更新工艺参数
 */
export const updateHeatingProcessParams = (taskId: string, params: Partial<HeatingProcessParams>): AxiosPromise<void> => {
  return request({
    url: `/erp/saltprocess/heating/params/${taskId}`,
    method: 'put',
    data: params
  });
};

// 统计分析接口

/**
 * 获取提温统计数据
 */
export const getHeatingStatistics = (period?: string): AxiosPromise<HeatingStatistics> => {
  return request({
    url: '/erp/saltprocess/heating/statistics',
    method: 'get',
    params: { period }
  });
};

/**
 * 生成提温报告
 */
export const generateHeatingReport = (taskId: string): AxiosPromise<HeatingReport> => {
  return request({
    url: `/erp/saltprocess/heating/report/${taskId}`,
    method: 'get'
  });
};

// 导出接口

/**
 * 导出提温任务列表
 */
export const exportHeatingTaskList = (query?: HeatingTaskQuery): AxiosPromise<Blob> => {
  return request({
    url: '/erp/saltprocess/heating/task/export',
    method: 'get',
    params: query,
    responseType: 'blob'
  });
};

/**
 * 导出提温数据
 */
export const exportHeatingData = (taskId: string, startTime?: string, endTime?: string): AxiosPromise<Blob> => {
  return request({
    url: '/erp/saltprocess/heating/data/export',
    method: 'get',
    params: { taskId, startTime, endTime },
    responseType: 'blob'
  });
};

/**
 * 导出提温报告
 */
export const exportHeatingReport = (taskId: string): AxiosPromise<Blob> => {
  return request({
    url: `/erp/saltprocess/heating/report/${taskId}/export`,
    method: 'get',
    responseType: 'blob'
  });
};
