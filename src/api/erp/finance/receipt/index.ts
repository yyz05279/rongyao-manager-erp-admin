import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { ReceiptVO, ReceiptForm, ReceiptQuery } from '@/api/erp/finance/receipt/types';

/**
 * 查询收款单列表
 * @param query
 * @returns {*}
 */
export const listReceipt = (query?: ReceiptQuery): AxiosPromise<ReceiptVO[]> => {
  return request({
    url: '/erp/finance/receipt/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询收款单详细
 * @param id
 */
export const getReceipt = (id: string | number): AxiosPromise<ReceiptVO> => {
  return request({
    url: '/erp/finance/receipt/' + id,
    method: 'get'
  });
};

/**
 * 新增收款单
 * @param data
 */
export const addReceipt = (data: ReceiptForm) => {
  return request({
    url: '/erp/receipt',
    method: 'post',
    data: data
  });
};

/**
 * 修改收款单
 * @param data
 */
export const updateReceipt = (data: ReceiptForm) => {
  return request({
    url: '/erp/receipt',
    method: 'put',
    data: data
  });
};

/**
 * 删除收款单
 * @param id
 */
export const delReceipt = (id: string | number | Array<string | number>) => {
  return request({
    url: '/erp/finance/receipt/' + id,
    method: 'delete'
  });
};

/**
 * 更新收款单状态
 * @param id
 * @param status
 */
export const updateReceiptStatus = (id: string | number, status: number) => {
  return request({
    url: '/erp/finance/receipt/update-status',
    method: 'put',
    params: {
      id,
      status
    }
  });
};
