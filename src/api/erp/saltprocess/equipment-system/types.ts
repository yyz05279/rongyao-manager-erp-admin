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
  id?: string | number;               // 子系统模板ID（编辑时使用）

  // 方式一：引用已存在的独立子系统模板（推荐）
  referenceTemplateId?: number;       // 引用的独立子系统模板ID
  referenceTemplateName?: string;     // 引用的模板名称（仅用于前端显示，不提交到后端）

  // 方式二：新建子系统模板（当不使用referenceTemplateId时必填）
  subsystemName?: string;             // 子系统名称
  subsystemType?: string;             // 子系统类型（MECHANICAL/ELECTRICAL/PIPELINE）
  category?: string;                  // 子系统分类
  specification?: string;             // 规格型号
  model?: string;                     // 型号
  manufacturer?: string;              // 制造商
  description?: string;               // 描述
  estimatedWeight?: number;           // 预估重量(kg)
  status?: string;                    // 状态

  // 通用字段（两种方式都可用）
  sequenceNumber?: number;            // 排序号
  remarks?: string;                   // 备注
}

/**
 * 子系统模板修改表单数据
 * 基于接口文档: 子系统模版修改接口文档.md (更新于 2025-01-14)
 */
export interface SubsystemTemplateUpdateForm {
  id: string | number;                // 必填：子系统模版ID（支持字符串和数字，避免雪花算法ID精度丢失）
  subsystemName?: string;             // 可选：子系统名称（最大100字符）
  category?: string;                  // 可选：子系统类别（最大50字符）
  subsystemType?: string;             // 可选：子系统类型（手动输入，最大50字符）
  description?: string;               // 可选：描述（最大500字符）
  sequenceNumber?: number;            // 可选：排序号（不能小于0）
  status?: string;                    // 可选：状态（DRAFT-草稿，ACTIVE-启用，INACTIVE-停用，ARCHIVED-归档）
  remarks?: string;                   // 可选：备注（最大500字符）
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
  projectId?: string;                 // 项目ID（使用 string 类型避免 Long 精度丢失）
  templateId?: string;                // 模板ID（使用 string 类型避免 Long 精度丢失）
  systemCode?: string;                // 系统编码
  systemName?: string;                // 系统名称
  systemType?: string;                // 系统类型
  status?: string;                    // 状态
  responsiblePersonId?: string;       // 负责人ID（使用 string 类型避免 Long 精度丢失）
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
  id: string | number;                // 主键ID（支持 string 避免精度丢失）
  projectId: string;                  // 项目ID（使用 string 类型避免 Long 精度丢失）
  projectName?: string;               // 项目名称（冗余）
  templateId?: string;                // 模板ID（使用 string 类型避免 Long 精度丢失）
  systemCode: string;                 // 系统编码（唯一）
  systemName: string;                 // 系统名称
  systemType: string;                 // 系统类型
  category?: string;                  // 分类
  description?: string;               // 描述
  subsystemCount?: number;            // 子系统数量
  totalItems?: number;                // 总子项数
  totalMaterials?: number;            // 总物料数
  totalWeight?: number;               // 总重量(kg)
  responsiblePersonId?: string;       // 负责人ID（使用 string 类型避免 Long 精度丢失）
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
 * 项目设备系统表单数据（基本编辑）
 */
export interface ProjectEquipmentSystemForm {
  id?: string | number;               // 主键ID（支持 string 避免精度丢失）
  projectId: string;                  // 项目ID（必填，使用 string 类型避免 Long 精度丢失）
  projectName?: string;               // 项目名称
  templateId?: string;                // 模板ID（使用 string 类型避免 Long 精度丢失）
  systemCode?: string;                // 系统编码（可选，不传则自动生成）
  systemName: string;                 // 系统名称（必填）
  systemType: string;                 // 系统类型（必填）
  category?: string;                  // 分类
  description?: string;               // 描述
  responsiblePersonId?: string;       // 负责人ID（使用 string 类型避免 Long 精度丢失）
  responsiblePerson?: string;         // 负责人姓名
  status?: string;                    // 状态
  priority?: number;                  // 优先级
  remarks?: string;                   // 备注
}

/**
 * 项目子系统表单数据（用于完整编辑）
 */
export interface ProjectSubsystemForm {
  id?: string | number;               // 子系统ID（编辑时使用）
  projectSystemId: string | number;   // 项目设备系统ID（必填）
  projectId: string | number;         // 项目ID（必填）
  templateId?: string | number;       // 子系统模板ID（引用模板时填写）
  subsystemCode?: string;             // 子系统编码（可选，不传则自动生成）
  subsystemName: string;              // 子系统名称（必填）
  subsystemType?: string;             // 子系统类型
  category?: string;                  // 分类
  specification?: string;             // 规格型号
  model?: string;                     // 型号
  manufacturer?: string;              // 制造商
  description?: string;               // 描述
  status?: string;                    // 状态
  sequenceNumber?: number;            // 排序号
  remarks?: string;                   // 备注
}

/**
 * 项目设备系统完整编辑表单数据（支持级联更新子系统）
 */
export interface ProjectEquipmentSystemFullForm {
  id: string | number;                // 项目设备系统ID（必填）
  projectId: string | number;         // 化盐项目ID（必填，用于数据隔离验证）
  projectName?: string;               // 项目名称（冗余）
  templateId?: string | number;       // 设备系统模板ID（追溯来源）
  systemCode: string;                 // 系统编码（必填）
  systemName: string;                 // 系统名称（必填）
  systemType?: string;                // 系统类型（SOLID/LIQUID/POWDER/BURNER）
  category?: string;                  // 分类
  description?: string;               // 描述（最多500字符）
  responsiblePersonId?: string | number; // 负责人ID
  responsiblePerson?: string;         // 负责人姓名
  status?: string;                    // 状态（DRAFT/ACTIVE/COMPLETED/ARCHIVED）
  priority?: number;                  // 优先级
  sequenceNumber?: number;            // 排序号
  remarks?: string;                   // 备注（最多500字符）
  version?: number;                   // 版本号（乐观锁）
  subsystems: ProjectSubsystemForm[]; // 项目子系统列表（必填，至少1个）
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
 * 设备系统模板详情（包含统计信息和子系统模板列表）
 */
export interface EquipmentSystemTemplateDetailVO extends EquipmentSystemTemplateVO {
  statistics?: EquipmentSystemStatistics;
  subsystemTemplates?: SubsystemTemplateForm[];  // 子系统模板列表
}

/**
 * 项目子系统VO
 */
export interface ProjectSubsystemVO {
  id: string | number;
  projectSystemId: string | number;
  projectId: string | number;
  templateId?: string | number | null;
  subsystemCode: string;
  subsystemName: string;
  subsystemType: string;
  category?: string | null;
  specification?: string | null;
  model?: string | null;
  manufacturer?: string | null;
  description?: string | null;
  itemCount?: number;
  materialCount?: number;
  totalWeight?: number | string;  // 支持字符串类型（如 "0.00"）
  status: string;
  sequenceNumber?: number;
  remarks?: string | null;
  version?: number;
  createTime?: string;
  updateTime?: string;
  // 后端返回的额外字段
  createDept?: string | number | null;
  createBy?: string | number | null;
  updateBy?: string | number | null;
  tenantId?: string | null;
  delFlag?: number;
}

/**
 * 项目设备系统详情（包含统计信息和项目子系统列表）
 */
export interface ProjectEquipmentSystemDetailVO extends ProjectEquipmentSystemVO {
  statistics?: EquipmentSystemStatistics;
  projectSubsystems?: ProjectSubsystemVO[];  // 项目子系统列表
}

// ==================== 子项模板相关类型 ====================

/**
 * 子项类型枚举
 */
export enum ItemType {
  MAIN = 'MAIN',           // 主要部件
  FASTENER = 'FASTENER',   // 紧固件
  ACCESSORY = 'ACCESSORY'  // 附件
}

/**
 * 子项模板查询参数
 */
export interface ItemTemplateQuery {
  templateCode?: string;        // 子项模板编码（模糊查询）
  itemName?: string;            // 子项名称（模糊查询）
  itemType?: string;            // 子项类型（MAIN/FASTENER/ACCESSORY）
  status?: string;              // 状态
  subsystemTemplateId?: number; // 子系统模版ID
}

/**
 * 子项模板VO（返回对象）
 */
export interface ItemTemplateVO {
  id: string | number;          // 主键ID
  subsystemTemplateId: number;  // 子系统模版ID
  templateCode: string;         // 子项模板编码
  itemName: string;             // 子项名称
  itemType?: string;            // 子项类型（MAIN/FASTENER/ACCESSORY）
  specification?: string;       // 规格型号
  description?: string;         // 描述
  defaultQuantity?: number;     // 默认数量
  defaultUnit?: string;         // 默认单位
  estimatedUnitWeight?: number; // 预估单重(kg)
  parentItemTemplateId?: number;// 父子项模板ID（支持子项嵌套）
  sequenceNumber?: number;      // 排序号
  status?: string;              // 状态
  remarks?: string;             // 备注
  createBy?: number;            // 创建人ID
  createTime?: string;          // 创建时间
  updateBy?: number;            // 更新人ID
  updateTime?: string;          // 更新时间
}

/**
 * 子项模板表单数据（用于新增和编辑）
 */
export interface ItemTemplateForm {
  id?: string | number;         // 主键ID（编辑时必填）
  itemTemplateId?: number;      // 关联的子项模板ID（从模板库选择时使用）
  subsystemTemplateId?: number; // 子系统模版ID（新增时从路径参数自动设置）
  templateCode: string;         // 子项模板编码（必填，最大长度50）
  itemName: string;             // 子项名称（必填，最大长度100）
  itemType?: string;            // 子项类型（MAIN/FASTENER/ACCESSORY，最大长度50）
  specification?: string;       // 规格型号（最大长度500）
  description?: string;         // 描述（最大长度500）
  defaultQuantity?: number;     // 默认数量（最小0.01，最多8位整数2位小数）
  defaultUnit?: string;         // 默认单位（最大长度20）
  estimatedUnitWeight?: number; // 预估单重(kg)（最小0，最多10位整数2位小数）
  parentItemTemplateId?: number;// 父子项模板ID（支持子项嵌套）
  sequenceNumber?: number;      // 排序号（最小0）
  status?: string;              // 状态（最大长度20）
  remarks?: string;             // 备注（最大长度500）
}

