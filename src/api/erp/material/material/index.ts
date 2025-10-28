import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { MaterialVO, MaterialForm, MaterialQuery } from '@/api/erp/material/material/types';

/**
 * 查询物料列表
 * @param query
 * @returns {*}
 */
export const listMaterial = (query?: MaterialQuery): AxiosPromise<MaterialVO[]> => {
  return request({
    url: '/erp/saltprocess/material/item/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询物料详细
 * @param id
 */
export const getMaterial = (id: string | number): AxiosPromise<MaterialVO> => {
  return request({
    url: '/erp/saltprocess/material/item/' + id,
    method: 'get'
  });
};

/**
 * 新增物料
 * @param data
 */
export const addMaterial = (data: MaterialForm) => {
  return request({
    url: '/erp/saltprocess/material/item',
    method: 'post',
    data: data
  });
};

/**
 * 修改物料
 * @param data
 */
export const updateMaterial = (data: MaterialForm) => {
  return request({
    url: '/erp/saltprocess/material/item',
    method: 'put',
    data: data
  });
};

/**
 * 批量更新物料
 * @param items 物料数组
 */
export const batchUpdateMaterial = (items: MaterialForm[]) => {
  return request({
    url: '/erp/saltprocess/material/item/batch',
    method: 'put',
    data: items
  });
};

/**
 * 删除物料
 * @param id
 */
export const delMaterial = (id: string | number | Array<string | number>) => {
  return request({
    url: '/erp/saltprocess/material/item/' + id,
    method: 'delete'
  });
};

/**
 * 更新物料数量
 * @param id 物料ID
 * @param quantity 新数量
 */
export const updateMaterialQuantity = (id: string | number, quantity: number) => {
  return request({
    url: `/erp/saltprocess/material/item/${id}/quantity`,
    method: 'put',
    params: { quantity }
  });
};

/**
 * 查询易碎品列表
 * @param shippingListId 清单ID
 */
export const getFragileMaterials = (shippingListId: string | number): AxiosPromise<MaterialVO[]> => {
  return request({
    url: `/erp/saltprocess/material/item/fragile/${shippingListId}`,
    method: 'get'
  });
};

/**
 * 查询危险品列表
 * @param shippingListId 清单ID
 */
export const getHazardousMaterials = (shippingListId: string | number): AxiosPromise<MaterialVO[]> => {
  return request({
    url: `/erp/saltprocess/material/item/hazardous/${shippingListId}`,
    method: 'get'
  });
};

/**
 * 导出物料列表
 */
export const exportMaterial = (query?: MaterialQuery) => {
  return request({
    url: '/erp/saltprocess/material/item/export',
    method: 'post',
    data: query
  });
};

