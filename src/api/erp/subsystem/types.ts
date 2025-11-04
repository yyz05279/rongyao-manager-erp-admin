/**
 * 子系统管理模块 - 类型定义
 */

// 通用分页查询参数
export interface PageQuery {
  pageNum?: number;
  pageSize?: number;
}

// 通用分页响应
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
  subsystemName?: string;
  subsystemCode?: string;
  status?: number;
  projectId?: string;
}

/**
 * 子系统VO（返回对象）
 */
export interface SubsystemVO {
  id: string;
  subsystemCode: string;
  subsystemName: string;
  projectId?: string;
  projectName?: string;
  status: number; // 0-禁用, 1-启用
  description?: string;
  subItemCount?: number; // 子项数量
  materialCount?: number; // 物料总数
  totalWeight?: number; // 总重量
  totalVolume?: number; // 总体积
  createBy?: string;
  createTime?: string;
  updateBy?: string;
  updateTime?: string;
  remark?: string;
}

/**
 * 子系统表单数据
 */
export interface SubsystemForm {
  id?: string;
  subsystemCode: string;
  subsystemName: string;
  projectId?: string;
  status: number;
  description?: string;
  remark?: string;
}

// ==================== 子项相关类型 ====================

/**
 * 子项查询参数
 */
export interface SubItemQuery extends PageQuery {
  subsystemId: string;
  subItemName?: string;
  subItemCode?: string;
}

/**
 * 子项VO（返回对象）
 */
export interface SubItemVO {
  id: string;
  subsystemId: string;
  subsystemName?: string;
  subItemCode: string;
  subItemName: string;
  description?: string;
  materialCount?: number; // 物料数量
  totalWeight?: number; // 总重量
  totalVolume?: number; // 总体积
  createBy?: string;
  createTime?: string;
  updateBy?: string;
  updateTime?: string;
  remark?: string;
}

/**
 * 子项表单数据
 */
export interface SubItemForm {
  id?: string;
  subsystemId: string;
  subItemCode: string;
  subItemName: string;
  description?: string;
  remark?: string;
}

// ==================== 物料相关类型 ====================

/**
 * 子系统物料查询参数
 */
export interface SubsystemMaterialQuery extends PageQuery {
  subItemId: string;
  materialName?: string;
  materialCode?: string;
}

/**
 * 子系统物料VO（返回对象）
 */
export interface SubsystemMaterialVO {
  id: string;
  subItemId: string;
  subItemName?: string;
  materialCode: string;
  materialName: string;
  specification?: string;
  quantity?: number;
  unit?: string;
  unitWeight?: number; // 单重(kg)
  totalWeight?: number; // 总重(kg)
  unitVolume?: number; // 单体积(m³)
  totalVolume?: number; // 总体积(m³)
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  productionDate?: string;
  isFragile: number; // 0-否, 1-是
  isHazardous: number; // 0-否, 1-是
  packagingMethod?: string;
  remarks?: string;
  createBy?: string;
  createTime?: string;
  updateBy?: string;
  updateTime?: string;
}

/**
 * 子系统物料表单数据
 */
export interface SubsystemMaterialForm {
  id?: string;
  subItemId: string;
  materialCode: string;
  materialName: string;
  specification?: string;
  quantity?: number;
  unit?: string;
  unitWeight?: number;
  totalWeight?: number;
  unitVolume?: number;
  totalVolume?: number;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  productionDate?: string;
  isFragile: number;
  isHazardous: number;
  packagingMethod?: string;
  remarks?: string;
}

// ==================== 统计信息 ====================

/**
 * 子系统统计信息
 */
export interface SubsystemStatistics {
  totalSubsystems: number;
  activeSubsystems: number;
  totalSubItems: number;
  totalMaterials: number;
  totalWeight: number;
  totalVolume: number;
}

/**
 * 子系统详情（包含子项和物料）
 */
export interface SubsystemDetail extends SubsystemVO {
  subItems: SubItemDetail[];
}

/**
 * 子项详情（包含物料）
 */
export interface SubItemDetail extends SubItemVO {
  materials: SubsystemMaterialVO[];
}

