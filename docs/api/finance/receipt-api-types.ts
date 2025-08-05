/**
 * 财务管理 - 收款单API接口类型定义
 * 基于RuoYi-Vue-Plus架构设计
 */

/**
 * 收款单状态枚举
 */
export enum ReceiptStatus {
  /** 草稿 */
  DRAFT = 0,
  /** 待审批 */
  PENDING_APPROVAL = 1,
  /** 已审批 */
  APPROVED = 2,
  /** 已拒绝 */
  REJECTED = 3,
  /** 已收款 */
  RECEIVED = 4,
  /** 已取消 */
  CANCELLED = 5
}

/**
 * 收款方式枚举
 */
export enum ReceiptMethod {
  /** 现金 */
  CASH = 'CASH',
  /** 银行转账 */
  BANK_TRANSFER = 'BANK_TRANSFER',
  /** 支票 */
  CHECK = 'CHECK',
  /** 电子支付 */
  ELECTRONIC = 'ELECTRONIC',
  /** 信用卡 */
  CREDIT_CARD = 'CREDIT_CARD',
  /** 其他 */
  OTHER = 'OTHER'
}

/**
 * 收款单明细项
 */
export interface ReceiptItemVO {
  /** 明细ID */
  id?: string | number;
  /** 收款单ID */
  receiptId?: string | number;
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
 * 收款单视图对象
 */
export interface ReceiptVO extends BaseEntity {
  /** 编号 */
  id: string | number;
  /** 收款单编号 */
  no: string;
  /** 收款状态 */
  status: ReceiptStatus;
  /** 客户编号 */
  customerId: string | number;
  /** 客户名称 */
  customerName: string;
  /** 客户联系人 */
  customerContact?: string;
  /** 结算账户编号 */
  accountId: string | number;
  /** 账户名称 */
  accountName: string;
  /** 收款方式 */
  receiptMethod: ReceiptMethod;
  /** 收款时间 */
  receiptTime: string;
  /** 合计金额，单位：元 */
  totalAmount: number;
  /** 已收金额 */
  receivedAmount?: number;
  /** 未收金额 */
  unreceivedAmount?: number;
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
  /** 收款明细 */
  items?: ReceiptItemVO[];
  /** 创建人姓名 */
  createByName?: string;
  /** 更新人姓名 */
  updateByName?: string;
}

/**
 * 收款单表单对象
 */
export interface ReceiptForm extends BaseEntity {
  /** 编号 */
  id?: string | number;
  /** 收款单编号 */
  no?: string;
  /** 收款状态 */
  status?: ReceiptStatus;
  /** 客户编号 */
  customerId: string | number;
  /** 结算账户编号 */
  accountId: string | number;
  /** 收款方式 */
  receiptMethod: ReceiptMethod;
  /** 收款时间 */
  receiptTime: string;
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
  /** 收款明细 */
  items: ReceiptItemVO[];
}

/**
 * 收款单查询对象
 */
export interface ReceiptQuery extends PageQuery {
  /** 收款单编号 */
  no?: string;
  /** 收款状态 */
  status?: ReceiptStatus | ReceiptStatus[];
  /** 客户编号 */
  customerId?: string | number;
  /** 客户名称 */
  customerName?: string;
  /** 结算账户编号 */
  accountId?: string | number;
  /** 收款方式 */
  receiptMethod?: ReceiptMethod;
  /** 收款时间范围 */
  receiptTimeRange?: string[];
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
  /** 关键字搜索（编号、客户名称、备注） */
  keyword?: string;
  /** 排序字段 */
  orderBy?: string;
  /** 排序方向 */
  orderDirection?: 'ASC' | 'DESC';
  /** 日期范围参数 */
  params?: any;
}

/**
 * 收款单审批对象
 */
export interface ReceiptApprovalForm {
  /** 收款单ID */
  id: string | number;
  /** 审批动作 */
  action: 'APPROVE' | 'REJECT';
  /** 审批意见 */
  comment?: string;
}

/**
 * 收款单统计对象
 */
export interface ReceiptStatistics {
  /** 总数量 */
  totalCount: number;
  /** 总金额 */
  totalAmount: number;
  /** 已收金额 */
  receivedAmount: number;
  /** 待收金额 */
  pendingAmount: number;
  /** 按状态统计 */
  statusStatistics: {
    status: ReceiptStatus;
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
 * 收款单导出查询参数
 */
export interface ReceiptExportQuery extends Omit<ReceiptQuery, 'pageNum' | 'pageSize'> {
  /** 导出字段 */
  fields?: string[];
  /** 导出格式 */
  format?: 'EXCEL' | 'PDF' | 'CSV';
}

/**
 * 收款单对账对象
 */
export interface ReceiptReconciliation {
  /** 收款单ID */
  receiptId: string | number;
  /** 银行流水号 */
  bankTransactionNo?: string;
  /** 实际到账金额 */
  actualAmount: number;
  /** 到账时间 */
  actualReceiptTime: string;
  /** 手续费 */
  fee?: number;
  /** 对账状态 */
  reconciliationStatus: 'MATCHED' | 'UNMATCHED' | 'PARTIAL';
  /** 对账备注 */
  reconciliationRemark?: string;
}
