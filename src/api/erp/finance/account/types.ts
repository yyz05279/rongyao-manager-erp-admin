export interface AccountVO {
  /**
   * 账户名称
   */
  id: number;
  /**
   * 账户名称
   */
  name: string;

  /**
   * 账户编码
   */
  no: string;

  /**
   * 备注
   */
  remark: string;

  /**
   * 开启状态
   */
  status: number;

  /**
   * 排序
   */
  sort: number;

  /**
   * 是否默认
   */
  defaultStatus: number;

  /**
   * 创建时间
   */
  createTime: string;

  /**
   * 创建人
   */
  createBy: number;

  /**
   * 更新时间
   */
  updateTime: string;

  /**
   * 更新人
   */
  updateBy: number;

}

export interface AccountForm extends BaseEntity {
  /**
   * 账户名称
   */
  id?: string;
  /**
   * 账户名称
   */
  name?: string;

  /**
   * 账户编码
   */
  no?: string;

  /**
   * 备注
   */
  remark?: string;

  /**
   * 开启状态
   */
  status?: number;

  /**
   * 排序
   */
  sort?: number;

  /**
   * 是否默认
   */
  defaultStatus?: number;

}

export interface AccountQuery extends PageQuery {

  /**
   * 账户名称
   */
  name?: string;

  /**
   * 账户编码
   */
  no?: string;

  /**
   * 开启状态
   */
  status?: number;

  /**
   * 备注
   */
  remark?: string;

  /**
   * 排序
   */
  sort?: number;

  /**
   * 是否默认
   */
  defaultStatus?: number;

  /**
   * 日期范围参数
   */
  params?: any;
}



