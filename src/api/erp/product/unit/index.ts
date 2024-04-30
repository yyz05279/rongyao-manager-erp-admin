import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { ProductUnitVO, ProductUnitForm, ProductUnitQuery } from '@/api/erp/product/unit/types';

/**
 * 查询产品单位列表
 * @param query
 * @returns {*}
 */

export const listProductUnit = (query?: ProductUnitQuery): AxiosPromise<ProductUnitVO[]> => {
  return request({
    url: '/erp/productUnit/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询产品单位详细
 * @param id
 */
export const getProductUnit = (id: string | number): AxiosPromise<ProductUnitVO> => {
  return request({
    url: '/erp/productUnit/' + id,
    method: 'get'
  });
};

/**
 * 新增产品单位
 * @param data
 */
export const addProductUnit = (data: ProductUnitForm) => {
  return request({
    url: '/erp/productUnit',
    method: 'post',
    data: data
  });
};

/**
 * 修改产品单位
 * @param data
 */
export const updateProductUnit = (data: ProductUnitForm) => {
  return request({
    url: '/erp/productUnit',
    method: 'put',
    data: data
  });
};

/**
 * 删除产品单位
 * @param id
 */
export const delProductUnit = (id: string | number | Array<string | number>) => {
  return request({
    url: '/erp/productUnit/' + id,
    method: 'delete'
  });
};
