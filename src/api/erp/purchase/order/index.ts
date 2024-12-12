import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { PurchaseOrderVO, PurchaseOrderForm, PurchaseOrderQuery } from '@/api/erp/purchase/order/types';

/**
 * 查询采购订单列表
 * @param query
 * @returns {*}
 */

export const listPurchaseOrder = (query?: PurchaseOrderQuery): AxiosPromise<PurchaseOrderVO[]> => {
  return request({
    url: '/erp/purchaseOrder/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询采购订单详细
 * @param id
 */
export const getPurchaseOrder = (id: string | number): AxiosPromise<PurchaseOrderVO> => {
  return request({
    url: '/erp/purchaseOrder/' + id,
    method: 'get'
  });
};

/**
 * 新增采购订单
 * @param data
 */
export const addPurchaseOrder = (data: PurchaseOrderForm) => {
  return request({
    url: '/erp/purchaseOrder',
    method: 'post',
    data: data
  });
};

/**
 * 修改采购订单
 * @param data
 */
export const updatePurchaseOrder = (data: PurchaseOrderForm) => {
  return request({
    url: '/erp/purchaseOrder',
    method: 'put',
    data: data
  });
};

/**
 * 删除采购订单
 * @param id
 */
export const delPurchaseOrder = (id: string | number | Array<string | number>) => {
  return request({
    url: '/erp/purchaseOrder/' + id,
    method: 'delete'
  });
};
