/**
 * 物料查询参数
 */
export interface MaterialQuery extends PageQuery {
  /**
   * 物料名称
   */
  name?: string;

  /**
   * 物料编码
   */
  itemCode?: string;

  /**
   * 物料清单ID
   */
  shippingListId?: string | number;

  /**
   * 物料状态
   */
  status?: number;

  /**
   * 生产日期范围查询 - 开始日期
   */
  productionDateStart?: string;

  /**
   * 生产日期范围查询 - 结束日期
   */
  productionDateEnd?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}

/**
 * 物料视图对象
 */
export interface MaterialVO {
  /**
   * 物料编号
   */
  id: string | number;

  /**
   * 物料清单ID
   */
  shippingListId?: string | number;
  
  /**
   * 物料清单ID（后端字段）
   */
  materialListId?: string | number;

  /**
   * 物料编码（前端字段）
   */
  itemCode?: string;
  
  /**
   * 物料编码（后端字段）
   */
  materialCode?: string;

  /**
   * 物料名称（前端字段）
   */
  itemName?: string;
  
  /**
   * 物料名称（后端字段）
   */
  materialName?: string;

  /**
   * 规格型号
   */
  specification?: string;

  /**
   * 设备类型（前端字段）
   */
  equipmentType?: string;
  
  /**
   * 物料类型（后端字段）
   */
  materialType?: string;

  /**
   * 数量
   */
  quantity: number;

  /**
   * 单位
   */
  unit?: string;

  /**
   * 单重（kg）
   */
  unitWeight?: number;

  /**
   * 总重（kg）
   */
  totalWeight?: number;

  /**
   * 单体积（m³）
   */
  unitVolume?: number;

  /**
   * 总体积（m³）
   */
  totalVolume?: number;

  /**
   * 制造商
   */
  manufacturer?: string;

  /**
   * 型号
   */
  model?: string;

  /**
   * 序列号
   */
  serialNumber?: string;

  /**
   * 生产日期
   */
  productionDate?: string;

  /**
   * 是否易碎品（0-否，1-是）
   */
  isFragile?: number;

  /**
   * 是否危险品（0-否，1-是）
   */
  isHazardous?: number;

  /**
   * 包装方式
   */
  packagingMethod?: string;

  /**
   * 备注
   */
  remarks?: string;

  /**
   * 版本号（用于乐观锁）
   */
  version?: number;

  /**
   * 创建时间
   */
  createTime?: string;

  /**
   * 更新时间
   */
  updateTime?: string;
}

/**
 * 物料表单对象
 */
export interface MaterialForm extends BaseEntity {
  /**
   * 物料编号
   */
  id?: string | number;

  /**
   * 物料清单ID
   */
  shippingListId?: string | number;

  /**
   * 物料编码
   */
  itemCode?: string;

  /**
   * 物料名称
   */
  itemName?: string;

  /**
   * 规格型号
   */
  specification?: string;

  /**
   * 数量
   */
  quantity?: number;

  /**
   * 单位
   */
  unit?: string;

  /**
   * 单重（kg）
   */
  unitWeight?: number;

  /**
   * 总重（kg）
   */
  totalWeight?: number;

  /**
   * 单体积（m³）
   */
  unitVolume?: number;

  /**
   * 总体积（m³）
   */
  totalVolume?: number;

  /**
   * 制造商
   */
  manufacturer?: string;

  /**
   * 型号
   */
  model?: string;

  /**
   * 序列号
   */
  serialNumber?: string;

  /**
   * 生产日期
   */
  productionDate?: string;

  /**
   * 是否易碎品（0-否，1-是）
   */
  isFragile?: number;

  /**
   * 是否危险品（0-否，1-是）
   */
  isHazardous?: number;

  /**
   * 包装方式
   */
  packagingMethod?: string;

  /**
   * 备注
   */
  remarks?: string;

  /**
   * 版本号（用于乐观锁）
   */
  version?: number;
}

