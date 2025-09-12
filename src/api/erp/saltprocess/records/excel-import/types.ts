/**
 * Excel导入模块 - 类型定义
 * 支持熔盐入库统计表和化盐量记录表的数据导入
 */

// 熔盐入库统计表数据结构
export interface MoltenSaltInventoryRecord {
  id?: string;
  recordCode?: string; // 记录编码 - 系统自动生成
  batchNumber?: string; // 批次号 - 系统自动生成
  date: string; // 日期
  sodiumBags: number; // 钠(单位：袋)
  potassiumBags: number; // 钾(单位：袋)
  totalCrushingAmount: number; // 总粉碎量
  staffCount?: number; // 人数

  // 计算字段
  sodiumWeight?: number; // 钠盐重量(吨) = 袋数 * 1.2
  potassiumWeight?: number; // 钾盐重量(吨) = 袋数 * 1.0
  totalWeight?: number; // 总重量(吨)

  // 元数据
  createTime?: string;
  updateTime?: string;
  createBy?: string;
  updateBy?: string;
  remark?: string;
}

// 化盐量记录表数据结构
export interface SaltProcessRecord {
  id?: string;
  recordCode?: string; // 记录编码 - 系统自动生成
  batchNumber?: string; // 批次号 - 系统自动生成
  sequenceNumber: number; // 序号
  date: string; // 日期
  wasteAmount: number; // 垃圾(单位需确认)
  sodiumNitrate: number; // 硝酸钠
  potassiumNitrate: number; // 硝酸钾
  saltPerWaste: number; // 每垃圾化盐量
  accumulatedSalt: number; // 累积化盐量
  moltenSaltTemperature: number; // 熔盐罐熔盐温度(°C)
  moltenSaltLevel: number; // 熔盐罐熔盐液位(m)
  gasConsumptionPerWaste: number; // 每垃圾天然气耗量(Nm3)
  powerConsumptionPerWaste: number; // 每垃圾用电量(kWh)
  staffCount: number; // 人数
  recorder: string; // 记录人
  remark?: string; // 备注
  
  // 计算字段
  totalNitrate?: number; // 总硝酸盐量
  efficiency?: number; // 处理效率
  
  // 元数据
  createTime?: string;
  updateTime?: string;
  createBy?: string;
  updateBy?: string;
}

// Excel导入配置
export interface ExcelImportConfig {
  sheetName?: string; // 工作表名称
  headerRow: number; // 表头行号(从1开始)
  dataStartRow: number; // 数据开始行号
  columnMapping: Record<string, string>; // 列名映射
  requiredFields: string[]; // 必填字段
  calculatedFields?: string[]; // 可计算字段
}

// 熔盐入库统计表导入配置
export const MOLTEN_SALT_INVENTORY_CONFIG: ExcelImportConfig = {
  // sheetName: 不指定，让系统自动选择第一个工作表
  headerRow: 1, // 表头在第1行
  dataStartRow: 2, // 数据从第2行开始
  columnMapping: {
    // 日期字段的各种可能名称
    '日期': 'date',
    '日明': 'date',
    'Date': 'date',
    '记录日期': 'date',

    // 钠盐字段的各种可能名称 - 根据Excel截图添加更多变体
    '钠（单位：袋）': 'sodiumBags',
    '钠(单位：袋)': 'sodiumBags',
    '钠（单位：...': 'sodiumBags',
    '钠 （单位：...': 'sodiumBags',
    '钠': 'sodiumBags',
    'Na': 'sodiumBags',
    '钠盐': 'sodiumBags',
    '钠 （单位： ...': 'sodiumBags', // 可能有额外空格
    '钠（单位：': 'sodiumBags', // 可能被截断

    // 钾盐字段的各种可能名称 - 根据Excel截图添加更多变体
    '钾（单位：袋）': 'potassiumBags',
    '钾(单位：袋)': 'potassiumBags',
    '钾（单位：...': 'potassiumBags',
    '钾 （单位：...': 'potassiumBags',
    '钾': 'potassiumBags',
    'K': 'potassiumBags',
    '钾盐': 'potassiumBags',
    '钾 （单位： ...': 'potassiumBags', // 可能有额外空格
    '钾（单位：': 'potassiumBags', // 可能被截断

    // 总粉碎量字段
    '总粉碎量': 'totalCrushingAmount',
    '粉碎量': 'totalCrushingAmount',
    '总量': 'totalCrushingAmount',

    // 人数字段
    '人数': 'staffCount',
    '操作人数': 'staffCount',
    '工作人员': 'staffCount'
  },
  requiredFields: ['date', 'sodiumBags', 'potassiumBags'],
  calculatedFields: ['totalCrushingAmount', 'sodiumWeight', 'potassiumWeight', 'totalWeight']
};

// 化盐量记录表导入配置
export const SALT_PROCESS_CONFIG: ExcelImportConfig = {
  // sheetName: 不指定，让系统自动选择第一个工作表
  headerRow: 3, // 考虑到表头可能有合并单元格
  dataStartRow: 4,
  columnMapping: {
    '序号': 'sequenceNumber',
    '日期': 'date',
    '垃圾': 'wasteAmount',
    '硝酸钠': 'sodiumNitrate',
    '硝酸钾': 'potassiumNitrate',
    '每垃圾化盐量': 'saltPerWaste',
    '累积化盐量': 'accumulatedSalt',
    '熔盐罐熔盐温度': 'moltenSaltTemperature',
    '熔盐罐熔盐液位': 'moltenSaltLevel',
    '每垃圾天然气耗量': 'gasConsumptionPerWaste',
    '每垃圾用电量': 'powerConsumptionPerWaste',
    '人数': 'staffCount',
    '记录人': 'recorder',
    '备注': 'remark'
  },
  requiredFields: ['sequenceNumber', 'date', 'wasteAmount'],
  calculatedFields: ['totalNitrate', 'efficiency', 'accumulatedSalt']
};

// Excel导入结果
export interface ExcelImportResult<T> {
  success: boolean;
  data: T[];
  errors: ExcelImportError[];
  summary: {
    totalRows: number;
    successRows: number;
    errorRows: number;
    calculatedFields: string[];
  };
  message?: string;
}

// Excel导入错误
export interface ExcelImportError {
  row: number;
  field?: string;
  message: string;
  type: 'validation' | 'parsing' | 'calculation';
  originalValue?: any;
}

// Excel文件信息
export interface ExcelFileInfo {
  fileName: string;
  fileSize: number;
  sheetNames: string[];
  detectedType: 'molten_salt_inventory' | 'salt_process' | 'unknown';
  config: ExcelImportConfig;
}

// 数据验证规则
export interface ValidationRule {
  field: string;
  type: 'required' | 'number' | 'date' | 'string' | 'range';
  min?: number;
  max?: number;
  pattern?: RegExp;
  message: string;
}

// 熔盐入库统计表验证规则
export const MOLTEN_SALT_VALIDATION_RULES: ValidationRule[] = [
  { field: 'date', type: 'required', message: '日期不能为空' },
  { field: 'date', type: 'date', message: '日期格式不正确' },
  { field: 'sodiumBags', type: 'required', message: '钠盐袋数不能为空' },
  { field: 'sodiumBags', type: 'number', min: 0, message: '钠盐袋数必须大于等于0' },
  { field: 'potassiumBags', type: 'required', message: '钾盐袋数不能为空' },
  { field: 'potassiumBags', type: 'number', min: 0, message: '钾盐袋数必须大于等于0' },
  { field: 'totalCrushingAmount', type: 'number', min: 0, message: '总粉碎量必须大于等于0' }
];

// 化盐量记录表验证规则
export const SALT_PROCESS_VALIDATION_RULES: ValidationRule[] = [
  { field: 'sequenceNumber', type: 'required', message: '序号不能为空' },
  { field: 'sequenceNumber', type: 'number', min: 1, message: '序号必须大于0' },
  { field: 'date', type: 'required', message: '日期不能为空' },
  { field: 'date', type: 'date', message: '日期格式不正确' },
  { field: 'wasteAmount', type: 'required', message: '垃圾量不能为空' },
  { field: 'wasteAmount', type: 'number', min: 0, message: '垃圾量必须大于等于0' },
  { field: 'moltenSaltTemperature', type: 'number', min: 0, max: 1000, message: '温度范围应在0-1000°C之间' },
  { field: 'moltenSaltLevel', type: 'number', min: 0, message: '液位必须大于等于0' },
  { field: 'gasConsumptionPerWaste', type: 'number', min: 0, message: '天然气耗量必须大于等于0' },
  { field: 'powerConsumptionPerWaste', type: 'number', min: 0, message: '用电量必须大于等于0' },
  { field: 'staffCount', type: 'number', min: 1, message: '人数必须大于0' },
  { field: 'recorder', type: 'required', message: '记录人不能为空' }
];

// 盐类规格常量
export const SALT_SPECIFICATIONS = {
  SODIUM_WEIGHT_PER_BAG: 1.2, // 钠盐：1.2吨/袋
  POTASSIUM_WEIGHT_PER_BAG: 1.0 // 钾盐：1.0吨/袋
} as const;

// 导入状态
export type ImportStatus = 'idle' | 'parsing' | 'validating' | 'calculating' | 'completed' | 'error';

// 导入进度信息
export interface ImportProgress {
  status: ImportStatus;
  currentStep: string;
  progress: number; // 0-100
  processedRows: number;
  totalRows: number;
  errors: ExcelImportError[];
}
