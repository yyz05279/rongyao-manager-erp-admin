/**
 * 库存管理模块 - API接口
 */
import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import {
  InventoryQuery,
  InventoryVO,
  InventoryForm,
  StockTransactionQuery,
  StockTransactionVO,
  StockTransactionForm,
  StockAdjustmentVO,
  StockAdjustmentForm,
  InventoryAlert,
  InventoryCountVO,
  InventoryCountForm,
  InventoryCountDetailVO,
  InventoryCountDetailForm,
  InventoryStatistics,
  InventoryTurnoverAnalysis,
  ABCAnalysis,
  InventoryReport
} from './types';
import { ApiResponse, PageResult } from '../types';

// 库存基础管理接口

/**
 * 查询库存列表
 */
export const listInventory = (query?: InventoryQuery): AxiosPromise<PageResult<InventoryVO>> => {
  return request({
    url: '/erp/saltprocess/inventory/list',
    method: 'get',
    params: query
  });
};

/**
 * 获取库存详情
 */
export const getInventory = (id: string): AxiosPromise<InventoryVO> => {
  return request({
    url: `/erp/saltprocess/inventory/${id}`,
    method: 'get'
  });
};

/**
 * 创建库存记录
 */
export const createInventory = (data: InventoryForm): AxiosPromise<InventoryVO> => {
  return request({
    url: '/erp/saltprocess/inventory',
    method: 'post',
    data
  });
};

/**
 * 更新库存记录
 */
export const updateInventory = (data: InventoryForm): AxiosPromise<InventoryVO> => {
  return request({
    url: '/erp/saltprocess/inventory',
    method: 'put',
    data
  });
};

/**
 * 删除库存记录
 */
export const deleteInventory = (ids: string[]): AxiosPromise<void> => {
  return request({
    url: `/erp/saltprocess/inventory/${ids.join(',')}`,
    method: 'delete'
  });
};

/**
 * 获取库存实时状态
 */
export const getInventoryRealtime = (materialId: string): AxiosPromise<InventoryVO> => {
  return request({
    url: `/erp/saltprocess/inventory/realtime/${materialId}`,
    method: 'get'
  });
};

/**
 * 获取物料详情
 */
export const getInventoryMaterial = (materialId: string): AxiosPromise<any> => {
  return request({
    url: `/erp/saltprocess/inventory/material/${materialId}`,
    method: 'get'
  });
};

/**
 * 新增物料
 */
export const addInventoryMaterial = (data: any): AxiosPromise<void> => {
  return request({
    url: '/erp/saltprocess/inventory/material',
    method: 'post',
    data
  });
};

/**
 * 更新物料
 */
export const updateInventoryMaterial = (data: any): AxiosPromise<void> => {
  return request({
    url: '/erp/saltprocess/inventory/material',
    method: 'put',
    data
  });
};

/**
 * 获取库存明细
 */
export const getInventoryDetails = (materialId: string): AxiosPromise<any[]> => {
  return request({
    url: `/erp/saltprocess/inventory/material/${materialId}/details`,
    method: 'get'
  });
};

/**
 * 新增库存明细
 */
export const addInventoryDetail = (data: any): AxiosPromise<void> => {
  return request({
    url: '/erp/saltprocess/inventory/detail',
    method: 'post',
    data
  });
};

/**
 * 更新库存明细
 */
export const updateInventoryDetail = (data: any): AxiosPromise<void> => {
  return request({
    url: '/erp/saltprocess/inventory/detail',
    method: 'put',
    data
  });
};

/**
 * 删除库存明细
 */
export const deleteInventoryDetail = (detailId: string): AxiosPromise<void> => {
  return request({
    url: `/erp/saltprocess/inventory/detail/${detailId}`,
    method: 'delete'
  });
};

/**
 * 获取库位列表
 */
export const getLocationList = (): AxiosPromise<any[]> => {
  return request({
    url: '/erp/saltprocess/inventory/location/list',
    method: 'get'
  });
};

/**
 * 获取供应商列表
 */
export const getSupplierList = (): AxiosPromise<any[]> => {
  return request({
    url: '/erp/saltprocess/inventory/supplier/list',
    method: 'get'
  });
};

/**
 * 获取仓库列表
 */
export const getWarehouseList = (): AxiosPromise<any[]> => {
  return request({
    url: '/erp/saltprocess/inventory/warehouse/list',
    method: 'get'
  });
};

/**
 * 查询物料库存列表
 */
export const listInventoryMaterial = (query?: any): AxiosPromise<any> => {
  return request({
    url: '/erp/saltprocess/inventory/material/list',
    method: 'get',
    params: query
  });
};

/**
 * 删除物料
 */
export const deleteInventoryMaterial = (materialIds: string | string[]): AxiosPromise<void> => {
  return request({
    url: `/erp/saltprocess/inventory/material/${materialIds}`,
    method: 'delete'
  });
};

/**
 * 获取库存概览
 */
export const getInventoryOverview = (): AxiosPromise<any> => {
  return request({
    url: '/erp/saltprocess/inventory/overview',
    method: 'get'
  });
};

// 出入库管理接口

/**
 * 查询出入库记录
 */
export const listStockTransaction = (query?: StockTransactionQuery): AxiosPromise<PageResult<StockTransactionVO>> => {
  return request({
    url: '/erp/saltprocess/inventory/transaction/list',
    method: 'get',
    params: query
  });
};

/**
 * 创建出入库记录
 */
export const createStockTransaction = (data: StockTransactionForm): AxiosPromise<StockTransactionVO> => {
  return request({
    url: '/erp/saltprocess/inventory/transaction',
    method: 'post',
    data
  });
};

/**
 * 批量出库
 */
export const batchOutbound = (transactions: StockTransactionForm[]): AxiosPromise<void> => {
  return request({
    url: '/erp/saltprocess/inventory/transaction/batch-outbound',
    method: 'post',
    data: transactions
  });
};

/**
 * 批量入库
 */
export const batchInbound = (transactions: StockTransactionForm[]): AxiosPromise<void> => {
  return request({
    url: '/erp/saltprocess/inventory/transaction/batch-inbound',
    method: 'post',
    data: transactions
  });
};

/**
 * 获取出入库统计
 */
export const getTransactionStatistics = (startTime: string, endTime: string): AxiosPromise<any> => {
  return request({
    url: '/erp/saltprocess/inventory/transaction/statistics',
    method: 'get',
    params: { startTime, endTime }
  });
};

// 库存调整接口

/**
 * 查询库存调整记录
 */
export const listStockAdjustment = (query?: any): AxiosPromise<PageResult<StockAdjustmentVO>> => {
  return request({
    url: '/erp/saltprocess/inventory/adjustment/list',
    method: 'get',
    params: query
  });
};

/**
 * 创建库存调整
 */
export const createStockAdjustment = (data: StockAdjustmentForm): AxiosPromise<StockAdjustmentVO> => {
  return request({
    url: '/erp/saltprocess/inventory/adjustment',
    method: 'post',
    data
  });
};

/**
 * 审批库存调整
 */
export const approveStockAdjustment = (id: string, approved: boolean, comments?: string): AxiosPromise<void> => {
  return request({
    url: `/erp/saltprocess/inventory/adjustment/${id}/approve`,
    method: 'put',
    data: { approved, comments }
  });
};

// 库存预警接口

/**
 * 获取库存预警列表
 */
export const getInventoryAlerts = (status?: string): AxiosPromise<InventoryAlert[]> => {
  return request({
    url: '/erp/saltprocess/inventory/alert/list',
    method: 'get',
    params: { status }
  });
};

/**
 * 处理库存预警
 */
export const handleInventoryAlert = (alertId: string, action: string): AxiosPromise<void> => {
  return request({
    url: `/erp/saltprocess/inventory/alert/${alertId}/handle`,
    method: 'post',
    data: { action }
  });
};

/**
 * 关闭库存预警
 */
export const closeInventoryAlert = (alertId: string): AxiosPromise<void> => {
  return request({
    url: `/erp/saltprocess/inventory/alert/${alertId}/close`,
    method: 'post'
  });
};

// 库存盘点接口

/**
 * 查询盘点任务列表
 */
export const listInventoryCount = (query?: any): AxiosPromise<PageResult<InventoryCountVO>> => {
  return request({
    url: '/erp/saltprocess/inventory/count/list',
    method: 'get',
    params: query
  });
};

/**
 * 创建盘点任务
 */
export const createInventoryCount = (data: InventoryCountForm): AxiosPromise<InventoryCountVO> => {
  return request({
    url: '/erp/saltprocess/inventory/count',
    method: 'post',
    data
  });
};

/**
 * 获取盘点详情
 */
export const getInventoryCount = (id: string): AxiosPromise<InventoryCountVO> => {
  return request({
    url: `/erp/saltprocess/inventory/count/${id}`,
    method: 'get'
  });
};

/**
 * 开始盘点
 */
export const startInventoryCount = (id: string): AxiosPromise<void> => {
  return request({
    url: `/erp/saltprocess/inventory/count/${id}/start`,
    method: 'post'
  });
};

/**
 * 完成盘点
 */
export const completeInventoryCount = (id: string): AxiosPromise<void> => {
  return request({
    url: `/erp/saltprocess/inventory/count/${id}/complete`,
    method: 'post'
  });
};

/**
 * 获取盘点明细
 */
export const getInventoryCountDetails = (countId: string): AxiosPromise<InventoryCountDetailVO[]> => {
  return request({
    url: `/erp/saltprocess/inventory/count/${countId}/details`,
    method: 'get'
  });
};

/**
 * 提交盘点明细
 */
export const submitInventoryCountDetail = (data: InventoryCountDetailForm): AxiosPromise<InventoryCountDetailVO> => {
  return request({
    url: '/erp/saltprocess/inventory/count/detail',
    method: 'post',
    data
  });
};

/**
 * 批量提交盘点明细
 */
export const batchSubmitInventoryCountDetails = (details: InventoryCountDetailForm[]): AxiosPromise<void> => {
  return request({
    url: '/erp/saltprocess/inventory/count/detail/batch',
    method: 'post',
    data: details
  });
};

// 统计分析接口

/**
 * 获取库存统计数据
 */
export const getInventoryStatistics = (period?: string): AxiosPromise<InventoryStatistics> => {
  return request({
    url: '/erp/saltprocess/inventory/statistics',
    method: 'get',
    params: { period }
  });
};

/**
 * 获取库存周转分析
 */
export const getInventoryTurnoverAnalysis = (period?: string): AxiosPromise<InventoryTurnoverAnalysis[]> => {
  return request({
    url: '/erp/saltprocess/inventory/analysis/turnover',
    method: 'get',
    params: { period }
  });
};

/**
 * 获取ABC分析
 */
export const getABCAnalysis = (period?: string): AxiosPromise<ABCAnalysis[]> => {
  return request({
    url: '/erp/saltprocess/inventory/analysis/abc',
    method: 'get',
    params: { period }
  });
};

/**
 * 生成库存报告
 */
export const generateInventoryReport = (reportType: string, params?: any): AxiosPromise<InventoryReport> => {
  return request({
    url: '/erp/saltprocess/inventory/report/generate',
    method: 'post',
    data: { reportType, ...params }
  });
};

// 导出接口

/**
 * 导出库存列表
 */
export const exportInventoryList = (query?: InventoryQuery): AxiosPromise<Blob> => {
  return request({
    url: '/erp/saltprocess/inventory/export',
    method: 'get',
    params: query,
    responseType: 'blob'
  });
};

/**
 * 导出出入库记录
 */
export const exportStockTransactions = (query?: StockTransactionQuery): AxiosPromise<Blob> => {
  return request({
    url: '/erp/saltprocess/inventory/transaction/export',
    method: 'get',
    params: query,
    responseType: 'blob'
  });
};

/**
 * 导出盘点结果
 */
export const exportInventoryCountResult = (countId: string): AxiosPromise<Blob> => {
  return request({
    url: `/erp/saltprocess/inventory/count/${countId}/export`,
    method: 'get',
    responseType: 'blob'
  });
};

/**
 * 导出库存报告
 */
export const exportInventoryReport = (reportType: string, params?: any): AxiosPromise<Blob> => {
  return request({
    url: '/erp/saltprocess/inventory/report/export',
    method: 'post',
    data: { reportType, ...params },
    responseType: 'blob'
  });
};
