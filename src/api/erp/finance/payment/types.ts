export interface PaymentVO {
  /**
   * 编号
   */
  id: string | number;

  /**
   * 付款单编号
   */
  no: string;

  /**
   * 付款状态
   */
  status: number;

  /**
   * 供应商编号
   */
  supplierId: string | number;

  /**
   * 供应商名称
   */
  supplierName?: string;

  /**
   * 结算账户编号
   */
  accountId: string | number;

  /**
   * 账户名称
   */
  accountName?: string;

  /**
   * 付款时间
   */
  paymentTime: string;

  /**
   * 合计金额，单位：元
   */
  totalPrice: number;

  /**
   * 备注
   */
  remark: string;

  /**
   * 创建时间
   */
  createTime?: string;

  /**
   * 创建人
   */
  createBy?: string;
}

export interface PaymentForm extends BaseEntity {
  /**
   * 编号
   */
  id?: string | number;

  /**
   * 付款单编号
   */
  no?: string;

  /**
   * 付款状态
   */
  status?: number;

  /**
   * 供应商编号
   */
  supplierId?: string | number;

  /**
   * 结算账户编号
   */
  accountId?: string | number;

  /**
   * 付款时间
   */
  paymentTime?: string;

  /**
   * 合计金额，单位：元
   */
  totalPrice?: number;

  /**
   * 备注
   */
  remark?: string;
}

export interface PaymentQuery extends PageQuery {
  /**
   * 付款单编号
   */
  no?: string;

  /**
   * 付款状态
   */
  status?: number;

  /**
   * 供应商编号
   */
  supplierId?: string | number;

  /**
   * 结算账户编号
   */
  accountId?: string | number;

  /**
   * 付款时间
   */
  paymentTime?: string[];

  /**
   * 日期范围参数
   */
  params?: any;
}
