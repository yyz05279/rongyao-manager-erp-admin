import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { AccountVO, AccountForm, AccountQuery } from '@/api/erp/finance/account/types';

/**
 * 查询ERP 结算账户列表
 * @param query
 * @returns {*}
 */

export const listAccount = (query?: AccountQuery): AxiosPromise<AccountVO[]> => {
  return request({
    url: '/erp/account/list',
    method: 'get',
    params: query
  });
};

/**
 * 查询ERP 结算账户详细
 * @param id
 */
export const getAccount = (id: string | number): AxiosPromise<AccountVO> => {
  return request({
    url: '/erp/account/' + id,
    method: 'get'
  });
};

// 修改结算账户默认状态
export function updateAccountDefaultStatus(no: string | number,id: string | number,  defaultStatus: string | number) {
  const data = {
    no,
    id,
    defaultStatus
  };
  return request({
    url: '/erp/account/changeStatus',
    method: 'put',
    data: data
  });
}

/**
 * 新增ERP 结算账户
 * @param data
 */
export const addAccount = (data: AccountForm) => {
  return request({
    url: '/erp/account',
    method: 'post',
    data: data
  });
};

/**
 * 修改ERP 结算账户
 * @param data
 */
export const updateAccount = (data: AccountForm) => {
  return request({
    url: '/erp/account',
    method: 'put',
    data: data
  });
};

/**
 * 删除ERP 结算账户
 * @param id
 */
export const delAccount = (id: string | number | Array<string | number>) => {
  return request({
    url: '/erp/account/' + id,
    method: 'delete'
  });
};
/**
 * 查询结算账户精简列表
 */
export const getAccountSimpleList = (): AxiosPromise<AccountVO[]> => {
  return request({
    url: '/erp/account/simple-list',
    method: 'get'
  });
};
