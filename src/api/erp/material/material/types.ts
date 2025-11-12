/**
 * 物料查询参数
 */
export interface MaterialQuery extends PageQuery {
  /**
   * 物料名称（模糊查询）
   */
  materialName?: string;

  /**
   * 物料编码（模糊查询）
   */
  materialCode?: string;

  /**
   * 物料类型
   */
  materialType?: string;

  /**
   * 物料状态
   */
  status?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}

/**
 * 物料视图对象
 * 物料管理模块只负责管理物料的基本信息和包装规格
 */
export interface MaterialVO {
  /**
   * 物料编号
   */
  id: string | number;

  // ========== 基础信息 ==========

  /**
   * 物料编码（后端自动生成，格式：WL + yyyyMMdd + 6位序号）
   */
  materialCode?: string;

  /**
   * 物料名称（必填）
   */
  materialName?: string;

  /**
   * 物料类型（必填）
   * @see MaterialType
   */
  materialType?: string;

  /**
   * 规格型号
   */
  specification?: string;

  /**
   * 单位（必填）
   */
  unit?: string;

  /**
   * 型号
   */
  model?: string;

  /**
   * 是否易碎品（0-否，1-是）
   */
  isFragile?: number;

  /**
   * 是否危险品（0-否，1-是）
   */
  isHazardous?: number;

  // ========== 包装规格字段 ==========

  /**
   * 包装数量（每包/每箱的数量）
   */
  packageQuantity?: number;

  /**
   * 包装单位（袋、箱、卷等）
   */
  packageUnit?: string;

  /**
   * 基础单位（颗、个、米等，最小计量单位）
   */
  baseUnit?: string;

  /**
   * 包装重量（单包重量，kg）
   */
  packageWeight?: number;

  /**
   * 包装体积（单包体积，m³）
   */
  packageVolume?: number;

  // ========== 系统字段 ==========

  /**
   * 备注
   */
  remarks?: string;

  /**
   * 版本号（用于乐观锁）
   */
  version?: number;

  /**
   * 物料状态
   */
  status?: string;

  /**
   * 创建时间
   */
  createTime?: string;

  /**
   * 更新时间
   */
  updateTime?: string;

  /**
   * 创建人
   */
  createBy?: string;

  /**
   * 更新人
   */
  updateBy?: string;

  // ========== 兼容旧字段名 ==========

  /**
   * @deprecated 使用 materialCode 替代
   */
  itemCode?: string;

  /**
   * @deprecated 使用 materialName 替代
   */
  itemName?: string;
}

/**
 * 物料表单对象
 * 物料管理模块只负责管理物料的基本信息和包装规格
 */
export interface MaterialForm extends BaseEntity {
  /**
   * 物料编号
   */
  id?: string | number;

  // ========== 基础信息 ==========

  /**
   * 物料编码（后端自动生成，编辑时需要）
   */
  materialCode?: string;

  /**
   * 物料名称（必填）
   */
  materialName?: string;

  /**
   * 物料类型（必填）
   * @see MaterialType
   */
  materialType?: string;

  /**
   * 规格型号
   */
  specification?: string;

  /**
   * 单位（必填）
   */
  unit?: string;

  /**
   * 型号
   */
  model?: string;

  /**
   * 是否易碎品（0-否，1-是）
   */
  isFragile?: number;

  /**
   * 是否危险品（0-否，1-是）
   */
  isHazardous?: number;

  // ========== 包装规格字段（可选） ==========

  /**
   * 包装数量（每包/每箱的数量）
   */
  packageQuantity?: number;

  /**
   * 包装单位（袋、箱、卷等）
   */
  packageUnit?: string;

  /**
   * 基础单位（颗、个、米等，最小计量单位）
   */
  baseUnit?: string;

  /**
   * 包装重量（单包重量，kg）
   */
  packageWeight?: number;

  /**
   * 包装体积（单包体积，m³）
   */
  packageVolume?: number;

  // ========== 系统字段 ==========

  /**
   * 备注
   */
  remarks?: string;

  /**
   * 版本号（用于乐观锁）
   */
  version?: number;
}

/**
 * 物料类型枚举
 */
export enum MaterialType {
  GENERAL = 'GENERAL',                    // 通用物料
  MECHANICAL = 'MECHANICAL',              // 机械设备
  ELECTRICAL = 'ELECTRICAL',              // 电气设备
  PIPELINE = 'PIPELINE',                  // 管道材料
  BURNER = 'BURNER',                      // 燃烧器
  AUXILIARY = 'AUXILIARY',                // 辅助材料
  STANDARD_PARTS = 'STANDARD_PARTS'       // 标准件
}

/**
 * 物料类型选项
 */
export const MaterialTypeOptions = [
  { label: '通用物料', value: 'GENERAL' },
  { label: '机械设备', value: 'MECHANICAL' },
  { label: '电气设备', value: 'ELECTRICAL' },
  { label: '管道材料', value: 'PIPELINE' },
  { label: '燃烧器', value: 'BURNER' },
  { label: '辅助材料', value: 'AUXILIARY' },
  { label: '标准件', value: 'STANDARD_PARTS' }
];

