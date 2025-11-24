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
 * 新增项目子系统 - 表单
 */
export interface ProjectSubsystemAddForm {
  projectSystemId: string | number;      // ✅ 必填：项目设备系统ID
  projectId: string | number;            // ✅ 必填：项目ID
  subsystemCode: string;                 // ✅ 必填：子系统编码
  subsystemName: string;                 // ✅ 必填：子系统名称
  templateId?: string | number | null;   // ⭕ 可选：子系统模板ID
  subsystemType?: string | null;         // ⭕ 可选：子系统类型
  category?: string | null;              // ⭕ 可选：子系统分类
  specification?: string | null;         // ⭕ 可选：规格型号
  model?: string | null;                 // ⭕ 可选：型号
  manufacturer?: string | null;          // ⭕ 可选：制造商
  description?: string | null;           // ⭕ 可选：描述
  itemCount?: number | null;             // ⭕ 可选：子项数量
  materialCount?: number | null;         // ⭕ 可选：物料数量
  totalWeight?: number | null;           // ⭕ 可选：总重量(kg)
  status?: string | null;                // ⭕ 可选：状态
  sequenceNumber?: number | null;        // ⭕ 可选：排序号
  remarks?: string | null;               // ⭕ 可选：备注
}

/**
 * 更新项目子系统 - 表单
 */
export interface ProjectSubsystemUpdateForm {
  id: string | number;                   // ✅ 必填：主键ID
  projectSystemId: string | number;      // ✅ 必填：项目设备系统ID
  projectId: string | number;            // ✅ 必填：项目ID
  subsystemCode: string;                 // ✅ 必填：子系统编码
  subsystemName: string;                 // ✅ 必填：子系统名称
  templateId?: string | number | null;   // ⭕ 可选：子系统模板ID
  subsystemType?: string | null;         // ⭕ 可选：子系统类型
  category?: string | null;              // ⭕ 可选：子系统分类
  specification?: string | null;         // ⭕ 可选：规格型号
  model?: string | null;                 // ⭕ 可选：型号
  manufacturer?: string | null;          // ⭕ 可选：制造商
  description?: string | null;           // ⭕ 可选：描述
  itemCount?: number | null;             // ⭕ 可选：子项数量
  materialCount?: number | null;         // ⭕ 可选：物料数量
  totalWeight?: number | null;           // ⭕ 可选：总重量(kg)
  status?: string | null;                // ⭕ 可选：状态
  sequenceNumber?: number | null;        // ⭕ 可选：排序号
  remarks?: string | null;               // ⭕ 可选：备注
  version?: number | null;               // ⭕ 可选：版本号（乐观锁）
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
 * 新增项目子系统
 * @param data 新增表单数据
 */
export const addProjectSubsystem = (data: ProjectSubsystemAddForm): AxiosPromise<void> => {
  return request({
    url: '/erp/saltprocess/projectSubsystem',
    method: 'post',
    data
  });
};

/**
 * 修改项目子系统
 * @param data 修改表单数据
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
 * @param id 子系统ID
 */
export const deleteProjectSubsystem = (id: string | number): AxiosPromise<void> => {
  return request({
    url: `/erp/saltprocess/projectSubsystem/${id}`,
    method: 'delete'
  });
};

