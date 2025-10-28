import request from '@/utils/request';
import type { AxiosPromise } from 'axios';
import type { MaterialQuery, MaterialVO, MaterialImportBo, MaterialImportResultVo, ProductMatchRequest, ProductMatchResponse } from './types';

/**
 * 查询物料列表
 */
export function listMaterial(query?: MaterialQuery): AxiosPromise<{ rows: MaterialVO[]; total: number }> {
  return request({
    url: '/erp/saltprocess/material/list',
    method: 'get',
    params: query
  });
}

/**
 * 获取物料详情
 */
export function getMaterial(materialId: string | number): AxiosPromise<MaterialVO> {
  return request({
    url: '/erp/saltprocess/material/' + materialId,
    method: 'get'
  });
}

/**
 * 新增物料
 */
export function addMaterial(data: MaterialVO): AxiosPromise<void> {
  return request({
    url: '/erp/saltprocess/material',
    method: 'post',
    data: data
  });
}

/**
 * 修改物料
 */
export function updateMaterial(data: MaterialVO): AxiosPromise<void> {
  return request({
    url: '/erp/saltprocess/material',
    method: 'put',
    data: data
  });
}

/**
 * 批量更新物料明细
 * @param items 物料明细数组
 */
export function batchUpdateMaterialItems(items: any[]): AxiosPromise<void> {
  return request({
    url: '/erp/saltprocess/material/item/batch',
    method: 'put',
    data: items
  });
}

/**
 * 单个更新物料明细
 * @param data 物料明细数据
 */
export function updateMaterialItem(data: any): AxiosPromise<void> {
  return request({
    url: '/erp/saltprocess/material/item',
    method: 'put',
    data: data
  });
}

/**
 * 删除物料
 */
export function deleteMaterial(materialIds: string | string[]): AxiosPromise<void> {
  return request({
    url: '/erp/saltprocess/material/' + materialIds,
    method: 'delete'
  });
}

/**
 * 导入前端解析的物料清单数据
 */
export function importParsedMaterialData(data: MaterialImportBo): AxiosPromise<MaterialImportResultVo> {
  return request({
    url: '/erp/saltprocess/material/frontend-import/data',
    method: 'post',
    data: data
  });
}

/**
 * 验证前端解析的物料数据
 */
export function validateParsedMaterialData(data: MaterialImportBo): AxiosPromise<MaterialImportResultVo> {
  return request({
    url: '/erp/saltprocess/material/frontend-import/validate',
    method: 'post',
    data: data
  });
}

/**
 * 匹配现有产品
 */
export function matchExistingProduct(materialName: string, specification?: string): AxiosPromise<ProductMatchResponse> {
  return request({
    url: '/erp/saltprocess/material/frontend-import/match-product',
    method: 'get',
    params: {
      materialName,
      specification
    }
  });
}

/**
 * 批量匹配产品
 */
export function batchMatchProducts(matchRequests: ProductMatchRequest[]): AxiosPromise<ProductMatchResponse[]> {
  return request({
    url: '/erp/saltprocess/material/frontend-import/batch-match-products',
    method: 'post',
    data: matchRequests
  });
}

/**
 * 获取产品分类列表
 */
export function getProductCategories(): AxiosPromise<any[]> {
  return request({
    url: '/erp/saltprocess/material/frontend-import/product-categories',
    method: 'get'
  });
}

/**
 * 获取常用单位列表
 */
export function getCommonUnits(): AxiosPromise<string[]> {
  return request({
    url: '/erp/saltprocess/material/frontend-import/common-units',
    method: 'get'
  });
}

/**
 * 导出物料列表
 */
export function exportMaterialList(query?: MaterialQuery): Promise<void> {
  return request({
    url: '/erp/saltprocess/material/export',
    method: 'get',
    params: query,
    responseType: 'blob'
  });
}
