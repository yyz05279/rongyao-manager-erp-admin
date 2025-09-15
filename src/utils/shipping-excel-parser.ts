/**
 * 发货清单Excel解析工具类
 * 基于现有的excel-parser.ts扩展，专门处理发货清单相关的Excel文件
 */
import * as XLSX from 'xlsx';
import type {
  ShippingExcelImportConfig,
  ShippingExcelImportResult,
  ShippingItemForm,
  EquipmentType
} from '@/api/erp/saltprocess/shipping/types';

// 发货清单Excel配置
export const SHIPPING_EXCEL_CONFIGS = {
  // 通用发货清单配置
  GENERAL: {
    fileType: 'GENERAL' as const,
    headerRow: 1,
    columnMapping: {
      '序号': 'index',
      '物品名称': 'itemName',
      '规格型号': 'specification',
      '数量': 'quantity',
      '单位': 'unit',
      '单重': 'unitWeight',
      '总重': 'totalWeight',
      '制造商': 'manufacturer',
      '型号': 'model',
      '序列号': 'serialNumber',
      '包装方式': 'packageType',
      '包装件数': 'packageQuantity',
      '备注': 'remarks'
    }
  },
  
  // 机械设备发货清单配置
  MECHANICAL: {
    fileType: 'MECHANICAL' as const,
    headerRow: 1,
    columnMapping: {
      '序号': 'index',
      '设备名称': 'itemName',
      '规格': 'specification',
      '数量': 'quantity',
      '单位': 'unit',
      '重量': 'unitWeight',
      '总重量': 'totalWeight',
      '制造厂家': 'manufacturer',
      '设备型号': 'model',
      '设备编号': 'serialNumber',
      '包装': 'packageType',
      '备注': 'remarks'
    }
  },
  
  // 电控设备发货清单配置
  ELECTRICAL: {
    fileType: 'ELECTRICAL' as const,
    headerRow: 1,
    columnMapping: {
      '序号': 'index',
      '设备名称': 'itemName',
      '型号规格': 'specification',
      '数量': 'quantity',
      '单位': 'unit',
      '单重(kg)': 'unitWeight',
      '总重(kg)': 'totalWeight',
      '生产厂家': 'manufacturer',
      '产品型号': 'model',
      '产品编号': 'serialNumber',
      '包装方式': 'packageType',
      '说明': 'remarks'
    }
  },
  
  // 管路装箱清单配置
  PIPELINE: {
    fileType: 'PIPELINE' as const,
    headerRow: 1,
    columnMapping: {
      '序号': 'index',
      '名称': 'itemName',
      '规格': 'specification',
      '数量': 'quantity',
      '单位': 'unit',
      '单重': 'unitWeight',
      '总重': 'totalWeight',
      '材质': 'manufacturer',
      '标准': 'model',
      '包装': 'packageType',
      '备注': 'remarks'
    }
  },
  
  // 燃烧器及附属件清单配置
  BURNER: {
    fileType: 'BURNER' as const,
    headerRow: 1,
    columnMapping: {
      '序号': 'index',
      '设备名称': 'itemName',
      '规格型号': 'specification',
      '数量': 'quantity',
      '单位': 'unit',
      '重量(kg)': 'unitWeight',
      '总重量(kg)': 'totalWeight',
      '制造商': 'manufacturer',
      '型号': 'model',
      '编号': 'serialNumber',
      '包装': 'packageType',
      '备注': 'remarks'
    }
  }
};

export class ShippingExcelParser {
  private workbook: XLSX.WorkBook | null = null;

  /**
   * 解析Excel文件
   */
  async parseFile(file: File): Promise<{ success: boolean; message: string; sheets: string[] }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          this.workbook = XLSX.read(data, { type: 'array' });
          
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
   * 自动识别发货清单类型
   */
  identifyShippingListType(sheetName?: string): keyof typeof SHIPPING_EXCEL_CONFIGS {
    if (!this.workbook) {
      throw new Error('请先解析Excel文件');
    }

    const targetSheet = sheetName || this.workbook.SheetNames[0];
    const worksheet = this.workbook.Sheets[targetSheet];
    
    if (!worksheet) {
      throw new Error(`工作表 "${targetSheet}" 不存在`);
    }

    // 将工作表转换为JSON数组进行分析
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    const headerText = JSON.stringify(jsonData.slice(0, 5)).toLowerCase();

    // 根据关键词识别类型
    if (headerText.includes('电控') || headerText.includes('控制') || headerText.includes('plc')) {
      return 'ELECTRICAL';
    } else if (headerText.includes('机械') || headerText.includes('设备')) {
      return 'MECHANICAL';
    } else if (headerText.includes('管路') || headerText.includes('管道') || headerText.includes('标准件')) {
      return 'PIPELINE';
    } else if (headerText.includes('燃烧器') || headerText.includes('燃烧') || headerText.includes('附属件')) {
      return 'BURNER';
    }

    return 'GENERAL';
  }

  /**
   * 导入发货清单数据
   */
  async importShippingData(
    config: ShippingExcelImportConfig,
    sheetName?: string
  ): Promise<ShippingExcelImportResult> {
    if (!this.workbook) {
      throw new Error('请先解析Excel文件');
    }

    const targetSheet = sheetName || this.workbook.SheetNames[0];
    const worksheet = this.workbook.Sheets[targetSheet];
    
    if (!worksheet) {
      throw new Error(`工作表 "${targetSheet}" 不存在`);
    }

    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    const errors: { row: number; field: string; message: string }[] = [];
    const data: ShippingItemForm[] = [];

    // 查找表头行
    let headerRowIndex = config.headerRow - 1;
    for (let i = 0; i < Math.min(10, jsonData.length); i++) {
      const row = jsonData[i] as any[];
      if (row && row.some(cell => 
        typeof cell === 'string' && 
        (cell.includes('名称') || cell.includes('序号') || cell.includes('数量'))
      )) {
        headerRowIndex = i;
        break;
      }
    }

    const headers = jsonData[headerRowIndex] as string[];
    if (!headers || headers.length === 0) {
      throw new Error('未找到有效的表头行');
    }

    // 处理数据行
    for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
      const row = jsonData[i] as any[];
      if (!row || row.every(cell => !cell)) continue; // 跳过空行

      const item: Partial<ShippingItemForm> = {
        isFragile: false,
        isHazardous: false
      };

      // 映射字段
      headers.forEach((header, colIndex) => {
        if (!header) return;
        
        const fieldName = this.findMappedField(header, config.columnMapping);
        if (fieldName && row[colIndex] !== undefined && row[colIndex] !== null) {
          const value = row[colIndex];
          
          try {
            switch (fieldName) {
              case 'quantity':
              case 'unitWeight':
              case 'totalWeight':
              case 'unitVolume':
              case 'totalVolume':
              case 'packageQuantity':
                item[fieldName] = this.parseNumber(value);
                break;
              case 'isFragile':
              case 'isHazardous':
                item[fieldName] = this.parseBoolean(value);
                break;
              default:
                item[fieldName] = String(value).trim();
            }
          } catch (error) {
            errors.push({
              row: i + 1,
              field: fieldName,
              message: `字段 "${header}" 值 "${value}" 解析失败: ${error}`
            });
          }
        }
      });

      // 数据验证和补充
      const validationResult = this.validateAndEnhanceItem(item, i + 1, config.fileType);
      if (validationResult.errors.length > 0) {
        errors.push(...validationResult.errors);
      }

      if (validationResult.item.itemName) {
        data.push(validationResult.item as ShippingItemForm);
      }
    }

    return {
      success: errors.length === 0,
      totalRows: jsonData.length - headerRowIndex - 1,
      successRows: data.length,
      errorRows: errors.length,
      errors,
      data
    };
  }

  /**
   * 查找映射字段
   */
  private findMappedField(header: string, columnMapping: { [key: string]: string }): string | null {
    // 精确匹配
    if (columnMapping[header]) {
      return columnMapping[header];
    }

    // 去除空格后匹配
    const trimmedHeader = header.replace(/\s+/g, '');
    for (const [key, value] of Object.entries(columnMapping)) {
      if (key.replace(/\s+/g, '') === trimmedHeader) {
        return value;
      }
    }

    // 模糊匹配
    for (const [key, value] of Object.entries(columnMapping)) {
      if (header.includes(key) || key.includes(header)) {
        return value;
      }
    }

    return null;
  }

  /**
   * 解析数字
   */
  private parseNumber(value: any): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const num = parseFloat(value.replace(/[^\d.-]/g, ''));
      if (isNaN(num)) throw new Error('无效的数字格式');
      return num;
    }
    throw new Error('无法解析为数字');
  }

  /**
   * 解析布尔值
   */
  private parseBoolean(value: any): boolean {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      const str = value.toLowerCase().trim();
      return str === '是' || str === 'true' || str === '1' || str === 'yes';
    }
    return false;
  }

  /**
   * 验证和增强数据项
   */
  private validateAndEnhanceItem(
    item: Partial<ShippingItemForm>, 
    rowIndex: number, 
    fileType: string
  ): { item: Partial<ShippingItemForm>; errors: { row: number; field: string; message: string }[] } {
    const errors: { row: number; field: string; message: string }[] = [];

    // 必填字段验证
    if (!item.itemName) {
      errors.push({ row: rowIndex, field: 'itemName', message: '物品名称不能为空' });
    }

    if (!item.quantity || item.quantity <= 0) {
      errors.push({ row: rowIndex, field: 'quantity', message: '数量必须大于0' });
    }

    if (!item.unit) {
      item.unit = '个'; // 默认单位
    }

    // 根据文件类型设置设备类型
    switch (fileType) {
      case 'MECHANICAL':
        item.equipmentType = 'MECHANICAL' as EquipmentType;
        break;
      case 'ELECTRICAL':
        item.equipmentType = 'ELECTRICAL' as EquipmentType;
        break;
      case 'PIPELINE':
        item.equipmentType = 'PIPELINE' as EquipmentType;
        break;
      case 'BURNER':
        item.equipmentType = 'BURNER' as EquipmentType;
        break;
      default:
        item.equipmentType = 'AUXILIARY' as EquipmentType;
    }

    // 计算总重量
    if (item.unitWeight && item.quantity && !item.totalWeight) {
      item.totalWeight = item.unitWeight * item.quantity;
    }

    // 计算总体积
    if (item.unitVolume && item.quantity && !item.totalVolume) {
      item.totalVolume = item.unitVolume * item.quantity;
    }

    return { item, errors };
  }

  /**
   * 生成Excel模板
   */
  static generateTemplate(templateType: keyof typeof SHIPPING_EXCEL_CONFIGS): Blob {
    const config = SHIPPING_EXCEL_CONFIGS[templateType];
    const headers = Object.keys(config.columnMapping);
    
    // 示例数据
    const sampleData = {
      '序号': 1,
      '物品名称': '示例设备',
      '规格型号': 'ABC-123',
      '数量': 1,
      '单位': '台',
      '单重': 100,
      '总重': 100,
      '制造商': '示例厂家',
      '型号': 'MODEL-001',
      '序列号': 'SN001',
      '包装方式': '木箱',
      '包装件数': 1,
      '备注': '示例备注'
    };

    const data = [headers, headers.map(h => sampleData[h] || '')];
    
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, '发货清单');
    
    return new Blob([XLSX.write(wb, { bookType: 'xlsx', type: 'array' })], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
  }
}
