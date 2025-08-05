/**
 * 财务管理 - 收款单API接口定义
 * 基于RuoYi-Vue-Plus架构设计
 */

import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { 
  ReceiptVO, 
  ReceiptForm, 
  ReceiptQuery, 
  ReceiptApprovalForm,
  ReceiptStatistics,
  ReceiptExportQuery,
  ReceiptReconciliation
} from './receipt-api-types';

/**
 * 查询收款单列表
 * @param query 查询参数
 * @returns 收款单列表
 */
export const listReceipt = (query?: ReceiptQuery): AxiosPromise<ReceiptVO[]> => {
  return request({
    url: '/erp/finance/receipt/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询收款单详细信息
 * @param id 收款单ID
 * @returns 收款单详细信息
 */
export const getReceipt = (id: string | number): AxiosPromise<ReceiptVO> => {
  return request({
    url: `/erp/finance/receipt/${id}`,
    method: 'get'
  });
};

/**
 * 根据编号查询收款单
 * @param no 收款单编号
 * @returns 收款单详细信息
 */
export const getReceiptByNo = (no: string): AxiosPromise<ReceiptVO> => {
  return request({
    url: `/erp/finance/receipt/no/${no}`,
    method: 'get'
  });
};

/**
 * 新增收款单
 * @param data 收款单表单数据
 * @returns 操作结果
 */
export const addReceipt = (data: ReceiptForm) => {
  return request({
    url: '/erp/finance/receipt',
    method: 'post',
    data: data
  });
};

/**
 * 修改收款单
 * @param data 收款单表单数据
 * @returns 操作结果
 */
export const updateReceipt = (data: ReceiptForm) => {
  return request({
    url: '/erp/finance/receipt',
    method: 'put',
    data: data
  });
};

/**
 * 删除收款单
 * @param id 收款单ID或ID数组
 * @returns 操作结果
 */
export const delReceipt = (id: string | number | Array<string | number>) => {
  return request({
    url: `/erp/finance/receipt/${id}`,
    method: 'delete'
  });
};

/**
 * 提交收款单审批
 * @param id 收款单ID
 * @returns 操作结果
 */
export const submitReceiptApproval = (id: string | number) => {
  return request({
    url: `/erp/finance/receipt/${id}/submit`,
    method: 'post'
  });
};

/**
 * 审批收款单
 * @param data 审批表单数据
 * @returns 操作结果
 */
export const approveReceipt = (data: ReceiptApprovalForm) => {
  return request({
    url: '/erp/finance/receipt/approve',
    method: 'post',
    data: data
  });
};

/**
 * 撤回收款单
 * @param id 收款单ID
 * @param reason 撤回原因
 * @returns 操作结果
 */
export const withdrawReceipt = (id: string | number, reason?: string) => {
  return request({
    url: `/erp/finance/receipt/${id}/withdraw`,
    method: 'post',
    data: { reason }
  });
};

/**
 * 取消收款单
 * @param id 收款单ID
 * @param reason 取消原因
 * @returns 操作结果
 */
export const cancelReceipt = (id: string | number, reason?: string) => {
  return request({
    url: `/erp/finance/receipt/${id}/cancel`,
    method: 'post',
    data: { reason }
  });
};

/**
 * 确认收款
 * @param id 收款单ID
 * @param actualAmount 实际收款金额
 * @param receiptDate 实际收款日期
 * @returns 操作结果
 */
export const confirmReceipt = (
  id: string | number, 
  actualAmount?: number, 
  receiptDate?: string
) => {
  return request({
    url: `/erp/finance/receipt/${id}/confirm`,
    method: 'post',
    data: { actualAmount, receiptDate }
  });
};

/**
 * 复制收款单
 * @param id 源收款单ID
 * @returns 新收款单数据
 */
export const copyReceipt = (id: string | number): AxiosPromise<ReceiptForm> => {
  return request({
    url: `/erp/finance/receipt/${id}/copy`,
    method: 'post'
  });
};

/**
 * 获取收款单统计信息
 * @param query 查询条件
 * @returns 统计信息
 */
export const getReceiptStatistics = (query?: ReceiptQuery): AxiosPromise<ReceiptStatistics> => {
  return request({
    url: '/erp/finance/receipt/statistics',
    method: 'get',
    params: query
  });
};

/**
 * 导出收款单
 * @param query 导出查询参数
 * @returns 文件流
 */
export const exportReceipt = (query?: ReceiptExportQuery) => {
  return request({
    url: '/erp/finance/receipt/export',
    method: 'post',
    data: query,
    responseType: 'blob'
  });
};

/**
 * 下载收款单模板
 * @returns 模板文件流
 */
export const downloadReceiptTemplate = () => {
  return request({
    url: '/erp/finance/receipt/template',
    method: 'get',
    responseType: 'blob'
  });
};

/**
 * 导入收款单
 * @param file 文件
 * @returns 导入结果
 */
export const importReceipt = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  return request({
    url: '/erp/finance/receipt/import',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

/**
 * 获取收款单编号
 * @returns 新的收款单编号
 */
export const generateReceiptNo = (): AxiosPromise<string> => {
  return request({
    url: '/erp/finance/receipt/generateNo',
    method: 'get'
  });
};

/**
 * 批量操作收款单
 * @param ids 收款单ID数组
 * @param action 操作类型
 * @param data 操作数据
 * @returns 操作结果
 */
export const batchOperateReceipt = (
  ids: Array<string | number>, 
  action: 'SUBMIT' | 'APPROVE' | 'REJECT' | 'CANCEL' | 'DELETE',
  data?: any
) => {
  return request({
    url: '/erp/finance/receipt/batch',
    method: 'post',
    data: { ids, action, ...data }
  });
};

/**
 * 获取收款单审批历史
 * @param id 收款单ID
 * @returns 审批历史记录
 */
export const getReceiptApprovalHistory = (id: string | number) => {
  return request({
    url: `/erp/finance/receipt/${id}/approval-history`,
    method: 'get'
  });
};

/**
 * 获取收款单关联的销售订单
 * @param customerId 客户ID
 * @returns 销售订单列表
 */
export const getRelatedSaleOrders = (customerId: string | number) => {
  return request({
    url: `/erp/finance/receipt/related-orders/${customerId}`,
    method: 'get'
  });
};

/**
 * 收款单对账
 * @param data 对账数据
 * @returns 对账结果
 */
export const reconcileReceipt = (data: ReceiptReconciliation) => {
  return request({
    url: '/erp/finance/receipt/reconcile',
    method: 'post',
    data: data
  });
};

/**
 * 获取收款单对账记录
 * @param id 收款单ID
 * @returns 对账记录
 */
export const getReceiptReconciliation = (id: string | number) => {
  return request({
    url: `/erp/finance/receipt/${id}/reconciliation`,
    method: 'get'
  });
};
