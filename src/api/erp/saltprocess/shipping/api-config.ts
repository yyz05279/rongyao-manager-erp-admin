/**
 * 发货清单管理模块 - API配置
 * 用于控制是否使用Mock数据
 */

// 判断是否使用Mock数据
// 只在明确设置 VITE_USE_MOCK='true' 时才使用 Mock，否则使用真实接口
const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK === 'true';

// 导入所有API函数
import * as mockApi from './mock-service';
import * as realApi from './index';

// 根据环境选择API实现
const apiImplementation = USE_MOCK_DATA ? mockApi : realApi;

// 导出API函数
export const listShippingList = apiImplementation.listShippingList;
export const delShippingList = apiImplementation.delShippingList;
export const getShippingList = apiImplementation.getShippingList;
export const addShippingList = apiImplementation.addShippingList;
export const updateShippingList = apiImplementation.updateShippingList;
export const updateShippingStatus = apiImplementation.updateShippingStatus;
export const getShippingItems = apiImplementation.getShippingItems;
export const getProjectSimpleList = apiImplementation.getProjectSimpleList;
export const getResponsiblePersonList = apiImplementation.getResponsiblePersonList;
export const getShippingStatistics = apiImplementation.getShippingStatistics;
export const getTrackingRecords = apiImplementation.getTrackingRecords;
export const getAttachments = apiImplementation.getAttachments;
export const createShippingListFromExcel = apiImplementation.createShippingListFromExcel;
export const delShippingAttachment = apiImplementation.delShippingAttachment;
export const downloadShippingAttachment = apiImplementation.downloadShippingAttachment;
export const exportSingleShippingList = apiImplementation.exportSingleShippingList;
export const importEnhancedShippingList = apiImplementation.importEnhancedShippingList;
export const checkBatchExists = apiImplementation.checkBatchExists;

// 导出类型
export type { EnhancedShippingImportRequest, EnhancedShippingImportResult } from './index';

// 导出数据解析工具（解析工具不区分Mock和真实API，统一使用）
export {
  parseShippingListPageResponse,
  parseShippingListVO,
  parseShippingItemVO,
  parseVehicleInfo,
  parseDriverInfo,
  formatWeight,
  formatVolume,
  getStatusTagType,
  getEquipmentTypeName,
  isShippingListEditable,
  isShippingListDeletable,
  getFullPhotoUrl,
  getFullPhotoUrls
} from './data-parser';

// 导出配置信息
export const API_CONFIG = {
  useMockData: USE_MOCK_DATA,
  environment: import.meta.env.MODE
};
