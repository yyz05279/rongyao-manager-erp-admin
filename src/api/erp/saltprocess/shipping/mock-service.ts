/**
 * 发货清单管理模块 - Mock API服务
 * 用于开发环境下替代真实API调用
 */
import {
  mockShippingLists,
  mockShippingItems,
  mockShippingStatistics,
  mockTrackingRecords,
  mockAttachments,
  mockProjects,
  mockUsers,
  getShippingItemsByListId,
  getTrackingRecordsByListId,
  getAttachmentsByListId,
  filterShippingLists,
  paginateResults,
  generateListCode
} from './mock-data';
import type {
  ShippingListVO,
  ShippingListQuery,
  ShippingListForm,
  ShippingItemVO,
  ShippingItemForm,
  ShippingStatistics,
  ShippingTrackingRecord,
  ShippingAttachment
} from './types';
import {
  ShippingStatus,
  EquipmentType
} from './types';

// 模拟API响应格式
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

interface PageResult<T> {
  rows: T[];
  total: number;
  pageNum: number;
  pageSize: number;
  pages: number;
}

// 模拟网络延迟
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

// 生成成功响应
const successResponse = <T>(data: T): ApiResponse<T> => ({
  code: 200,
  message: '操作成功',
  data
});

// 生成错误响应
const errorResponse = (message: string): ApiResponse<null> => ({
  code: 500,
  message,
  data: null
});

/**
 * Mock API服务类
 */
export class MockShippingService {
  // 本地存储的数据副本
  private static shippingLists: ShippingListVO[] = [...mockShippingLists];
  private static shippingItems: ShippingItemVO[] = [...mockShippingItems];
  private static trackingRecords: ShippingTrackingRecord[] = [...mockTrackingRecords];
  private static attachments: ShippingAttachment[] = [...mockAttachments];

  /**
   * 查询发货清单列表
   */
  static async listShippingList(query: ShippingListQuery): Promise<ApiResponse<PageResult<ShippingListVO>>> {
    await delay();

    try {
      const filteredLists = filterShippingLists(query);
      const result = paginateResults(filteredLists, query.pageNum, query.pageSize);
      return successResponse(result);
    } catch (error) {
      return errorResponse('查询发货清单失败');
    }
  }

  /**
   * 获取发货清单详情
   */
  static async getShippingList(id: string): Promise<ApiResponse<ShippingListVO>> {
    await delay();

    try {
      const shippingList = this.shippingLists.find(list => list.id === id);
      if (!shippingList) {
        return errorResponse('发货清单不存在');
      }
      return successResponse(shippingList);
    } catch (error) {
      return errorResponse('获取发货清单详情失败');
    }
  }

  /**
   * 新增发货清单
   */
  static async addShippingList(data: ShippingListForm): Promise<ApiResponse<string>> {
    await delay();

    try {
      const newId = `SL${Date.now()}`;
      const newShippingList: ShippingListVO = {
        id: newId,
        listCode: generateListCode(),
        projectId: data.projectId,
        projectName: mockProjects.find(p => p.id === data.projectId)?.name || '',
        batchNumber: data.batchNumber,
        shippingDate: data.shippingDate,
        shippingMethod: data.shippingMethod,
        responsiblePersonId: data.responsiblePersonId,
        responsiblePerson: mockUsers.find(u => u.id === data.responsiblePersonId)?.name || '',
        status: ShippingStatus.DRAFT,
        totalItems: 0,
        totalWeight: 0,
        totalVolume: 0,
        remarks: data.remarks || '',
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString(),
        createBy: 'current_user',
        updateBy: 'current_user'
      };

      this.shippingLists.unshift(newShippingList);

      // 添加初始跟踪记录
      const trackingRecord: ShippingTrackingRecord = {
        id: `TR${Date.now()}`,
        shippingListId: newId,
        status: ShippingStatus.DRAFT,
        statusTime: new Date().toISOString(),
        operator: 'current_user',
        operatorId: 'current_user',
        remarks: '创建发货清单',
        createTime: new Date().toISOString()
      };
      this.trackingRecords.push(trackingRecord);

      return successResponse(newId);
    } catch (error) {
      return errorResponse('新增发货清单失败');
    }
  }

  /**
   * 更新发货清单
   */
  static async updateShippingList(data: ShippingListForm): Promise<ApiResponse<null>> {
    await delay();

    try {
      const id = data.id;
      if (!id) {
        return errorResponse('发货清单ID不能为空');
      }

      const index = this.shippingLists.findIndex(list => list.id === id);
      if (index === -1) {
        return errorResponse('发货清单不存在');
      }

      const existingList = this.shippingLists[index];
      const updatedList: ShippingListVO = {
        ...existingList,
        projectId: data.projectId,
        projectName: mockProjects.find(p => p.id === data.projectId)?.name || '',
        batchNumber: data.batchNumber,
        shippingDate: data.shippingDate,
        shippingMethod: data.shippingMethod,
        responsiblePersonId: data.responsiblePersonId,
        responsiblePerson: mockUsers.find(u => u.id === data.responsiblePersonId)?.name || '',
        remarks: data.remarks || '',
        updateTime: new Date().toISOString(),
        updateBy: 'current_user'
      };

      this.shippingLists[index] = updatedList;

      // 添加跟踪记录
      const trackingRecord: ShippingTrackingRecord = {
        id: `TR${Date.now()}`,
        shippingListId: id,
        status: existingList.status as ShippingStatus,
        statusTime: new Date().toISOString(),
        operator: 'current_user',
        operatorId: 'current_user',
        remarks: '更新发货清单信息',
        createTime: new Date().toISOString()
      };
      this.trackingRecords.push(trackingRecord);

      return successResponse(null);
    } catch (error) {
      return errorResponse('更新发货清单失败');
    }
  }

  /**
   * 删除发货清单
   */
  static async delShippingList(ids: string[]): Promise<ApiResponse<null>> {
    await delay();

    try {
      // 检查是否有已发货的清单
      const hasShippedList = this.shippingLists.some(list =>
        ids.includes(list.id) && ['shipped', 'delivered', 'completed'].includes(list.status)
      );

      if (hasShippedList) {
        return errorResponse('已发货的清单不能删除');
      }

      // 删除发货清单
      this.shippingLists = this.shippingLists.filter(list => !ids.includes(list.id));

      // 删除相关明细
      this.shippingItems = this.shippingItems.filter(item => !ids.includes(item.shippingListId));

      // 删除相关跟踪记录
      this.trackingRecords = this.trackingRecords.filter(record => !ids.includes(record.shippingListId));

      // 删除相关附件
      this.attachments = this.attachments.filter(attachment => !ids.includes(attachment.shippingListId));

      return successResponse(null);
    } catch (error) {
      return errorResponse('删除发货清单失败');
    }
  }

  /**
   * 更新发货清单状态
   */
  static async updateShippingStatus(id: string, status: ShippingStatus, remarks?: string): Promise<ApiResponse<null>> {
    await delay();

    try {
      const index = this.shippingLists.findIndex(list => list.id === id);
      if (index === -1) {
        return errorResponse('发货清单不存在');
      }

      this.shippingLists[index] = {
        ...this.shippingLists[index],
        status,
        updateTime: new Date().toISOString(),
        updateBy: 'current_user'
      };

      // 添加跟踪记录
      const trackingRecord: ShippingTrackingRecord = {
        id: `TR${Date.now()}`,
        shippingListId: id,
        status,
        statusTime: new Date().toISOString(),
        operator: 'current_user',
        operatorId: 'current_user',
        remarks: remarks || `状态更新为${status}`,
        createTime: new Date().toISOString()
      };
      this.trackingRecords.push(trackingRecord);

      return successResponse(null);
    } catch (error) {
      return errorResponse('更新状态失败');
    }
  }

  /**
   * 获取发货清单明细
   */
  static async getShippingItems(shippingListId: string): Promise<ApiResponse<ShippingItemVO[]>> {
    await delay();

    try {
      const items = getShippingItemsByListId(shippingListId);
      return successResponse(items);
    } catch (error) {
      return errorResponse('获取发货清单明细失败');
    }
  }

  /**
   * 获取项目简单列表
   */
  static async getProjectSimpleList(): Promise<ApiResponse<Array<{id: string, name: string}>>> {
    await delay();

    try {
      return successResponse(mockProjects);
    } catch (error) {
      return errorResponse('获取项目列表失败');
    }
  }

  /**
   * 获取负责人列表
   */
  static async getResponsiblePersonList(): Promise<ApiResponse<Array<{id: string, name: string}>>> {
    await delay();

    try {
      return successResponse(mockUsers);
    } catch (error) {
      return errorResponse('获取负责人列表失败');
    }
  }

  /**
   * 获取统计数据
   */
  static async getShippingStatistics(): Promise<ApiResponse<ShippingStatistics>> {
    await delay();

    try {
      // 重新计算统计数据
      const stats: ShippingStatistics = {
        totalLists: this.shippingLists.length,
        totalItems: this.shippingItems.length,
        totalWeight: this.shippingLists.reduce((sum, list) => sum + (typeof list.totalWeight === 'number' ? list.totalWeight : parseFloat(list.totalWeight as string) || 0), 0),
        totalVolume: this.shippingLists.reduce((sum, list) => sum + (typeof list.totalVolume === 'number' ? list.totalVolume : parseFloat(list.totalVolume as string) || 0), 0),
        monthlyShippingTrend: [],
        statusCounts: {
          DRAFT: this.shippingLists.filter(list => list.status === ShippingStatus.DRAFT).length,
          PENDING: this.shippingLists.filter(list => list.status === ShippingStatus.PENDING).length,
          PARTIAL_SHIPPED: this.shippingLists.filter(list => list.status === ShippingStatus.PARTIAL_SHIPPED).length,
          SHIPPED: this.shippingLists.filter(list => list.status === ShippingStatus.SHIPPED).length,
          DELIVERED: this.shippingLists.filter(list => list.status === ShippingStatus.DELIVERED).length,
          COMPLETED: this.shippingLists.filter(list => list.status === ShippingStatus.COMPLETED).length,
          CANCELLED: this.shippingLists.filter(list => list.status === ShippingStatus.CANCELLED).length
        },
        equipmentTypeCounts: {
          MECHANICAL: this.shippingItems.filter(item => item.equipmentType === EquipmentType.MECHANICAL).length,
          ELECTRICAL: this.shippingItems.filter(item => item.equipmentType === EquipmentType.ELECTRICAL).length,
          PIPELINE: this.shippingItems.filter(item => item.equipmentType === EquipmentType.PIPELINE).length,
          BURNER: this.shippingItems.filter(item => item.equipmentType === EquipmentType.BURNER).length,
          AUXILIARY: this.shippingItems.filter(item => item.equipmentType === EquipmentType.AUXILIARY).length,
          STANDARD_PARTS: this.shippingItems.filter(item => item.equipmentType === EquipmentType.STANDARD_PARTS).length
        }
      };

      return successResponse(stats);
    } catch (error) {
      return errorResponse('获取统计数据失败');
    }
  }

  /**
   * 获取跟踪记录
   */
  static async getTrackingRecords(shippingListId: string): Promise<ApiResponse<ShippingTrackingRecord[]>> {
    await delay();

    try {
      const records = getTrackingRecordsByListId(shippingListId);
      return successResponse(records.sort((a, b) =>
        new Date(b.statusTime).getTime() - new Date(a.statusTime).getTime()
      ));
    } catch (error) {
      return errorResponse('获取跟踪记录失败');
    }
  }

  /**
   * 获取附件列表
   */
  static async getAttachments(shippingListId: string): Promise<ApiResponse<ShippingAttachment[]>> {
    await delay();

    try {
      const attachments = getAttachmentsByListId(shippingListId);
      return successResponse(attachments);
    } catch (error) {
      return errorResponse('获取附件列表失败');
    }
  }

  /**
   * Excel导入创建发货清单
   */
  static async createShippingListFromExcel(
    projectId: string,
    batchNumber: string,
    responsiblePersonId: string,
    items: ShippingItemVO[]
  ): Promise<ApiResponse<string>> {
    await delay();

    try {
      const newId = `SL${Date.now()}`;
      const project = mockProjects.find(p => p.id === projectId);
      const responsiblePerson = mockUsers.find(u => u.id === responsiblePersonId);

      // 计算统计数据
      const totalItems = items.length;
      const totalWeight = items.reduce((sum, item) => sum + (item.weight || 0) * item.quantity, 0);
      const totalVolume = items.reduce((sum, item) => sum + (item.volume || 0) * item.quantity, 0);

      const newShippingList: ShippingListVO = {
        id: newId,
        listCode: generateListCode(),
        projectId,
        projectName: project?.name || '',
        batchNumber,
        shippingDate: new Date().toISOString().split('T')[0],
        shippingMethod: 'TRUCK',
        responsiblePersonId,
        responsiblePerson: responsiblePerson?.name || '',
        status: ShippingStatus.DRAFT,
        totalItems,
        totalWeight,
        totalVolume,
        remarks: `通过Excel导入创建，共${totalItems}项`,
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString(),
        createBy: 'current_user',
        updateBy: 'current_user'
      };

      // 添加到发货清单列表
      this.shippingLists.unshift(newShippingList);

      // 添加明细项
      const newItems = items.map(item => ({
        ...item,
        id: `SI${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        shippingListId: newId,
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString(),
        createBy: 'current_user',
        updateBy: 'current_user'
      }));

      this.shippingItems.push(...newItems);

      // 添加初始跟踪记录
      const trackingRecord: ShippingTrackingRecord = {
        id: `TR${Date.now()}`,
        shippingListId: newId,
        status: ShippingStatus.DRAFT,
        statusTime: new Date().toISOString(),
        operator: 'current_user',
        operatorId: 'system',
        remarks: `通过Excel导入创建发货清单，导入${totalItems}项明细`,
        createTime: new Date().toISOString()
      };
      this.trackingRecords.push(trackingRecord);

      return successResponse(newId);
    } catch (error) {
      return errorResponse('Excel导入创建发货清单失败');
    }
  }

  /**
   * 删除附件（Mock实现）
   */
  static async delShippingAttachment(id: string): Promise<ApiResponse<null>> {
    await delay();

    try {
      const index = this.attachments.findIndex(attachment => attachment.id === id);
      if (index === -1) {
        return errorResponse('附件不存在');
      }

      this.attachments.splice(index, 1);
      return successResponse(null);
    } catch (error) {
      return errorResponse('删除附件失败');
    }
  }

  /**
   * 下载附件（Mock实现）
   */
  static async downloadShippingAttachment(id: string): Promise<ApiResponse<Blob>> {
    await delay();

    try {
      const attachment = this.attachments.find(att => att.id === id);
      if (!attachment) {
        return errorResponse('附件不存在');
      }

      // 创建一个模拟的文件内容
      const content = `这是模拟的附件内容：${attachment.fileName}`;
      const blob = new Blob([content], { type: 'application/octet-stream' });
      return successResponse(blob);
    } catch (error) {
      return errorResponse('下载附件失败');
    }
  }

  /**
   * 导出单个发货清单（Mock实现）
   */
  static async exportSingleShippingList(id: string): Promise<ApiResponse<Blob>> {
    await delay();

    try {
      const shippingList = this.shippingLists.find(list => list.id === id);
      if (!shippingList) {
        return errorResponse('发货清单不存在');
      }

      const items = this.shippingItems.filter(item => item.shippingListId === id);

      // 创建模拟的Excel内容
      const content = `发货清单导出\n清单编号：${shippingList.listCode}\n项目名称：${shippingList.projectName}\n明细数量：${items.length}`;
      const blob = new Blob([content], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      return successResponse(blob);
    } catch (error) {
      return errorResponse('导出发货清单失败');
    }
  }
}

// 导出Mock API函数，保持与真实API相同的接口
export const listShippingList = MockShippingService.listShippingList.bind(MockShippingService);
export const getShippingList = MockShippingService.getShippingList.bind(MockShippingService);
export const addShippingList = MockShippingService.addShippingList.bind(MockShippingService);
export const updateShippingList = MockShippingService.updateShippingList.bind(MockShippingService);
export const delShippingList = MockShippingService.delShippingList.bind(MockShippingService);
export const updateShippingStatus = MockShippingService.updateShippingStatus.bind(MockShippingService);
export const getShippingItems = MockShippingService.getShippingItems.bind(MockShippingService);
export const getProjectSimpleList = MockShippingService.getProjectSimpleList.bind(MockShippingService);
export const getResponsiblePersonList = MockShippingService.getResponsiblePersonList.bind(MockShippingService);
export const getShippingStatistics = MockShippingService.getShippingStatistics.bind(MockShippingService);
export const getTrackingRecords = MockShippingService.getTrackingRecords.bind(MockShippingService);
export const getAttachments = MockShippingService.getAttachments.bind(MockShippingService);
export const createShippingListFromExcel = MockShippingService.createShippingListFromExcel.bind(MockShippingService);
export const delShippingAttachment = MockShippingService.delShippingAttachment.bind(MockShippingService);
export const downloadShippingAttachment = MockShippingService.downloadShippingAttachment.bind(MockShippingService);
export const exportSingleShippingList = MockShippingService.exportSingleShippingList.bind(MockShippingService);

// 增强版导入接口（Mock实现）
export const importEnhancedShippingList = async (data: any): Promise<any> => {
  await delay();

  try {
    // Mock实现：直接返回成功
    const listCode = generateListCode();
    const shippingListId = `SL${Date.now()}`;

    console.log('增强版导入（Mock）:', data);

    return {
      data: {
        success: true,
        shippingListId,
        listCode,
        summary: `成功导入发货清单，共 ${data.shippingItems?.length || 0} 项设备`,
        errors: []
      }
    };
  } catch (error) {
    return {
      data: {
        success: false,
        summary: '导入失败',
        errors: [String(error)]
      }
    };
  }
};
