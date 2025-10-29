/**
 * Excel数据转换工具函数
 * 基于Context7最佳实践
 */

/**
 * 将Excel日期序列号转换为 yyyy-MM-dd 格式
 * Excel的日期以1900年1月1日为起点的序列号存储
 *
 * @param excelDate Excel日期序列号或日期字符串
 * @returns yyyy-MM-dd 格式的日期字符串
 */
export function convertExcelDateToFormat(excelDate: any): string {
  if (!excelDate) return '';

  // 如果已经是字符串格式的日期，直接返回或格式化
  if (typeof excelDate === 'string') {
    // 尝试解析字符串日期
    const date = new Date(excelDate);
    if (!isNaN(date.getTime())) {
      return formatDate(date);
    }
    // 如果是特殊格式（如 yyyy/MM/dd 或 yyyy.MM.dd）
    const cleaned = excelDate.replace(/[./]/g, '-');
    const testDate = new Date(cleaned);
    if (!isNaN(testDate.getTime())) {
      return formatDate(testDate);
    }
    return excelDate; // 无法转换，返回原值
  }

  // 如果是数字（Excel日期序列号）
  if (typeof excelDate === 'number') {
    // Excel日期系统从1900年1月1日开始
    // 但Excel错误地认为1900年是闰年，所以需要调整
    const excelEpoch = new Date(1900, 0, 1);
    const daysOffset = excelDate > 59 ? excelDate - 1 : excelDate; // 修正1900年闰年bug
    const date = new Date(excelEpoch.getTime() + (daysOffset - 1) * 24 * 60 * 60 * 1000);
    return formatDate(date);
  }

  // 如果已经是Date对象
  if (excelDate instanceof Date) {
    return formatDate(excelDate);
  }

  return String(excelDate);
}

/**
 * 格式化日期为 yyyy-MM-dd
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 从车辆信息字符串中提取车牌号
 *
 * 支持格式：
 * - "17.5米车 苏NHA923" -> "苏NHA923"
 * - "苏NHA923 17.5米车" -> "苏NHA923"
 * - "苏NHA923" -> "苏NHA923"
 *
 * @param vehicleInfo 车辆信息字符串
 * @returns 车牌号
 */
export function extractLicensePlate(vehicleInfo: string): string {
  if (!vehicleInfo || typeof vehicleInfo !== 'string') return '';

  // 中国车牌号格式：省份简称+字母+5-6位字母或数字
  // 例如：苏NHA923、京A12345、粤B12345D
  const plateRegex = /([京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z][A-HJ-NP-Z0-9]{5,6})/;
  const match = vehicleInfo.match(plateRegex);

  if (match) {
    return match[1].trim();
  }

  // 如果没有匹配到标准格式，尝试提取所有非中文空格部分
  const parts = vehicleInfo.split(/\s+/);
  for (const part of parts) {
    // 简单验证：包含字母和数字
    if (/[A-Z]/.test(part) && /\d/.test(part) && part.length >= 6 && part.length <= 8) {
      return part.trim();
    }
  }

  return vehicleInfo.trim();
}

/**
 * 从车辆信息字符串中提取车辆描述
 *
 * @param vehicleInfo 车辆信息字符串
 * @returns 车辆描述（如"17.5米车"）
 */
export function extractVehicleDescription(vehicleInfo: string): string {
  if (!vehicleInfo || typeof vehicleInfo !== 'string') return '';

  // 移除车牌号，保留车辆描述
  const licensePlate = extractLicensePlate(vehicleInfo);
  if (licensePlate && licensePlate !== vehicleInfo) {
    return vehicleInfo.replace(licensePlate, '').trim();
  }

  return vehicleInfo.trim();
}

/**
 * 从司机信息字符串中提取姓名
 *
 * 支持格式：
 * - "李猛 18036946111" -> "李猛"
 * - "张三丰13912345678" -> "张三丰"
 * - "李猛" -> "李猛"
 *
 * @param driverInfo 司机信息字符串
 * @returns 司机姓名
 */
export function extractDriverName(driverInfo: string): string {
  if (!driverInfo || typeof driverInfo !== 'string') return '';

  // 移除手机号码，剩下的就是姓名
  const phoneNumber = extractPhoneNumber(driverInfo);
  if (phoneNumber) {
    return driverInfo.replace(phoneNumber, '').trim();
  }

  // 如果没有手机号，尝试提取纯中文部分
  const nameMatch = driverInfo.match(/^([^\d\s]+)/);
  if (nameMatch) {
    return nameMatch[1].trim();
  }

  return driverInfo.trim();
}

/**
 * 从司机信息字符串中提取手机号
 *
 * 支持格式：
 * - "李猛 18036946111" -> "18036946111"
 * - "张三丰13912345678" -> "13912345678"
 * - "18036946111" -> "18036946111"
 *
 * @param driverInfo 司机信息字符串
 * @returns 手机号码
 */
export function extractPhoneNumber(driverInfo: string): string {
  if (!driverInfo || typeof driverInfo !== 'string') return '';

  // 中国手机号格式：1开头的11位数字
  const phoneRegex = /(1[3-9]\d{9})/;
  const match = driverInfo.match(phoneRegex);

  if (match) {
    return match[1];
  }

  // 如果没有匹配到，尝试提取任意11位数字
  const digitMatch = driverInfo.match(/(\d{11})/);
  if (digitMatch) {
    return digitMatch[1];
  }

  return '';
}

/**
 * 解析司机信息，返回姓名和手机号对象
 *
 * @param driverInfo 司机信息字符串
 * @returns { name: string, phone: string }
 */
export interface DriverInfoParsed {
  name: string;
  phone: string;
  original: string;
}

export function parseDriverInfo(driverInfo: string): DriverInfoParsed {
  return {
    name: extractDriverName(driverInfo),
    phone: extractPhoneNumber(driverInfo),
    original: driverInfo || ''
  };
}

/**
 * 解析车辆信息，返回车牌号和描述对象
 *
 * @param vehicleInfo 车辆信息字符串
 * @returns { licensePlate: string, description: string }
 */
export interface VehicleInfoParsed {
  licensePlate: string;
  description: string;
  original: string;
}

export function parseVehicleInfo(vehicleInfo: string): VehicleInfoParsed {
  return {
    licensePlate: extractLicensePlate(vehicleInfo),
    description: extractVehicleDescription(vehicleInfo),
    original: vehicleInfo || ''
  };
}

/**
 * 批量转换发货时间记录中的日期
 */
export function convertShippingTimeDates<T extends { 发货时间?: any }>(records: T[]): T[] {
  return records.map(record => ({
    ...record,
    发货时间: record.发货时间 ? convertExcelDateToFormat(record.发货时间) : ''
  }));
}

