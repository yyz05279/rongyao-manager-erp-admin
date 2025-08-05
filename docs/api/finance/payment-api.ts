/**
 * 财务管理 - 付款单API接口定义
 * 基于RuoYi-Vue-Plus架构设计
 */

import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { 
  PaymentVO, 
  PaymentForm, 
  PaymentQuery, 
  PaymentApprovalForm,
  PaymentStatistics,
  PaymentExportQuery
} from './payment-api-types';

/**
 * 查询付款单列表
 * @param query 查询参数
 * @returns 付款单列表
 */
export const listPayment = (query?: PaymentQuery): AxiosPromise<PaymentVO[]> => {
  return request({
    url: '/erp/finance/payment/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询付款单详细信息
 * @param id 付款单ID
 * @returns 付款单详细信息
 */
export const getPayment = (id: string | number): AxiosPromise<PaymentVO> => {
  return request({
    url: `/erp/finance/payment/${id}`,
    method: 'get'
  });
};

/**
 * 根据编号查询付款单
 * @param no 付款单编号
 * @returns 付款单详细信息
 */
export const getPaymentByNo = (no: string): AxiosPromise<PaymentVO> => {
  return request({
    url: `/erp/finance/payment/no/${no}`,
    method: 'get'
  });
};

/**
 * 新增付款单
 * @param data 付款单表单数据
 * @returns 操作结果
 */
export const addPayment = (data: PaymentForm) => {
  return request({
    url: '/erp/finance/payment',
    method: 'post',
    data: data
  });
};

/**
 * 修改付款单
 * @param data 付款单表单数据
 * @returns 操作结果
 */
export const updatePayment = (data: PaymentForm) => {
  return request({
    url: '/erp/finance/payment',
    method: 'put',
    data: data
  });
};

/**
 * 删除付款单
 * @param id 付款单ID或ID数组
 * @returns 操作结果
 */
export const delPayment = (id: string | number | Array<string | number>) => {
  return request({
    url: `/erp/finance/payment/${id}`,
    method: 'delete'
  });
};

/**
 * 提交付款单审批
 * @param id 付款单ID
 * @returns 操作结果
 */
export const submitPaymentApproval = (id: string | number) => {
  return request({
    url: `/erp/finance/payment/${id}/submit`,
    method: 'post'
  });
};

/**
 * 审批付款单
 * @param data 审批表单数据
 * @returns 操作结果
 */
export const approvePayment = (data: PaymentApprovalForm) => {
  return request({
    url: '/erp/finance/payment/approve',
    method: 'post',
    data: data
  });
};

/**
 * 撤回付款单
 * @param id 付款单ID
 * @param reason 撤回原因
 * @returns 操作结果
 */
export const withdrawPayment = (id: string | number, reason?: string) => {
  return request({
    url: `/erp/finance/payment/${id}/withdraw`,
    method: 'post',
    data: { reason }
  });
};

/**
 * 取消付款单
 * @param id 付款单ID
 * @param reason 取消原因
 * @returns 操作结果
 */
export const cancelPayment = (id: string | number, reason?: string) => {
  return request({
    url: `/erp/finance/payment/${id}/cancel`,
    method: 'post',
    data: { reason }
  });
};

/**
 * 确认付款
 * @param id 付款单ID
 * @param actualAmount 实际付款金额
 * @param paymentDate 实际付款日期
 * @returns 操作结果
 */
export const confirmPayment = (
  id: string | number, 
  actualAmount?: number, 
  paymentDate?: string
) => {
  return request({
    url: `/erp/finance/payment/${id}/confirm`,
    method: 'post',
    data: { actualAmount, paymentDate }
  });
};

/**
 * 复制付款单
 * @param id 源付款单ID
 * @returns 新付款单数据
 */
export const copyPayment = (id: string | number): AxiosPromise<PaymentForm> => {
  return request({
    url: `/erp/finance/payment/${id}/copy`,
    method: 'post'
  });
};

/**
 * 获取付款单统计信息
 * @param query 查询条件
 * @returns 统计信息
 */
export const getPaymentStatistics = (query?: PaymentQuery): AxiosPromise<PaymentStatistics> => {
  return request({
    url: '/erp/finance/payment/statistics',
    method: 'get',
    params: query
  });
};

/**
 * 导出付款单
 * @param query 导出查询参数
 * @returns 文件流
 */
export const exportPayment = (query?: PaymentExportQuery) => {
  return request({
    url: '/erp/finance/payment/export',
    method: 'post',
    data: query,
    responseType: 'blob'
  });
};

/**
 * 下载付款单模板
 * @returns 模板文件流
 */
export const downloadPaymentTemplate = () => {
  return request({
    url: '/erp/finance/payment/template',
    method: 'get',
    responseType: 'blob'
  });
};

/**
 * 导入付款单
 * @param file 文件
 * @returns 导入结果
 */
export const importPayment = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return request({
    url: '/erp/finance/payment/import',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

/**
 * 获取付款单编号
 * @returns 新的付款单编号
 */
export const generatePaymentNo = (): AxiosPromise<string> => {
  return request({
    url: '/erp/finance/payment/generateNo',
    method: 'get'
  });
};

/**
 * 批量操作付款单
 * @param ids 付款单ID数组
 * @param action 操作类型
 * @param data 操作数据
 * @returns 操作结果
 */
export const batchOperatePayment = (
  ids: Array<string | number>, 
  action: 'SUBMIT' | 'APPROVE' | 'REJECT' | 'CANCEL' | 'DELETE',
  data?: any
) => {
  return request({
    url: '/erp/finance/payment/batch',
    method: 'post',
    data: { ids, action, ...data }
  });
};

/**
 * 获取付款单审批历史
 * @param id 付款单ID
 * @returns 审批历史记录
 */
export const getPaymentApprovalHistory = (id: string | number) => {
  return request({
    url: `/erp/finance/payment/${id}/approval-history`,
    method: 'get'
  });
};

/**
 * 获取付款单关联的采购订单
 * @param supplierId 供应商ID
 * @returns 采购订单列表
 */
export const getRelatedPurchaseOrders = (supplierId: string | number) => {
  return request({
    url: `/erp/finance/payment/related-orders/${supplierId}`,
    method: 'get'
  });
};
