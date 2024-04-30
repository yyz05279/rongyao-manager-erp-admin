import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { ProductCategoryVO, ProductCategoryForm, ProductCategoryQuery } from '@/api/erp/product/category/types';

/**
 * 查询产品分类列表
 * @param query
 * @returns {*}
 */

export const listProductCategory = (query?: ProductCategoryQuery): AxiosPromise<ProductCategoryVO[]> => {
  return request({
    url: '/erp/productCategory/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询产品分类详细
 * @param id
 */
export const getProductCategory = (id: string | number): AxiosPromise<ProductCategoryVO> => {
  return request({
    url: '/erp/productCategory/' + id,
    method: 'get'
  });
};

/**
 * 新增产品分类
 * @param data
 */
export const addProductCategory = (data: ProductCategoryForm) => {
  return request({
    url: '/erp/productCategory',
    method: 'post',
    data: data
  });
};

/**
 * 修改产品分类
 * @param data
 */
export const updateProductCategory = (data: ProductCategoryForm) => {
  return request({
    url: '/erp/productCategory',
    method: 'put',
    data: data
  });
};

/**
 * 删除产品分类
 * @param id
 */
export const delProductCategory = (id: string | number | Array<string | number>) => {
  return request({
    url: '/erp/productCategory/' + id,
    method: 'delete'
  });
};
