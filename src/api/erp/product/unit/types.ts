export interface ProductUnitVO {
  /**
   * 单位编号
   */
  id: string | number;

  /**
   * 单位名字
   */
  name: string;

  /**
   * 单位状态
   */
  status: number;

}

export interface ProductUnitForm extends BaseEntity {
  /**
   * 单位编号
   */
  id?: string | number;

  /**
   * 单位名字
   */
  name?: string;

  /**
   * 单位状态
   */
  status?: number;

}

export interface ProductUnitQuery extends PageQuery {

  /**
   * 单位名字
   */
  name?: string;

  /**
   * 单位状态
   */
  status?: number;

    /**
     * 日期范围参数
     */
    params?: any;
}



