import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { WarehouseVO, WarehouseForm, WarehouseQuery } from '@/api/erp/stock/warehouse/types';

/**
 * 查询仓库信息列表
 * @param query
 * @returns {*}
 */

export const listWarehouse = (query?: WarehouseQuery): AxiosPromise<WarehouseVO[]> => {
  return request({
    url: '/erp/warehouse/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询仓库信息详细
 * @param id
 */
export const getWarehouse = (id: string | number): AxiosPromise<WarehouseVO> => {
  return request({
    url: '/erp/warehouse/' + id,
    method: 'get'
  });
};

/**
 * 新增仓库信息
 * @param data
 */
export const addWarehouse = (data: WarehouseForm) => {
  return request({
    url: '/erp/warehouse',
    method: 'post',
    data: data
  });
};

/**
 * 修改仓库信息
 * @param data
 */
export const updateWarehouse = (data: WarehouseForm) => {
  return request({
    url: '/erp/warehouse',
    method: 'put',
    data: data
  });
};

/**
 * 删除仓库信息
 * @param id
 */
export const delWarehouse = (id: string | number | Array<string | number>) => {
  return request({
    url: '/erp/warehouse/' + id,
    method: 'delete'
  });
};
