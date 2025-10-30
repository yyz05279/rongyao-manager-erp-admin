/**
 * 发货清单 Excel 数据解析工具
 * 用于从Excel文件中提取发货类型、子系统等信息
 */

import { EquipmentType } from './types';

/**
 * 设备类型映射表
 * 从中文标识映射到枚举值
 */
const EQUIPMENT_TYPE_MAP: Record<string, EquipmentType> = {
  '机械': EquipmentType.MECHANICAL,
  '机械设备': EquipmentType.MECHANICAL,
  'MECHANICAL': EquipmentType.MECHANICAL,
  '电控': EquipmentType.ELECTRICAL,
  '电气': EquipmentType.ELECTRICAL,
  '电控设备': EquipmentType.ELECTRICAL,
  'ELECTRICAL': EquipmentType.ELECTRICAL,
  '管路': EquipmentType.PIPELINE,
  '管道': EquipmentType.PIPELINE,
  '管路设备': EquipmentType.PIPELINE,
  'PIPELINE': EquipmentType.PIPELINE,
  '燃烧器': EquipmentType.BURNER,
  'BURNER': EquipmentType.BURNER,
  '辅助': EquipmentType.AUXILIARY,
  '辅助设备': EquipmentType.AUXILIARY,
  'AUXILIARY': EquipmentType.AUXILIARY,
  '标准件': EquipmentType.STANDARD_PARTS,
  'STANDARD_PARTS': EquipmentType.STANDARD_PARTS
};

/**
 * 从Excel标题中提取设备类型
 * 例如：从 "淮安化盐系统-发货清单（机械）" 中提取 "机械"
 *
 * @param title Excel文件标题（通常在第一行）
 * @returns 设备类型枚举值或undefined
 */
export const extractEquipmentTypeFromTitle = (title: string): EquipmentType | undefined => {
  if (!title) {
    return undefined;
  }

  // 匹配括号内的内容，如：（机械）、(电控)、【管路】等
  const bracketPatterns = [
    /[（(]([^)）]+)[)）]/g,  // 圆括号
    /[【\[]([^\]】]+)[\]】]/g  // 方括号
  ];

  for (const pattern of bracketPatterns) {
    const matches = title.match(pattern);
    if (matches && matches.length > 0) {
      // 取最后一个匹配项（通常最后的括号是类型标识）
      const lastMatch = matches[matches.length - 1];
      const content = lastMatch.replace(/[（(【\[)）】\]]/g, '').trim();

      // 查找匹配的设备类型
      const equipmentType = EQUIPMENT_TYPE_MAP[content];
      if (equipmentType) {
        return equipmentType;
      }
    }
  }

  // 如果括号内没找到，尝试直接匹配关键词
  for (const [keyword, type] of Object.entries(EQUIPMENT_TYPE_MAP)) {
    if (title.includes(keyword)) {
      return type;
    }
  }

  return undefined;
};

/**
 * 从Excel第二行提取子系统信息
 * 例如：从 "固态处理厂" 中提取子系统名称
 *
 * @param row Excel第二行的数据对象或字符串
 * @returns 子系统名称或undefined
 */
export const extractSubsystemFromSecondRow = (row: any): string | undefined => {
  if (!row) {
    return undefined;
  }

  // 如果是字符串，直接返回
  if (typeof row === 'string') {
    const trimmed = row.trim();
    return trimmed || undefined;
  }

  // 如果是对象，尝试从常见的字段中提取
  const possibleFields = [
    'subsystem',
    '子系统',
    '所属系统',
    'system',
    '系统名称',
    '工厂',
    '车间',
    // 也可能在第一列
    'A',
    'col0',
    'column0'
  ];

  for (const field of possibleFields) {
    if (row[field]) {
      const value = String(row[field]).trim();
      if (value) {
        return value;
      }
    }
  }

  // 如果以上都没有，尝试获取第一个非空值
  const values = Object.values(row);
  for (const value of values) {
    if (value) {
      const strValue = String(value).trim();
      if (strValue && !isNumericOrEmpty(strValue)) {
        return strValue;
      }
    }
  }

  return undefined;
};

/**
 * 智能提取发货类型（兼容多种格式）
 * 优先级：标题括号内容 > 标题关键词 > 默认值
 *
 * @param title Excel标题
 * @param defaultType 默认类型
 * @returns 发货类型字符串（中文）
 */
export const extractShippingType = (title: string, defaultType?: string): string | undefined => {
  const equipmentType = extractEquipmentTypeFromTitle(title);

  if (equipmentType) {
    // 将枚举值转换回中文
    const typeNameMap: Record<EquipmentType, string> = {
      [EquipmentType.MECHANICAL]: '机械',
      [EquipmentType.ELECTRICAL]: '电控',
      [EquipmentType.PIPELINE]: '管路',
      [EquipmentType.BURNER]: '燃烧器',
      [EquipmentType.AUXILIARY]: '辅助设备',
      [EquipmentType.STANDARD_PARTS]: '标准件'
    };
    return typeNameMap[equipmentType];
  }

  return defaultType;
};

/**
 * 批量提取设备类型
 * 用于处理明细数据，如果明细中没有指定类型，使用从标题提取的类型
 *
 * @param items 设备明细列表
 * @param defaultType 默认设备类型（从标题提取）
 * @returns 添加了设备类型的明细列表
 */
export const assignEquipmentTypes = <T extends { equipmentType?: EquipmentType | string }>(
  items: T[],
  defaultType?: EquipmentType
): T[] => {
  return items.map(item => ({
    ...item,
    equipmentType: item.equipmentType || defaultType
  }));
};

/**
 * 批量分配子系统信息
 * 用于处理明细数据，如果明细中没有指定子系统，使用主表级别的子系统
 *
 * @param items 设备明细列表
 * @param defaultSubsystem 默认子系统（从第二行提取）
 * @returns 添加了子系统的明细列表
 */
export const assignSubsystems = <T extends { subsystem?: string }>(
  items: T[],
  defaultSubsystem?: string
): T[] => {
  if (!defaultSubsystem) {
    return items;
  }

  return items.map(item => ({
    ...item,
    subsystem: item.subsystem || defaultSubsystem
  }));
};

/**
 * 综合提取Excel元数据
 * 一次性提取标题、子系统、设备类型等信息
 *
 * @param excelData Excel数据对象 { title: string, secondRow: any, items: any[] }
 * @returns 提取的元数据
 */
export interface ExcelMetadata {
  shippingType?: string;       // 发货类型（中文）
  equipmentType?: EquipmentType; // 设备类型（枚举）
  subsystem?: string;           // 子系统
  sheetName?: string;           // Sheet名称
}

export const extractExcelMetadata = (excelData: {
  title?: string;
  secondRow?: any;
  sheetName?: string;
}): ExcelMetadata => {
  const metadata: ExcelMetadata = {};

  // 从标题提取设备类型
  if (excelData.title) {
    metadata.equipmentType = extractEquipmentTypeFromTitle(excelData.title);
    metadata.shippingType = extractShippingType(excelData.title);
  }

  // 从第二行提取子系统
  if (excelData.secondRow) {
    metadata.subsystem = extractSubsystemFromSecondRow(excelData.secondRow);
  }

  // Sheet名称
  if (excelData.sheetName) {
    metadata.sheetName = excelData.sheetName;
  }

  return metadata;
};

/**
 * 辅助函数：判断字符串是否为纯数字或空
 */
const isNumericOrEmpty = (str: string): boolean => {
  if (!str || str.trim() === '') {
    return true;
  }
  return !isNaN(Number(str));
};

/**
 * 设备类型转中文
 */
export const equipmentTypeToChineseName = (type?: EquipmentType | string): string => {
  if (!type) {
    return '未分类';
  }

  const nameMap: Record<string, string> = {
    [EquipmentType.MECHANICAL]: '机械',
    [EquipmentType.ELECTRICAL]: '电控',
    [EquipmentType.PIPELINE]: '管路',
    [EquipmentType.BURNER]: '燃烧器',
    [EquipmentType.AUXILIARY]: '辅助设备',
    [EquipmentType.STANDARD_PARTS]: '标准件'
  };

  return nameMap[type] || String(type);
};

/**
 * 中文转设备类型枚举
 */
export const chineseNameToEquipmentType = (name: string): EquipmentType | undefined => {
  return EQUIPMENT_TYPE_MAP[name];
};

