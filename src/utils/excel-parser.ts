/**
 * Excel数据解析工具类
 * 支持多种Excel格式的数据解析，包括自动识别表头、数据类型转换、缺失数据处理等功能
 */
import * as XLSX from 'xlsx';
import type {
  ExcelImportConfig,
  ExcelImportResult,
  ExcelImportError,
  ExcelFileInfo,
  ValidationRule,
  ImportProgress,
  MoltenSaltInventoryRecord,
  SaltProcessRecord
} from '@/api/erp/saltprocess/records/excel-import/types';
import {
  MOLTEN_SALT_INVENTORY_CONFIG,
  SALT_PROCESS_CONFIG,
  MOLTEN_SALT_VALIDATION_RULES,
  SALT_PROCESS_VALIDATION_RULES,
  SALT_SPECIFICATIONS
} from '@/api/erp/saltprocess/records/excel-import/types';

export class ExcelParser {
  private workbook: XLSX.WorkBook | null = null;
  private progressCallback?: (progress: ImportProgress) => void;

  /**
   * 设置进度回调函数
   */
  setProgressCallback(callback: (progress: ImportProgress) => void) {
    this.progressCallback = callback;
  }

  /**
   * 更新进度
   */
  private updateProgress(status: ImportProgress['status'], currentStep: string, progress: number, processedRows: number = 0, totalRows: number = 0, errors: ExcelImportError[] = []) {
    if (this.progressCallback) {
      this.progressCallback({
        status,
        currentStep,
        progress,
        processedRows,
        totalRows,
        errors
      });
    }
  }

  /**
   * 解析Excel文件
   */
  async parseFile(file: File): Promise<ExcelFileInfo> {
    this.updateProgress('parsing', '正在读取Excel文件...', 10);

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          this.workbook = XLSX.read(data, { type: 'array' });
          
          const fileInfo = this.analyzeFile(file);
          this.updateProgress('parsing', '文件解析完成', 30);
          resolve(fileInfo);
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
   * 分析Excel文件结构
   */
  private analyzeFile(file: File): ExcelFileInfo {
    if (!this.workbook) {
      throw new Error('工作簿未加载');
    }

    const sheetNames = this.workbook.SheetNames;
    let detectedType: ExcelFileInfo['detectedType'] = 'unknown';
    let config = MOLTEN_SALT_INVENTORY_CONFIG;

    // 自动检测表格类型
    console.log('开始分析文件类型，工作表名称:', sheetNames);
    console.log('文件名:', file.name);

    // 首先通过文件名判断
    if (file.name.includes('化盐记录') || file.name.includes('化盐统计')) {
      detectedType = 'molten_salt_inventory';
      config = MOLTEN_SALT_INVENTORY_CONFIG;
      console.log('通过文件名识别为熔盐入库统计表');
    } else if (file.name.includes('江苏联储') || file.name.includes('化盐量记录')) {
      detectedType = 'salt_process';
      config = SALT_PROCESS_CONFIG;
      console.log('通过文件名识别为化盐量记录表');
    }

    // 如果文件名无法识别，则检查表头内容
    if (detectedType === 'unknown') {
      for (const sheetName of sheetNames) {
        console.log('分析工作表:', sheetName);
        const sheet = this.workbook.Sheets[sheetName];
        const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
        console.log('工作表范围:', range);

        // 检查表头内容来判断表格类型
        for (let row = 0; row <= Math.min(5, range.e.r); row++) {
          for (let col = range.s.c; col <= range.e.c; col++) {
            const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
            const cell = sheet[cellAddress];
            if (cell && cell.v) {
              const cellValue = String(cell.v).trim();
              console.log(`单元格 ${cellAddress}: "${cellValue}"`);

              // 检测熔盐入库统计表 - 更精确的匹配
              if (cellValue.includes('熔盐入库统计') ||
                  cellValue.includes('化盐记录统计') ||
                  (cellValue.includes('钠') && (cellValue.includes('袋') || cellValue.includes('单位'))) ||
                  (cellValue.includes('钾') && (cellValue.includes('袋') || cellValue.includes('单位'))) ||
                  cellValue.includes('总粉碎量')) {
                detectedType = 'molten_salt_inventory';
                config = MOLTEN_SALT_INVENTORY_CONFIG;

                break;
              }

              // 检测化盐量记录表
              if (cellValue.includes('化盐量记录') ||
                  cellValue.includes('江苏联储') ||
                  cellValue.includes('每垃圾化盐量') ||
                  cellValue.includes('熔盐罐') ||
                  cellValue.includes('硝酸钠') ||
                  cellValue.includes('硝酸钾')) {
                detectedType = 'salt_process';
                config = SALT_PROCESS_CONFIG;

                break;
              }
            }
          }
          if (detectedType !== 'unknown') break;
        }
        if (detectedType !== 'unknown') break;
      }
    }

    console.log('最终识别结果:', detectedType);

    console.log('文件分析完成:', {
      fileName: file.name,
      fileSize: file.size,
      sheetNames,
      detectedType,
      configSheetName: config.sheetName
    });

    return {
      fileName: file.name,
      fileSize: file.size,
      sheetNames,
      detectedType,
      config
    };
  }

  /**
   * 导入熔盐入库统计数据
   */
  async importMoltenSaltInventory(config?: Partial<ExcelImportConfig>): Promise<ExcelImportResult<MoltenSaltInventoryRecord>> {
    const finalConfig = { ...MOLTEN_SALT_INVENTORY_CONFIG, ...config };
    return this.importData<MoltenSaltInventoryRecord>(finalConfig, MOLTEN_SALT_VALIDATION_RULES, this.calculateMoltenSaltFields.bind(this));
  }

  /**
   * 导入化盐量记录数据
   */
  async importSaltProcess(config?: Partial<ExcelImportConfig>): Promise<ExcelImportResult<SaltProcessRecord>> {
    const finalConfig = { ...SALT_PROCESS_CONFIG, ...config };
    return this.importData<SaltProcessRecord>(finalConfig, SALT_PROCESS_VALIDATION_RULES, this.calculateSaltProcessFields.bind(this));
  }

  /**
   * 通用数据导入方法
   */
  private async importData<T>(
    config: ExcelImportConfig,
    validationRules: ValidationRule[],
    calculateFields?: (record: Partial<T>) => Partial<T>
  ): Promise<ExcelImportResult<T>> {
    if (!this.workbook) {
      throw new Error('请先解析Excel文件');
    }

    this.updateProgress('parsing', '开始解析数据...', 40);

    const errors: ExcelImportError[] = [];
    const data: T[] = [];
    
    // 智能选择工作表
    console.log('可用的工作表名称:', this.workbook.SheetNames);
    console.log('配置期望的工作表名称:', config.sheetName);

    let selectedSheetName: string;
    let worksheet: any;

    // 1. 首先尝试使用配置中指定的工作表名称
    if (config.sheetName && this.workbook.Sheets[config.sheetName]) {
      selectedSheetName = config.sheetName;
      worksheet = this.workbook.Sheets[selectedSheetName];
      console.log(`使用配置指定的工作表: "${selectedSheetName}"`);
    }
    // 2. 如果配置的工作表不存在，尝试使用第一个工作表
    else if (this.workbook.SheetNames.length > 0) {
      selectedSheetName = this.workbook.SheetNames[0];
      worksheet = this.workbook.Sheets[selectedSheetName];
      console.log(`配置的工作表不存在，使用第一个可用工作表: "${selectedSheetName}"`);

      if (config.sheetName) {
        console.warn(`警告: 配置的工作表 "${config.sheetName}" 不存在，已自动切换到 "${selectedSheetName}"`);
      }
    }
    // 3. 如果没有任何工作表，抛出错误
    else {
      throw new Error(`Excel文件中没有找到任何工作表。可用工作表: [${this.workbook.SheetNames.join(', ')}]`);
    }

    if (!worksheet) {
      throw new Error(`无法访问工作表 "${selectedSheetName}"。可用工作表: [${this.workbook.SheetNames.join(', ')}]`);
    }

    console.log(`成功选择工作表: "${selectedSheetName}"`);

    // 获取工作表范围
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    console.log('工作表范围:', range);
    console.log('配置信息:', config);

    // 智能查找表头行
    let actualHeaderRow = config.headerRow - 1;
    let headers: string[] = [];

    // 尝试从配置的表头行开始，向下查找真正的表头
    for (let r = config.headerRow - 1; r <= Math.min(config.headerRow + 2, range.e.r); r++) {
      const testHeaderData = XLSX.utils.sheet_to_json(worksheet, {
        range: `${XLSX.utils.encode_cell({r, c: range.s.c})}:${XLSX.utils.encode_cell({r, c: range.e.c})}`,
        header: 1,
        defval: ''
      }) as any[][];

      if (testHeaderData.length > 0) {
        const testHeaders = testHeaderData[0] as string[];
        console.log(`第${r + 1}行内容:`, testHeaders);

        // 检查是否包含预期的表头关键词
        const hasDateHeader = testHeaders.some(h => h && (h.includes('日期') || h.includes('日明')));
        const hasSodiumHeader = testHeaders.some(h => h && h.includes('钠'));
        const hasPotassiumHeader = testHeaders.some(h => h && h.includes('钾'));

        if (hasDateHeader || hasSodiumHeader || hasPotassiumHeader) {
          actualHeaderRow = r;
          headers = testHeaders;
          break;
        }
      }
    }

    if (headers.length === 0) {
      // 如果没找到合适的表头，使用配置的行
      const headerRowData = XLSX.utils.sheet_to_json(worksheet, {
        range: `${XLSX.utils.encode_cell({r: config.headerRow - 1, c: range.s.c})}:${XLSX.utils.encode_cell({r: config.headerRow - 1, c: range.e.c})}`,
        header: 1,
        defval: ''
      }) as any[][];

      if (headerRowData.length === 0) {
        throw new Error('无法读取表头信息');
      }

      headers = headerRowData[0] as string[];
      actualHeaderRow = config.headerRow - 1;
    }



    // 更新数据开始行
    const actualDataStartRow = actualHeaderRow + 2; // 表头行的下一行

    // 获取数据行 - 使用调整后的数据开始行

    // 方法1: 使用header: 1 (数组格式)
    const dataRowsData = XLSX.utils.sheet_to_json(worksheet, {
      range: `${XLSX.utils.encode_cell({r: actualDataStartRow - 1, c: range.s.c})}:${XLSX.utils.encode_cell({r: range.e.r, c: range.e.c})}`,
      header: 1,
      defval: '',
      raw: false // 确保数据被正确格式化
    }) as any[][];

    console.log('解析到的数据行数:', dataRowsData.length);
    console.log('数据行示例 (前3行):');
    for (let i = 0; i < Math.min(3, dataRowsData.length); i++) {
      console.log(`  行 ${i + 1}:`, dataRowsData[i]);
    }

    // 方法2: 也尝试使用对象格式读取进行对比
    const dataRowsObject = XLSX.utils.sheet_to_json(worksheet, {
      range: `${XLSX.utils.encode_cell({r: actualDataStartRow - 1, c: range.s.c})}:${XLSX.utils.encode_cell({r: range.e.r, c: range.e.c})}`,
      header: headers,
      defval: '',
      raw: false
    });

    console.log('对象格式数据示例 (前2行):');
    for (let i = 0; i < Math.min(2, dataRowsObject.length); i++) {
      console.log(`  对象行 ${i + 1}:`, dataRowsObject[i]);
    }

    // 确定最终使用的数据行
    let dataRows: any[][];

    if (dataRowsData.length === 0) {
      console.warn('使用数组格式未读取到数据，尝试逐行读取...');

      // 备用方法：逐行读取数据
      const alternativeData: any[][] = [];
      for (let r = actualDataStartRow - 1; r <= range.e.r; r++) {
        const rowData: any[] = [];
        for (let c = range.s.c; c <= range.e.c; c++) {
          const cellAddress = XLSX.utils.encode_cell({ r, c });
          const cell = worksheet[cellAddress];
          rowData.push(cell ? cell.v : '');
        }

        // 检查行是否为空
        const hasData = rowData.some(cell => cell !== '' && cell !== null && cell !== undefined);
        if (hasData) {
          alternativeData.push(rowData);
          console.log(`备用方法读取行 ${r + 1}:`, rowData);
        }
      }

      if (alternativeData.length === 0) {
        console.error('所有数据读取方法都未能获取到数据');
        return {
          success: true,
          data: [],
          errors: [],
          summary: {
            totalRows: 0,
            successRows: 0,
            errorRows: 0,
            calculatedFields: config.calculatedFields || []
          }
        };
      }

      console.log(`备用方法成功读取 ${alternativeData.length} 行数据`);
      dataRows = alternativeData;
    } else {
      dataRows = dataRowsData;
    }

    this.updateProgress('validating', '正在验证数据...', 60, 0, dataRows.length);

    // 开始数据解析

    // 处理每一行数据
    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const rowNumber = actualDataStartRow + i; // 使用实际数据开始行计算



      try {
        // 映射字段
        const record: Partial<T> = {};

        for (let j = 0; j < headers.length; j++) {
          const header = headers[j]?.trim();
          const cellValue = row[j];

          // 智能列名映射 - 尝试多种匹配方式
          let mappedField = this.findMappedField(header, config.columnMapping);



          if (mappedField) {
            // 即使值为空也要映射，以便后续处理
            const convertedValue = cellValue !== undefined && cellValue !== '' && cellValue !== null
              ? this.convertValue(cellValue, mappedField)
              : null;

            (record as any)[mappedField] = convertedValue;
          }
        }

        // 数据验证
        const rowErrors = this.validateRecord(record, validationRules, rowNumber);
        if (rowErrors.length > 0) {
          errors.push(...rowErrors);
          continue;
        }

        // 添加系统自动生成字段
        this.addSystemGeneratedFields(record, i + 1);

        // 计算字段
        if (calculateFields) {
          const calculatedRecord = calculateFields(record);
          Object.assign(record, calculatedRecord);
        }

        data.push(record as T);
        this.updateProgress('validating', `正在处理第 ${i + 1} 行数据...`, 60 + (i / dataRows.length) * 30, i + 1, dataRows.length);
      } catch (error) {
        errors.push({
          row: rowNumber,
          message: `行数据处理失败: ${error}`,
          type: 'parsing',
          originalValue: row
        });
      }
    }

    this.updateProgress('completed', '数据导入完成', 100, dataRows.length, dataRows.length, errors);

    return {
      success: errors.length === 0,
      data,
      errors,
      summary: {
        totalRows: dataRows.length,
        successRows: data.length,
        errorRows: errors.length,
        calculatedFields: config.calculatedFields || []
      }
    };
  }

  /**
   * 数据类型转换
   */
  private convertValue(value: any, fieldName: string): any {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    // 日期字段处理
    if (fieldName.includes('date') || fieldName === 'date') {

      if (typeof value === 'number') {
        // Excel日期序列号转换
        try {
          // Excel日期序列号从1900年1月1日开始计算
          // 但Excel错误地认为1900年是闰年，所以需要调整
          let excelDate = value;
          if (value > 59) {
            excelDate = value - 1; // 修正Excel的闰年错误
          }

          // 转换为JavaScript日期
          const jsDate = new Date((excelDate - 25569) * 86400 * 1000);

          // 格式化为YYYY-MM-DD
          const year = jsDate.getFullYear();
          const month = String(jsDate.getMonth() + 1).padStart(2, '0');
          const day = String(jsDate.getDate()).padStart(2, '0');
          const result = `${year}-${month}-${day}`;

          console.log(`Excel日期序列号转换: ${value} -> ${result}`);
          return result;
        } catch (error) {
          console.warn('Excel日期转换失败:', error);

          // 备用方法：使用XLSX库的内置转换
          try {
            const date = XLSX.SSF.parse_date_code(value);
            const result = `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
            console.log(`XLSX库日期转换: ${value} -> ${result}`);
            return result;
          } catch (error2) {
            console.error('所有日期转换方法都失败:', error2);
            return String(value);
          }
        }
      }

      if (typeof value === 'string') {
        // 处理各种字符串日期格式
        let dateStr = value.trim();


        // 处理 "7/12/24" 格式
        if (/^\d{1,2}\/\d{1,2}\/\d{2}$/.test(dateStr)) {
          const parts = dateStr.split('/');
          const month = parts[0].padStart(2, '0');
          const day = parts[1].padStart(2, '0');
          const year = '20' + parts[2]; // 假设是21世纪
          const result = `${year}-${month}-${day}`;
          console.log(`短日期格式转换: ${value} -> ${result}`);
          return result;
        }

        // 处理 "8/1/24" 等格式
        if (/^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(dateStr)) {
          const parts = dateStr.split('/');
          const month = parts[0].padStart(2, '0');
          const day = parts[1].padStart(2, '0');
          let year = parts[2];
          if (year.length === 2) {
            year = '20' + year;
          }
          const result = `${year}-${month}-${day}`;
          console.log(`标准日期格式转换: ${value} -> ${result}`);
          return result;
        }

        // 尝试直接解析
        const parsedDate = new Date(dateStr);
        if (!isNaN(parsedDate.getTime())) {
          const result = parsedDate.toISOString().split('T')[0];
          console.log(`直接解析日期: ${value} -> ${result}`);
          return result;
        }
      }

      console.log(`日期转换失败，返回原值: ${value}`);
      return String(value);
    }

    // 数字字段处理
    if (['sodiumBags', 'potassiumBags', 'totalCrushingAmount', 'sequenceNumber',
         'wasteAmount', 'sodiumNitrate', 'potassiumNitrate', 'saltPerWaste',
         'accumulatedSalt', 'moltenSaltTemperature', 'moltenSaltLevel',
         'gasConsumptionPerWaste', 'powerConsumptionPerWaste', 'staffCount'].includes(fieldName)) {
      const num = Number(value);
      const result = isNaN(num) ? null : num;
      console.log(`数字转换: ${fieldName} = ${value} -> ${result}`);
      return result;
    }

    // 字符串字段
    const result = String(value).trim();
    console.log(`字符串转换: ${fieldName} = ${value} -> ${result}`);
    return result;
  }

  /**
   * 数据验证
   */
  private validateRecord(record: any, rules: ValidationRule[], rowNumber: number): ExcelImportError[] {
    const errors: ExcelImportError[] = [];

    for (const rule of rules) {
      const value = record[rule.field];

      switch (rule.type) {
        case 'required':
          if (value === null || value === undefined || value === '') {
            errors.push({
              row: rowNumber,
              field: rule.field,
              message: rule.message,
              type: 'validation',
              originalValue: value
            });
          }
          break;

        case 'number':
          if (value !== null && value !== undefined && isNaN(Number(value))) {
            errors.push({
              row: rowNumber,
              field: rule.field,
              message: rule.message,
              type: 'validation',
              originalValue: value
            });
          } else if (typeof rule.min === 'number' && Number(value) < rule.min) {
            errors.push({
              row: rowNumber,
              field: rule.field,
              message: rule.message,
              type: 'validation',
              originalValue: value
            });
          } else if (typeof rule.max === 'number' && Number(value) > rule.max) {
            errors.push({
              row: rowNumber,
              field: rule.field,
              message: rule.message,
              type: 'validation',
              originalValue: value
            });
          }
          break;

        case 'date':
          if (value && !this.isValidDate(value)) {
            errors.push({
              row: rowNumber,
              field: rule.field,
              message: rule.message,
              type: 'validation',
              originalValue: value
            });
          }
          break;
      }
    }

    return errors;
  }

  /**
   * 日期验证
   */
  private isValidDate(value: any): boolean {
    const date = new Date(value);
    return !isNaN(date.getTime());
  }

  /**
   * 计算熔盐入库统计表字段
   */
  private calculateMoltenSaltFields(record: Partial<MoltenSaltInventoryRecord>): Partial<MoltenSaltInventoryRecord> {
    const calculated: Partial<MoltenSaltInventoryRecord> = {};

    // 计算钠盐重量
    if (record.sodiumBags && record.sodiumBags > 0) {
      calculated.sodiumWeight = record.sodiumBags * SALT_SPECIFICATIONS.SODIUM_WEIGHT_PER_BAG;
    } else {
      calculated.sodiumWeight = 0;
    }

    // 计算钾盐重量
    if (record.potassiumBags && record.potassiumBags > 0) {
      calculated.potassiumWeight = record.potassiumBags * SALT_SPECIFICATIONS.POTASSIUM_WEIGHT_PER_BAG;
    } else {
      calculated.potassiumWeight = 0;
    }

    // 计算总重量
    calculated.totalWeight = (calculated.sodiumWeight || 0) + (calculated.potassiumWeight || 0);

    // 如果没有总粉碎量，使用总重量
    if (!record.totalCrushingAmount && calculated.totalWeight > 0) {
      calculated.totalCrushingAmount = calculated.totalWeight;
    }

    return calculated;
  }

  /**
   * 计算化盐量记录表字段
   */
  private calculateSaltProcessFields(record: Partial<SaltProcessRecord>): Partial<SaltProcessRecord> {
    const calculated: Partial<SaltProcessRecord> = {};

    // 计算总硝酸盐量
    if (record.sodiumNitrate && record.potassiumNitrate) {
      calculated.totalNitrate = record.sodiumNitrate + record.potassiumNitrate;
    }

    // 计算处理效率
    if (record.saltPerWaste && record.wasteAmount) {
      calculated.efficiency = (record.saltPerWaste / record.wasteAmount) * 100;
    }

    return calculated;
  }

  /**
   * 调试Excel文件结构
   */
  debugExcelStructure(_worksheet: any, _range: any): void {
    // 调试方法已移除，保留方法签名以避免破坏现有调用
  }

  /**
   * 智能列名映射 - 尝试多种匹配方式
   */
  private findMappedField(header: string, columnMapping: Record<string, string>): string | undefined {
    if (!header) {
      return undefined;
    }

    // 1. 精确匹配
    if (columnMapping[header]) {
      return columnMapping[header];
    }

    // 2. 去除空格后匹配
    const trimmedHeader = header.trim();
    if (columnMapping[trimmedHeader]) {
      console.log(`去空格匹配成功: "${header}" -> "${trimmedHeader}" -> ${columnMapping[trimmedHeader]}`);
      return columnMapping[trimmedHeader];
    }

    // 3. 模糊匹配 - 检查是否包含关键词
    const headerLower = header.toLowerCase().trim();
    // 日期字段匹配
    if (headerLower.includes('日期') || headerLower.includes('日明') || headerLower.includes('date')) {
      return 'date';
    }

    // 钠盐字段匹配 - 增强匹配逻辑
    if (headerLower.includes('钠')) {
      return 'sodiumBags';
    }

    // 钾盐字段匹配 - 增强匹配逻辑
    if (headerLower.includes('钾')) {
      return 'potassiumBags';
    }

    // 总粉碎量字段匹配
    if (headerLower.includes('总粉碎量') || headerLower.includes('粉碎量') || headerLower.includes('总量')) {
      return 'totalCrushingAmount';
    }

    // 人数字段匹配
    if (headerLower.includes('人数') || headerLower.includes('操作人数') || headerLower.includes('工作人员')) {
      return 'staffCount';
    }

    // 新增字段匹配 - 根据Excel表格结构
    // 熔盐液位字段匹配
    if (headerLower.includes('液位') || headerLower.includes('熔盐液位') || headerLower.includes('熔盐罐熔盐液位')) {
      return 'moltenSaltLevel';
    }

    // 熔盐温度字段匹配
    if (headerLower.includes('温度') || headerLower.includes('熔盐温度') || headerLower.includes('熔盐罐熔盐温度')) {
      return 'moltenSaltTemperature';
    }

    // 天然气耗量字段匹配
    if (headerLower.includes('天然气') || headerLower.includes('气耗') || headerLower.includes('天然气耗量')) {
      return 'gasConsumption';
    }

    // 用电量字段匹配
    if (headerLower.includes('用电') || headerLower.includes('电量') || headerLower.includes('用电量')) {
      return 'powerConsumption';
    }

    // 记录人字段匹配
    if (headerLower.includes('记录人') || headerLower.includes('记录员') || headerLower.includes('记录者')) {
      return 'recorderName';
    }

    // 项目ID字段匹配
    if (headerLower.includes('项目') || headerLower.includes('project') || headerLower.includes('项目id')) {
      return 'projectId';
    }

    // 班次字段匹配
    if (headerLower.includes('班次') || headerLower.includes('班') || headerLower.includes('shift')) {
      return 'shift';
    }

    // 4. 遍历所有映射，查找部分匹配
    for (const [key, value] of Object.entries(columnMapping)) {
      if (key.includes(header) || header.includes(key)) {
        return value;
      }
    }
    return undefined;
  }

  /**
   * 添加系统自动生成字段
   */
  private addSystemGeneratedFields(record: any, rowIndex: number): void {
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();

    // 生成记录编码 (格式: TEMP_YYYYMMDDHHMMSS_XXXX_行号)
    record.recordCode = `TEMP_${timestamp}_${randomSuffix}_${String(rowIndex).padStart(3, '0')}`;

    // 生成批次号 (格式: BATCH_YYYYMMDD_行号)
    const dateStr = timestamp.substring(0, 8);
    record.batchNumber = `BATCH_${dateStr}_${String(rowIndex).padStart(3, '0')}`;
  }
}
