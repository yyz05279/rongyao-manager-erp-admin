/**
 * ID类型转换工具
 * 用于将后端返回的雪花算法生成的长整数ID转换为字符串类型
 * 避免JavaScript中Number类型精度丢失的问题
 */

/**
 * 需要转换的ID字段列表
 * 包含常见的ID字段名称
 */
const ID_FIELDS = [
  'id',
  'userId',
  'projectId',
  'subsystemId',
  'itemId',
  'materialId',
  'templateId',
  'itemTemplateId',
  'materialTemplateId',
  'parentItemId',
  'responsiblePersonId',
  'sourceProjectId',
  'relatedProductId',
  'createBy',
  'updateBy'
];

/**
 * 判断是否为需要转换的ID字段
 * @param key 字段名
 * @returns 是否需要转换
 */
function isIdField(key: string): boolean {
  return ID_FIELDS.includes(key) || key.toLowerCase().endsWith('id');
}

/**
 * 判断数字是否为长整数（超过JavaScript安全整数范围）
 * JavaScript安全整数范围: -(2^53 - 1) 到 (2^53 - 1)
 * @param num 数字值
 * @returns 是否为长整数
 */
function isLongInteger(num: number): boolean {
  return !Number.isSafeInteger(num) || Math.abs(num) > Number.MAX_SAFE_INTEGER;
}

/**
 * 将ID值转换为字符串
 * @param value ID值
 * @returns 转换后的字符串或原值
 */
function convertIdValue(value: any): any {
  // 如果已经是字符串，直接返回
  if (typeof value === 'string') {
    return value;
  }

  // 如果是数字，转换为字符串
  if (typeof value === 'number') {
    // 如果是长整数或大于100000（可能是雪花算法生成的ID），转换为字符串
    // 排除一些小数字，如status、count等
    if (value > 100000 || isLongInteger(value)) {
      return String(value);
    }
  }

  return value;
}

/**
 * 递归转换对象中的ID字段
 * @param obj 需要转换的对象
 * @returns 转换后的对象
 */
export function convertIdsToString(obj: any): any {
  // null 或 undefined 直接返回
  if (obj === null || obj === undefined) {
    return obj;
  }

  // 数组：递归处理每个元素
  if (Array.isArray(obj)) {
    return obj.map(item => convertIdsToString(item));
  }

  // 非对象类型直接返回
  if (typeof obj !== 'object') {
    return obj;
  }

  // Date、RegExp等特殊对象直接返回
  if (obj instanceof Date || obj instanceof RegExp) {
    return obj;
  }

  // 处理普通对象
  const result: any = {};

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key];

      // 如果是ID字段，转换值
      if (isIdField(key)) {
        result[key] = convertIdValue(value);
      }
      // 如果值是对象或数组，递归处理
      else if (typeof value === 'object' && value !== null) {
        result[key] = convertIdsToString(value);
      }
      // 其他情况直接赋值
      else {
        result[key] = value;
      }
    }
  }

  return result;
}

/**
 * 转换API响应数据中的ID字段
 * 专门用于处理标准API响应格式：{ code, msg, data, rows, total }
 * @param response API响应对象
 * @returns 转换后的响应对象
 */
export function convertResponseIds(response: any): any {
  if (!response || typeof response !== 'object') {
    return response;
  }

  // 创建新对象避免修改原对象
  const result = { ...response };

  // 转换data字段
  if (result.data !== undefined && result.data !== null) {
    result.data = convertIdsToString(result.data);
  }

  // 转换rows字段（分页列表）
  if (result.rows !== undefined && result.rows !== null) {
    result.rows = convertIdsToString(result.rows);
  }

  return result;
}

/**
 * 添加自定义ID字段到转换列表
 * @param fields 字段名称数组
 */
export function addIdFields(fields: string[]): void {
  fields.forEach(field => {
    if (!ID_FIELDS.includes(field)) {
      ID_FIELDS.push(field);
    }
  });
}

/**
 * 获取当前ID字段列表
 * @returns ID字段列表
 */
export function getIdFields(): string[] {
  return [...ID_FIELDS];
}

/**
 * 转换请求数据中的ID字段为字符串
 * 用于请求拦截器，确保发送给后端的ID是字符串格式
 * @param data 请求数据
 * @returns 转换后的请求数据
 */
export function convertRequestIds(data: any): any {
  if (!data || typeof data !== 'object') {
    return data;
  }

  // FormData类型不处理
  if (data instanceof FormData) {
    return data;
  }

  // 转换ID字段
  return convertIdsToString(data);
}

