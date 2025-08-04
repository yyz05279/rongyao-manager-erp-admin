export interface ReceiptVO {
  /**
   * 编号
   */
  id: string | number;

  /**
   * 收款单编号
   */
  no: string;

  /**
   * 收款状态
   */
  status: number;

  /**
   * 客户编号
   */
  customerId: string | number;

  /**
   * 客户名称
   */
  customerName?: string;

  /**
   * 结算账户编号
   */
  accountId: string | number;

  /**
   * 账户名称
   */
  accountName?: string;

  /**
   * 收款时间
   */
  receiptTime: string;

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

export interface ReceiptForm extends BaseEntity {
  /**
   * 编号
   */
  id?: string | number;

  /**
   * 收款单编号
   */
  no?: string;

  /**
   * 收款状态
   */
  status?: number;

  /**
   * 客户编号
   */
  customerId?: string | number;

  /**
   * 结算账户编号
   */
  accountId?: string | number;

  /**
   * 收款时间
   */
  receiptTime?: string;

  /**
   * 合计金额，单位：元
   */
  totalPrice?: number;

  /**
   * 备注
   */
  remark?: string;
}

export interface ReceiptQuery extends PageQuery {
  /**
   * 收款单编号
   */
  no?: string;

  /**
   * 收款状态
   */
  status?: number;

  /**
   * 客户编号
   */
  customerId?: string | number;

  /**
   * 结算账户编号
   */
  accountId?: string | number;

  /**
   * 收款时间
   */
  receiptTime?: string[];

  /**
   * 日期范围参数
   */
  params?: any;
}
