/**
 * 发货清单数据解析工具
 * 用于解析和标准化后端返回的发货清单数据
 */
import { ShippingListVO, ShippingItemVO, SubsystemWeight } from './types';

/**
 * 后端分页响应格式
 */
export interface BackendPageResponse<T> {
  total: number;
  rows: T[];
  code: number;
  msg: string;
}

/**
 * 前端标准分页格式
 */
export interface PageResult<T> {
  records: T[];
  total: number;
  size?: number;
  current?: number;
  pages?: number;
}

/**
 * 解析发货清单分页响应数据
 *
 * @param response 后端返回的分页响应
 * @returns 标准化的分页数据
 *
 * @example
 * ```typescript
 * const response = await api.getShippingList();
 * const pageData = parseShippingListPageResponse(response.data);
 *
 * console.log(pageData.records); // 标准化的发货清单列表
 * console.log(pageData.total);   // 总条数
 * ```
 */
export function parseShippingListPageResponse(response: BackendPageResponse<any>): PageResult<ShippingListVO> {
  if (!response || !response.rows) {
    return {
      records: [],
      total: 0
    };
  }

  return {
    records: response.rows.map((item) => parseShippingListVO(item)),
    total: response.total || 0
  };
}

/**
 * 解析单个发货清单详情数据
 *
 * @param data 后端返回的发货清单数据
 * @returns 标准化的发货清单对象
 *
 * @example
 * ```typescript
 * const response = await api.getShippingList(id);
 * const shippingList = parseShippingListVO(response.data);
 *
 * // 访问标准化后的数据
 * console.log(shippingList.statusName);        // "草稿"
 * console.log(shippingList.shippingMethodName); // "卡车运输"
 * console.log(shippingList.vehiclePlate);       // "苏NHA923"
 * console.log(shippingList.driverName);         // "李猛"
 * ```
 */
export function parseShippingListVO(data: any): ShippingListVO {
  if (!data) {
    throw new Error('发货清单数据不能为空');
  }

  // 解析车辆信息
  const vehicleInfo = parseVehicleInfo(data.vehicleInfo, data.vehiclePlate, data.vehicleDescription);

  // 解析司机信息
  const driverInfo = parseDriverInfo(data.driverInfo, data.driverName, data.driverPhone);

  return {
    // 基本信息
    id: data.id || data.shippingListId,
    shippingListId: data.id || data.shippingListId,
    listCode: data.listCode || '',
    projectId: String(data.projectId || ''),
    projectName: data.projectName || '',
    batchNumber: data.batchNumber || '',

    // 负责人信息
    responsiblePerson: data.responsiblePerson || '',
    responsiblePersonId: data.responsiblePersonId,

    // 日期信息
    shippingDate: data.shippingDate || '',
    expectedDeliveryDate: data.expectedDeliveryDate || null,
    actualDeliveryDate: data.actualDeliveryDate || null,

    // 状态信息
    status: data.status || 'DRAFT',
    statusDesc: data.statusDesc,
    statusName: data.statusDesc || data.statusName, // 优先使用后端返回的 statusDesc

    // 发货方式
    shippingMethod: data.shippingMethod || 'TRUCK',
    shippingMethodDesc: data.shippingMethodDesc,
    shippingMethodName: data.shippingMethodDesc || data.shippingMethodName,

    // 车辆信息（保留原始字段和增强字段）
    vehicleInfo: data.vehicleInfo || vehicleInfo.combined,
    vehiclePlate: data.vehiclePlate || vehicleInfo.plate,
    vehicleDescription: data.vehicleDescription || vehicleInfo.description,

    // 司机信息（保留原始字段和增强字段）
    driverInfo: data.driverInfo || driverInfo.combined,
    driverName: data.driverName || driverInfo.name,
    driverPhone: data.driverPhone || driverInfo.phone,

    // 照片信息
    shippingPhotoUrls: Array.isArray(data.shippingPhotoUrls) ? data.shippingPhotoUrls : [],
    driverLicensePhotoUrls: Array.isArray(data.driverLicensePhotoUrls) ? data.driverLicensePhotoUrls : [],
    packingListPath: data.packingListPath || null,
    photoPath: data.photoPath || null,

    // 统计信息
    totalItems: Number(data.totalItems) || 0,
    totalWeight: data.totalWeight || '0.00',
    totalVolume: data.totalVolume || '0.00',

    // 设备分类统计
    mechanicalCount: data.mechanicalCount || null,
    electricalCount: data.electricalCount || null,
    pipelineCount: data.pipelineCount || null,
    fragileCount: data.fragileCount || null,
    hazardousCount: data.hazardousCount || null,

    // 备注
    remarks: data.remarks || null,

    // 子系统重量映射数组
    subsystemWeights: parseSubsystemWeights(data.subsystemWeights),

    // 审计字段
    tenantId: data.tenantId,
    createDept: data.createDept,
    createTime: data.createTime || '',
    updateTime: data.updateTime || '',
    createBy: data.createBy,
    updateBy: data.updateBy,
    version: data.version,

    // 关联数据
    items: Array.isArray(data.items) ? data.items.map((item: any) => parseShippingItemVO(item)) : undefined,
    trackingRecords: data.trackingRecords || undefined,
    attachments: data.attachments || undefined
  };
}

/**
 * 解析发货清单明细数据
 *
 * @param data 后端返回的明细数据
 * @returns 标准化的明细对象
 */
export function parseShippingItemVO(data: any): ShippingItemVO {
  if (!data) {
    throw new Error('发货明细数据不能为空');
  }

  return {
    id: data.id || '',
    shippingListId: data.shippingListId || '',
    itemCode: data.itemCode || '',
    itemName: data.itemName || data.equipmentName || '',
    specification: data.specification || '',
    equipmentType: data.equipmentType || 'MECHANICAL',
    quantity: Number(data.quantity) || 0,
    unit: data.unit || '台',
    unitWeight: data.unitWeight ? Number(data.unitWeight) : undefined,
    totalWeight: data.totalWeight ? Number(data.totalWeight) : undefined,
    unitVolume: data.unitVolume ? Number(data.unitVolume) : undefined,
    totalVolume: data.totalVolume ? Number(data.totalVolume) : undefined,
    manufacturer: data.manufacturer || '',
    model: data.model || '',
    serialNumber: data.serialNumber || '',
    packageType: data.packageType || '',
    packageQuantity: data.packageQuantity ? Number(data.packageQuantity) : undefined,
    isFragile: Boolean(data.isFragile),
    isHazardous: Boolean(data.isHazardous),
    storageRequirement: data.storageRequirement || '',
    remarks: data.remarks || data.remarks2 || '', // 支持 remarks2 字段
    createTime: data.createTime || '',
    updateTime: data.updateTime || ''
  };
}

/**
 * 解析车辆信息
 * 从 vehicleInfo 字符串中提取车牌号和车辆描述
 *
 * @param vehicleInfo 原始车辆信息字符串（如："17.5米车\n苏NHA923"）
 * @param vehiclePlate 车牌号（如果后端已分离）
 * @param vehicleDescription 车辆描述（如果后端已分离）
 * @returns 解析后的车辆信息对象
 *
 * @example
 * ```typescript
 * const result = parseVehicleInfo("17.5米车\n苏NHA923");
 * console.log(result.plate);        // "苏NHA923"
 * console.log(result.description);  // "17.5米车"
 * console.log(result.combined);     // "17.5米车 苏NHA923"
 * ```
 */
export function parseVehicleInfo(
  vehicleInfo?: string,
  vehiclePlate?: string,
  vehicleDescription?: string
): {
  plate: string;
  description: string;
  combined: string;
} {
  // 如果后端已经分离了字段，直接使用
  if (vehiclePlate || vehicleDescription) {
    return {
      plate: vehiclePlate || '',
      description: vehicleDescription || '',
      combined: [vehicleDescription, vehiclePlate].filter(Boolean).join(' ')
    };
  }

  // 如果没有 vehicleInfo，返回空值
  if (!vehicleInfo) {
    return {
      plate: '',
      description: '',
      combined: ''
    };
  }

  // 解析 vehicleInfo 字符串
  // 格式示例：
  // "17.5米车\n苏NHA923"
  // "17.5米车 苏NHA923"
  const lines = vehicleInfo
    .split(/[\n\r]+/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length >= 2) {
    return {
      description: lines[0],
      plate: lines[1],
      combined: `${lines[0]} ${lines[1]}`
    };
  }

  // 如果只有一行，尝试通过空格分割
  const parts = vehicleInfo.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return {
      description: parts[0],
      plate: parts[1],
      combined: vehicleInfo
    };
  }

  // 无法解析，返回原始值
  return {
    plate: '',
    description: vehicleInfo,
    combined: vehicleInfo
  };
}

/**
 * 解析司机信息
 * 从 driverInfo 字符串中提取司机姓名和电话
 *
 * @param driverInfo 原始司机信息字符串（如："李猛         18036946111"）
 * @param driverName 司机姓名（如果后端已分离）
 * @param driverPhone 司机电话（如果后端已分离）
 * @returns 解析后的司机信息对象
 *
 * @example
 * ```typescript
 * const result = parseDriverInfo("李猛         18036946111");
 * console.log(result.name);      // "李猛"
 * console.log(result.phone);     // "18036946111"
 * console.log(result.combined);  // "李猛 18036946111"
 * ```
 */
export function parseDriverInfo(
  driverInfo?: string,
  driverName?: string,
  driverPhone?: string
): {
  name: string;
  phone: string;
  combined: string;
} {
  // 如果后端已经分离了字段，直接使用
  if (driverName || driverPhone) {
    return {
      name: driverName || '',
      phone: driverPhone || '',
      combined: [driverName, driverPhone].filter(Boolean).join(' ')
    };
  }

  // 如果没有 driverInfo，返回空值
  if (!driverInfo) {
    return {
      name: '',
      phone: '',
      combined: ''
    };
  }

  // 解析 driverInfo 字符串
  // 格式示例：
  // "李猛         18036946111"
  // "李猛 18036946111"
  const cleaned = driverInfo.replace(/\s+/g, ' ').trim();
  const parts = cleaned.split(' ').filter(Boolean);

  if (parts.length >= 2) {
    return {
      name: parts[0],
      phone: parts[1],
      combined: `${parts[0]} ${parts[1]}`
    };
  }

  // 尝试通过正则提取电话号码
  const phoneMatch = driverInfo.match(/1[3-9]\d{9}/);
  if (phoneMatch) {
    const phone = phoneMatch[0];
    const name = driverInfo.replace(phone, '').replace(/\s+/g, '').trim();
    return {
      name,
      phone,
      combined: `${name} ${phone}`
    };
  }

  // 无法解析，返回原始值
  return {
    name: driverInfo,
    phone: '',
    combined: driverInfo
  };
}

/**
 * 格式化重量显示
 *
 * @param weight 重量值（可能是数字或字符串）
 * @param unit 单位（默认为 kg）
 * @returns 格式化后的重量字符串
 *
 * @example
 * ```typescript
 * formatWeight(1500.5);      // "1,500.50 kg"
 * formatWeight("0.00");      // "0.00 kg"
 * formatWeight(2000, "吨");  // "2,000.00 吨"
 * ```
 */
export function formatWeight(weight: number | string, unit = 'kg'): string {
  const numWeight = typeof weight === 'string' ? parseFloat(weight) : weight;

  if (isNaN(numWeight)) {
    return `0.00 ${unit}`;
  }

  return `${numWeight.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${unit}`;
}

/**
 * 格式化体积显示
 *
 * @param volume 体积值（可能是数字或字符串）
 * @param unit 单位（默认为 m³）
 * @returns 格式化后的体积字符串
 *
 * @example
 * ```typescript
 * formatVolume(12.8);   // "12.80 m³"
 * formatVolume("0.00"); // "0.00 m³"
 * ```
 */
export function formatVolume(volume: number | string, unit = 'm³'): string {
  const numVolume = typeof volume === 'string' ? parseFloat(volume) : volume;

  if (isNaN(numVolume)) {
    return `0.00 ${unit}`;
  }

  return `${numVolume.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${unit}`;
}

/**
 * 获取状态标签类型（用于 Element Plus 的 el-tag）
 *
 * @param status 发货状态
 * @returns Element Plus 标签类型
 *
 * @example
 * ```vue
 * <el-tag :type="getStatusTagType(shippingList.status)">
 *   {{ shippingList.statusName }}
 * </el-tag>
 * ```
 */
export function getStatusTagType(status: string): 'success' | 'info' | 'warning' | 'danger' | '' {
  const statusMap: Record<string, 'success' | 'info' | 'warning' | 'danger' | ''> = {
    DRAFT: 'info',
    PENDING: 'warning',
    PARTIAL_SHIPPED: 'warning',
    SHIPPED: '',
    DELIVERED: 'success',
    COMPLETED: 'success',
    CANCELLED: 'danger'
  };

  return statusMap[status] || 'info';
}

/**
 * 获取设备类型显示文本
 *
 * @param equipmentType 设备类型代码
 * @returns 设备类型中文名称
 */
export function getEquipmentTypeName(equipmentType: string): string {
  const typeMap: Record<string, string> = {
    MECHANICAL: '机械设备',
    ELECTRICAL: '电控设备',
    PIPELINE: '管路设备',
    BURNER: '燃烧器',
    AUXILIARY: '辅助设备',
    STANDARD_PARTS: '标准件'
  };

  return typeMap[equipmentType] || equipmentType;
}

/**
 * 检查发货清单是否可编辑
 *
 * @param status 发货状态
 * @returns 是否可编辑
 */
export function isShippingListEditable(status: string): boolean {
  return ['DRAFT', 'PENDING'].includes(status);
}

/**
 * 检查发货清单是否可删除
 *
 * @param status 发货状态
 * @returns 是否可删除
 */
export function isShippingListDeletable(status: string): boolean {
  return ['DRAFT', 'PENDING'].includes(status);
}

/**
 * 获取图片完整访问URL
 *
 * @param photoPath 后端返回的图片相对路径（如：/shipping-photos/2025-10-30/xxx.jpg）
 * @param baseUrl 基础URL（可选，一般不需要传入）
 * @returns 完整的图片访问URL
 *
 * @example
 * ```typescript
 * // 开发环境
 * getFullPhotoUrl("/shipping-photos/2025-10-30/xxx.jpg");
 * // 返回: "/dev-api/upload/shipping-photos/2025-10-30/xxx.jpg"
 *
 * // 生产环境
 * getFullPhotoUrl("/shipping-photos/2025-10-30/xxx.jpg");
 * // 返回: "/upload/shipping-photos/2025-10-30/xxx.jpg"
 * ```
 */
export function getFullPhotoUrl(photoPath: string, baseUrl?: string): string {
  if (!photoPath) {
    return '';
  }

  // 如果已经是完整URL，直接返回
  if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
    return photoPath;
  }

  // 如果提供了自定义baseUrl，使用它
  if (baseUrl) {
    const path = photoPath.startsWith('/') ? photoPath : `/${photoPath}`;
    return `${baseUrl}/upload${path}`;
  }

  // 确保路径以 / 开头
  const path = photoPath.startsWith('/') ? photoPath : `/${photoPath}`;

  // 开发环境使用代理 /dev-api
  if (import.meta.env.DEV) {
    return `/dev-api/upload${path}`;
  }

  // 生产环境直接使用 /upload
  return `/upload${path}`;
}

/**
 * 批量生成完整的图片URL列表
 *
 * @param photoPaths 图片相对路径数组
 * @param baseUrl 基础URL（可选）
 * @returns 完整的图片URL数组
 */
export function getFullPhotoUrls(photoPaths: string[], baseUrl?: string): string[] {
  if (!Array.isArray(photoPaths)) {
    return [];
  }

  return photoPaths.map((path) => getFullPhotoUrl(path, baseUrl)).filter(Boolean);
}

/**
 * 解析子系统重量数组
 *
 * @param data 后端返回的子系统重量数据（可能是字符串或数组）
 * @returns 标准化的子系统重量数组
 *
 * @example
 * ```typescript
 * // 后端返回JSON字符串
 * parseSubsystemWeights('[{"subsystem":"固态处理厂-机械","weight":14.5}]');
 * // 返回: [{ subsystem: "固态处理厂-机械", weight: 14.5, remarks: undefined }]
 *
 * // 后端直接返回数组
 * parseSubsystemWeights([{ subsystem: "液态处理厂", weight: 3.2 }]);
 * // 返回: [{ subsystem: "液态处理厂", weight: 3.2, remarks: undefined }]
 * ```
 */
export function parseSubsystemWeights(data: any): SubsystemWeight[] {
  // 如果数据为空，返回空数组
  if (!data) {
    return [];
  }

  // 如果已经是数组，直接返回
  if (Array.isArray(data)) {
    return data.map((item) => ({
      subsystem: item.subsystem || '',
      weight: typeof item.weight === 'string' ? parseFloat(item.weight) : item.weight || 0,
      remarks: item.remarks || undefined
    }));
  }

  // 如果是JSON字符串，解析后返回
  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => ({
          subsystem: item.subsystem || '',
          weight: typeof item.weight === 'string' ? parseFloat(item.weight) : item.weight || 0,
          remarks: item.remarks || undefined
        }));
      }
    } catch (error) {
      console.error('解析子系统重量JSON失败:', error);
      return [];
    }
  }

  return [];
}
