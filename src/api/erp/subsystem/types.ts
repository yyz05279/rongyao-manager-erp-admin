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

// ==================== 子系统模板相关类型 ====================

/**
 * 子系统模板查询参数
 * 基于API文档 v1.0
 */
export interface SubsystemTemplateQuery extends PageQuery {
  templateCode?: string;      // 模板编号（模糊查询）
  templateName?: string;       // 模板名称（模糊查询）
  category?: string;           // 分类（精确查询）
  status?: string;             // 状态（精确查询）
  isStandard?: boolean;        // 是否标准模板
}

/**
 * 子系统模板VO（返回对象）
 * 注意：模板不包含项目信息和负责人信息
 * 基于API文档 v1.0
 */
export interface SubsystemTemplateVO {
  id: number;                  // 主键ID
  templateCode: string;        // 模板编号
  templateName: string;        // 模板名称
  category?: string;           // 分类
  description?: string;        // 描述
  isStandard?: boolean;        // 是否标准模板
  version?: string;            // 版本号
  status: string;              // 状态：DRAFT/ACTIVE/INACTIVE/ARCHIVED
  sourceProjectId?: number;    // 来源项目ID
  relatedProductId?: number;   // 关联产品ID
  totalItems?: number;         // 子项总数
  totalMaterials?: number;     // 物料总数
  remarks?: string;            // 备注
  createTime?: string;         // 创建时间
  updateTime?: string;         // 更新时间
  createBy?: string;           // 创建人
  updateBy?: string;           // 更新人
}

/**
 * 子系统模板表单数据
 * 注意：模板不包含项目信息和负责人信息
 * 基于API文档 v1.0
 */
export interface SubsystemTemplateForm {
  id?: number;                 // 主键ID（修改时必填）
  templateCode?: string;       // 模板编号（可选，不传则自动生成）
  templateName: string;        // 模板名称（必填）
  category?: string;           // 分类
  description?: string;        // 描述
  isStandard?: boolean;        // 是否标准模板
  version?: string;            // 版本号
  status?: string;             // 状态
  sourceProjectId?: number;    // 来源项目ID
  relatedProductId?: number;   // 关联产品ID
  remarks?: string;            // 备注
}

/**
 * 子系统模板详情（包含子项、附件和统计信息）
 */
export interface SubsystemTemplateDetailVO extends SubsystemTemplateVO {
  items: SubsystemItemVO[];
  attachments: SubsystemAttachmentVO[];
  statistics: SubsystemDetailStatistics;
}

// ==================== 子项模板相关类型 ====================

/**
 * 子项模板查询参数
 */
export interface SubsystemItemTemplateQuery extends PageQuery {
  templateId?: number;        // 子系统模板ID
  itemCode?: string;          // 子项编号（模糊查询）
  itemName?: string;          // 子项名称（模糊查询）
  itemType?: string;          // 子项类型
  isRequired?: boolean;       // 是否必需
}

/**
 * 子项模板VO（返回对象）
 */
export interface SubsystemItemTemplateVO {
  id: number;                 // 主键ID
  templateId: number;         // 子系统模板ID
  itemCode: string;           // 子项编号
  itemName: string;           // 子项名称
  itemType?: string;          // 子项类型（如：组件、部件、单元等）
  specification?: string;     // 规格型号
  description?: string;       // 描述
  defaultQuantity?: number;   // 默认数量
  unit?: string;              // 单位
  isRequired?: boolean;       // 是否必需
  sequenceNumber?: number;    // 排序号
  remarks?: string;           // 备注
  createTime?: string;        // 创建时间
  updateTime?: string;        // 更新时间
}

/**
 * 子项模板表单对象
 */
export interface SubsystemItemTemplateForm {
  id?: number;                // 主键ID
  templateId?: number;        // 子系统模板ID（可选，基础数据管理时不需要）
  itemCode?: string;          // 子项编号（不传则自动生成）
  itemName: string;           // 子项名称
  itemType?: string;          // 子项类型
  specification?: string;     // 规格型号
  description?: string;       // 描述
  defaultQuantity?: number;   // 默认数量，默认1
  unit?: string;              // 单位，默认"个"
  isRequired?: boolean;       // 是否必需，默认true
  sequenceNumber?: number;    // 排序号，不传自动计算
  remarks?: string;           // 备注
}

// ==================== 物料模板相关类型 ====================

/**
 * 物料模板查询参数
 */
export interface SubsystemMaterialTemplateQuery extends PageQuery {
  templateId?: number;        // 子系统模板ID
  itemTemplateId?: number;    // 子项模板ID
  materialId?: number;        // 基础物料ID
  materialCode?: string;      // 物料编码（模糊查询）
  materialName?: string;      // 物料名称（模糊查询）
  isRequired?: boolean;       // 是否必需
}

/**
 * 物料模板VO（返回对象）
 */
export interface SubsystemMaterialTemplateVO {
  id: number;                 // 主键ID
  templateId: number;         // 子系统模板ID
  itemTemplateId: number;     // 子项模板ID
  materialId: number;         // 基础物料ID
  materialCode?: string;      // 物料编码（冗余字段）
  materialName?: string;      // 物料名称（冗余字段）
  specification?: string;     // 规格型号（冗余字段）
  unit?: string;              // 单位（冗余字段）
  defaultQuantity: number;    // 默认数量
  isRequired?: boolean;       // 是否必需
  remarks?: string;           // 备注
  createTime?: string;        // 创建时间
  updateTime?: string;        // 更新时间
}

/**
 * 物料模板表单对象
 */
export interface SubsystemMaterialTemplateForm {
  id?: number;                // 主键ID
  templateId?: number;        // 子系统模板ID（可选，基础数据管理时不需要）
  itemTemplateId: number;     // 子项模板ID
  materialId: number;         // 基础物料ID
  defaultQuantity?: number;   // 默认数量，默认1
  isRequired?: boolean;       // 是否必需，默认true
  remarks?: string;           // 备注
}

