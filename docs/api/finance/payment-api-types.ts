/**
 * 财务管理 - 付款单API接口类型定义
 * 基于RuoYi-Vue-Plus架构设计
 */

/**
 * 付款单状态枚举
 */
export enum PaymentStatus {
  /** 草稿 */
  DRAFT = 0,
  /** 待审批 */
  PENDING_APPROVAL = 1,
  /** 已审批 */
  APPROVED = 2,
  /** 已拒绝 */
  REJECTED = 3,
  /** 已付款 */
  PAID = 4,
  /** 已取消 */
  CANCELLED = 5
}

/**
 * 付款方式枚举
 */
export enum PaymentMethod {
  /** 现金 */
  CASH = 'CASH',
  /** 银行转账 */
  BANK_TRANSFER = 'BANK_TRANSFER',
  /** 支票 */
  CHECK = 'CHECK',
  /** 电子支付 */
  ELECTRONIC = 'ELECTRONIC',
  /** 其他 */
  OTHER = 'OTHER'
}

/**
 * 付款单明细项
 */
export interface PaymentItemVO {
  /** 明细ID */
  id?: string | number;
  /** 付款单ID */
  paymentId?: string | number;
  /** 科目编码 */
  subjectCode: string;
  /** 科目名称 */
  subjectName: string;
  /** 金额 */
  amount: number;
  /** 备注 */
  remark?: string;
}

/**
 * 付款单视图对象
 */
export interface PaymentVO extends BaseEntity {
  /** 编号 */
  id: string | number;
  /** 付款单编号 */
  no: string;
  /** 付款状态 */
  status: PaymentStatus;
  /** 供应商编号 */
  supplierId: string | number;
  /** 供应商名称 */
  supplierName: string;
  /** 供应商联系人 */
  supplierContact?: string;
  /** 结算账户编号 */
  accountId: string | number;
  /** 账户名称 */
  accountName: string;
  /** 付款方式 */
  paymentMethod: PaymentMethod;
  /** 付款时间 */
  paymentTime: string;
  /** 合计金额，单位：元 */
  totalAmount: number;
  /** 已付金额 */
  paidAmount?: number;
  /** 未付金额 */
  unpaidAmount?: number;
  /** 币种 */
  currency?: string;
  /** 汇率 */
  exchangeRate?: number;
  /** 发票号码 */
  invoiceNo?: string;
  /** 合同编号 */
  contractNo?: string;
  /** 业务类型 */
  businessType?: string;
  /** 紧急程度 */
  urgencyLevel?: number;
  /** 备注 */
  remark?: string;
  /** 附件列表 */
  attachments?: string[];
  /** 审批人ID */
  approverId?: string | number;
  /** 审批人姓名 */
  approverName?: string;
  /** 审批时间 */
  approvalTime?: string;
  /** 审批意见 */
  approvalComment?: string;
  /** 付款明细 */
  items?: PaymentItemVO[];
  /** 创建人姓名 */
  createByName?: string;
  /** 更新人姓名 */
  updateByName?: string;
}

/**
 * 付款单表单对象
 */
export interface PaymentForm extends BaseEntity {
  /** 编号 */
  id?: string | number;
  /** 付款单编号 */
  no?: string;
  /** 付款状态 */
  status?: PaymentStatus;
  /** 供应商编号 */
  supplierId: string | number;
  /** 结算账户编号 */
  accountId: string | number;
  /** 付款方式 */
  paymentMethod: PaymentMethod;
  /** 付款时间 */
  paymentTime: string;
  /** 合计金额，单位：元 */
  totalAmount: number;
  /** 币种 */
  currency?: string;
  /** 汇率 */
  exchangeRate?: number;
  /** 发票号码 */
  invoiceNo?: string;
  /** 合同编号 */
  contractNo?: string;
  /** 业务类型 */
  businessType?: string;
  /** 紧急程度 */
  urgencyLevel?: number;
  /** 备注 */
  remark?: string;
  /** 附件列表 */
  attachments?: string[];
  /** 付款明细 */
  items: PaymentItemVO[];
}

/**
 * 付款单查询对象
 */
export interface PaymentQuery extends PageQuery {
  /** 付款单编号 */
  no?: string;
  /** 付款状态 */
  status?: PaymentStatus | PaymentStatus[];
  /** 供应商编号 */
  supplierId?: string | number;
  /** 供应商名称 */
  supplierName?: string;
  /** 结算账户编号 */
  accountId?: string | number;
  /** 付款方式 */
  paymentMethod?: PaymentMethod;
  /** 付款时间范围 */
  paymentTimeRange?: string[];
  /** 创建时间范围 */
  createTimeRange?: string[];
  /** 金额范围 */
  amountRange?: [number, number];
  /** 业务类型 */
  businessType?: string;
  /** 紧急程度 */
  urgencyLevel?: number;
  /** 创建人 */
  createBy?: string | number;
  /** 审批人 */
  approverId?: string | number;
  /** 发票号码 */
  invoiceNo?: string;
  /** 合同编号 */
  contractNo?: string;
  /** 关键字搜索（编号、供应商名称、备注） */
  keyword?: string;
  /** 排序字段 */
  orderBy?: string;
  /** 排序方向 */
  orderDirection?: 'ASC' | 'DESC';
  /** 日期范围参数 */
  params?: any;
}

/**
 * 付款单审批对象
 */
export interface PaymentApprovalForm {
  /** 付款单ID */
  id: string | number;
  /** 审批动作 */
  action: 'APPROVE' | 'REJECT';
  /** 审批意见 */
  comment?: string;
}

/**
 * 付款单统计对象
 */
export interface PaymentStatistics {
  /** 总数量 */
  totalCount: number;
  /** 总金额 */
  totalAmount: number;
  /** 已付金额 */
  paidAmount: number;
  /** 待付金额 */
  pendingAmount: number;
  /** 按状态统计 */
  statusStatistics: {
    status: PaymentStatus;
    count: number;
    amount: number;
  }[];
  /** 按月份统计 */
  monthlyStatistics: {
    month: string;
    count: number;
    amount: number;
  }[];
}

/**
 * 付款单导出查询参数
 */
export interface PaymentExportQuery extends Omit<PaymentQuery, 'pageNum' | 'pageSize'> {
  /** 导出字段 */
  fields?: string[];
  /** 导出格式 */
  format?: 'EXCEL' | 'PDF' | 'CSV';
}
