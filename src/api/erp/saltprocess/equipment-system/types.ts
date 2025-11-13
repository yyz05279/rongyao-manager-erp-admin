/**
 * 设备系统管理模块 - 类型定义
 * 基于后端 API v1.2 文档 (更新日期: 2025-01-12)
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

// ==================== 设备系统模板相关类型 ====================

/**
 * 设备系统模板查询参数
 */
export interface EquipmentSystemTemplateQuery extends PageQuery {
  templateCode?: string;      // 模板编码（模糊查询）
  templateName?: string;       // 模板名称（模糊查询）
  systemType?: string;         // 系统类型（SOLID/LIQUID/POWDER/BURNER）
  category?: string;           // 分类
  status?: string;             // 状态（DRAFT/ACTIVE/ARCHIVED）
  isStandard?: boolean;        // 是否标准模板
}

/**
 * 系统类型枚举
 */
export enum SystemType {
  SOLID = 'SOLID',       // 固态
  LIQUID = 'LIQUID',     // 液态
  POWDER = 'POWDER',     // 粉盐
  BURNER = 'BURNER'      // 燃烧器
}

/**
 * 模板状态枚举
 */
export enum TemplateStatus {
  DRAFT = 'DRAFT',       // 草稿
  ACTIVE = 'ACTIVE',     // 启用
  ARCHIVED = 'ARCHIVED'  // 归档
}

/**
 * 设备系统模板VO（返回对象）
 */
export interface EquipmentSystemTemplateVO {
  id: string | number;                // 主键ID
  templateCode: string;               // 模板编码（唯一）
  templateName: string;               // 模板名称
  systemType: string;                 // 系统类型
  category?: string;                  // 分类
  description?: string;               // 描述
  subsystemCount?: number;            // 子系统数量
  totalItems?: number;                // 总子项数
  totalMaterials?: number;            // 总物料数
  estimatedWeight?: number;           // 预估总重量(kg)
  status: string;                     // 状态
  isStandard?: boolean;               // 是否标准模板
  version?: string;                   // 版本号
  remarks?: string;                   // 备注
  createBy?: number;                  // 创建人ID
  createTime?: string;                // 创建时间
  updateBy?: number;                  // 更新人ID
  updateTime?: string;                // 更新时间
}

/**
 * 子系统类型枚举
 */
export enum SubsystemType {
  MECHANICAL = 'MECHANICAL',  // 机械设备
  ELECTRICAL = 'ELECTRICAL',  // 电控设备
  PIPELINE = 'PIPELINE'        // 管路设备
}

/**
 * 子系统模板表单数据（支持两种方式）
 * 基于 API v1.2 文档
 */
export interface SubsystemTemplateForm {
  // 方式一：引用已存在的独立子系统模板（推荐）
  referenceTemplateId?: number;       // 引用的独立子系统模板ID

  // 方式二：新建子系统模板（当不使用referenceTemplateId时必填）
  subsystemName?: string;             // 子系统名称
  subsystemType?: string;             // 子系统类型（MECHANICAL/ELECTRICAL/PIPELINE）
  category?: string;                  // 子系统分类
  specification?: string;             // 规格型号
  model?: string;                     // 型号
  manufacturer?: string;              // 制造商
  description?: string;               // 描述
  status?: string;                    // 状态

  // 通用字段（两种方式都可用）
  sequenceNumber?: number;            // 排序号
  remarks?: string;                   // 备注
}

/**
 * 设备系统模板表单数据
 * 基于 API v1.2 文档
 */
export interface EquipmentSystemTemplateForm {
  id?: string | number;               // 主键ID（修改时必填）
  templateCode?: string;              // 模板编码（可选，不传则自动生成）
  templateName: string;               // 模板名称（必填）
  systemType: string;                 // 系统类型（必填）
  category?: string;                  // 分类
  description?: string;               // 描述
  status?: string;                    // 状态（DRAFT/ACTIVE/ARCHIVED）
  isStandard?: boolean;               // 是否标准模板
  version?: string;                   // 版本号
  remarks?: string;                   // 备注
  subsystemTemplates: SubsystemTemplateForm[];  // 子系统模板列表（必填，至少1个）
}

/**
 * 子系统模板简要信息（用于显示和参考）
 */
export interface SubsystemTemplateSimpleVO {
  id: number;                         // 子系统模板ID
  templateCode: string;               // 模板编号
  templateName: string;               // 模板名称
  category?: string;                  // 分类
  version?: string;                   // 版本号
  status?: string;                    // 状态
  itemCount?: number;                 // 子项数量
  materialCount?: number;             // 物料数量
}

// ==================== 项目设备系统相关类型 ====================

/**
 * 项目设备系统查询参数
 */
export interface ProjectEquipmentSystemQuery extends PageQuery {
  projectId?: number | string;        // 项目ID
  templateId?: number | string;       // 模板ID
  systemCode?: string;                // 系统编码
  systemName?: string;                // 系统名称
  systemType?: string;                // 系统类型
  status?: string;                    // 状态
  responsiblePersonId?: number;       // 负责人ID
}

/**
 * 项目状态枚举
 */
export enum ProjectStatus {
  DRAFT = 'DRAFT',           // 草稿
  ACTIVE = 'ACTIVE',         // 活跃
  COMPLETED = 'COMPLETED',   // 已完成
  ARCHIVED = 'ARCHIVED'      // 已归档
}

/**
 * 项目设备系统VO（返回对象）
 */
export interface ProjectEquipmentSystemVO {
  id: string | number;                // 主键ID
  projectId: number;                  // 项目ID
  projectName?: string;               // 项目名称（冗余）
  templateId?: number;                // 模板ID
  systemCode: string;                 // 系统编码（唯一）
  systemName: string;                 // 系统名称
  systemType: string;                 // 系统类型
  category?: string;                  // 分类
  description?: string;               // 描述
  subsystemCount?: number;            // 子系统数量
  totalItems?: number;                // 总子项数
  totalMaterials?: number;            // 总物料数
  totalWeight?: number;               // 总重量(kg)
  responsiblePersonId?: number;       // 负责人ID
  responsiblePerson?: string;         // 负责人姓名
  status: string;                     // 状态
  priority?: number;                  // 优先级
  sequenceNumber?: number;            // 排序号
  remarks?: string;                   // 备注
  version?: number;                   // 版本号（乐观锁）
  createTime?: string;                // 创建时间
  updateTime?: string;                // 更新时间
}

/**
 * 项目设备系统表单数据
 */
export interface ProjectEquipmentSystemForm {
  id?: string | number;               // 主键ID
  projectId: number;                  // 项目ID（必填）
  projectName?: string;               // 项目名称
  templateId?: number;                // 模板ID
  systemCode?: string;                // 系统编码（可选，不传则自动生成）
  systemName: string;                 // 系统名称（必填）
  systemType: string;                 // 系统类型（必填）
  category?: string;                  // 分类
  description?: string;               // 描述
  responsiblePersonId?: number;       // 负责人ID
  responsiblePerson?: string;         // 负责人姓名
  status?: string;                    // 状态
  priority?: number;                  // 优先级
  remarks?: string;                   // 备注
}

// ==================== 统计和详情类型 ====================

/**
 * 设备系统统计信息
 */
export interface EquipmentSystemStatistics {
  completedSubsystemCount: number;    // 已完成子系统数量
  inProgressSubsystemCount: number;   // 进行中子系统数量
  pendingSubsystemCount: number;      // 待处理子系统数量
  totalMaterialCount: number;         // 总物料数量
  totalWeight: number;                // 总重量
}

/**
 * 设备系统模板详情（包含统计信息）
 */
export interface EquipmentSystemTemplateDetailVO extends EquipmentSystemTemplateVO {
  statistics?: EquipmentSystemStatistics;
}

/**
 * 项目设备系统详情（包含统计信息）
 */
export interface ProjectEquipmentSystemDetailVO extends ProjectEquipmentSystemVO {
  statistics?: EquipmentSystemStatistics;
}

