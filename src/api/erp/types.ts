/**
 * ERP模块通用类型定义
 */

// 分页结果
export interface PageResult<T> {
  records: T[];
  total: number;
  size: number;
  current: number;
  pages: number;
}

// 通用查询参数
export interface BaseQuery {
  pageNum?: number;
  pageSize?: number;
  orderByColumn?: string;
  isAsc?: string;
}

// 通用响应结果
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

// 通用实体基类
export interface BaseEntity {
  createBy?: string;
  createTime?: string;
  updateBy?: string;
  updateTime?: string;
  remark?: string;
}

// 通用树形结构
export interface TreeNode {
  id: string | number;
  label: string;
  children?: TreeNode[];
  parentId?: string | number;
  level?: number;
  expanded?: boolean;
  checked?: boolean;
  disabled?: boolean;
}

// 字典数据
export interface DictData {
  dictCode: number;
  dictSort: number;
  dictLabel: string;
  dictValue: string;
  dictType: string;
  cssClass?: string;
  listClass?: string;
  isDefault: string;
  status: string;
  createBy?: string;
  createTime?: string;
  updateBy?: string;
  updateTime?: string;
  remark?: string;
}

// 文件上传响应
export interface UploadResponse {
  fileName: string;
  newFileName: string;
  originalFilename: string;
  url: string;
  size: number;
  contentType: string;
}

// 导入结果
export interface ImportResult {
  successCount: number;
  failureCount: number;
  totalCount: number;
  successList?: any[];
  failureList?: Array<{
    row: number;
    message: string;
    data?: any;
  }>;
}

// 导出参数
export interface ExportParams {
  fileName?: string;
  sheetName?: string;
  exportFields?: string[];
  exportFormat?: 'excel' | 'csv' | 'pdf';
  query?: any;
}

// 批量操作参数
export interface BatchParams {
  ids: Array<string | number>;
  operation: string;
  params?: any;
}

// 统计数据
export interface StatisticsData {
  label: string;
  value: number;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
  color?: string;
}

// 图表数据点
export interface ChartDataPoint {
  name: string;
  value: number;
  category?: string;
  time?: string;
  extra?: any;
}

// 图表系列数据
export interface ChartSeries {
  name: string;
  type: string;
  data: ChartDataPoint[];
  color?: string;
}

// 审核状态枚举
export enum AuditStatus {
  PENDING = 0,
  APPROVED = 1,
  REJECTED = 2
}

// 通用状态枚举
export enum CommonStatus {
  DISABLED = 0,
  ENABLED = 1
}

// 删除标志枚举
export enum DelFlag {
  NORMAL = '0',
  DELETED = '2'
}

// 性别枚举
export enum Gender {
  MALE = '0',
  FEMALE = '1',
  UNKNOWN = '2'
}

// 是否枚举
export enum YesNo {
  NO = 'N',
  YES = 'Y'
}

// 操作类型枚举
export enum OperationType {
  INSERT = 'INSERT',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  SELECT = 'SELECT',
  EXPORT = 'EXPORT',
  IMPORT = 'IMPORT',
  FORCE = 'FORCE',
  GRANT = 'GRANT',
  OTHER = 'OTHER'
}

// 业务类型枚举
export enum BusinessType {
  OTHER = 0,
  INSERT = 1,
  UPDATE = 2,
  DELETE = 3,
  GRANT = 4,
  EXPORT = 5,
  IMPORT = 6,
  FORCE = 7,
  GENCODE = 8,
  CLEAN = 9
}

// 数据范围枚举
export enum DataScope {
  ALL = '1',
  CUSTOM = '2',
  DEPT = '3',
  DEPT_AND_CHILD = '4',
  SELF = '5'
}

// 菜单类型枚举
export enum MenuType {
  DIRECTORY = 'M',
  MENU = 'C',
  BUTTON = 'F'
}

// 显示状态枚举
export enum Visible {
  SHOW = '0',
  HIDE = '1'
}

// 组件状态枚举
export enum ComponentStatus {
  NORMAL = '0',
  DISABLE = '1'
}

// 框架类型枚举
export enum FrameType {
  NO = '1',
  YES = '0'
}

// 缓存类型枚举
export enum CacheType {
  CACHE = '0',
  NO_CACHE = '1'
}

// 路由参数
export interface RouteParams {
  path: string;
  component?: string;
  name?: string;
  meta?: {
    title?: string;
    icon?: string;
    noCache?: boolean;
    link?: string;
  };
  children?: RouteParams[];
}

// 用户信息
export interface UserInfo {
  userId: number;
  userName: string;
  nickName: string;
  email?: string;
  phonenumber?: string;
  sex?: string;
  avatar?: string;
  status: string;
  delFlag: string;
  loginIp?: string;
  loginDate?: string;
  createBy?: string;
  createTime?: string;
  updateBy?: string;
  updateTime?: string;
  remark?: string;
  dept?: any;
  roles?: any[];
  roleIds?: number[];
  postIds?: number[];
  roleId?: number;
}

// 角色信息
export interface RoleInfo {
  roleId: number;
  roleName: string;
  roleKey: string;
  roleSort: number;
  dataScope: string;
  menuCheckStrictly: boolean;
  deptCheckStrictly: boolean;
  status: string;
  delFlag: string;
  createBy?: string;
  createTime?: string;
  updateBy?: string;
  updateTime?: string;
  remark?: string;
  flag?: boolean;
  menuIds?: number[];
  deptIds?: number[];
  permissions?: string[];
}

// 部门信息
export interface DeptInfo {
  deptId: number;
  parentId: number;
  ancestors: string;
  deptName: string;
  orderNum: number;
  leader?: string;
  phone?: string;
  email?: string;
  status: string;
  delFlag: string;
  createBy?: string;
  createTime?: string;
  updateBy?: string;
  updateTime?: string;
  children?: DeptInfo[];
}

// 岗位信息
export interface PostInfo {
  postId: number;
  postCode: string;
  postName: string;
  postSort: number;
  status: string;
  createBy?: string;
  createTime?: string;
  updateBy?: string;
  updateTime?: string;
  remark?: string;
  flag?: boolean;
}

// 菜单信息
export interface MenuInfo {
  menuId: number;
  menuName: string;
  parentId: number;
  orderNum: number;
  path: string;
  component?: string;
  query?: string;
  isFrame: string;
  isCache: string;
  menuType: string;
  visible: string;
  status: string;
  perms?: string;
  icon: string;
  createBy?: string;
  createTime?: string;
  updateBy?: string;
  updateTime?: string;
  remark?: string;
  children?: MenuInfo[];
}

// 操作日志
export interface OperLog {
  operId: number;
  title: string;
  businessType: number;
  method: string;
  requestMethod: string;
  operatorType: number;
  operName: string;
  deptName?: string;
  operUrl: string;
  operIp: string;
  operLocation?: string;
  operParam?: string;
  jsonResult?: string;
  status: number;
  errorMsg?: string;
  operTime: string;
  costTime: number;
}

// 登录日志
export interface LoginLog {
  infoId: number;
  userName: string;
  ipaddr: string;
  loginLocation?: string;
  browser?: string;
  os?: string;
  status: string;
  msg?: string;
  loginTime: string;
}

// 在线用户
export interface OnlineUser {
  tokenId: string;
  userName: string;
  ipaddr: string;
  loginLocation?: string;
  browser?: string;
  os?: string;
  loginTime: string;
}
