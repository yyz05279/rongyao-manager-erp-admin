/**
 * 化盐项目数据记录系统前端集成示例代码
 * 
 * 本文件提供了完整的前端集成示例，包括：
 * 1. API客户端配置
 * 2. 类型定义
 * 3. 服务封装
 * 4. Vue组件示例
 * 5. 错误处理
 * 6. 工具函数
 */

import axios, { AxiosResponse, AxiosRequestConfig } from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';

// ==================== 类型定义 ====================

// 通用响应类型
interface ApiResponse<T = any> {
  code: number;
  msg: string;
  data: T;
}

// 分页响应类型
interface PageResponse<T = any> {
  code: number;
  msg: string;
  rows: T[];
  total: number;
}

// 分页查询参数
interface PageQuery {
  pageNum?: number;
  pageSize?: number;
}

// 预热数据记录类型
interface PreheatingDataRecordVo {
  id: number;
  recordCode: string;
  taskId: number;
  projectId: number;
  tankNumber: string;
  recordDate: string;
  recordTime: string;
  shift: number;
  targetTemperature: number;
  actualTemperature: number;
  temperatureDeviation?: number;
  heatingRate?: number;
  targetPressure?: number;
  actualPressure?: number;
  pressureDeviation?: number;
  heatingPower?: number;
  heatingEfficiency?: number;
  equipmentStatus: number;
  alarmStatus: number;
  energyConsumption?: number;
  hourlyConsumption?: number;
  operatorId: number;
  operatorName: string;
  supervisorId?: number;
  supervisorName?: string;
  qualityStatus: number;
  deviationReason?: string;
  correctiveAction?: string;
  remarks?: string;
  createTime: string;
}

interface PreheatingDataRecordBo {
  id?: number;
  recordCode: string;
  taskId: number;
  projectId: number;
  tankNumber: string;
  recordDate: string;
  recordTime: string;
  shift: number;
  targetTemperature: number;
  actualTemperature: number;
  heatingRate?: number;
  targetPressure?: number;
  actualPressure?: number;
  heatingPower?: number;
  heatingEfficiency?: number;
  equipmentStatus: number;
  alarmStatus?: number;
  energyConsumption?: number;
  hourlyConsumption?: number;
  operatorId: number;
  operatorName: string;
  supervisorId?: number;
  supervisorName?: string;
  qualityStatus?: number;
  deviationReason?: string;
  correctiveAction?: string;
  remarks?: string;
}

interface PreheatingDataRecordQuery extends PageQuery {
  recordCode?: string;
  taskId?: number;
  projectId?: number;
  tankNumber?: string;
  recordDate?: string;
  qualityStatus?: number;
}

// 数据分析类型
interface ProjectStatistics {
  preheatingRecordCount: number;
  binaryRecordCount: number;
  binaryTotalCost: number;
  ternaryRecordCount: number;
  ternaryTotalCost: number;
  totalCost: number;
  totalRecordCount: number;
}

interface ProductionStatistics {
  binaryProductionCount: number;
  binaryTotalOutput: number;
  binaryAvgYieldRate: number;
  ternaryProductionCount: number;
  ternaryTotalOutput: number;
  ternaryAvgYieldRate: number;
  ternaryAvgStabilityIndex: number;
  totalOutput: number;
  avgYieldRate: number;
}

// ==================== API客户端配置 ====================

// 创建axios实例
const apiClient = axios.create({
  baseURL: process.env.VUE_APP_API_BASE_URL || 'http://localhost:8080',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // 添加认证token
    const token = localStorage.getItem('satoken') || sessionStorage.getItem('satoken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 添加请求ID用于追踪
    if (config.headers) {
      config.headers['X-Request-ID'] = generateRequestId();
    }
    
    console.log('API Request:', config.method?.toUpperCase(), config.url, config.params || config.data);
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    const { code, msg, data } = response.data;
    
    console.log('API Response:', response.config.url, { code, msg, dataLength: Array.isArray(data) ? data.length : 'object' });
    
    if (code !== 200) {
      console.error('API Error:', msg);
      
      // 特殊错误码处理
      if (code === 401) {
        handleUnauthorized();
        return Promise.reject(new Error('登录已过期'));
      } else if (code === 403) {
        ElMessage.error('权限不足，无法执行此操作');
        return Promise.reject(new Error('权限不足'));
      }
      
      throw new Error(msg || '操作失败');
    }
    
    return response.data;
  },
  (error) => {
    console.error('Response Error:', error);
    
    if (error.response) {
      const { status, data } = error.response;
      let message = '操作失败';
      
      switch (status) {
        case 400:
          message = data?.msg || '请求参数错误';
          break;
        case 401:
          message = '登录已过期，请重新登录';
          handleUnauthorized();
          break;
        case 403:
          message = '权限不足，无法执行此操作';
          break;
        case 404:
          message = '请求的资源不存在';
          break;
        case 500:
          message = '服务器内部错误';
          break;
        default:
          message = data?.msg || `请求失败 (${status})`;
      }
      
      ElMessage.error(message);
    } else if (error.request) {
      ElMessage.error('网络连接失败，请检查网络设置');
    } else {
      ElMessage.error(error.message || '未知错误');
    }
    
    return Promise.reject(error);
  }
);

// ==================== 工具函数 ====================

// 生成请求ID
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// 处理未授权
function handleUnauthorized(): void {
  localStorage.removeItem('satoken');
  sessionStorage.removeItem('satoken');
  
  // 如果在Vue Router环境中
  if (typeof window !== 'undefined' && window.location) {
    window.location.href = '/login';
  }
}

// 下载文件
function downloadFile(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

// 格式化日期
function formatDate(date: Date | string, format: string = 'YYYY-MM-DD'): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  
  return format
    .replace('YYYY', year.toString())
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

// ==================== API服务封装 ====================

// 预热数据记录API服务
export class PreheatingDataRecordService {
  private static readonly BASE_URL = '/erp/saltprocess/preheating-record';

  // 查询列表
  static async getList(params: PreheatingDataRecordQuery): Promise<PageResponse<PreheatingDataRecordVo>> {
    return apiClient.get(`${this.BASE_URL}/list`, { params });
  }

  // 获取详情
  static async getById(id: number): Promise<ApiResponse<PreheatingDataRecordVo>> {
    return apiClient.get(`${this.BASE_URL}/${id}`);
  }

  // 新增记录
  static async create(data: PreheatingDataRecordBo): Promise<ApiResponse<void>> {
    return apiClient.post(this.BASE_URL, data);
  }

  // 修改记录
  static async update(data: PreheatingDataRecordBo): Promise<ApiResponse<void>> {
    return apiClient.put(this.BASE_URL, data);
  }

  // 删除记录
  static async delete(ids: number[]): Promise<ApiResponse<void>> {
    return apiClient.delete(`${this.BASE_URL}/${ids.join(',')}`);
  }

  // 根据任务ID查询
  static async getByTaskId(taskId: number): Promise<ApiResponse<PreheatingDataRecordVo[]>> {
    return apiClient.get(`${this.BASE_URL}/task/${taskId}`);
  }

  // 根据项目ID查询
  static async getByProjectId(projectId: number): Promise<ApiResponse<PreheatingDataRecordVo[]>> {
    return apiClient.get(`${this.BASE_URL}/project/${projectId}`);
  }

  // 根据日期范围查询
  static async getByDateRange(startDate: string, endDate: string): Promise<ApiResponse<PreheatingDataRecordVo[]>> {
    return apiClient.get(`${this.BASE_URL}/date-range`, {
      params: { startDate, endDate }
    });
  }

  // 根据熔盐罐编号查询
  static async getByTankNumber(tankNumber: string): Promise<ApiResponse<PreheatingDataRecordVo[]>> {
    return apiClient.get(`${this.BASE_URL}/tank/${tankNumber}`);
  }

  // 查询最新记录
  static async getLatest(taskId: number): Promise<ApiResponse<PreheatingDataRecordVo>> {
    return apiClient.get(`${this.BASE_URL}/latest/${taskId}`);
  }

  // 统计记录数量
  static async countByDateRange(startDate: string, endDate: string): Promise<ApiResponse<number>> {
    return apiClient.get(`${this.BASE_URL}/count`, {
      params: { startDate, endDate }
    });
  }

  // 导出数据
  static async export(params: PreheatingDataRecordQuery): Promise<void> {
    const response = await apiClient.post(`${this.BASE_URL}/export`, params, {
      responseType: 'blob',
    });
    
    const filename = `预热数据记录_${formatDate(new Date(), 'YYYY-MM-DD_HH-mm-ss')}.xlsx`;
    downloadFile(response.data, filename);
  }

  // 导入数据
  static async import(file: File): Promise<ApiResponse<void>> {
    const formData = new FormData();
    formData.append('file', file);
    
    return apiClient.post(`${this.BASE_URL}/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  // 获取导入模板
  static async downloadTemplate(): Promise<void> {
    const response = await apiClient.post(`${this.BASE_URL}/importTemplate`, {}, {
      responseType: 'blob',
    });
    
    const filename = '预热数据记录导入模板.xlsx';
    downloadFile(response.data, filename);
  }
}

// 数据分析API服务
export class SaltProcessAnalysisService {
  private static readonly BASE_URL = '/erp/saltprocess/analysis';

  // 项目统计
  static async getProjectStatistics(projectId: number): Promise<ApiResponse<ProjectStatistics>> {
    return apiClient.get(`${this.BASE_URL}/project-statistics/${projectId}`);
  }

  // 生产统计
  static async getProductionStatistics(startDate: string, endDate: string): Promise<ApiResponse<ProductionStatistics>> {
    return apiClient.get(`${this.BASE_URL}/production-statistics`, {
      params: { startDate, endDate }
    });
  }

  // 质量分析
  static async getQualityAnalysis(projectId: number, startDate: string, endDate: string): Promise<ApiResponse<any>> {
    return apiClient.get(`${this.BASE_URL}/quality-analysis/${projectId}`, {
      params: { startDate, endDate }
    });
  }

  // 成本分析
  static async getCostAnalysis(projectId: number, startDate: string, endDate: string): Promise<ApiResponse<any>> {
    return apiClient.get(`${this.BASE_URL}/cost-analysis/${projectId}`, {
      params: { startDate, endDate }
    });
  }

  // 产出率趋势
  static async getYieldRateTrend(projectId: number, startDate: string, endDate: string): Promise<ApiResponse<any[]>> {
    return apiClient.get(`${this.BASE_URL}/yield-rate-trend/${projectId}`, {
      params: { startDate, endDate }
    });
  }

  // 温度控制分析
  static async getTemperatureControlAnalysis(taskId: number): Promise<ApiResponse<any>> {
    return apiClient.get(`${this.BASE_URL}/temperature-control/${taskId}`);
  }

  // 预警信息
  static async getAlerts(projectId: number): Promise<ApiResponse<any[]>> {
    return apiClient.get(`${this.BASE_URL}/alerts/${projectId}`);
  }

  // 综合分析报告
  static async generateComprehensiveReport(projectId: number, startDate: string, endDate: string): Promise<ApiResponse<any>> {
    return apiClient.get(`${this.BASE_URL}/comprehensive-report/${projectId}`, {
      params: { startDate, endDate }
    });
  }

  // 实时监控数据
  static async getRealTimeMonitoringData(taskId: number): Promise<ApiResponse<any>> {
    return apiClient.get(`${this.BASE_URL}/real-time-monitoring/${taskId}`);
  }
}

// ==================== 表单验证规则 ====================

export const preheatingDataRecordRules = {
  recordCode: [
    { required: true, message: '记录编码不能为空', trigger: 'blur' },
    { max: 50, message: '记录编码长度不能超过50个字符', trigger: 'blur' }
  ],
  taskId: [
    { required: true, message: '预热任务ID不能为空', trigger: 'blur' }
  ],
  projectId: [
    { required: true, message: '项目ID不能为空', trigger: 'blur' }
  ],
  tankNumber: [
    { required: true, message: '熔盐罐编号不能为空', trigger: 'blur' },
    { max: 20, message: '熔盐罐编号长度不能超过20个字符', trigger: 'blur' }
  ],
  recordDate: [
    { required: true, message: '记录日期不能为空', trigger: 'blur' }
  ],
  recordTime: [
    { required: true, message: '记录时间不能为空', trigger: 'blur' }
  ],
  shift: [
    { required: true, message: '班次不能为空', trigger: 'blur' }
  ],
  targetTemperature: [
    { required: true, message: '目标温度不能为空', trigger: 'blur' },
    { type: 'number', min: 0, max: 1000, message: '目标温度范围为0-1000°C', trigger: 'blur' }
  ],
  actualTemperature: [
    { required: true, message: '实际温度不能为空', trigger: 'blur' },
    { type: 'number', min: 0, max: 1000, message: '实际温度范围为0-1000°C', trigger: 'blur' }
  ],
  operatorId: [
    { required: true, message: '操作员ID不能为空', trigger: 'blur' }
  ],
  operatorName: [
    { required: true, message: '操作员姓名不能为空', trigger: 'blur' },
    { max: 50, message: '操作员姓名长度不能超过50个字符', trigger: 'blur' }
  ]
};

// ==================== 常量定义 ====================

// 班次选项
export const SHIFT_OPTIONS = [
  { label: '白班', value: 1 },
  { label: '夜班', value: 2 }
];

// 设备状态选项
export const EQUIPMENT_STATUS_OPTIONS = [
  { label: '正常', value: 1 },
  { label: '异常', value: 2 },
  { label: '维护', value: 3 }
];

// 报警状态选项
export const ALARM_STATUS_OPTIONS = [
  { label: '无报警', value: 0 },
  { label: '温度报警', value: 1 },
  { label: '压力报警', value: 2 },
  { label: '设备报警', value: 3 }
];

// 质量状态选项
export const QUALITY_STATUS_OPTIONS = [
  { label: '正常', value: 1 },
  { label: '异常', value: 2 },
  { label: '待检查', value: 3 }
];

// ==================== 导出 ====================

export {
  apiClient,
  formatDate,
  downloadFile,
  generateRequestId,
  handleUnauthorized
};

export type {
  ApiResponse,
  PageResponse,
  PageQuery,
  PreheatingDataRecordVo,
  PreheatingDataRecordBo,
  PreheatingDataRecordQuery,
  ProjectStatistics,
  ProductionStatistics
};
