export interface PurchaseOrderVO {
  /**
   * 编号
   */
  id: string | number;

  /**
   * 采购单编号
   */
  no: string;

  /**
   * 采购状态
   */
  status: number;

  /**
   * 供应商
   */
  supplierId: string | number;

  /**
   * 结算账户
   */
  accountId: string | number;

  /**
   * 订单时间
   */
  orderTime: string;

  /**
   * 合计数量
   */
  totalCount: number;

  /**
   * 合计价格，单位：元
   */
  totalPrice: number;

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
   * 定金金额，单位：元
   */
  depositPrice: number;

  /**
   * 附件地址
   */
  fileUrl: string;

  /**
   * 备注
   */
  remark: string;

  /**
   * 采购入库数量
   */
  inCount: number;

  /**
   * 采购退货数量
   */
  returnCount: number;

}

export interface PurchaseOrderForm extends BaseEntity {
  /**
   * 编号
   */
  id?: string | number;

  /**
   * 采购单编号
   */
  no?: string;

  /**
   * 采购状态
   */
  status?: number;

  /**
   * 供应商
   */
  supplierId?: string | number;

  /**
   * 结算账户
   */
  accountId?: string | number;

  /**
   * 订单时间
   */
  orderTime?: string;

  /**
   * 合计数量
   */
  totalCount?: number;

  /**
   * 合计价格，单位：元
   */
  totalPrice?: number;

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
   * 定金金额，单位：元
   */
  depositPrice?: number;

  /**
   * 附件地址
   */
  fileUrl?: string;

  /**
   * 备注
   */
  remark?: string;

  /**
   * 采购入库数量
   */
  inCount?: number;

  /**
   * 采购退货数量
   */
  returnCount?: number;

  // /**
  //  * 采购单明细
  //  */
  // purchaseOrderItems: PurchaseOrderItem[];
}

export interface PurchaseOrderItem{

  /**
   * 产品id
   */
  productId?: string | number;
  /**
   *库存
   */
  stockCount?:string | number;
  /**
   * 条码
   */
  productBarCode?:string | number;

  /**
   * 单位
   */
  productUnitName?:string | number;
  /**
   * 数量
   */
  count?:string | number;

  /**
   * 产品单价
   */
  productPrice?:string | number;
  /**
   * 金额
   */
  totalProductPrice?:string | number;
  /**
   * 税率
   */
  taxPercent?:string | number;
  /**
   * 税额
   */
  taxPrice?:string | number;
  /**
   * 税额合计
   */
  totalPrice?:string | number;
  /**
   * 备注
   */
  remark?:string | number;
}

export interface PurchaseOrderQuery extends PageQuery {

  /**
   * 采购单编号
   */
  no?: string;

  /**
   * 采购状态
   */
  status?: number;

  /**
   * 供应商
   */
  supplierId?: string | number;

  /**
   * 产品
   */
  productId?: string | number;
  inStatus?: string | number;
  returnStatus?: string | number;

  /**
   * 订单时间
   */
  orderTime?: string;

    /**
     * 日期范围参数
     */
    params?: any;
}



