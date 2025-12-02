export interface PurchaseInVO {
  /**
   * 编号
   */
  id: string | number;

  /**
   * 采购入库编号
   */
  no: string;

  /**
   * 采购状态
   */
  status: number;

  /**
   * 供应商编号
   */
  supplierId: string | number;

  /**
   * 结算账户编号
   */
  accountId: string | number;

  /**
   * 入库时间
   */
  inTime: string;

  /**
   * 采购订单编号
   */
  orderId: string | number;

  /**
   * 采购订单号
   */
  orderNo: string;

  /**
   * 合计数量
   */
  totalCount: number;

  /**
   * 合计价格，单位：元
   */
  totalPrice: number;

  /**
   * 已付款金额，单位：元
   */
  paymentPrice: number;

  /**
   * 合计产品价格，单位：元
   */
  totalProductPrice: number;

  /**
   * 合计税额，单位：元
   */
  totalTaxPrice: number;

  /**
   * 优惠率，百分比
   */
  discountPercent: number;

  /**
   * 优惠金额，单位：元
   */
  discountPrice: number;

  /**
   * 其它金额，单位：元
   */
  otherPrice: number;

  /**
   * 附件地址
   */
  fileUrl: string;

  /**
   * 备注
   */
  remark: string;

}

export interface PurchaseInForm extends BaseEntity {
  /**
   * 编号
   */
  id?: string | number;

  /**
   * 采购入库编号
   */
  no?: string;

  /**
   * 采购状态
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
   * 入库时间
   */
  inTime?: string;

  /**
   * 采购订单编号
   */
  orderId?: string | number;

  /**
   * 采购订单号
   */
  orderNo?: string;

  /**
   * 合计数量
   */
  totalCount?: number;

  /**
   * 合计价格，单位：元
   */
  totalPrice?: number;

  /**
   * 已付款金额，单位：元
   */
  paymentPrice?: number;

  /**
   * 合计产品价格，单位：元
   */
  totalProductPrice?: number;

  /**
   * 合计税额，单位：元
   */
  totalTaxPrice?: number;

  /**
   * 优惠率，百分比
   */
  discountPercent?: number;

  /**
   * 优惠金额，单位：元
   */
  discountPrice?: number;

  /**
   * 其它金额，单位：元
   */
  otherPrice?: number;

  /**
   * 附件地址
   */
  fileUrl?: string;

  /**
   * 备注
   */
  remark?: string;

  /**
   * 采购入库项
   */
  items?: any[];

}

export interface PurchaseInQuery extends PageQuery {

  /**
   * 采购入库编号
   */
  no?: string;

  /**
   * 采购状态
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
   * 入库时间
   */
  inTime?: string;

  /**
   * 采购订单编号
   */
  orderId?: string | number;

  /**
   * 采购订单号
   */
  orderNo?: string;

  /**
   * 合计数量
   */
  totalCount?: number;

  /**
   * 合计价格，单位：元
   */
  totalPrice?: number;

  /**
   * 已付款金额，单位：元
   */
  paymentPrice?: number;

  /**
   * 合计产品价格，单位：元
   */
  totalProductPrice?: number;

  /**
   * 合计税额，单位：元
   */
  totalTaxPrice?: number;

  /**
   * 优惠率，百分比
   */
  discountPercent?: number;

  /**
   * 优惠金额，单位：元
   */
  discountPrice?: number;

  /**
   * 其它金额，单位：元
   */
  otherPrice?: number;

  /**
   * 附件地址
   */
  fileUrl?: string;

  /**
   * 日期范围参数
   */
  params?: any;

  /**
   * 产品
   */
  productId?: string | number;
  /**
   * 仓库
   */
  wareHouseId?: string | number;
  /**
   * 创建人
   */
  createBy?: string;
  /**
   * 付款状态
   */
  paymentStatus?: string | number;
}



