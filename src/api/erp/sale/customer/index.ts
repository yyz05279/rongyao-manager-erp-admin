import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { CustomerVO, CustomerForm, CustomerQuery } from '@/api/erp/sale/customer/types';

/**
 * 查询客户信息列表
 * @param query
 * @returns {*}
 */

export const listCustomer = (query?: CustomerQuery): AxiosPromise<CustomerVO[]> => {
  return request({
    url: '/erp/customer/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询客户信息详细
 * @param id
 */
export const getCustomer = (id: string | number): AxiosPromise<CustomerVO> => {
  return request({
    url: '/erp/customer/' + id,
    method: 'get'
  });
};

/**
 * 新增客户信息
 * @param data
 */
export const addCustomer = (data: CustomerForm) => {
  return request({
    url: '/erp/customer',
    method: 'post',
    data: data
  });
};

/**
 * 修改客户信息
 * @param data
 */
export const updateCustomer = (data: CustomerForm) => {
  return request({
    url: '/erp/customer',
    method: 'put',
    data: data
  });
};

/**
 * 删除客户信息
 * @param id
 */
export const delCustomer = (id: string | number | Array<string | number>) => {
  return request({
    url: '/erp/customer/' + id,
    method: 'delete'
  });
};
/**
 * 客户状态修改
 * @param id 客户id
 * @param status 客户状态
 */
export const changeCustomerStatus = (id: string | number, status: string | number) => {
  const data = {
    id,
    status
  };
  return request({
    url: '/erp/customer/changeCustomerStatus',
    method: 'put',
    data: data
  });
};
