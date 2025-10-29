/**
 * 增强型发货清单Excel解析工具类
 * 支持解析发货时间sheet和车次明细sheet，并尝试提取图片
 */
import * as XLSX from 'xlsx';
import {
  convertExcelDateToFormat,
  parseVehicleInfo,
  parseDriverInfo,
  type VehicleInfoParsed,
  type DriverInfoParsed
} from './excel-data-converter';

// 发货时间记录
export interface ShippingTimeRecord {
  序号: number | string;
  名称: string;
  明细: string;
  发货时间: string; // 已转换为 yyyy-MM-dd 格式
  车辆信息: string; // 原始信息
  车牌号?: string; // 解析后的车牌号
  车辆描述?: string; // 解析后的车辆描述
  司机姓名及电话: string; // 原始信息
  司机姓名?: string; // 解析后的司机姓名
  司机电话?: string; // 解析后的司机电话
}

// 设备明细记录
export interface EquipmentDetailRecord {
  序号: number | string;
  名称: string;
  分项?: string;
  数量: number | string;
  单位: string;
  备注?: string;
  重量?: number | string;
  [key: string]: any; // 允许其他字段
}

// 解析结果
export interface EnhancedShippingParseResult {
  success: boolean;
  message: string;
  shippingTimes: ShippingTimeRecord[]; // 发货时间数据
  equipmentDetails: {
    sheetName: string; // sheet名称（如"第一车"）
    data: EquipmentDetailRecord[]; // 设备明细数据
  }[];
  images: {
    sheetName: string;
    imageData: string; // base64
    position?: string; // 图片位置信息
  }[];
  availableSheets: string[]; // 所有可用的sheet
}

export class EnhancedShippingExcelParser {
  private workbook: XLSX.WorkBook | null = null;
  private fileBuffer: ArrayBuffer | null = null;

  /**
   * 解析Excel文件
   */
  async parseFile(file: File): Promise<{ success: boolean; message: string; sheets: string[] }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          this.fileBuffer = e.target?.result as ArrayBuffer;
          this.workbook = XLSX.read(data, {
            type: 'array',
            cellStyles: true, // 读取样式信息
            cellFormula: false,
            cellHTML: false
          });

          resolve({
            success: true,
            message: '文件解析成功',
            sheets: this.workbook.SheetNames
          });
        } catch (error) {
          reject(new Error(`文件解析失败: ${error}`));
        }
      };

      reader.onerror = () => {
        reject(new Error('文件读取失败'));
      };

      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * 完整解析发货清单Excel
   */
  async parseShippingListExcel(): Promise<EnhancedShippingParseResult> {
    if (!this.workbook) {
      throw new Error('请先解析Excel文件');
    }

    const result: EnhancedShippingParseResult = {
      success: false,
      message: '',
      shippingTimes: [],
      equipmentDetails: [],
      images: [],
      availableSheets: this.workbook.SheetNames
    };

    try {
      // 1. 解析"设备发货时间"sheet
      if (this.workbook.SheetNames.includes('设备发货时间') ||
          this.workbook.SheetNames.includes('设备发货明细及时间')) {
        const sheetName = this.workbook.SheetNames.find(name =>
          name.includes('设备发货') || name.includes('发货时间')
        );
        if (sheetName) {
          result.shippingTimes = this.parseShippingTimeSheet(sheetName);
        }
      }

      // 2. 解析所有车次明细sheet（以"第"开头的sheet）
      const detailSheets = this.workbook.SheetNames.filter(name =>
        name.startsWith('第') || name.includes('车') || name.includes('固态处理厂')
      );

      for (const sheetName of detailSheets) {
        const details = this.parseEquipmentDetailSheet(sheetName);
        if (details && details.length > 0) {
          result.equipmentDetails.push({
            sheetName,
            data: details
          });
        }
      }

      // 3. 尝试提取图片（注意：xlsx库对图片支持有限）
      result.images = await this.extractImages();

      result.success = true;
      result.message = '解析成功';
    } catch (error) {
      result.success = false;
      result.message = `解析失败: ${error}`;
    }

    return result;
  }

  /**
   * 解析发货时间sheet
   */
  private parseShippingTimeSheet(sheetName: string): ShippingTimeRecord[] {
    if (!this.workbook) return [];

    const worksheet = this.workbook.Sheets[sheetName];
    if (!worksheet) return [];

    // 先读取原始数据
    let jsonData = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: '', // 空单元格默认值
      raw: false // 不使用原始值，让xlsx自动处理日期
    }) as any[][];

    // 处理合并单元格
    jsonData = this.fillMergedCells(worksheet, jsonData);

    const records: ShippingTimeRecord[] = [];

    // 查找表头行
    let headerRowIndex = -1;
    for (let i = 0; i < Math.min(5, jsonData.length); i++) {
      const row = jsonData[i];
      if (row && row.some((cell: any) =>
        typeof cell === 'string' && (
          cell.includes('序号') ||
          cell.includes('名称') ||
          cell.includes('发货时间')
        )
      )) {
        headerRowIndex = i;
        break;
      }
    }

    if (headerRowIndex === -1) {
      // 如果没找到表头，尝试默认第一行
      headerRowIndex = 0;
    }

    const headers = jsonData[headerRowIndex] as string[];

    // 解析数据行
    for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      if (!row || row.every((cell: any) => !cell)) continue; // 跳过空行

      const record: any = {};

      headers.forEach((header, index) => {
        if (header && row[index] !== undefined) {
          // 清理表头名称
          const cleanHeader = header.trim();
          record[cleanHeader] = row[index];
        }
      });

      // 如果至少有名称或明细，就添加这条记录
      if (record['名称'] || record['明细']) {
        // 转换发货时间为标准格式
        if (record['发货时间']) {
          record['发货时间'] = convertExcelDateToFormat(record['发货时间']);
        }

        // 解析车辆信息
        if (record['车辆信息']) {
          const vehicleInfo = parseVehicleInfo(record['车辆信息']);
          record['车牌号'] = vehicleInfo.licensePlate;
          record['车辆描述'] = vehicleInfo.description;
        }

        // 解析司机信息
        if (record['司机姓名及电话']) {
          const driverInfo = parseDriverInfo(record['司机姓名及电话']);
          record['司机姓名'] = driverInfo.name;
          record['司机电话'] = driverInfo.phone;
        }

        records.push(record as ShippingTimeRecord);
      }
    }

    return records;
  }

  /**
   * 处理合并单元格，将主单元格的值填充到所有合并区域
   */
  private fillMergedCells(worksheet: XLSX.WorkSheet, jsonData: any[][]): any[][] {
    // 获取合并单元格信息
    const merges = worksheet['!merges'] || [];

    if (merges.length === 0) {
      return jsonData; // 没有合并单元格，直接返回
    }

    // 创建数据副本
    const filledData = jsonData.map(row => [...(row || [])]);

    // 遍历所有合并单元格区域
    merges.forEach((merge: XLSX.Range) => {
      const { s: start, e: end } = merge; // s: start, e: end

      // 获取合并区域左上角单元格的值
      const masterValue = filledData[start.r]?.[start.c];

      // 如果主单元格有值，填充到整个合并区域
      if (masterValue !== undefined && masterValue !== null && masterValue !== '') {
        for (let row = start.r; row <= end.r; row++) {
          // 确保行存在
          if (!filledData[row]) {
            filledData[row] = [];
          }
          for (let col = start.c; col <= end.c; col++) {
            // 只在单元格为空时填充
            if (!filledData[row][col]) {
              filledData[row][col] = masterValue;
            }
          }
        }
      }
    });

    return filledData;
  }

  /**
   * 解析设备明细sheet（支持合并单元格）
   */
  private parseEquipmentDetailSheet(sheetName: string): EquipmentDetailRecord[] {
    if (!this.workbook) return [];

    const worksheet = this.workbook.Sheets[sheetName];
    if (!worksheet) return [];

    // 先读取原始数据
    let jsonData = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: ''
    }) as any[][];

    // 处理合并单元格
    jsonData = this.fillMergedCells(worksheet, jsonData);

    const records: EquipmentDetailRecord[] = [];

    // 查找表头行（通常包含"序号"、"名称"、"数量"等）
    let headerRowIndex = -1;
    for (let i = 0; i < Math.min(10, jsonData.length); i++) {
      const row = jsonData[i];
      if (row && row.some((cell: any) =>
        typeof cell === 'string' && (
          cell.includes('序号') ||
          cell.includes('名称') ||
          cell.includes('数量')
        )
      )) {
        headerRowIndex = i;
        break;
      }
    }

    if (headerRowIndex === -1) return [];

    const headers = jsonData[headerRowIndex] as string[];

    // 解析数据行
    for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      if (!row || row.every((cell: any) => !cell)) continue;

      const record: any = {};

      headers.forEach((header, index) => {
        if (header && row[index] !== undefined) {
          const cleanHeader = header.trim();
          record[cleanHeader] = row[index];
        }
      });

      // 如果至少有名称或分项，就添加这条记录
      if (record['名称'] || record['分项']) {
        records.push(record as EquipmentDetailRecord);
      }
    }

    return records;
  }

  /**
   * 尝试提取Excel中的图片
   * 注意：标准的xlsx库对图片支持有限，这里返回空数组
   * 如果需要完整的图片提取功能，可能需要使用其他库如exceljs
   */
  private async extractImages(): Promise<{ sheetName: string; imageData: string; position?: string }[]> {
    // xlsx库不直接支持图片提取
    // 可以考虑使用exceljs或其他专门处理Excel图片的库
    // 这里返回空数组，让用户手动上传图片
    return [];
  }

  /**
   * 获取指定sheet的原始数据（用于调试）
   */
  getRawSheetData(sheetName: string): any[][] | null {
    if (!this.workbook) return null;

    const worksheet = this.workbook.Sheets[sheetName];
    if (!worksheet) return null;

    return XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: ''
    }) as any[][];
  }

  /**
   * 格式化文件大小
   */
  static formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  /**
   * 验证是否为发货清单Excel
   */
  static validateShippingListExcel(sheets: string[]): { valid: boolean; message: string } {
    // 检查是否包含必要的sheet
    const hasTimeSheet = sheets.some(name =>
      name.includes('发货时间') || name.includes('设备发货')
    );

    const hasDetailSheet = sheets.some(name =>
      name.startsWith('第') || name.includes('车')
    );

    if (!hasTimeSheet && !hasDetailSheet) {
      return {
        valid: false,
        message: '未找到有效的发货清单数据。请确保Excel文件包含"设备发货时间"或车次明细sheet'
      };
    }

    return {
      valid: true,
      message: '文件验证通过'
    };
  }
}

