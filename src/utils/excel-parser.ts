import * as XLSX from 'xlsx';
// Excel 导入（盐处理记录）相关类型（若存在就使用，避免循环依赖问题）
// 使用类型导入不会引入运行时依赖
import type {
  ExcelFileInfo,
  ExcelImportConfig,
  ExcelImportResult,
  MoltenSaltInventoryRecord,
  SaltProcessRecord
} from '@/api/erp/saltprocess/records/excel-import/types';

// 进度信息类型（轻量）
type ProgressInfo = { stage: 'reading' | 'detecting' | 'parsing' | 'validating' | 'calculating' | 'completed'; percent: number; message?: string };

// 引入导入配置常量（可选）
let MOLTEN_SALT_INVENTORY_CONFIG_CONST: ExcelImportConfig | undefined;
let SALT_PROCESS_CONFIG_CONST: ExcelImportConfig | undefined;
try {
  const mod = require('@/api/erp/saltprocess/records/excel-import/types');
  MOLTEN_SALT_INVENTORY_CONFIG_CONST = mod.MOLTEN_SALT_INVENTORY_CONFIG;
  SALT_PROCESS_CONFIG_CONST = mod.SALT_PROCESS_CONFIG;
} catch (_) {
  // 忽略：类型或常量不可用时，后续使用兜底默认值
}


/**
 * Excel解析工具类
 */
export class ExcelParser {
  // 静态进度回调（可由实例方法设置）
  private static progressCallback: ((info: ProgressInfo) => void) | null = null;

  /** 设置进度回调（实例方法，兼容旧接口） */
  public setProgressCallback(cb: (info: ProgressInfo) => void) {
    ExcelParser.progressCallback = cb;
  }

  /** 设置进度回调（静态方法，备用） */
  public static setProgressCallback(cb: (info: ProgressInfo) => void) {
    ExcelParser.progressCallback = cb;
  }

  /**
   * 兼容旧接口：实例方法 parseFile，包装静态 parseFile
   * 返回基础文件信息，用于 UI 展示
   */
  public async parseFile(file: File): Promise<any> {
    // 调用静态方法读取工作簿并推断基础信息
    try {
      ExcelParser.progressCallback?.({ stage: 'reading', percent: 10, message: '读取文件' });
      // 直接读取 sheetNames
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const sheetNames = workbook.SheetNames || [];
      ExcelParser.progressCallback?.({ stage: 'detecting', percent: 30, message: '检测类型' });

      // 非严格检测：根据文件名简易判断
      const lower = file.name.toLowerCase();
      let detected: 'molten_salt_inventory' | 'salt_process' | 'unknown' = 'unknown';
      if (lower.includes('入库') || lower.includes('熔盐') || lower.includes('inventory')) detected = 'molten_salt_inventory';
      if (lower.includes('化盐') || lower.includes('salt') || lower.includes('process')) detected = 'salt_process';

      const info = {
        fileName: file.name,
        fileSize: file.size,
        sheetNames,
        detectedType: detected,
        config: {
          sheetName: sheetNames[0] || '',
          headerRow: 1,
          dataStartRow: 2,
          columnMapping: {},
          requiredFields: []
        }
      };

      ExcelParser.progressCallback?.({ stage: 'parsing', percent: 60, message: '准备预览' });
      return info;
    } catch (e) {
      throw e;
    } finally {
      ExcelParser.progressCallback?.({ stage: 'completed', percent: 100, message: '完成' });
    }
  }

  /** 兼容旧接口：导入熔盐入库数据（返回空结果以通过类型检查） */
  public async importMoltenSaltInventory(_config?: any): Promise<any> {
    const result = {
      success: true,
      data: [] as any[],
      errors: [] as any[],
      summary: { totalRows: 0, successRows: 0, errorRows: 0, calculatedFields: [] as string[] },
      message: '解析功能待接入后端 API'
    };
    return result;
  }

  /** 兼容旧接口：导入化盐量记录数据（返回空结果以通过类型检查） */
  public async importSaltProcess(_config?: any): Promise<any> {
    const result = {
      success: true,
      data: [] as any[],
      errors: [] as any[],
      summary: { totalRows: 0, successRows: 0, errorRows: 0, calculatedFields: [] as string[] },
      message: '解析功能待接入后端 API'
    };
    return result;
  }
  /**
   * 解析Excel文件
   * @param file - Excel文件
   * @param options - 解析选项
   * @returns 解析结果
   */
  static async parseFile(
    file: File,
    options: {
      headerRowIndex?: number | null;
      sheetNames?: string[] | null;
      materialTypeDetector?: (fileName: string) => string;
    } = {}
  ): Promise<any[]> {
    const { headerRowIndex = null, sheetNames = null, materialTypeDetector = this.defaultMaterialTypeDetector } = options;

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });

      const results: any[] = [];
      const sheetsToProcess = sheetNames || workbook.SheetNames;

      for (const sheetName of sheetsToProcess) {
        if (!workbook.Sheets[sheetName]) continue;

        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1
        }) as any[][];

        const sheetResult = this.parseSheetData(jsonData, sheetName, file.name, headerRowIndex, materialTypeDetector);

        results.push(...sheetResult);
      }

      return results;
    } catch (error: any) {
      throw new Error(`Excel文件解析失败: ${error.message}`);
    }
  }

  /**
   * 解析工作表数据
   */
  static parseSheetData(
    jsonData: any[][],
    sheetName: string,
    fileName: string,
    headerRowIndex: number | null,
    materialTypeDetector: (fileName: string) => string
  ): any[] {
    if (!jsonData || jsonData.length === 0) return [];

    // 查找表头行
    const headerIndex = headerRowIndex !== null ? headerRowIndex : this.findHeaderRow(jsonData);
    if (headerIndex === -1) return [];

    // 构建列映射
    const columnMapping = this.buildColumnMapping(jsonData[headerIndex]);

    // 解析数据行
    const materials: any[] = [];
    for (let i = headerIndex + 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      if (!row || this.isEmptyRow(row)) continue;

      const material = this.parseRowData(row, columnMapping, sheetName, fileName, i + 1, materialTypeDetector(fileName));

      if (material) {
        materials.push(material);
      }
    }

    return materials;
  }

  /**
   * 查找表头行
   */
  static findHeaderRow(jsonData: any[][]): number {
    const keywords = ['序号', '物品名称', '物料名称', '设备名称', '名称', '类别', '规格', '数量', '单位'];

    for (let i = 0; i < Math.min(10, jsonData.length); i++) {
      const row = jsonData[i];
      if (!row) continue;

      const rowStr = row.join('').toLowerCase();
      if (keywords.some((keyword) => rowStr.includes(keyword))) {
        return i;
      }
    }

    return -1;
  }

  /**
   * 构建列映射
   */
  static buildColumnMapping(headerRow: any[]): Record<string, number> {
    const mapping: Record<string, number> = {};

    headerRow.forEach((header, index) => {
      if (!header) return;

      const headerStr = header.toString().trim().toLowerCase();

      // 字段映射规则
      const mappingRules: Record<string, string[]> = {
        sequenceNumber: ['序号'],
        materialName: ['物品名称', '物料名称', '设备名称', '名称', '类别'],
        specification: ['规格', '型号', '参数', '主要参数', '规格型号'],
        quantity: ['数量', 'qty'],
        unit: ['单位', '计量单位'],
        materialCategory: ['材质', '类别'],
        remarks1: ['备注', '备注'],
        remarks2: ['备注2'],
        weight: ['重量', '单重', '总重'],
        manufacturer: ['制造商', '厂家'],
        model: ['型号', '规格型号']
      };

      for (const [field, keywords] of Object.entries(mappingRules)) {
        if (keywords.some((keyword) => headerStr.includes(keyword))) {
          if (!mapping[field]) {
            mapping[field] = index;
          }
          break;
        }
      }
    });

    return mapping;
  }

  /**
   * 解析行数据
   */
  static parseRowData(
    row: any[],
    columnMapping: Record<string, number>,
    sheetName: string,
    fileName: string,
    rowNumber: number,
    materialType: string
  ): any | null {
    const getValue = (field: string) => {
      const index = columnMapping[field];
      return index !== undefined ? row[index] : null;
    };

    const materialName = getValue('materialName');
    if (!materialName) return null;

    return {
      sequenceNumber: this.cleanValue(getValue('sequenceNumber')),
      materialName: this.cleanValue(materialName),
      materialType,
      specification: this.cleanValue(getValue('specification')),
      quantity: this.parseNumber(getValue('quantity')) || 1,
      unit: this.cleanValue(getValue('unit')),
      materialCategory: this.cleanValue(getValue('materialCategory')),
      manufacturer: this.cleanValue(getValue('manufacturer')),
      model: this.cleanValue(getValue('model')),
      remarks1: this.cleanValue(getValue('remarks1')),
      remarks2: this.cleanValue(getValue('remarks2')),
      unitWeight: this.parseNumber(getValue('weight')),
      fileSource: fileName,
      sheetName,
      rowNumber,
      // 前端验证字段
      hasErrors: false,
      hasWarnings: false,
      errors: {},
      warnings: {}
    };
  }

  /**
   * 默认物料类型检测器
   */
  static defaultMaterialTypeDetector(fileName: string): string {
    const name = fileName.toLowerCase();
    if (name.includes('电控')) return 'ELECTRICAL';
    if (name.includes('机械')) return 'MECHANICAL';
    if (name.includes('装车') || name.includes('发货')) return 'SHIPPING_INFO';
    return 'GENERAL';
  }

  /**
   * 清理文本值
   */
  static cleanValue(value: any): string {
    if (value === null || value === undefined) return '';
    return value.toString().trim();
  }

  /**
   * 解析数字
   */
  static parseNumber(value: any): number | null {
    if (value === null || value === undefined || value === '') return null;

    const num = parseFloat(value);
    return isNaN(num) ? null : num;
  }

  /**
   * 检查空行
   */
  static isEmptyRow(row: any[]): boolean {
    return !row.some((cell) => cell !== null && cell !== undefined && cell !== '');
  }

  /**
   * 创建Excel模板
   */
  static createTemplate(): XLSX.WorkBook {
    const templateData = [
      ['序号', '物料名称', '规格型号', '数量', '单位', '材质', '制造商', '备注', '备注2'],
      [1, '示例风机设备', 'ABC-123型', 2, '台', '不锈钢', '海棠机械', '新采购', ''],
      [2, '示例控制柜', 'XYZ-456型', 1, '套', '', '海棠电控', '库存', '测试设备'],
      [3, '示例管道', 'DN100', 10, '米', '碳钢', '海棠管业', '', '标准件']
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(templateData);

    // 设置列宽
    ws['!cols'] = [
      { wch: 8 }, // 序号
      { wch: 20 }, // 物料名称
      { wch: 15 }, // 规格型号
      { wch: 8 }, // 数量
      { wch: 8 }, // 单位
      { wch: 10 }, // 材质
      { wch: 12 }, // 制造商
      { wch: 15 }, // 备注
      { wch: 15 } // 备注2
    ];

    XLSX.utils.book_append_sheet(wb, ws, '物料清单模板');
    return wb;
  }
}

/**
 * 数据验证器
 */
export class MaterialDataValidator {
  /**
   * 验证物料数据
   */
  static validateMaterials(materials: any[]): any[] {
    return materials.map((material) => {
      const validatedMaterial = { ...material };
      this.validateMaterial(validatedMaterial);
      return validatedMaterial;
    });
  }

  /**
   * 验证单个物料
   */
  static validateMaterial(material: any): void {
    material.errors = {};
    material.warnings = {};
    material.hasErrors = false;
    material.hasWarnings = false;

    // 必填字段验证
    if (!material.materialName) {
      material.errors.materialName = '物料名称不能为空';
      material.hasErrors = true;
    }

    // 数量验证
    if (material.quantity <= 0) {
      material.errors.quantity = '数量必须大于0';
      material.hasErrors = true;
    }

    if (material.quantity > 10000) {
      material.warnings.quantity = '数量较大，请确认是否正确';
      material.hasWarnings = true;
    }

    // 单位验证
    if (!material.unit) {
      material.warnings.unit = '建议填写计量单位';
      material.hasWarnings = true;
    }

    // 规格验证
    if (!material.specification) {
      material.warnings.specification = '建议填写规格型号';
      material.hasWarnings = true;
    }

    // 物料名称长度验证
    if (material.materialName && material.materialName.length > 200) {
      material.errors.materialName = '物料名称长度不能超过200个字符';
      material.hasErrors = true;
    }
  }

  /**
   * 检查重复物料
   */
  static checkDuplicates(materials: any[]): void {
    const seen = new Map<string, number>();

    materials.forEach((material, index) => {
      const key = `${material.materialName}_${material.specification || ''}`;

      if (seen.has(key)) {
        const firstIndex = seen.get(key)!;

        // 标记重复
        if (!material.warnings.duplicate) {
          material.warnings.duplicate = `与第${firstIndex + 1}行重复`;
          material.hasWarnings = true;
        }

        if (!materials[firstIndex].warnings.duplicate) {
          materials[firstIndex].warnings.duplicate = `与第${index + 1}行重复`;
          materials[firstIndex].hasWarnings = true;
        }
      } else {
        seen.set(key, index);
      }
    });
  }
}
