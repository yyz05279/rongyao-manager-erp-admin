import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { ProductVO, ProductForm, ProductQuery } from '@/api/erp/product/product/types';
import {ProductUnitVO} from "@/api/erp/product/unit/types";

/**
 * 查询产品信息列表
 * @param query
 * @returns {*}
 */

export const listProduct = (query?: ProductQuery): AxiosPromise<ProductVO[]> => {
  return request({
    url: '/erp/product/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询产品信息详细
 * @param id
 */
export const getProduct = (id: string | number): AxiosPromise<ProductVO> => {
  return request({
    url: '/erp/product/' + id,
    method: 'get'
  });
};

/**
 * 新增产品信息
 * @param data
 */
export const addProduct = (data: ProductForm) => {
  return request({
    url: '/erp/product',
    method: 'post',
    data: data
  });
};

/**
 * 修改产品信息
 * @param data
 */
export const updateProduct = (data: ProductForm) => {
  return request({
    url: '/erp/product',
    method: 'put',
    data: data
  });
};

/**
 * 删除产品信息
 * @param id
 */
export const delProduct = (id: string | number | Array<string | number>) => {
  return request({
    url: '/erp/product/' + id,
    method: 'delete'
  });
};

/**
 * 查询产品精简列表
 * @param
 */
export const getProductSimpleList = ():AxiosPromise<ProductVO[]> => {
  return request({
    url: '/erp/product/simple-list',
    method: 'get'
  });
};
