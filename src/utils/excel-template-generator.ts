/**
 * Excel模板生成工具
 * 用于生成发货清单导入模板
 */
import * as XLSX from 'xlsx';
import { excelTemplateConfigs } from './excel-import-test';

export class ExcelTemplateGenerator {
  /**
   * 生成所有模板文件
   */
  static generateAllTemplates(): void {
    excelTemplateConfigs.forEach((config) => {
      this.generateTemplate(config);
    });
  }

  /**
   * 生成单个模板文件
   */
  static generateTemplate(config: any): void {
    const workbook = XLSX.utils.book_new();

    // 创建工作表数据
    const worksheetData = [];

    // 添加说明行
    worksheetData.push([`${config.templateName} - 导入模板`]);
    worksheetData.push(['请按照以下格式填写数据，带*号的为必填项']);
    worksheetData.push([]); // 空行

    // 添加表头
    const headers = config.columns.map((col: any) => (col.required ? `${col.label}*` : col.label));
    worksheetData.push(headers);

    // 添加示例数据
    const examples = config.columns.map((col: any) => col.example || '');
    worksheetData.push(examples);

    // 添加数据类型说明
    const typeDescriptions = config.columns.map((col: any) => {
      switch (col.type) {
        case 'string':
          return '文本';
        case 'number':
          return '数字';
        case 'boolean':
          return '是/否';
        default:
          return '文本';
      }
    });
    worksheetData.push(typeDescriptions);

    // 创建工作表
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // 设置列宽
    const columnWidths = config.columns.map((col: any) => ({
      wch: Math.max(col.label.length + 2, 15)
    }));
    worksheet['!cols'] = columnWidths;

    // 设置样式（简化版本）
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');

    // 标题行样式
    for (let col = range.s.c; col <= range.e.c; col++) {
      const titleCell = XLSX.utils.encode_cell({ r: 0, c: col });
      if (worksheet[titleCell]) {
        worksheet[titleCell].s = {
          font: { bold: true, size: 14 },
          alignment: { horizontal: 'center' }
        };
      }
    }

    // 表头行样式
    for (let col = range.s.c; col <= range.e.c; col++) {
      const headerCell = XLSX.utils.encode_cell({ r: 3, c: col });
      if (worksheet[headerCell]) {
        worksheet[headerCell].s = {
          font: { bold: true },
          fill: { fgColor: { rgb: '4472C4' } },
          alignment: { horizontal: 'center' }
        };
      }
    }

    // 合并标题行
    worksheet['!merges'] = [
      {
        s: { r: 0, c: 0 },
        e: { r: 0, c: config.columns.length - 1 }
      }
    ];

    // 添加到工作簿
    XLSX.utils.book_append_sheet(workbook, worksheet, '导入模板');

    // 生成文件名
    const fileName = `${config.templateName.replace(/\s+/g, '_')}.xlsx`;

    // 保存文件
    XLSX.writeFile(workbook, fileName);
  }

  /**
   * 生成模板文件的Blob对象
   */
  static generateTemplateBlob(config: any): Blob {
    const workbook = XLSX.utils.book_new();

    // 创建工作表数据
    const worksheetData = [];

    // 添加说明行
    worksheetData.push([`${config.templateName} - 导入模板`]);
    worksheetData.push(['请按照以下格式填写数据，带*号的为必填项']);
    worksheetData.push(['注意：请不要修改表头行，从第5行开始填写数据']);
    worksheetData.push([]); // 空行

    // 添加表头
    const headers = config.columns.map((col: any) => (col.required ? `${col.label}*` : col.label));
    worksheetData.push(headers);

    // 添加示例数据（2行）
    for (let i = 0; i < 2; i++) {
      const examples = config.columns.map((col: any) => {
        if (col.example) {
          return i === 0 ? col.example : `${col.example}_${i + 1}`;
        }
        return '';
      });
      worksheetData.push(examples);
    }

    // 添加空行供用户填写
    for (let i = 0; i < 10; i++) {
      const emptyRow = new Array(config.columns.length).fill('');
      worksheetData.push(emptyRow);
    }

    // 创建工作表
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // 设置列宽
    const columnWidths = config.columns.map((col: any) => ({
      wch: Math.max(col.label.length + 2, 15)
    }));
    worksheet['!cols'] = columnWidths;

    // 合并标题行
    worksheet['!merges'] = [
      {
        s: { r: 0, c: 0 },
        e: { r: 0, c: config.columns.length - 1 }
      },
      {
        s: { r: 1, c: 0 },
        e: { r: 1, c: config.columns.length - 1 }
      },
      {
        s: { r: 2, c: 0 },
        e: { r: 2, c: config.columns.length - 1 }
      }
    ];

    // 添加到工作簿
    XLSX.utils.book_append_sheet(workbook, worksheet, '导入模板');

    // 添加说明工作表
    const instructionSheet = this.createInstructionSheet(config);
    XLSX.utils.book_append_sheet(workbook, instructionSheet, '填写说明');

    // 生成Blob
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    return new Blob([wbout], { type: 'application/octet-stream' });
  }

  /**
   * 创建说明工作表
   */
  private static createInstructionSheet(config: any): XLSX.WorkSheet {
    const instructionData = [];

    // 标题
    instructionData.push([`${config.templateName} - 填写说明`]);
    instructionData.push([]);

    // 基本说明
    instructionData.push(['基本说明：']);
    instructionData.push(['1. 请在"导入模板"工作表中填写数据']);
    instructionData.push(['2. 带*号的字段为必填项，不能为空']);
    instructionData.push(['3. 请从第5行开始填写数据，不要修改表头']);
    instructionData.push(['4. 数据填写完成后，保存文件并导入系统']);
    instructionData.push([]);

    // 字段说明
    instructionData.push(['字段说明：']);
    instructionData.push(['字段名称', '是否必填', '数据类型', '示例值', '说明']);

    config.columns.forEach((col: any) => {
      instructionData.push([
        col.label,
        col.required ? '是' : '否',
        col.type === 'string' ? '文本' : col.type === 'number' ? '数字' : '是/否',
        col.example || '',
        this.getFieldDescription(col.key)
      ]);
    });

    instructionData.push([]);

    // 注意事项
    instructionData.push(['注意事项：']);
    instructionData.push([
      '1. 设备类型请填写：MECHANICAL(机械设备)、ELECTRICAL(电控设备)、PIPELINE(管路设备)、BURNER(燃烧器)、AUXILIARY(辅助设备)、STANDARD_PARTS(标准件)'
    ]);
    instructionData.push(['2. 是否易碎、是否危险品请填写：是 或 否']);
    instructionData.push(['3. 数量、重量等数值字段请填写数字，不要包含单位']);
    instructionData.push(['4. 如有疑问，请联系系统管理员']);

    const worksheet = XLSX.utils.aoa_to_sheet(instructionData);

    // 设置列宽
    worksheet['!cols'] = [{ wch: 20 }, { wch: 10 }, { wch: 10 }, { wch: 20 }, { wch: 40 }];

    return worksheet;
  }

  /**
   * 获取字段描述
   */
  private static getFieldDescription(fieldKey: string): string {
    const descriptions: { [key: string]: string } = {
      itemName: '物品的名称，如：离心泵、变频器等',
      specification: '物品的规格型号，如：IS100-80-160',
      equipmentType: '设备类型，必须从指定值中选择',
      quantity: '物品数量，必须为正整数',
      unit: '计量单位，如：台、个、套、米等',
      unitWeight: '单个物品的重量，单位：千克',
      manufacturer: '制造商名称',
      model: '产品型号',
      serialNumber: '产品序列号或编号',
      packageType: '包装方式，如：木箱、纸箱、托盘等',
      packageQuantity: '包装件数',
      isFragile: '是否为易碎品，填写"是"或"否"',
      isHazardous: '是否为危险品，填写"是"或"否"',
      storageRequirement: '存储要求，如：干燥通风、防潮防震等',
      remarks: '备注信息'
    };

    return descriptions[fieldKey] || '';
  }

  /**
   * 下载模板文件
   */
  static downloadTemplate(config: any): void {
    const blob = this.generateTemplateBlob(config);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${config.templateName.replace(/\s+/g, '_')}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
