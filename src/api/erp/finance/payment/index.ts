import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { PaymentVO, PaymentForm, PaymentQuery } from '@/api/erp/finance/payment/types';

/**
 * 查询付款单列表
 * @param query
 * @returns {*}
 */
export const listPayment = (query?: PaymentQuery): AxiosPromise<PaymentVO[]> => {
  return request({
    url: '//erp/finance/payment/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询付款单详细
 * @param id
 */
export const getPayment = (id: string | number): AxiosPromise<PaymentVO> => {
  return request({
    url: '//erp/finance/payment/' + id,
    method: 'get'
  });
};

/**
 * 新增付款单
 * @param data
 */
export const addPayment = (data: PaymentForm) => {
  return request({
    url: '//erp/finance/payment',
    method: 'post',
    data: data
  });
};

/**
 * 修改付款单
 * @param data
 */
export const updatePayment = (data: PaymentForm) => {
  return request({
    url: '//erp/finance/payment',
    method: 'put',
    data: data
  });
};

/**
 * 删除付款单
 * @param id
 */
export const delPayment = (id: string | number | Array<string | number>) => {
  return request({
    url: '//erp/finance/payment/' + id,
    method: 'delete'
  });
};

/**
 * 更新付款单状态
 * @param id
 * @param status
 */
export const updatePaymentStatus = (id: string | number, status: number) => {
  return request({
    url: '//erp/finance/payment/update-status',
    method: 'put',
    params: {
      id,
      status
    }
  });
};
