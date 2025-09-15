/**
 * Excel导入测试工具
 * 基于XLSX.js库实现Excel文件解析功能
 */
import * as XLSX from 'xlsx';
import { 
  ShippingItemForm, 
  EquipmentType, 
  ShippingExcelImportConfig,
  ShippingExcelImportResult 
} from '@/api/erp/saltprocess/shipping/types';

// Excel模板配置
export interface ExcelTemplateConfig {
  fileType: 'GENERAL' | 'MECHANICAL' | 'ELECTRICAL' | 'PIPELINE' | 'BURNER';
  templateName: string;
  description: string;
  columns: {
    key: string;
    label: string;
    required: boolean;
    type: 'string' | 'number' | 'boolean';
    example?: string;
  }[];
}

// 预定义的Excel模板配置
export const excelTemplateConfigs: ExcelTemplateConfig[] = [
  {
    fileType: 'GENERAL',
    templateName: '通用发货清单模板',
    description: '适用于各种类型设备的通用模板',
    columns: [
      { key: 'itemName', label: '物品名称', required: true, type: 'string', example: '离心泵' },
      { key: 'specification', label: '规格型号', required: false, type: 'string', example: 'IS100-80-160' },
      { key: 'equipmentType', label: '设备类型', required: true, type: 'string', example: 'MECHANICAL' },
      { key: 'quantity', label: '数量', required: true, type: 'number', example: '2' },
      { key: 'unit', label: '单位', required: true, type: 'string', example: '台' },
      { key: 'unitWeight', label: '单重(kg)', required: false, type: 'number', example: '150.5' },
      { key: 'manufacturer', label: '制造商', required: false, type: 'string', example: '上海水泵厂' },
      { key: 'model', label: '型号', required: false, type: 'string', example: 'IS100-80-160' },
      { key: 'serialNumber', label: '序列号', required: false, type: 'string', example: 'SP20240315001' },
      { key: 'packageType', label: '包装方式', required: false, type: 'string', example: '木箱' },
      { key: 'packageQuantity', label: '包装件数', required: false, type: 'number', example: '2' },
      { key: 'isFragile', label: '是否易碎', required: false, type: 'boolean', example: '否' },
      { key: 'isHazardous', label: '是否危险品', required: false, type: 'boolean', example: '否' },
      { key: 'storageRequirement', label: '存储要求', required: false, type: 'string', example: '干燥通风' },
      { key: 'remarks', label: '备注', required: false, type: 'string', example: '新设备' }
    ]
  },
  {
    fileType: 'MECHANICAL',
    templateName: '机械设备发货清单模板',
    description: '专用于机械设备的发货清单模板',
    columns: [
      { key: 'itemName', label: '设备名称', required: true, type: 'string', example: '离心泵' },
      { key: 'specification', label: '规格型号', required: true, type: 'string', example: 'IS100-80-160' },
      { key: 'quantity', label: '数量', required: true, type: 'number', example: '2' },
      { key: 'unit', label: '单位', required: true, type: 'string', example: '台' },
      { key: 'unitWeight', label: '单重(kg)', required: true, type: 'number', example: '150.5' },
      { key: 'manufacturer', label: '制造商', required: true, type: 'string', example: '上海水泵厂' },
      { key: 'model', label: '设备型号', required: true, type: 'string', example: 'IS100-80-160' },
      { key: 'serialNumber', label: '设备序列号', required: false, type: 'string', example: 'SP20240315001' },
      { key: 'packageType', label: '包装方式', required: true, type: 'string', example: '木箱' },
      { key: 'packageQuantity', label: '包装件数', required: true, type: 'number', example: '2' },
      { key: 'storageRequirement', label: '存储要求', required: false, type: 'string', example: '干燥通风' },
      { key: 'remarks', label: '备注说明', required: false, type: 'string', example: '新设备，注意防潮' }
    ]
  },
  {
    fileType: 'ELECTRICAL',
    templateName: '电控设备发货清单模板',
    description: '专用于电控设备的发货清单模板',
    columns: [
      { key: 'itemName', label: '设备名称', required: true, type: 'string', example: '变频器' },
      { key: 'specification', label: '技术规格', required: true, type: 'string', example: '380V/50Hz' },
      { key: 'quantity', label: '数量', required: true, type: 'number', example: '1' },
      { key: 'unit', label: '单位', required: true, type: 'string', example: '台' },
      { key: 'unitWeight', label: '单重(kg)', required: false, type: 'number', example: '25.8' },
      { key: 'manufacturer', label: '制造商', required: true, type: 'string', example: '西门子' },
      { key: 'model', label: '产品型号', required: true, type: 'string', example: 'G120C-5.5KW' },
      { key: 'serialNumber', label: '产品序列号', required: false, type: 'string', example: 'SN20240315001' },
      { key: 'packageType', label: '包装方式', required: true, type: 'string', example: '防静电包装' },
      { key: 'isFragile', label: '是否易碎', required: true, type: 'boolean', example: '是' },
      { key: 'storageRequirement', label: '存储要求', required: true, type: 'string', example: '防潮防震' },
      { key: 'remarks', label: '特殊说明', required: false, type: 'string', example: '精密设备，小心搬运' }
    ]
  },
  {
    fileType: 'PIPELINE',
    templateName: '管路设备发货清单模板',
    description: '专用于管路设备的发货清单模板',
    columns: [
      { key: 'itemName', label: '管件名称', required: true, type: 'string', example: '不锈钢管' },
      { key: 'specification', label: '规格尺寸', required: true, type: 'string', example: 'DN100 PN16' },
      { key: 'quantity', label: '数量', required: true, type: 'number', example: '10' },
      { key: 'unit', label: '单位', required: true, type: 'string', example: '米' },
      { key: 'unitWeight', label: '单重(kg/m)', required: true, type: 'number', example: '12.5' },
      { key: 'manufacturer', label: '制造商', required: true, type: 'string', example: '苏州管道厂' },
      { key: 'model', label: '产品型号', required: false, type: 'string', example: 'SS316L' },
      { key: 'packageType', label: '包装方式', required: true, type: 'string', example: '捆扎包装' },
      { key: 'packageQuantity', label: '包装件数', required: true, type: 'number', example: '5' },
      { key: 'storageRequirement', label: '存储要求', required: false, type: 'string', example: '防锈防腐' },
      { key: 'remarks', label: '备注', required: false, type: 'string', example: '316L不锈钢材质' }
    ]
  },
  {
    fileType: 'BURNER',
    templateName: '燃烧器设备发货清单模板',
    description: '专用于燃烧器设备的发货清单模板',
    columns: [
      { key: 'itemName', label: '设备名称', required: true, type: 'string', example: '燃气燃烧器' },
      { key: 'specification', label: '技术参数', required: true, type: 'string', example: '500kW 天然气' },
      { key: 'quantity', label: '数量', required: true, type: 'number', example: '1' },
      { key: 'unit', label: '单位', required: true, type: 'string', example: '套' },
      { key: 'unitWeight', label: '单重(kg)', required: true, type: 'number', example: '280.5' },
      { key: 'manufacturer', label: '制造商', required: true, type: 'string', example: '无锡燃烧器厂' },
      { key: 'model', label: '产品型号', required: true, type: 'string', example: 'WX-500-NG' },
      { key: 'serialNumber', label: '设备序列号', required: true, type: 'string', example: 'BN20240315001' },
      { key: 'packageType', label: '包装方式', required: true, type: 'string', example: '木箱包装' },
      { key: 'isHazardous', label: '是否危险品', required: true, type: 'boolean', example: '否' },
      { key: 'storageRequirement', label: '存储要求', required: true, type: 'string', example: '干燥通风，远离火源' },
      { key: 'remarks', label: '安全说明', required: false, type: 'string', example: '安装前需检查气密性' }
    ]
  }
];

// Excel文件解析类
export class ExcelImportParser {
  private workbook: XLSX.WorkBook | null = null;
  private config: ShippingExcelImportConfig | null = null;

  /**
   * 读取Excel文件
   */
  async readFile(file: File): Promise<XLSX.WorkBook> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          this.workbook = workbook;
          resolve(workbook);
        } catch (error) {
          reject(new Error('Excel文件读取失败：' + error));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('文件读取失败'));
      };
      
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * 获取工作表名称列表
   */
  getSheetNames(): string[] {
    if (!this.workbook) {
      throw new Error('请先读取Excel文件');
    }
    return this.workbook.SheetNames;
  }

  /**
   * 预览工作表数据
   */
  previewSheet(sheetName: string, maxRows: number = 10): any[][] {
    if (!this.workbook) {
      throw new Error('请先读取Excel文件');
    }

    const worksheet = this.workbook.Sheets[sheetName];
    if (!worksheet) {
      throw new Error(`工作表 "${sheetName}" 不存在`);
    }

    const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
      header: 1, 
      defval: '',
      range: maxRows 
    });
    
    return jsonData as any[][];
  }

  /**
   * 设置导入配置
   */
  setConfig(config: ShippingExcelImportConfig): void {
    this.config = config;
  }

  /**
   * 解析Excel数据
   */
  parseData(): ShippingExcelImportResult {
    if (!this.workbook || !this.config) {
      throw new Error('请先读取文件并设置配置');
    }

    const sheetName = this.config.sheetName || this.workbook.SheetNames[0];
    const worksheet = this.workbook.Sheets[sheetName];
    
    if (!worksheet) {
      throw new Error(`工作表 "${sheetName}" 不存在`);
    }

    // 获取数据范围
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    const startRow = this.config.headerRow;
    const totalRows = range.e.r - startRow + 1;

    const result: ShippingExcelImportResult = {
      success: true,
      totalRows: totalRows,
      successRows: 0,
      errorRows: 0,
      errors: [],
      data: []
    };

    // 解析数据行
    for (let rowIndex = startRow; rowIndex <= range.e.r; rowIndex++) {
      try {
        const rowData = this.parseRow(worksheet, rowIndex);
        if (rowData) {
          const validationResult = this.validateRowData(rowData, rowIndex + 1);
          if (validationResult.isValid) {
            result.data.push(rowData);
            result.successRows++;
          } else {
            result.errors.push(...validationResult.errors);
            result.errorRows++;
          }
        }
      } catch (error) {
        result.errors.push({
          row: rowIndex + 1,
          field: 'general',
          message: `行解析失败: ${error}`
        });
        result.errorRows++;
      }
    }

    result.success = result.errorRows === 0;
    return result;
  }

  /**
   * 解析单行数据
   */
  private parseRow(worksheet: XLSX.WorkSheet, rowIndex: number): ShippingItemForm | null {
    if (!this.config) return null;

    const rowData: any = {};
    let hasData = false;

    // 根据列映射解析数据
    for (const [field, column] of Object.entries(this.config.columnMapping)) {
      const cellAddress = column + (rowIndex + 1);
      const cell = worksheet[cellAddress];
      const value = cell ? cell.v : '';

      if (value !== '' && value !== null && value !== undefined) {
        hasData = true;
      }

      rowData[field] = this.convertValue(field, value);
    }

    // 如果整行都没有数据，跳过
    if (!hasData) return null;

    // 设置默认值
    const item: ShippingItemForm = {
      itemName: rowData.itemName || '',
      specification: rowData.specification || '',
      equipmentType: this.parseEquipmentType(rowData.equipmentType),
      quantity: Number(rowData.quantity) || 0,
      unit: rowData.unit || '个',
      unitWeight: Number(rowData.unitWeight) || undefined,
      manufacturer: rowData.manufacturer || '',
      model: rowData.model || '',
      serialNumber: rowData.serialNumber || '',
      packageType: rowData.packageType || '',
      packageQuantity: Number(rowData.packageQuantity) || undefined,
      isFragile: this.parseBoolean(rowData.isFragile),
      isHazardous: this.parseBoolean(rowData.isHazardous),
      storageRequirement: rowData.storageRequirement || '',
      remarks: rowData.remarks || ''
    };

    return item;
  }

  /**
   * 转换数据值
   */
  private convertValue(field: string, value: any): any {
    if (value === '' || value === null || value === undefined) {
      return '';
    }

    // 数字类型字段
    if (['quantity', 'unitWeight', 'packageQuantity'].includes(field)) {
      return Number(value) || 0;
    }

    // 布尔类型字段
    if (['isFragile', 'isHazardous'].includes(field)) {
      return this.parseBoolean(value);
    }

    return String(value).trim();
  }

  /**
   * 解析设备类型
   */
  private parseEquipmentType(value: any): EquipmentType {
    const typeMap: { [key: string]: EquipmentType } = {
      '机械设备': EquipmentType.MECHANICAL,
      'MECHANICAL': EquipmentType.MECHANICAL,
      '电控设备': EquipmentType.ELECTRICAL,
      'ELECTRICAL': EquipmentType.ELECTRICAL,
      '管路设备': EquipmentType.PIPELINE,
      'PIPELINE': EquipmentType.PIPELINE,
      '燃烧器': EquipmentType.BURNER,
      'BURNER': EquipmentType.BURNER,
      '辅助设备': EquipmentType.AUXILIARY,
      'AUXILIARY': EquipmentType.AUXILIARY,
      '标准件': EquipmentType.STANDARD_PARTS,
      'STANDARD_PARTS': EquipmentType.STANDARD_PARTS
    };

    const key = String(value).trim().toUpperCase();
    return typeMap[key] || typeMap[value] || EquipmentType.MECHANICAL;
  }

  /**
   * 解析布尔值
   */
  private parseBoolean(value: any): boolean {
    if (typeof value === 'boolean') return value;
    
    const str = String(value).trim().toLowerCase();
    return ['是', 'yes', 'true', '1', 'y'].includes(str);
  }

  /**
   * 验证行数据
   */
  private validateRowData(data: ShippingItemForm, rowNumber: number): {
    isValid: boolean;
    errors: Array<{ row: number; field: string; message: string }>;
  } {
    const errors: Array<{ row: number; field: string; message: string }> = [];

    // 必填字段验证
    if (!data.itemName) {
      errors.push({ row: rowNumber, field: 'itemName', message: '物品名称不能为空' });
    }

    if (!data.quantity || data.quantity <= 0) {
      errors.push({ row: rowNumber, field: 'quantity', message: '数量必须大于0' });
    }

    if (!data.unit) {
      errors.push({ row: rowNumber, field: 'unit', message: '单位不能为空' });
    }

    // 数据类型验证
    if (data.unitWeight !== undefined && (isNaN(data.unitWeight) || data.unitWeight < 0)) {
      errors.push({ row: rowNumber, field: 'unitWeight', message: '单重必须为非负数' });
    }

    if (data.packageQuantity !== undefined && (isNaN(data.packageQuantity) || data.packageQuantity <= 0)) {
      errors.push({ row: rowNumber, field: 'packageQuantity', message: '包装件数必须大于0' });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}
