export interface ProductVO {
  /**
   * 产品编号
   */
  id: string | number;

  /**
   * 产品名称
   */
  name: string;

  /**
   * 产品条码
   */
  barCode: string;

  /**
   * 产品分类编号
   */
  categoryId: string | number;

  /**
   * 单位编号
   */
  unitId: string | number;

  /**
   * 产品状态
   */
  status: number;

  unitName?: string // 单位名字
  standard: string // 产品规格
  remark: string // 产品备注
  expiryDay: number // 保质期天数
  weight: number // 重量（kg）
  purchasePrice: number // 采购价格，单位：元
  salePrice: number // 销售价格，单位：元
  minPrice: number // 最低价格，单位：元
}

export interface ProductForm extends BaseEntity {
  /**
   * 产品编号
   */
  id?: string | number;

  /**
   * 产品名称
   */
  name?: string;

  /**
   * 产品条码
   */
  barCode?: string;

  /**
   * 产品分类编号
   */
  categoryId?: string | number;

  /**
   * 单位编号
   */
  unitId?: string | number;

  /**
   * 产品状态
   */
  status?: number;

  /**
   * 产品规格
   */
  standard?: string;

  /**
   * 产品备注
   */
  remark?: string;

  /**
   * 保质期天数
   */
  expiryDay?: number;

  /**
   * 基础重量（kg）
   */
  weight?: number;

  /**
   * 采购价格，单位：元
   */
  purchasePrice?: number;

  /**
   * 销售价格，单位：元
   */
  salePrice?: number;

  /**
   * 最低价格，单位：元
   */
  minPrice?: number;

}

export interface ProductQuery extends PageQuery {

  /**
   * 产品名称
   */
  name?: string;

  /**
   * 产品条码
   */
  barCode?: string;

  /**
   * 产品分类编号
   */
  categoryId?: string | number;

  /**
   * 单位编号
   */
  unitId?: string | number;

  /**
   * 产品状态
   */
  status?: number;

  /**
   * 日期范围参数
   */
  params?: any;
}



