/**
 * 项目子系统管理 - API接口
 */
import request from '@/utils/request';
import { AxiosPromise } from 'axios';

/**
 * 项目子系统详情VO
 */
export interface ProjectSubsystemDetailVO {
  id: string | number;
  projectSystemId: string | number;
  projectId: string | number;
  templateId?: string | number;
  subsystemCode: string;
  subsystemName: string;
  subsystemType: string;
  category?: string;
  specification?: string;
  model?: string;
  manufacturer?: string;
  description?: string;
  itemCount?: number;
  materialCount?: number;
  totalWeight?: number | string;
  status: string;
  sequenceNumber?: number;
  remarks?: string;
  version?: number;
  createTime?: string;
  updateTime?: string;
}

/**
 * 更新项目子系统 - 表单
 */
export interface ProjectSubsystemUpdateForm {
  id: string | number;
  subsystemName: string;
  category?: string | null;
  subsystemType?: string | null;
  description?: string | null;
  status?: string | null;
  remarks?: string | null;
}

/**
 * 查询项目子系统详情
 * @param id 子系统ID
 */
export const getProjectSubsystem = (id: string | number): AxiosPromise<ProjectSubsystemDetailVO> => {
  return request({
    url: `/erp/saltprocess/projectSubsystem/${id}`,
    method: 'get'
  });
};

/**
 * 修改项目子系统
 */
export const updateProjectSubsystem = (data: ProjectSubsystemUpdateForm): AxiosPromise<void> => {
  return request({
    url: '/erp/saltprocess/projectSubsystem',
    method: 'put',
    data
  });
};

/**
 * 删除项目子系统
 */
export const deleteProjectSubsystem = (id: string | number): AxiosPromise<void> => {
  return request({
    url: `/erp/saltprocess/projectSubsystem/${id}`,
    method: 'delete'
  });
};

