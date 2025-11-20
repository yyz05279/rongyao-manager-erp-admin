/**
 * 子系统模板管理模块 - API接口
 * 模板与项目子系统的区别：不包含项目信息和负责人信息
 *
 * @author haitang
 * @version v1.1
 * @date 2025-01-20
 *
 * 更新说明 v1.1：
 * - 修复编辑接口逻辑问题，拆分基础信息更新和子项更新接口
 * - updateSubsystemTemplate: 仅更新基础信息，不处理子项列表
 * - updateSubsystemTemplateItems: 新增接口，专门用于更新子项列表
 */
import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import {
  SubsystemTemplateQuery,
  SubsystemTemplateVO,
  SubsystemTemplateForm,
  SubsystemTemplateDetailVO,
  PageResult
} from './types';

// ==================== 子系统模板接口 ====================

/**
 * 查询子系统模板列表
 * @param query 查询参数
 * @returns 分页结果
 */
export const listSubsystemTemplate = (query?: SubsystemTemplateQuery): AxiosPromise<PageResult<SubsystemTemplateVO>> => {
  return request({
    url: '/erp/subsystem/template/list',
    method: 'get',
    params: query
  });
};

/**
 * 获取子系统模板详细信息
 * @param id 模板ID
 * @returns 模板详情
 */
export const getSubsystemTemplate = (id: string | number): AxiosPromise<SubsystemTemplateDetailVO> => {
  return request({
    url: `/erp/subsystem/template/${id}`,
    method: 'get'
  });
};

/**
 * 新增子系统模板
 * 说明：templateCode不传时，后台会自动生成唯一编号
 * @param data 模板表单数据
 */
export const addSubsystemTemplate = (data: SubsystemTemplateForm): AxiosPromise<void> => {
  return request({
    url: '/erp/subsystem/template',
    method: 'post',
    data
  });
};

/**
 * 修改子系统模板基础信息 ⭐️ v1.1 修复后
 * 功能说明：
 * - ✅ 仅更新模板的基础信息字段（名称、描述、备注、状态等）
 * - ❌ 不处理子项列表（即使传入items字段也会被忽略）
 * - 🎯 适用场景：更新模板名称、添加备注、修改描述等基础信息维护操作
 *
 * 注意事项：
 * 1. 必须传入 id 字段
 * 2. 只会更新传入的字段，未传入的字段保持不变
 * 3. 不会影响已有的子项列表
 *
 * @param data 模板基础信息（必须包含id，items字段会被忽略）
 * @version v1.1
 * @date 2025-01-20
 */
export const updateSubsystemTemplate = (data: SubsystemTemplateForm): AxiosPromise<void> => {
  return request({
    url: '/erp/subsystem/template',
    method: 'put',
    data
  });
};

/**
 * 更新子系统模板子项列表 ⭐️ v1.1 新增接口
 * 功能说明：
 * - ✅ 专门用于更新模板的子项配置
 * - ❌ 不影响模板的基础信息
 * - 🎯 适用场景：添加/修改子项、调整子项顺序、设置子项数量等
 *
 * 注意事项：
 * 1. 此操作会替换模板的所有子项（全量更新）
 * 2. 如果需要增量更新，请先查询现有子项，然后合并后再提交
 * 3. 传入空数组会清空所有子项
 *
 * @param templateId 模板ID
 * @param items 子项配置列表
 * @version v1.1
 * @date 2025-01-20
 */
export const updateSubsystemTemplateItems = (
  templateId: string | number,
  items: Array<{
    itemTemplateId: number;
    quantity?: number;
    sequenceNumber?: number;
    isRequired?: boolean;
    remarks?: string;
  }>
): AxiosPromise<void> => {
  return request({
    url: `/erp/subsystem/template/${templateId}/items`,
    method: 'put',
    data: items
  });
};

/**
 * 删除子系统模板
 * @param ids 模板ID（单个）或ID数组（多个用逗号分隔）
 */
export const delSubsystemTemplate = (ids: string | number | Array<string | number>): AxiosPromise<void> => {
  const idStr = Array.isArray(ids) ? ids.join(',') : String(ids);
  return request({
    url: `/erp/subsystem/template/${idStr}`,
    method: 'delete'
  });
};

/**
 * 复制子系统模板
 * 说明：复制后自动生成新编号，模板名称添加"-副本"后缀，状态设为DRAFT
 * @param id 源模板ID
 * @returns 新创建的模板ID
 */
export const copySubsystemTemplate = (id: string | number): AxiosPromise<number> => {
  return request({
    url: `/erp/subsystem/template/copy/${id}`,
    method: 'post'
  });
};

/**
 * 发布子系统模板
 * 说明：将模板状态从DRAFT改为ACTIVE，发布后可用于创建项目子系统
 * @param id 模板ID
 */
export const publishSubsystemTemplate = (id: string | number): AxiosPromise<void> => {
  return request({
    url: `/erp/subsystem/template/publish/${id}`,
    method: 'put'
  });
};

/**
 * 导出子系统模板列表
 * @param query 查询参数
 * @returns Excel文件流
 */
export const exportSubsystemTemplate = (query?: SubsystemTemplateQuery): AxiosPromise<Blob> => {
  return request({
    url: '/erp/subsystem/template/export',
    method: 'post',
    data: query,
    responseType: 'blob'
  });
};

/**
 * 生成子系统模板编号
 * 说明：格式为 TPL-SS-yyyyMMdd-序号，仅用于预览，新增时不传templateCode即可自动生成
 * @returns 生成的模板编号
 */
export const generateSubsystemTemplateCode = (): AxiosPromise<string> => {
  return request({
    url: '/erp/subsystem/template/generate-code',
    method: 'get'
  });
};

// ==================== 子项模板关联管理接口 ====================

/**
 * 获取模板的子项列表
 * @param templateId 子系统模板ID
 * @returns 子项列表（带关联信息）
 */
export const getTemplateItems = (templateId: string | number): AxiosPromise<any[]> => {
  return request({
    url: `/erp/subsystem/template/${templateId}/items`,
    method: 'get'
  });
};

/**
 * 从模板移除子项
 * 说明：解除子系统模板与子项模板的关联关系，自动清理该子项在该模板中的所有物料记录
 * @param templateId 子系统模板ID
 * @param itemTemplateId 子项模板ID
 */
export const removeItemFromTemplate = (
  templateId: string | number,
  itemTemplateId: string | number
): AxiosPromise<void> => {
  const url = `/erp/subsystem/template/${templateId}/items/${itemTemplateId}`;
  console.log('删除子项 API 调用:', { templateId, itemTemplateId, url });

  return request({
    url,
    method: 'delete'
  });
};

/**
 * 批量从模板移除子项
 * @param templateId 子系统模板ID
 * @param itemTemplateIds 子项模板ID数组
 */
export const batchRemoveItemsFromTemplate = (
  templateId: string | number,
  itemTemplateIds: number[]
): AxiosPromise<void> => {
  return request({
    url: `/erp/subsystem/template/${templateId}/items`,
    method: 'delete',
    data: itemTemplateIds
  });
};

/**
 * 添加子项到模板
 * 说明：将已存在的子项模板关联到子系统模板，自动同步子项的物料到子系统物料表
 * @param templateId 子系统模板ID
 * @param data 关联配置数据
 */
export const addItemToTemplate = (
  templateId: string | number,
  data: {
    itemTemplateId: string | number;
    quantity?: number;
    sequenceNumber?: number;
    isRequired?: boolean;
    remarks?: string;
  }
): AxiosPromise<void> => {
  return request({
    url: `/erp/subsystem/template/${templateId}/items`,
    method: 'post',
    data: {
      ...data,
      templateId: templateId  // 在请求体中也包含templateId
    }
  });
};

/**
 * 批量添加子项到模板
 * 说明：批量将子项模板关联到子系统模板
 * @param templateId 子系统模板ID
 * @param items 关联配置数据数组
 */
export const batchAddItemsToTemplate = (
  templateId: string | number,
  items: Array<{
    itemTemplateId: string | number;
    quantity?: number;
    sequenceNumber?: number;
    isRequired?: boolean;
    remarks?: string;
  }>
): AxiosPromise<void> => {
  // 为每个item添加templateId
  const itemsWithTemplateId = items.map(item => ({
    ...item,
    templateId: templateId
  }));
  
  return request({
    url: `/erp/subsystem/template/${templateId}/items/batch`,
    method: 'post',
    data: itemsWithTemplateId
  });
};

/**
 * 更新子项关联配置
 * 说明：更新子项在模板中的配置（数量、排序等）
 * @param templateId 子系统模板ID
 * @param itemTemplateId 子项模板ID
 * @param data 关联配置数据
 */
export const updateItemRelation = (
  templateId: string | number,
  itemTemplateId: string | number,
  data: any
): AxiosPromise<void> => {
  return request({
    url: `/erp/subsystem/template/${templateId}/items/${itemTemplateId}`,
    method: 'put',
    data
  });
};

