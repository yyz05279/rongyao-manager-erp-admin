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
  totalWeight?: number;
  status: string;
  sequenceNumber?: number;
  remarks?: string;
  version?: number;
  createTime?: string;
  updateTime?: string;
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

