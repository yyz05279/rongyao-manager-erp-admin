export interface WarehouseVO {
  /**
   * 仓库编号
   */
  id: string | number;

  /**
   * 仓库名称
   */
  name: string;

  /**
   * 仓库地址
   */
  address: string;

  /**
   * 排序
   */
  sort: number;

  /**
   * 备注
   */
  remark: string;

  /**
   * 负责人
   */
  principal: string;

  /**
   * 仓储费，单位：元
   */
  warehousePrice: number;

  /**
   * 搬运费，单位：元
   */
  truckagePrice: number;

  /**
   * 开启状态
   */
  status: string;

  /**
   * 是否默认
   */
  defaultStatus: number;

}

export interface WarehouseForm extends BaseEntity {

  /**
   * 仓库编号
   */
  id?: string | number;
  /**
   * 仓库名称
   */
  name?: string;

  /**
   * 仓库地址
   */
  address?: string;

  /**
   * 排序
   */
  sort?: number;

  /**
   * 备注
   */
  remark?: string;

  /**
   * 负责人
   */
  principal?: string;

  /**
   * 仓储费，单位：元
   */
  warehousePrice?: number;

  /**
   * 搬运费，单位：元
   */
  truckagePrice?: number;

  /**
   * 开启状态
   */
  status?: string;

  /**
   * 是否默认
   */
  defaultStatus?: number;

}

export interface WarehouseQuery extends PageQuery {
  /**
   * 客户编码
   */
  id?: string;

  /**
   * 仓库名称
   */
  name?: string;

  /**
   * 仓库地址
   */
  address?: string;

  /**
   * 排序
   */
  sort?: number;

  /**
   * 负责人
   */
  principal?: string;

  /**
   * 开启状态
   */
  status?: string;

  /**
   * 是否默认
   */
  defaultStatus?: number;

    /**
     * 日期范围参数
     */
    params?: any;
}



