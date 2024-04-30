import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { SupplierVO, SupplierForm, SupplierQuery } from '@/api/erp/purchase/supplier/types';

/**
 * 查询供应商信息列表
 * @param query
 * @returns {*}
 */

export const listSupplier = (query?: SupplierQuery): AxiosPromise<SupplierVO[]> => {
  return request({
    url: '/erp/supplier/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询供应商信息详细
 * @param id
 */
export const getSupplier = (id: string | number): AxiosPromise<SupplierVO> => {
  return request({
    url: '/erp/supplier/' + id,
    method: 'get'
  });
};

/**
 * 新增供应商信息
 * @param data
 */
export const addSupplier = (data: SupplierForm) => {
  return request({
    url: '/erp/supplier',
    method: 'post',
    data: data
  });
};

/**
 * 修改供应商信息
 * @param data
 */
export const updateSupplier = (data: SupplierForm) => {
  return request({
    url: '/erp/supplier',
    method: 'put',
    data: data
  });
};

/**
 * 删除供应商信息
 * @param id
 */
export const delSupplier = (id: string | number | Array<string | number>) => {
  return request({
    url: '/erp/supplier/' + id,
    method: 'delete'
  });
};
