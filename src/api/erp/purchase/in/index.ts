import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { PurchaseInVO, PurchaseInForm, PurchaseInQuery } from '@/api/erp/purchase/in/types';

// 导出类型
export type { PurchaseInVO, PurchaseInForm, PurchaseInQuery };

/**
 * 查询ERP 采购入库列表
 * @param query
 * @returns {*}
 */

export const listPurchaseIn = (query?: PurchaseInQuery): AxiosPromise<PurchaseInVO[]> => {
  return request({
    url: '/system/purchaseIn/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询ERP 采购入库详细
 * @param id
 */
export const getPurchaseIn = (id: string | number): AxiosPromise<PurchaseInVO> => {
  return request({
    url: '/system/purchaseIn/' + id,
    method: 'get'
  });
};

/**
 * 新增ERP 采购入库
 * @param data
 */
export const addPurchaseIn = (data: PurchaseInForm) => {
  return request({
    url: '/system/purchaseIn',
    method: 'post',
    data: data
  });
};

/**
 * 修改ERP 采购入库
 * @param data
 */
export const updatePurchaseIn = (data: PurchaseInForm) => {
  return request({
    url: '/system/purchaseIn',
    method: 'put',
    data: data
  });
};

/**
 * 删除ERP 采购入库
 * @param id
 */
export const delPurchaseIn = (id: string | number | Array<string | number>) => {
  return request({
    url: '/system/purchaseIn/' + id,
    method: 'delete'
  });
};
