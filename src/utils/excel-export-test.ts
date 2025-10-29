/**
 * Excel导出测试工具
 * 基于XLSX.js库实现Excel文件生成功能
 */
import * as XLSX from 'xlsx';
import {
  ShippingListVO,
  ShippingItemVO,
  ShippingStatistics,
  ShippingTrackingRecord,
  ShippingStatus,
  EquipmentType,
  ShippingMethod
} from '@/api/erp/saltprocess/shipping/types';

// 导出配置接口
export interface ExportConfig {
  fileName: string;
  sheetName: string;
  title?: string;
  includeStatistics?: boolean;
  includeDetails?: boolean;
}

// Excel样式配置
export interface ExcelStyle {
  headerStyle: XLSX.CellStyle;
  dataStyle: XLSX.CellStyle;
  titleStyle: XLSX.CellStyle;
  statisticsStyle: XLSX.CellStyle;
}

// 默认样式配置
const defaultStyles: ExcelStyle = {
  headerStyle: {
    font: { bold: true, color: { rgb: 'FFFFFF' } },
    fill: { fgColor: { rgb: '4472C4' } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: {
      top: { style: 'thin', color: { rgb: '000000' } },
      bottom: { style: 'thin', color: { rgb: '000000' } },
      left: { style: 'thin', color: { rgb: '000000' } },
      right: { style: 'thin', color: { rgb: '000000' } }
    }
  },
  dataStyle: {
    alignment: { horizontal: 'left', vertical: 'center' },
    border: {
      top: { style: 'thin', color: { rgb: 'CCCCCC' } },
      bottom: { style: 'thin', color: { rgb: 'CCCCCC' } },
      left: { style: 'thin', color: { rgb: 'CCCCCC' } },
      right: { style: 'thin', color: { rgb: 'CCCCCC' } }
    }
  },
  titleStyle: {
    font: { bold: true, size: 16 },
    alignment: { horizontal: 'center', vertical: 'center' }
  },
  statisticsStyle: {
    font: { bold: true },
    fill: { fgColor: { rgb: 'F2F2F2' } },
    alignment: { horizontal: 'center', vertical: 'center' }
  }
};

// Excel导出工具类
export class ExcelExportTool {
  private workbook: XLSX.WorkBook;
  private styles: ExcelStyle;

  constructor(styles?: Partial<ExcelStyle>) {
    this.workbook = XLSX.utils.book_new();
    this.styles = { ...defaultStyles, ...styles };
  }

  /**
   * 导出发货清单汇总
   */
  exportShippingListSummary(lists: ShippingListVO[], statistics?: ShippingStatistics, config?: Partial<ExportConfig>): void {
    const finalConfig: ExportConfig = {
      fileName: `发货清单汇总_${this.formatDate(new Date())}.xlsx`,
      sheetName: '发货清单汇总',
      title: '发货清单汇总报表',
      includeStatistics: true,
      ...config
    };

    const worksheet = XLSX.utils.aoa_to_sheet([]);
    let currentRow = 0;

    // 添加标题
    if (finalConfig.title) {
      XLSX.utils.sheet_add_aoa(worksheet, [[finalConfig.title]], { origin: `A${currentRow + 1}` });
      this.mergeCells(worksheet, currentRow, 0, currentRow, 12);
      this.applyCellStyle(worksheet, currentRow, 0, this.styles.titleStyle);
      currentRow += 2;
    }

    // 添加统计信息
    if (finalConfig.includeStatistics && statistics) {
      currentRow = this.addStatisticsSection(worksheet, statistics, currentRow);
      currentRow += 1;
    }

    // 添加表头
    const headers = [
      '清单编号',
      '项目名称',
      '批次号',
      '负责人',
      '发货日期',
      '预计送达',
      '实际送达',
      '发货状态',
      '发货方式',
      '总件数',
      '总重量(kg)',
      '总体积(m³)',
      '备注'
    ];

    XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: `A${currentRow + 1}` });
    this.applyHeaderStyle(worksheet, currentRow, headers.length);
    currentRow++;

    // 添加数据行
    const data = lists.map((list) => [
      list.listCode,
      list.projectName,
      list.batchNumber,
      list.responsiblePerson,
      list.shippingDate,
      list.expectedDeliveryDate || '',
      list.actualDeliveryDate || '',
      this.getStatusText(list.status),
      this.getShippingMethodText(list.shippingMethod),
      list.totalItems,
      list.totalWeight,
      list.totalVolume || '',
      list.remarks || ''
    ]);

    XLSX.utils.sheet_add_aoa(worksheet, data, { origin: `A${currentRow + 1}` });
    this.applyDataStyle(worksheet, currentRow, data.length, headers.length);

    // 设置列宽
    this.setColumnWidths(worksheet, [
      { wch: 15 },
      { wch: 20 },
      { wch: 12 },
      { wch: 10 },
      { wch: 12 },
      { wch: 12 },
      { wch: 12 },
      { wch: 10 },
      { wch: 10 },
      { wch: 8 },
      { wch: 12 },
      { wch: 12 },
      { wch: 20 }
    ]);

    XLSX.utils.book_append_sheet(this.workbook, worksheet, finalConfig.sheetName);
    this.saveFile(finalConfig.fileName);
  }

  /**
   * 导出单个发货清单详情
   */
  exportSingleShippingList(
    list: ShippingListVO,
    items: ShippingItemVO[],
    trackingRecords?: ShippingTrackingRecord[],
    config?: Partial<ExportConfig>
  ): void {
    const finalConfig: ExportConfig = {
      fileName: `发货清单_${list.projectName}_${list.batchNumber}_${this.formatDate(new Date())}.xlsx`,
      sheetName: '发货清单详情',
      title: `${list.projectName} - ${list.batchNumber} 发货清单`,
      includeDetails: true,
      ...config
    };

    const worksheet = XLSX.utils.aoa_to_sheet([]);
    let currentRow = 0;

    // 添加标题
    if (finalConfig.title) {
      XLSX.utils.sheet_add_aoa(worksheet, [[finalConfig.title]], { origin: `A${currentRow + 1}` });
      this.mergeCells(worksheet, currentRow, 0, currentRow, 14);
      this.applyCellStyle(worksheet, currentRow, 0, this.styles.titleStyle);
      currentRow += 2;
    }

    // 添加基本信息
    currentRow = this.addBasicInfoSection(worksheet, list, currentRow);
    currentRow += 1;

    // 添加明细表头
    const itemHeaders = [
      '序号',
      '物品名称',
      '规格型号',
      '设备类型',
      '数量',
      '单位',
      '单重(kg)',
      '总重(kg)',
      '制造商',
      '型号',
      '序列号',
      '包装方式',
      '包装件数',
      '是否易碎',
      '备注'
    ];

    XLSX.utils.sheet_add_aoa(worksheet, [['发货明细']], { origin: `A${currentRow + 1}` });
    this.mergeCells(worksheet, currentRow, 0, currentRow, itemHeaders.length - 1);
    this.applyCellStyle(worksheet, currentRow, 0, this.styles.statisticsStyle);
    currentRow++;

    XLSX.utils.sheet_add_aoa(worksheet, [itemHeaders], { origin: `A${currentRow + 1}` });
    this.applyHeaderStyle(worksheet, currentRow, itemHeaders.length);
    currentRow++;

    // 添加明细数据
    const itemData = items.map((item, index) => [
      index + 1,
      item.itemName,
      item.specification || '',
      this.getEquipmentTypeText(item.equipmentType),
      item.quantity,
      item.unit,
      item.unitWeight || '',
      item.totalWeight || '',
      item.manufacturer || '',
      item.model || '',
      item.serialNumber || '',
      item.packageType || '',
      item.packageQuantity || '',
      item.isFragile ? '是' : '否',
      item.remarks || ''
    ]);

    XLSX.utils.sheet_add_aoa(worksheet, itemData, { origin: `A${currentRow + 1}` });
    this.applyDataStyle(worksheet, currentRow, itemData.length, itemHeaders.length);
    currentRow += itemData.length;

    // 添加跟踪记录（如果有）
    if (trackingRecords && trackingRecords.length > 0) {
      currentRow += 1;
      currentRow = this.addTrackingSection(worksheet, trackingRecords, currentRow);
    }

    // 设置列宽
    this.setColumnWidths(worksheet, [
      { wch: 6 },
      { wch: 20 },
      { wch: 15 },
      { wch: 10 },
      { wch: 8 },
      { wch: 6 },
      { wch: 10 },
      { wch: 10 },
      { wch: 15 },
      { wch: 12 },
      { wch: 15 },
      { wch: 10 },
      { wch: 8 },
      { wch: 8 },
      { wch: 20 }
    ]);

    XLSX.utils.book_append_sheet(this.workbook, worksheet, finalConfig.sheetName);
    this.saveFile(finalConfig.fileName);
  }

  /**
   * 导出发货明细汇总
   */
  exportShippingItemsSummary(
    items: ShippingItemVO[],
    groupBy: 'project' | 'equipment_type' | 'manufacturer' = 'equipment_type',
    config?: Partial<ExportConfig>
  ): void {
    const finalConfig: ExportConfig = {
      fileName: `发货明细汇总_${this.formatDate(new Date())}.xlsx`,
      sheetName: '发货明细汇总',
      title: '发货明细汇总报表',
      ...config
    };

    const worksheet = XLSX.utils.aoa_to_sheet([]);
    let currentRow = 0;

    // 添加标题
    if (finalConfig.title) {
      XLSX.utils.sheet_add_aoa(worksheet, [[finalConfig.title]], { origin: `A${currentRow + 1}` });
      this.mergeCells(worksheet, currentRow, 0, currentRow, 10);
      this.applyCellStyle(worksheet, currentRow, 0, this.styles.titleStyle);
      currentRow += 2;
    }

    // 按指定方式分组
    const groupedItems = this.groupItems(items, groupBy);

    // 添加汇总表头
    const summaryHeaders = ['分组', '物品名称', '规格型号', '设备类型', '总数量', '单位', '总重量(kg)', '制造商', '平均单重(kg)', '备注'];

    XLSX.utils.sheet_add_aoa(worksheet, [summaryHeaders], { origin: `A${currentRow + 1}` });
    this.applyHeaderStyle(worksheet, currentRow, summaryHeaders.length);
    currentRow++;

    // 添加分组数据
    for (const [groupKey, groupItems] of Object.entries(groupedItems)) {
      const summary = this.calculateGroupSummary(groupItems);

      // 添加分组标题行
      XLSX.utils.sheet_add_aoa(worksheet, [[groupKey, '', '', '', '', '', '', '', '', '']], { origin: `A${currentRow + 1}` });
      this.applyCellStyle(worksheet, currentRow, 0, this.styles.statisticsStyle);
      this.mergeCells(worksheet, currentRow, 0, currentRow, summaryHeaders.length - 1);
      currentRow++;

      // 添加分组明细
      const groupData = groupItems.map((item) => [
        '',
        item.itemName,
        item.specification || '',
        this.getEquipmentTypeText(item.equipmentType),
        item.quantity,
        item.unit,
        item.totalWeight || '',
        item.manufacturer || '',
        item.unitWeight || '',
        item.remarks || ''
      ]);

      XLSX.utils.sheet_add_aoa(worksheet, groupData, { origin: `A${currentRow + 1}` });
      this.applyDataStyle(worksheet, currentRow, groupData.length, summaryHeaders.length);
      currentRow += groupData.length;

      // 添加小计行
      XLSX.utils.sheet_add_aoa(worksheet, [['小计', '', '', '', summary.totalQuantity, '', summary.totalWeight, '', summary.avgWeight, '']], {
        origin: `A${currentRow + 1}`
      });
      this.applyCellStyle(worksheet, currentRow, 0, this.styles.statisticsStyle);
      currentRow += 2;
    }

    // 设置列宽
    this.setColumnWidths(worksheet, [
      { wch: 15 },
      { wch: 20 },
      { wch: 15 },
      { wch: 10 },
      { wch: 8 },
      { wch: 6 },
      { wch: 12 },
      { wch: 15 },
      { wch: 12 },
      { wch: 20 }
    ]);

    XLSX.utils.book_append_sheet(this.workbook, worksheet, finalConfig.sheetName);
    this.saveFile(finalConfig.fileName);
  }

  /**
   * 添加统计信息部分
   */
  private addStatisticsSection(worksheet: XLSX.WorkSheet, statistics: ShippingStatistics, startRow: number): number {
    let currentRow = startRow;

    // 基础统计
    const basicStats = [
      ['统计项目', '数值'],
      ['总清单数', statistics.totalLists],
      ['总物品数', statistics.totalItems],
      ['总重量(kg)', statistics.totalWeight],
      ['总体积(m³)', statistics.totalVolume]
    ];

    XLSX.utils.sheet_add_aoa(worksheet, basicStats, { origin: `A${currentRow + 1}` });
    this.applyHeaderStyle(worksheet, currentRow, 2);
    this.applyDataStyle(worksheet, currentRow + 1, basicStats.length - 1, 2);
    currentRow += basicStats.length + 1;

    // 状态统计
    const statusStats = [
      ['发货状态', '数量'],
      ...Object.entries(statistics.statusCounts).map(([status, count]) => [this.getStatusText(status as ShippingStatus), count])
    ];

    XLSX.utils.sheet_add_aoa(worksheet, statusStats, { origin: `D${startRow + 1}` });
    this.applyHeaderStyle(worksheet, startRow, 2, 3);
    this.applyDataStyle(worksheet, startRow + 1, statusStats.length - 1, 2, 3);

    return currentRow;
  }

  /**
   * 添加基本信息部分
   */
  private addBasicInfoSection(worksheet: XLSX.WorkSheet, list: ShippingListVO, startRow: number): number {
    const basicInfo = [
      ['基本信息', ''],
      ['清单编号', list.listCode],
      ['项目名称', list.projectName],
      ['批次号', list.batchNumber],
      ['负责人', list.responsiblePerson],
      ['发货日期', list.shippingDate],
      ['预计送达', list.expectedDeliveryDate || ''],
      ['实际送达', list.actualDeliveryDate || ''],
      ['发货状态', this.getStatusText(list.status)],
      ['发货方式', this.getShippingMethodText(list.shippingMethod)],
      ['车辆信息', list.vehicleInfo || ''],
      ['司机信息', list.driverInfo || ''],
      ['总件数', list.totalItems],
      ['总重量(kg)', list.totalWeight],
      ['总体积(m³)', list.totalVolume || ''],
      ['备注', list.remarks || '']
    ];

    XLSX.utils.sheet_add_aoa(worksheet, basicInfo, { origin: `A${startRow + 1}` });
    this.applyCellStyle(worksheet, startRow, 0, this.styles.statisticsStyle);
    this.mergeCells(worksheet, startRow, 0, startRow, 1);

    for (let i = 1; i < basicInfo.length; i++) {
      this.applyCellStyle(worksheet, startRow + i, 0, this.styles.headerStyle);
      this.applyCellStyle(worksheet, startRow + i, 1, this.styles.dataStyle);
    }

    return startRow + basicInfo.length;
  }

  /**
   * 添加跟踪记录部分
   */
  private addTrackingSection(worksheet: XLSX.WorkSheet, records: ShippingTrackingRecord[], startRow: number): number {
    let currentRow = startRow;

    // 跟踪记录标题
    XLSX.utils.sheet_add_aoa(worksheet, [['跟踪记录']], { origin: `A${currentRow + 1}` });
    this.mergeCells(worksheet, currentRow, 0, currentRow, 5);
    this.applyCellStyle(worksheet, currentRow, 0, this.styles.statisticsStyle);
    currentRow++;

    // 跟踪记录表头
    const trackingHeaders = ['时间', '状态', '位置', '操作人', '备注'];
    XLSX.utils.sheet_add_aoa(worksheet, [trackingHeaders], { origin: `A${currentRow + 1}` });
    this.applyHeaderStyle(worksheet, currentRow, trackingHeaders.length);
    currentRow++;

    // 跟踪记录数据
    const trackingData = records.map((record) => [
      this.formatDateTime(record.statusTime),
      this.getStatusText(record.status),
      record.location || '',
      record.operator,
      record.remarks || ''
    ]);

    XLSX.utils.sheet_add_aoa(worksheet, trackingData, { origin: `A${currentRow + 1}` });
    this.applyDataStyle(worksheet, currentRow, trackingData.length, trackingHeaders.length);

    return currentRow + trackingData.length;
  }

  /**
   * 按指定方式分组物品
   */
  private groupItems(items: ShippingItemVO[], groupBy: string): { [key: string]: ShippingItemVO[] } {
    const grouped: { [key: string]: ShippingItemVO[] } = {};

    items.forEach((item) => {
      let key: string;
      switch (groupBy) {
        case 'equipment_type':
          key = this.getEquipmentTypeText(item.equipmentType);
          break;
        case 'manufacturer':
          key = item.manufacturer || '未知制造商';
          break;
        case 'project':
          key = '项目分组'; // 这里需要从关联的发货清单获取项目信息
          break;
        default:
          key = '其他';
      }

      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(item);
    });

    return grouped;
  }

  /**
   * 计算分组汇总信息
   */
  private calculateGroupSummary(items: ShippingItemVO[]): {
    totalQuantity: number;
    totalWeight: number;
    avgWeight: number;
  } {
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalWeight = items.reduce((sum, item) => sum + (item.totalWeight || 0), 0);
    const avgWeight = totalWeight / totalQuantity || 0;

    return {
      totalQuantity,
      totalWeight: Math.round(totalWeight * 100) / 100,
      avgWeight: Math.round(avgWeight * 100) / 100
    };
  }

  /**
   * 应用表头样式
   */
  private applyHeaderStyle(worksheet: XLSX.WorkSheet, row: number, colCount: number, startCol = 0): void {
    for (let col = startCol; col < startCol + colCount; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
      if (!worksheet[cellAddress]) worksheet[cellAddress] = { v: '' };
      worksheet[cellAddress].s = this.styles.headerStyle;
    }
  }

  /**
   * 应用数据样式
   */
  private applyDataStyle(worksheet: XLSX.WorkSheet, startRow: number, rowCount: number, colCount: number, startCol = 0): void {
    for (let row = startRow; row < startRow + rowCount; row++) {
      for (let col = startCol; col < startCol + colCount; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        if (!worksheet[cellAddress]) worksheet[cellAddress] = { v: '' };
        worksheet[cellAddress].s = this.styles.dataStyle;
      }
    }
  }

  /**
   * 应用单元格样式
   */
  private applyCellStyle(worksheet: XLSX.WorkSheet, row: number, col: number, style: XLSX.CellStyle): void {
    const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
    if (!worksheet[cellAddress]) worksheet[cellAddress] = { v: '' };
    worksheet[cellAddress].s = style;
  }

  /**
   * 合并单元格
   */
  private mergeCells(worksheet: XLSX.WorkSheet, startRow: number, startCol: number, endRow: number, endCol: number): void {
    if (!worksheet['!merges']) worksheet['!merges'] = [];
    worksheet['!merges'].push({
      s: { r: startRow, c: startCol },
      e: { r: endRow, c: endCol }
    });
  }

  /**
   * 设置列宽
   */
  private setColumnWidths(worksheet: XLSX.WorkSheet, widths: Array<{ wch: number }>): void {
    worksheet['!cols'] = widths;
  }

  /**
   * 获取状态文本
   */
  private getStatusText(status: ShippingStatus | string): string {
    const statusMap = {
      [ShippingStatus.DRAFT]: '草稿',
      [ShippingStatus.PENDING]: '待发货',
      [ShippingStatus.PARTIAL_SHIPPED]: '部分发货',
      [ShippingStatus.SHIPPED]: '已发货',
      [ShippingStatus.DELIVERED]: '已送达',
      [ShippingStatus.COMPLETED]: '已完成',
      [ShippingStatus.CANCELLED]: '已取消'
    };
    return statusMap[status as ShippingStatus] || status;
  }

  /**
   * 获取发货方式文本
   */
  private getShippingMethodText(method: ShippingMethod): string {
    const methodMap = {
      [ShippingMethod.TRUCK]: '卡车运输',
      [ShippingMethod.RAIL]: '铁路运输',
      [ShippingMethod.SEA]: '海运',
      [ShippingMethod.AIR]: '空运'
    };
    return methodMap[method] || method;
  }

  /**
   * 获取设备类型文本
   */
  private getEquipmentTypeText(type: EquipmentType): string {
    const typeMap = {
      [EquipmentType.MECHANICAL]: '机械设备',
      [EquipmentType.ELECTRICAL]: '电控设备',
      [EquipmentType.PIPELINE]: '管路设备',
      [EquipmentType.BURNER]: '燃烧器',
      [EquipmentType.AUXILIARY]: '辅助设备',
      [EquipmentType.STANDARD_PARTS]: '标准件'
    };
    return typeMap[type] || type;
  }

  /**
   * 格式化日期
   */
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  /**
   * 格式化日期时间
   */
  private formatDateTime(dateTime: string): string {
    return new Date(dateTime).toLocaleString('zh-CN');
  }

  /**
   * 保存文件
   */
  private saveFile(fileName: string): void {
    XLSX.writeFile(this.workbook, fileName);
  }

  /**
   * 获取文件Blob
   */
  getFileBlob(fileName: string): Blob {
    const wbout = XLSX.write(this.workbook, { bookType: 'xlsx', type: 'array' });
    return new Blob([wbout], { type: 'application/octet-stream' });
  }

  /**
   * 下载文件
   */
  downloadFile(fileName: string): void {
    const blob = this.getFileBlob(fileName);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
