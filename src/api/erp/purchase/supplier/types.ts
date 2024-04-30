export interface SupplierVO {
  /**
   * 供应商编号
   */
  id: string | number;

  /**
   * 供应商名称
   */
  name: string;

  /**
   * 联系人
   */
  contact: string;

  /**
   * 手机号码
   */
  mobile: string;

  /**
   * 联系电话
   */
  telephone: string;

  /**
   * 电子邮箱
   */
  email: string;

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

}

export interface SupplierForm extends BaseEntity {
  /**
   * 供应商编号
   */
  id?: string | number;

  /**
   * 供应商名称
   */
  name?: string;

  /**
   * 联系人
   */
  contact?: string;

  /**
   * 手机号码
   */
  mobile?: string;

  /**
   * 联系电话
   */
  telephone?: string;

  /**
   * 电子邮箱
   */
  email?: string;

  /**
   * 传真
   */
  fax?: string;

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
   * 纳税人识别号
   */
  taxNo?: string;

  /**
   * 税率
   */
  taxPercent?: number;

  /**
   * 开户行
   */
  bankName?: string;

  /**
   * 开户账号
   */
  bankAccount?: string;

  /**
   * 开户地址
   */
  bankAddress?: string;

}

export interface SupplierQuery extends PageQuery {

  /**
   * 供应商名称
   */
  name?: string;

  /**
   * 联系人
   */
  contact?: string;

  /**
   * 手机号码
   */
  mobile?: string;

  /**
   * 开启状态
   */
  status?: number;

    /**
     * 日期范围参数
     */
    params?: any;
}



