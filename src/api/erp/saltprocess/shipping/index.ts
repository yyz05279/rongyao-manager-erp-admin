/**
 * 项目发货清单管理模块 - API接口
 */
import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import {
  ShippingListVO,
  ShippingListForm,
  ShippingListQuery,
  ShippingItemVO,
  ShippingItemForm,
  ShippingStatistics,
  ShippingExcelImportResult,
  ShippingExcelImportConfig,
  ShippingTrackingRecord,
  ShippingAttachment,
  ShippingExportParams,
  ShippingItemsExportParams,
  EnhancedShippingListForm,
  EnhancedShippingItemForm
} from './types';
import { ApiResponse, PageResult } from '../types';

// 发货清单管理接口

/**
 * 查询发货清单列表
 */
export const listShippingList = (query?: ShippingListQuery): AxiosPromise<PageResult<ShippingListVO>> => {
  return request({
    url: '/erp/saltprocess/shipping/list',
    method: 'get',
    params: query
  });
};

/**
 * 获取发货清单详情
 */
export const getShippingList = (id: string): AxiosPromise<ShippingListVO> => {
  return request({
    url: `/erp/saltprocess/shipping/${id}`,
    method: 'get'
  });
};

/**
 * 新增发货清单
 */
export const addShippingList = (data: ShippingListForm): AxiosPromise<void> => {
  return request({
    url: '/erp/saltprocess/shipping',
    method: 'post',
    data
  });
};

/**
 * 修改发货清单
 */
export const updateShippingList = (data: ShippingListForm): AxiosPromise<void> => {
  return request({
    url: '/erp/saltprocess/shipping',
    method: 'put',
    data
  });
};

/**
 * 删除发货清单
 */
export const delShippingList = (ids: string | string[]): AxiosPromise<void> => {
  return request({
    url: `/erp/saltprocess/shipping/${ids}`,
    method: 'delete'
  });
};

/**
 * 更新发货状态
 */
export const updateShippingStatus = (id: string, status: string, remarks?: string): AxiosPromise<void> => {
  return request({
    url: `/erp/saltprocess/shipping/${id}/status`,
    method: 'put',
    data: { status, remarks }
  });
};

// 发货清单明细接口

/**
 * 查询发货清单明细
 */
export const listShippingItems = (shippingListId: string): AxiosPromise<ShippingItemVO[]> => {
  return request({
    url: `/erp/saltprocess/shipping/${shippingListId}/items`,
    method: 'get'
  });
};

/**
 * 批量添加发货清单明细
 */
export const addShippingItems = (shippingListId: string, items: ShippingItemForm[]): AxiosPromise<void> => {
  return request({
    url: `/erp/saltprocess/shipping/${shippingListId}/items`,
    method: 'post',
    data: items
  });
};

/**
 * 修改发货清单明细
 */
export const updateShippingItem = (data: ShippingItemForm): AxiosPromise<void> => {
  return request({
    url: '/erp/saltprocess/shipping/item',
    method: 'put',
    data
  });
};

/**
 * 删除发货清单明细
 */
export const delShippingItem = (ids: string | string[]): AxiosPromise<void> => {
  return request({
    url: `/erp/saltprocess/shipping/item/${ids}`,
    method: 'delete'
  });
};

// Excel导入导出接口

/**
 * Excel模板下载
 */
export const downloadShippingTemplate = (templateType: string): AxiosPromise<Blob> => {
  return request({
    url: `/erp/saltprocess/shipping/template/${templateType}`,
    method: 'get',
    responseType: 'blob'
  });
};

/**
 * Excel数据导入
 */
export const importShippingExcel = (file: File, config: ShippingExcelImportConfig): AxiosPromise<ShippingExcelImportResult> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('config', JSON.stringify(config));

  return request({
    url: '/erp/saltprocess/shipping/import',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

/**
 * 导出发货清单（批量导出）
 */
export const exportShippingList = (query?: ShippingListQuery): AxiosPromise<Blob> => {
  return request({
    url: '/erp/saltprocess/shipping/export',
    method: 'post',
    data: query,
    responseType: 'blob'
  });
};

/**
 * 导出单个发货清单
 */
export const exportSingleShippingList = (id: string | number): AxiosPromise<Blob> => {
  return request({
    url: `/erp/saltprocess/shipping/export/${id}`,
    method: 'get',
    responseType: 'blob'
  });
};

/**
 * 导出发货明细汇总
 */
export const exportShippingItemsSummary = (query?: ShippingItemsExportParams): AxiosPromise<Blob> => {
  return request({
    url: '/erp/saltprocess/shipping/export-items',
    method: 'post',
    data: query,
    responseType: 'blob'
  });
};

// 统计分析接口

/**
 * 获取发货统计数据
 */
export const getShippingStatistics = (startDate?: string, endDate?: string, projectId?: string): AxiosPromise<ShippingStatistics> => {
  return request({
    url: '/erp/saltprocess/shipping/statistics',
    method: 'get',
    params: { startDate, endDate, projectId }
  });
};

// 发货跟踪接口

/**
 * 获取发货跟踪记录
 */
export const getShippingTrackingRecords = (shippingListId: string): AxiosPromise<ShippingTrackingRecord[]> => {
  return request({
    url: `/erp/saltprocess/shipping/${shippingListId}/tracking`,
    method: 'get'
  });
};

/**
 * 添加发货跟踪记录
 */
export const addShippingTrackingRecord = (data: Omit<ShippingTrackingRecord, 'id' | 'createTime'>): AxiosPromise<void> => {
  return request({
    url: '/erp/saltprocess/shipping/tracking',
    method: 'post',
    data
  });
};

// 附件管理接口

/**
 * 获取发货清单附件列表
 */
export const getShippingAttachments = (shippingListId: string): AxiosPromise<ShippingAttachment[]> => {
  return request({
    url: `/erp/saltprocess/shipping/${shippingListId}/attachments`,
    method: 'get'
  });
};

/**
 * 上传发货清单附件
 */
export const uploadShippingAttachment = (shippingListId: string, file: File, attachmentType: string): AxiosPromise<ShippingAttachment> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('attachmentType', attachmentType);

  return request({
    url: `/erp/saltprocess/shipping/${shippingListId}/attachment`,
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

/**
 * 删除发货清单附件
 */
export const delShippingAttachment = (id: string): AxiosPromise<void> => {
  return request({
    url: `/erp/saltprocess/shipping/attachment/${id}`,
    method: 'delete'
  });
};

/**
 * 下载发货清单附件
 */
export const downloadShippingAttachment = (id: string): AxiosPromise<Blob> => {
  return request({
    url: `/erp/saltprocess/shipping/attachment/${id}/download`,
    method: 'get',
    responseType: 'blob'
  });
};

// 便捷查询接口

/**
 * 获取项目简化列表（用于下拉选择）
 */
export const getProjectSimpleList = (): AxiosPromise<{ id: string; name: string }[]> => {
  return request({
    url: '/erp/saltprocess/project/simple-list',
    method: 'get'
  });
};

/**
 * 获取负责人简化列表（用于下拉选择）
 */
export const getResponsiblePersonList = (): AxiosPromise<{ id: string; name: string }[]> => {
  return request({
    url: '/system/user/simple-list',
    method: 'get'
  });
};

// 为了与Mock API保持一致，添加函数别名
export const getShippingItems = listShippingItems;
export const getTrackingRecords = getShippingTrackingRecords;
export const getAttachments = getShippingAttachments;

/**
 * 增强版发货清单导入接口
 * 包含车辆、司机、照片等增强信息
 */
export interface EnhancedShippingImportRequest {
  // 基本信息
  projectId: string;
  projectName?: string;
  batchNumber: string;
  shippingType?: string; // 发货类型（从Excel标题提取，如：机械、电控）
  shippingLocation?: string;
  responsiblePerson?: string;
  responsiblePersonId: number | string;
  shippingDate: string;
  expectedDeliveryDate?: string;
  shippingMethod?: string;

  // 子系统信息（主表级别）
  subsystem?: string; // 子系统/所属系统（如：固态处理厂），从Excel第二行提取

  // 兼容旧版字段
  vehicleInfo?: string;
  driverInfo?: string;

  // 增强版字段
  vehiclePlate?: string; // 车牌号
  vehicleDescription?: string; // 车辆描述
  driverName?: string; // 司机姓名
  driverPhone?: string; // 司机电话
  shippingPhotoUrls?: string[]; // 发货照片URL列表
  driverLicensePhotoUrls?: string[]; // 司机驾照照片URL列表

  remarks?: string;

  // 设备明细
  shippingItems: EnhancedShippingItemForm[];
}

/**
 * 增强版发货清单导入结果
 */
export interface EnhancedShippingImportResult {
  success: boolean;
  shippingListId?: string;
  listCode?: string;
  summary: string;
  errors?: string[];
}

/**
 * 增强版发货清单导入接口
 */
export const importEnhancedShippingList = (data: EnhancedShippingImportRequest): AxiosPromise<EnhancedShippingImportResult> => {
  return request({
    url: '/erp/saltprocess/shipping/import/data',
    method: 'post',
    data
  });
};
