/**
 * 财务管理 - 通用数据模型和类型定义
 * 基于RuoYi-Vue-Plus架构设计
 */

/**
 * 基础实体类型
 */
export interface BaseEntity {
  /** 创建者 */
  createBy?: string | number;
  /** 创建部门 */
  createDept?: string | number;
  /** 创建时间 */
  createTime?: string;
  /** 更新者 */
  updateBy?: string | number;
  /** 更新时间 */
  updateTime?: string;
}

/**
 * 分页查询参数
 */
export interface PageQuery {
  /** 页码 */
  pageNum: number;
  /** 每页数量 */
  pageSize: number;
}

/**
 * 统一响应结果
 */
export interface ApiResponse<T = any> {
  /** 状态码 */
  code: number;
  /** 消息 */
  msg: string;
  /** 数据 */
  data: T;
  /** 时间戳 */
  timestamp?: number;
}

/**
 * 分页响应结果
 */
export interface PageResult<T> {
  /** 数据列表 */
  rows: T[];
  /** 总记录数 */
  total: number;
  /** 当前页码 */
  pageNum: number;
  /** 每页数量 */
  pageSize: number;
  /** 总页数 */
  pages: number;
}

/**
 * 会计科目类型
 */
export interface AccountSubjectVO {
  /** 科目编码 */
  code: string;
  /** 科目名称 */
  name: string;
  /** 科目类型 */
  type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
  /** 科目级别 */
  level: number;
  /** 父科目编码 */
  parentCode?: string;
  /** 是否启用 */
  enabled: boolean;
  /** 备注 */
  remark?: string;
}

/**
 * 供应商简化信息
 */
export interface SupplierSimpleVO {
  /** 供应商ID */
  id: string | number;
  /** 供应商名称 */
  name: string;
  /** 联系人 */
  contact?: string;
  /** 联系电话 */
  mobile?: string;
  /** 状态 */
  status: number;
}

/**
 * 客户简化信息
 */
export interface CustomerSimpleVO {
  /** 客户ID */
  id: string | number;
  /** 客户名称 */
  name: string;
  /** 联系人 */
  contact?: string;
  /** 联系电话 */
  mobile?: string;
  /** 状态 */
  status: string;
}

/**
 * 结算账户简化信息
 */
export interface AccountSimpleVO {
  /** 账户ID */
  id: string | number;
  /** 账户名称 */
  name: string;
  /** 账户编码 */
  no: string;
  /** 是否默认 */
  defaultStatus: number;
  /** 状态 */
  status: number;
}

/**
 * 审批历史记录
 */
export interface ApprovalHistoryVO {
  /** 记录ID */
  id: string | number;
  /** 单据ID */
  documentId: string | number;
  /** 单据类型 */
  documentType: 'PAYMENT' | 'RECEIPT';
  /** 审批人ID */
  approverId: string | number;
  /** 审批人姓名 */
  approverName: string;
  /** 审批动作 */
  action: 'SUBMIT' | 'APPROVE' | 'REJECT' | 'WITHDRAW' | 'CANCEL';
  /** 审批意见 */
  comment?: string;
  /** 审批时间 */
  approvalTime: string;
  /** 状态变更 */
  statusChange: {
    from: number;
    to: number;
  };
}

/**
 * 附件信息
 */
export interface AttachmentVO {
  /** 附件ID */
  id: string | number;
  /** 文件名 */
  fileName: string;
  /** 文件大小 */
  fileSize: number;
  /** 文件类型 */
  fileType: string;
  /** 文件路径 */
  filePath: string;
  /** 上传时间 */
  uploadTime: string;
  /** 上传人 */
  uploadBy: string | number;
}

/**
 * 导入结果
 */
export interface ImportResult {
  /** 总数量 */
  total: number;
  /** 成功数量 */
  success: number;
  /** 失败数量 */
  failure: number;
  /** 错误信息 */
  errors: {
    row: number;
    message: string;
  }[];
  /** 导入时间 */
  importTime: string;
}

/**
 * 批量操作结果
 */
export interface BatchOperationResult {
  /** 总数量 */
  total: number;
  /** 成功数量 */
  success: number;
  /** 失败数量 */
  failure: number;
  /** 失败详情 */
  failures: {
    id: string | number;
    reason: string;
  }[];
}

/**
 * 字典数据选项
 */
export interface DictOption {
  /** 字典标签 */
  label: string;
  /** 字典值 */
  value: string | number;
  /** 标签类型 */
  elTagType?: 'primary' | 'success' | 'info' | 'warning' | 'danger';
  /** 标签样式类 */
  elTagClass?: string;
  /** 是否默认 */
  isDefault?: boolean;
  /** 排序 */
  sort?: number;
  /** 状态 */
  status?: string;
  /** 备注 */
  remark?: string;
}

/**
 * 系统配置
 */
export interface SystemConfig {
  /** 配置键 */
  configKey: string;
  /** 配置值 */
  configValue: string;
  /** 配置名称 */
  configName: string;
  /** 配置类型 */
  configType: string;
  /** 是否系统内置 */
  isSystem: boolean;
  /** 备注 */
  remark?: string;
}

/**
 * 用户信息
 */
export interface UserInfo {
  /** 用户ID */
  userId: string | number;
  /** 用户名 */
  userName: string;
  /** 昵称 */
  nickName: string;
  /** 部门ID */
  deptId: string | number;
  /** 部门名称 */
  deptName?: string;
  /** 角色列表 */
  roles: string[];
  /** 权限列表 */
  permissions: string[];
}

/**
 * 错误码枚举
 */
export enum ErrorCode {
  /** 成功 */
  SUCCESS = 200,
  /** 参数错误 */
  PARAM_ERROR = 400,
  /** 未授权 */
  UNAUTHORIZED = 401,
  /** 禁止访问 */
  FORBIDDEN = 403,
  /** 资源不存在 */
  NOT_FOUND = 404,
  /** 服务器错误 */
  SERVER_ERROR = 500,
  /** 业务异常 */
  BUSINESS_ERROR = 600
}

/**
 * 操作日志类型
 */
export interface OperationLog {
  /** 日志ID */
  id: string | number;
  /** 操作模块 */
  module: string;
  /** 操作类型 */
  operationType: 'CREATE' | 'UPDATE' | 'DELETE' | 'QUERY' | 'EXPORT' | 'IMPORT' | 'APPROVE';
  /** 操作描述 */
  description: string;
  /** 操作人 */
  operator: string;
  /** 操作时间 */
  operationTime: string;
  /** 操作IP */
  operationIp: string;
  /** 请求参数 */
  requestParams?: string;
  /** 响应结果 */
  responseResult?: string;
  /** 执行时间（毫秒） */
  executionTime: number;
  /** 是否成功 */
  success: boolean;
  /** 错误信息 */
  errorMessage?: string;
}
