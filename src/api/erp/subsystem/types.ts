/**
 * 子系统管理模块 - 类型定义
 * 基于后端 API v1.1 文档
 */

// ==================== 通用类型 ====================

/**
 * 分页查询参数
 */
export interface PageQuery {
  pageNum?: number;
  pageSize?: number;
}

/**
 * 分页响应结果
 */
export interface PageResult<T> {
  total: number;
  rows: T[];
  code?: number;
  msg?: string;
}

// ==================== 子系统相关类型 ====================

/**
 * 子系统查询参数
 */
export interface SubsystemQuery extends PageQuery {
  subsystemCode?: string;
  subsystemName?: string;
  projectId?: number;
  projectName?: string;
  category?: string;
  status?: string;
  responsiblePerson?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * 子系统状态枚举
 */
export enum SubsystemStatus {
  DRAFT = 'DRAFT',       // 草稿
  ACTIVE = 'ACTIVE',     // 生效
  INACTIVE = 'INACTIVE', // 停用
  ARCHIVED = 'ARCHIVED'  // 归档
}

/**
 * 子系统VO（返回对象）
 */
export interface SubsystemVO {
  id: number;
  subsystemCode: string;
  subsystemName: string;
  projectId: number;
  projectName: string;
  category?: string;
  description?: string;
  responsiblePerson?: string;
  responsiblePersonId?: number;
  status: string;
  totalItems: number;
  totalMaterials: number;
  totalWeight: number;
  startDate?: string;
  endDate?: string;
  priority?: number;
  remarks?: string;
  createTime: string;
  updateTime: string;
}

/**
 * 子系统表单数据
 */
export interface SubsystemForm {
  id?: number;
  subsystemCode?: string;
  subsystemName: string;
  projectId: number;
  projectName: string;
  category?: string;
  description?: string;
  responsiblePerson?: string;
  responsiblePersonId?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
  priority?: number;
  remarks?: string;
}

/**
 * 子系统详情统计信息
 */
export interface SubsystemDetailStatistics {
  completedItemCount: number;
  inProgressItemCount: number;
  pendingItemCount: number;
  totalMaterialCount: number;
}

/**
 * 子系统详情（包含子项、附件和统计信息）
 */
export interface SubsystemDetailVO extends SubsystemVO {
  items: SubsystemItemVO[];
  attachments: SubsystemAttachmentVO[];
  statistics: SubsystemDetailStatistics;
}

/**
 * 子系统附件
 */
export interface SubsystemAttachmentVO {
  id: number;
  subsystemId: number;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadTime: string;
}

// ==================== 子项相关类型 ====================

/**
 * 子项查询参数
 */
export interface SubsystemItemQuery extends PageQuery {
  subsystemId?: number;
  itemCode?: string;
  itemName?: string;
  itemType?: string;
  status?: string;
  parentItemId?: number;
}

/**
 * 子项状态枚举
 */
export enum SubsystemItemStatus {
  PENDING = 'PENDING',         // 待处理
  IN_PROGRESS = 'IN_PROGRESS', // 进行中
  COMPLETED = 'COMPLETED',     // 已完成
  SUSPENDED = 'SUSPENDED'      // 已暂停
}

/**
 * 子项VO（返回对象）
 */
export interface SubsystemItemVO {
  id: number;
  subsystemId: number;
  itemCode: string;
  itemName: string;
  itemType?: string;
  specification?: string;
  description?: string;
  sequenceNumber?: number;
  quantity?: number;
  unit?: string;
  weight?: number;
  materialCount: number;
  status: string;
  parentItemId: number;
  remarks?: string;
  children?: SubsystemItemVO[];
  createTime: string;
  updateTime: string;
}

/**
 * 子项表单数据
 */
export interface SubsystemItemForm {
  id?: number;
  subsystemId: number;
  itemCode?: string;
  itemName: string;
  itemType?: string;
  specification?: string;
  description?: string;
  sequenceNumber?: number;
  parentItemId?: number;
  quantity?: number;
  unit?: string;
  weight?: number;
  status?: string;
  remarks?: string;
}

// ==================== 物料相关类型 ====================

/**
 * 子系统物料查询参数
 */
export interface SubsystemMaterialQuery extends PageQuery {
  subsystemId?: number;
  itemId?: number;
  materialId?: number;
  materialCode?: string;
  materialName?: string;
  specification?: string;
  materialType?: string;
  status?: string;
}

/**
 * 物料状态枚举
 */
export enum MaterialStatus {
  NORMAL = 'NORMAL',           // 正常
  OUT_OF_STOCK = 'OUT_OF_STOCK', // 缺货
  RESERVED = 'RESERVED',       // 已预留
  ALLOCATED = 'ALLOCATED'      // 已分配
}

/**
 * 子系统物料VO（返回对象）
 */
export interface SubsystemMaterialVO {
  id: number;
  subsystemId: number;
  itemId: number;
  materialId?: number;
  materialCode?: string;
  materialName: string;
  specification?: string;
  materialType?: string;
  quantity: number;
  unit?: string;
  unitWeight?: number;
  totalWeight: number;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  sequenceNumber?: number;
  status: string;
  remarks?: string;
  createTime: string;
  updateTime: string;
}

/**
 * 子系统物料表单数据
 */
export interface SubsystemMaterialForm {
  id?: number;
  subsystemId: number;
  itemId: number;
  materialId?: number;
  materialCode?: string;
  materialName: string;
  specification?: string;
  materialType?: string;
  quantity: number;
  unit?: string;
  unitWeight?: number;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  sequenceNumber?: number;
  status?: string;
  remarks?: string;
}

// ==================== 附件相关类型 ====================

/**
 * 附件类型枚举
 */
export enum AttachmentType {
  DRAWING = 'DRAWING',   // 图纸
  DOCUMENT = 'DOCUMENT', // 文档
  PHOTO = 'PHOTO',       // 照片
  OTHER = 'OTHER'        // 其他
}

