export interface CustomerVO {
  /**
   * 产品编号
   */
  id: string | number;

  /**
   * 客户名称
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
   * 传真
   */
  fax: string;

  /**
   * 备注
   */
  remark: string;

  /**
   * 开启状态
   */
  status: string;

  /**
   * 排序
   */
  sort: number;

  /**
   * 纳税人识别号
   */
  taxNo: string;

  /**
   * 税率
   */
  taxPercent: number;

  /**
   * 开户行
   */
  bankName: string;

  /**
   * 开户账号
   */
  bankAccount: string;

  /**
   * 开户地址
   */
  bankAddress: string;
}

export interface CustomerForm extends BaseEntity {
  /**
   * 产品编号
   */
  id?: string | number;

  /**
   * 客户名称
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
  status?: string;

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

export interface CustomerQuery extends PageQuery {
  /**
   * 客户编码
   */
  id?: string;
  /**
   * 客户名称
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
  status?: string;

  /**
   * 日期范围参数
   */
  params?: any;
}
