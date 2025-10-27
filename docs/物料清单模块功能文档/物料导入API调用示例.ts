/**
 * 物料导入API调用示例
 *
 * 本文件展示如何使用优化后的物料导入接口
 * 确保请求参数100%匹配后端接口文档
 */

import { importParsedMaterialData, validateParsedMaterialData } from '@/api/erp/saltprocess/material';
import type { MaterialImportBo, MaterialItemBo } from '@/api/erp/saltprocess/material/types';

// ============================================
// 示例1: 基础物料导入
// ============================================

/**
 * 导入基础物料清单
 */
export async function importBasicMaterialList(projectId: string, materials: any[]) {
  // 构建完整的导入请求（100%匹配接口文档）
  const importData: MaterialImportBo = {
    // 项目信息
    projectId: projectId,
    projectName: undefined, // 可选，后端会自动填充

    // 批次信息
    batchNumber: `BATCH-${Date.now()}`,

    // 负责人信息（可选）
    responsiblePerson: '张三',
    responsiblePersonId: 12345,

    // 发货日期信息
    shippingDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD格式
    expectedDeliveryDate: undefined,

    // 发货方式和车辆信息（可选）
    shippingMethod: 'TRUCK',
    vehicleInfo: '苏A12345',
    driverInfo: '李师傅 13800138000',

    // 备注和来源
    fileSource: '前端Excel解析导入',
    remarks: '批量导入物料清单',

    // 物料明细列表
    materialItems: materials.map((item) => ({
      // 基本信息
      sequenceNumber: item.sequenceNumber,
      materialType: item.materialType || 'GENERAL',
      materialName: item.materialName,
      specification: item.specification,
      quantity: item.quantity,
      unit: item.unit || '台',

      // 材质和制造商信息
      materialCategory: item.materialCategory,
      manufacturer: item.manufacturer,
      model: item.model,

      // 备注信息
      remarks1: item.remarks1,
      remarks2: item.remarks2,

      // 重量和体积信息
      unitWeight: item.unitWeight,
      totalWeight: item.totalWeight,
      unitVolume: item.unitVolume,
      totalVolume: item.totalVolume,

      // 包装信息
      packageType: item.packageType,
      packageQuantity: item.packageQuantity,

      // 特殊属性
      isFragile: item.isFragile || false,
      isHazardous: item.isHazardous || false,
      storageRequirement: item.storageRequirement,

      // 来源和位置信息
      fileSource: item.fileSource,
      sheetName: item.sheetName,
      rowNumber: item.rowNumber,

      // 验证状态
      hasErrors: false,
      hasWarnings: false
    }))
  };

  try {
    const result = await importParsedMaterialData(importData);

    console.log('导入成功:', {
      总记录数: result.totalRecords,
      成功: result.successRecords,
      失败: result.failedRecords,
      新建产品: result.newProductRecords,
      匹配产品: result.matchedProductRecords
    });

    return result;
  } catch (error) {
    console.error('导入失败:', error);
    throw error;
  }
}

// ============================================
// 示例2: 分批上传导入（每批10条）
// ============================================

/**
 * 分批上传物料数据，每批10条
 */
export async function importMaterialsInBatches(projectId: string, materials: any[], batchSize = 10) {
  const totalBatches = Math.ceil(materials.length / batchSize);
  const results: any[] = [];

  console.log(`开始分批上传: 共${materials.length}条数据，分${totalBatches}批，每批${batchSize}条`);

  for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
    const start = batchIndex * batchSize;
    const end = Math.min(start + batchSize, materials.length);
    const batchMaterials = materials.slice(start, end);

    console.log(`正在上传第 ${batchIndex + 1}/${totalBatches} 批，共${batchMaterials.length}条数据...`);

    const importData: MaterialImportBo = {
      projectId: projectId,
      batchNumber: `BATCH-${Date.now()}-${batchIndex + 1}`,
      shippingDate: new Date().toISOString().split('T')[0],
      fileSource: '前端分批导入',
      remarks: `第${batchIndex + 1}/${totalBatches}批，本批${batchMaterials.length}条`,
      materialItems: batchMaterials.map((item) => ({
        materialName: item.materialName,
        quantity: item.quantity,
        materialType: item.materialType || 'GENERAL',
        specification: item.specification,
        unit: item.unit,
        materialCategory: item.materialCategory,
        manufacturer: item.manufacturer,
        remarks1: item.remarks1,
        unitWeight: item.unitWeight
      }))
    };

    try {
      const result = await importParsedMaterialData(importData);

      results.push({
        batchIndex: batchIndex + 1,
        success: result.success,
        successRecords: result.successRecords,
        failedRecords: result.failedRecords
      });

      console.log(`✓ 第${batchIndex + 1}批上传成功: ${result.successRecords}条`);

      // 添加延迟，避免请求过快
      if (batchIndex < totalBatches - 1) {
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    } catch (error: any) {
      console.error(`✗ 第${batchIndex + 1}批上传失败:`, error.message);
      results.push({
        batchIndex: batchIndex + 1,
        success: false,
        error: error.message
      });
    }
  }

  // 汇总结果
  const totalSuccess = results.reduce((sum, r) => sum + (r.successRecords || 0), 0);
  const totalFailed = results.reduce((sum, r) => sum + (r.failedRecords || 0), 0);

  return {
    totalBatches,
    totalRecords: materials.length,
    successRecords: totalSuccess,
    failedRecords: totalFailed,
    batchResults: results
  };
}

// ============================================
// 示例3: 按Sheet分组导入（过滤发货清单）
// ============================================

/**
 * 按Sheet分组导入物料，自动过滤发货清单
 */
export async function importMaterialsBySheet(projectId: string, sheetGroups: any[]) {
  const results: any[] = [];
  const batchNumber = Date.now().toString();
  let totalSkipped = 0;

  for (const group of sheetGroups) {
    // 推断物料类型
    const materialType = inferMaterialType(group.sheetName);

    // 【关键】过滤发货清单：只保留非SHIPPING_INFO类型的物料
    const filteredMaterials = group.materials.filter((item: any) => {
      const itemType = item.materialType || materialType;
      return itemType !== 'SHIPPING_INFO';
    });

    // 如果过滤后没有数据，记录跳过信息
    if (filteredMaterials.length === 0) {
      totalSkipped += group.materials.length;
      console.info(`跳过发货清单Sheet: ${group.sheetName}，共${group.materials.length}条记录`);
      results.push({
        sheetName: group.sheetName,
        skipped: true,
        skipReason: '发货清单数据已过滤（数据不完整）',
        totalRecords: group.materials.length
      });
      continue;
    }

    // 构建导入请求
    const importData: MaterialImportBo = {
      projectId: projectId,
      batchNumber: `${batchNumber}-${group.sheetName}`,
      shippingDate: new Date().toISOString().split('T')[0],
      fileSource: `前端Excel解析-${group.sheetName}`,
      remarks: `Sheet: ${group.sheetName}, 总记录${group.materials.length}条, 过滤后${filteredMaterials.length}条`,
      materialItems: filteredMaterials.map((item: any) => ({
        sequenceNumber: item.sequenceNumber,
        materialType: materialType || item.materialType,
        materialName: item.materialName,
        specification: item.specification,
        quantity: item.quantity,
        unit: item.unit,
        materialCategory: item.materialCategory,
        manufacturer: item.manufacturer,
        model: item.model,
        remarks1: item.remarks1,
        remarks2: item.remarks2,
        unitWeight: item.unitWeight,
        totalWeight: item.totalWeight,
        unitVolume: item.unitVolume,
        totalVolume: item.totalVolume,
        packageType: item.packageType,
        packageQuantity: item.packageQuantity,
        isFragile: item.isFragile || false,
        isHazardous: item.isHazardous || false,
        storageRequirement: item.storageRequirement,
        fileSource: item.fileSource,
        sheetName: item.sheetName || group.sheetName,
        rowNumber: item.rowNumber,
        hasErrors: false,
        hasWarnings: false
      }))
    };

    try {
      const result = await importParsedMaterialData(importData);
      results.push({
        sheetName: group.sheetName,
        success: result.success,
        totalRecords: group.materials.length,
        filteredRecords: filteredMaterials.length,
        successRecords: result.successRecords,
        failedRecords: result.failedRecords,
        skipped: false
      });
    } catch (error: any) {
      results.push({
        sheetName: group.sheetName,
        success: false,
        error: error.message,
        skipped: false
      });
    }
  }

  return {
    results,
    totalSkipped,
    summary: `共处理 ${sheetGroups.length} 个Sheet，跳过${totalSkipped}条发货清单记录`
  };
}

// ============================================
// 示例4: 分批上传 + 过滤发货清单 + 按Sheet分组
// ============================================

/**
 * 完整的分批上传方案：按Sheet分组 + 过滤发货清单 + 分批上传
 */
export async function importMaterialsWithFullFeatures(projectId: string, sheetGroups: any[]) {
  const BATCH_SIZE = 10;
  const batchNumber = Date.now().toString();
  const allResults: any[] = [];

  for (const group of sheetGroups) {
    const materialType = inferMaterialType(group.sheetName);

    // 过滤发货清单
    const filteredMaterials = group.materials.filter((item: any) => {
      const itemType = item.materialType || materialType;
      return itemType !== 'SHIPPING_INFO';
    });

    if (filteredMaterials.length === 0) {
      console.info(`跳过发货清单Sheet: ${group.sheetName}`);
      allResults.push({
        sheetName: group.sheetName,
        skipped: true,
        skipReason: '发货清单数据已过滤'
      });
      continue;
    }

    // 过滤错误记录
    const validMaterials = filteredMaterials.filter((item: any) => !item.hasErrors);

    // 分批上传
    const totalBatches = Math.ceil(validMaterials.length / BATCH_SIZE);
    console.info(`Sheet ${group.sheetName}: 共${validMaterials.length}条，分${totalBatches}批`);

    let sheetSuccess = 0;
    let sheetFailed = 0;

    for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
      const start = batchIndex * BATCH_SIZE;
      const end = Math.min(start + BATCH_SIZE, validMaterials.length);
      const batchMaterials = validMaterials.slice(start, end);

      const importData: MaterialImportBo = {
        projectId: projectId,
        batchNumber: `${batchNumber}-${group.sheetName}-Batch${batchIndex + 1}`,
        shippingDate: new Date().toISOString().split('T')[0],
        fileSource: `前端Excel解析-${group.sheetName}`,
        remarks: `第${batchIndex + 1}/${totalBatches}批，本批${batchMaterials.length}条`,
        materialItems: batchMaterials.map((item: any) => ({
          materialName: item.materialName,
          quantity: item.quantity,
          materialType: materialType || item.materialType,
          specification: item.specification,
          unit: item.unit,
          materialCategory: item.materialCategory,
          manufacturer: item.manufacturer,
          model: item.model,
          remarks1: item.remarks1,
          remarks2: item.remarks2,
          unitWeight: item.unitWeight,
          totalWeight: item.totalWeight,
          sheetName: item.sheetName || group.sheetName,
          rowNumber: item.rowNumber
        }))
      };

      try {
        const result = await importParsedMaterialData(importData);
        sheetSuccess += result.successRecords || 0;
        sheetFailed += result.failedRecords || 0;

        // 添加延迟
        if (batchIndex < totalBatches - 1) {
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
      } catch (error: any) {
        sheetFailed += batchMaterials.length;
        console.error(`Sheet ${group.sheetName} 第${batchIndex + 1}批失败:`, error);
      }
    }

    allResults.push({
      sheetName: group.sheetName,
      success: sheetSuccess > 0,
      totalRecords: validMaterials.length,
      batchCount: totalBatches,
      successRecords: sheetSuccess,
      failedRecords: sheetFailed,
      skipped: false
    });
  }

  return {
    results: allResults,
    summary: `共处理 ${sheetGroups.length} 个Sheet`
  };
}

// ============================================
// 示例5: 导入前数据验证
// ============================================

/**
 * 导入前验证数据
 */
export async function validateBeforeImport(projectId: string, materials: any[]) {
  const importData: MaterialImportBo = {
    projectId: projectId,
    batchNumber: `VALIDATE-${Date.now()}`,
    materialItems: materials.map((item) => ({
      materialName: item.materialName,
      quantity: item.quantity,
      materialType: item.materialType || 'GENERAL',
      specification: item.specification,
      unit: item.unit
    }))
  };

  try {
    const result = await validateParsedMaterialData(importData);

    if (!result.success) {
      console.warn('数据验证失败:', result.errors);
      return {
        valid: false,
        errors: result.errors,
        warnings: result.warnings
      };
    }

    console.log('数据验证通过:', {
      总记录数: result.totalRecords,
      成功记录: result.successRecords,
      失败记录: result.failedRecords
    });

    return {
      valid: true,
      result
    };
  } catch (error) {
    console.error('验证失败:', error);
    throw error;
  }
}

// ============================================
// 示例6: 完整导入流程（带分批上传）
// ============================================

/**
 * 完整的导入流程：预检查 -> 验证 -> 分批导入
 */
export async function completeImportFlow(projectId: string, materials: any[]) {
  // 1. 数据预检查
  console.log('步骤1: 数据预检查...');
  if (materials.length === 0) {
    throw new Error('没有可导入的数据');
  }

  // 2. 数据验证
  console.log('步骤2: 数据验证...');
  const validationResult = await validateBeforeImport(projectId, materials);

  if (!validationResult.valid) {
    console.error('数据验证失败，请修正后重试');
    return {
      success: false,
      stage: 'validation',
      errors: validationResult.errors
    };
  }

  // 3. 显示警告（如果有）
  if (validationResult.result?.warnings && validationResult.result.warnings.length > 0) {
    console.warn('数据存在警告:', validationResult.result.warnings);
  }

  // 4. 执行分批导入
  console.log('步骤3: 执行分批导入...');
  const importResult = await importMaterialsInBatches(projectId, materials, 10);

  // 5. 返回结果
  return {
    success: importResult.successRecords > 0,
    stage: 'completed',
    result: importResult
  };
}

// ============================================
// 工具函数
// ============================================

/**
 * 根据Sheet名称推断物料类型
 */
function inferMaterialType(sheetName: string): string {
  const name = sheetName.toLowerCase();

  if (name.includes('电控')) return 'ELECTRICAL';
  if (name.includes('机械')) return 'MECHANICAL';
  if (name.includes('管路')) return 'PIPELINE';
  if (name.includes('燃烧器')) return 'BURNER';
  if (name.includes('辅助')) return 'AUXILIARY';
  if (name.includes('标准件')) return 'STANDARD_PARTS';
  if (name.includes('发货') || name.includes('装车')) return 'SHIPPING_INFO';

  return 'GENERAL';
}

// ============================================
// 使用示例
// ============================================

/**
 * 主函数示例
 */
export async function exampleUsage() {
  const projectId = 'PROJECT_001';

  // 示例数据
  const materials = [
    {
      sequenceNumber: '1',
      materialType: 'MECHANICAL',
      materialName: '助燃风机',
      specification: '流量13750m3/h，全压11319Pa',
      quantity: 1,
      unit: '台',
      materialCategory: '不锈钢',
      manufacturer: '海棠机械',
      model: 'ABC-123',
      remarks1: '带调节风门',
      unitWeight: 150.5,
      totalWeight: 150.5
    },
    {
      sequenceNumber: '2',
      materialType: 'ELECTRICAL',
      materialName: '控制柜',
      specification: 'PLC控制系统',
      quantity: 1,
      unit: '台',
      manufacturer: '海棠电控',
      unitWeight: 80,
      totalWeight: 80
    }
  ];

  try {
    // 方式1: 基础导入
    console.log('=== 方式1: 基础导入 ===');
    const result1 = await importBasicMaterialList(projectId, materials);
    console.log('导入结果:', result1);

    // 方式2: 完整流程导入
    console.log('\n=== 方式2: 完整流程导入 ===');
    const result2 = await completeImportFlow(projectId, materials);
    console.log('完整流程结果:', result2);

  } catch (error) {
    console.error('示例执行失败:', error);
  }
}

// ============================================
// 类型定义示例
// ============================================

/**
 * 物料导入配置
 */
export interface MaterialImportConfig {
  projectId: string;
  projectName?: string;
  responsiblePerson?: string;
  responsiblePersonId?: number;
  shippingMethod?: string;
  vehicleInfo?: string;
  driverInfo?: string;
  filterShippingInfo?: boolean; // 是否过滤发货清单
  autoValidate?: boolean; // 是否自动验证
}

/**
 * 导入结果汇总
 */
export interface ImportResultSummary {
  success: boolean;
  totalSheets: number;
  validSheets: number;
  skippedSheets: number;
  totalRecords: number;
  successRecords: number;
  failedRecords: number;
  skippedRecords: number;
  newProducts: number;
  matchedProducts: number;
  duration: number; // 毫秒
}

