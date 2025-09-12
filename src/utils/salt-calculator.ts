/**
 * 盐化工艺数据自动计算工具
 * 根据钠盐规格(1.2吨/袋)和钾盐规格(1.0吨/袋)，实现缺失字段的自动计算功能
 */
import type {
  MoltenSaltInventoryRecord,
  SaltProcessRecord,
  SALT_SPECIFICATIONS
} from '@/api/erp/saltprocess/records/excel-import/types';

// 盐类规格常量
export const SALT_SPECS = {
  SODIUM_WEIGHT_PER_BAG: 1.2, // 钠盐：1.2吨/袋
  POTASSIUM_WEIGHT_PER_BAG: 1.0, // 钾盐：1.0吨/袋
  
  // 密度参数（用于体积计算）
  SODIUM_DENSITY: 2.16, // g/cm³
  POTASSIUM_DENSITY: 2.11, // g/cm³
  
  // 标准工艺参数
  STANDARD_TEMPERATURE: 450, // 标准反应温度 °C
  STANDARD_PRESSURE: 2.5, // 标准反应压力 MPa
  STANDARD_PH: 7.0, // 标准pH值
  
  // 效率参数
  THEORETICAL_YIELD: 0.95, // 理论产出率 95%
  ENERGY_EFFICIENCY: 0.85 // 能源效率 85%
} as const;

/**
 * 熔盐入库统计数据计算器
 */
export class MoltenSaltCalculator {
  /**
   * 计算完整的熔盐入库统计记录
   */
  static calculateRecord(record: Partial<MoltenSaltInventoryRecord>): MoltenSaltInventoryRecord {
    const calculated = { ...record } as MoltenSaltInventoryRecord;

    // 基础重量计算
    calculated.sodiumWeight = this.calculateSodiumWeight(record.sodiumBags || 0);
    calculated.potassiumWeight = this.calculatePotassiumWeight(record.potassiumBags || 0);
    calculated.totalWeight = this.calculateTotalWeight(calculated.sodiumWeight, calculated.potassiumWeight);

    // 如果没有总粉碎量，使用总重量
    if (!calculated.totalCrushingAmount) {
      calculated.totalCrushingAmount = calculated.totalWeight;
    }

    // 验证和修正数据
    calculated = this.validateAndCorrect(calculated);

    return calculated;
  }

  /**
   * 计算钠盐重量
   */
  static calculateSodiumWeight(bags: number): number {
    return Number((bags * SALT_SPECS.SODIUM_WEIGHT_PER_BAG).toFixed(2));
  }

  /**
   * 计算钾盐重量
   */
  static calculatePotassiumWeight(bags: number): number {
    return Number((bags * SALT_SPECS.POTASSIUM_WEIGHT_PER_BAG).toFixed(2));
  }

  /**
   * 计算总重量
   */
  static calculateTotalWeight(sodiumWeight: number, potassiumWeight: number): number {
    return Number((sodiumWeight + potassiumWeight).toFixed(2));
  }

  /**
   * 根据重量反推袋数
   */
  static calculateBagsFromWeight(weight: number, saltType: 'sodium' | 'potassium'): number {
    const weightPerBag = saltType === 'sodium' 
      ? SALT_SPECS.SODIUM_WEIGHT_PER_BAG 
      : SALT_SPECS.POTASSIUM_WEIGHT_PER_BAG;
    return Math.round(weight / weightPerBag);
  }

  /**
   * 计算体积（基于密度）
   */
  static calculateVolume(weight: number, saltType: 'sodium' | 'potassium'): number {
    const density = saltType === 'sodium' 
      ? SALT_SPECS.SODIUM_DENSITY 
      : SALT_SPECS.POTASSIUM_DENSITY;
    // 重量(吨) -> 体积(m³)
    return Number(((weight * 1000) / (density * 1000)).toFixed(3));
  }

  /**
   * 验证和修正数据
   */
  private static validateAndCorrect(record: MoltenSaltInventoryRecord): MoltenSaltInventoryRecord {
    // 确保所有数值字段都是有效数字
    const numericFields = ['sodiumBags', 'potassiumBags', 'sodiumWeight', 'potassiumWeight', 'totalWeight', 'totalCrushingAmount'];
    
    for (const field of numericFields) {
      const value = (record as any)[field];
      if (value !== undefined && value !== null) {
        (record as any)[field] = Number(value) || 0;
      }
    }

    // 数据一致性检查
    const calculatedSodiumWeight = this.calculateSodiumWeight(record.sodiumBags || 0);
    const calculatedPotassiumWeight = this.calculatePotassiumWeight(record.potassiumBags || 0);
    
    // 如果计算值与实际值差异较大，使用计算值
    if (Math.abs((record.sodiumWeight || 0) - calculatedSodiumWeight) > 0.1) {
      record.sodiumWeight = calculatedSodiumWeight;
    }
    
    if (Math.abs((record.potassiumWeight || 0) - calculatedPotassiumWeight) > 0.1) {
      record.potassiumWeight = calculatedPotassiumWeight;
    }

    return record;
  }
}

/**
 * 化盐量记录数据计算器
 */
export class SaltProcessCalculator {
  /**
   * 计算完整的化盐量记录
   */
  static calculateRecord(record: Partial<SaltProcessRecord>): SaltProcessRecord {
    const calculated = { ...record } as SaltProcessRecord;

    // 基础计算
    calculated.totalNitrate = this.calculateTotalNitrate(
      record.sodiumNitrate || 0, 
      record.potassiumNitrate || 0
    );

    calculated.efficiency = this.calculateEfficiency(
      record.saltPerWaste || 0,
      record.wasteAmount || 0
    );

    // 累积化盐量计算（如果缺失）
    if (!calculated.accumulatedSalt && record.saltPerWaste && record.wasteAmount) {
      calculated.accumulatedSalt = this.calculateAccumulatedSalt(
        record.saltPerWaste,
        record.wasteAmount
      );
    }

    // 能耗效率计算
    const energyEfficiency = this.calculateEnergyEfficiency(
      record.gasConsumptionPerWaste || 0,
      record.powerConsumptionPerWaste || 0,
      record.wasteAmount || 0
    );

    // 验证和修正数据
    calculated = this.validateAndCorrect(calculated);

    return calculated;
  }

  /**
   * 计算总硝酸盐量
   */
  static calculateTotalNitrate(sodiumNitrate: number, potassiumNitrate: number): number {
    return Number((sodiumNitrate + potassiumNitrate).toFixed(2));
  }

  /**
   * 计算处理效率
   */
  static calculateEfficiency(saltPerWaste: number, wasteAmount: number): number {
    if (wasteAmount === 0) return 0;
    return Number(((saltPerWaste / wasteAmount) * 100).toFixed(2));
  }

  /**
   * 计算累积化盐量
   */
  static calculateAccumulatedSalt(saltPerWaste: number, wasteAmount: number): number {
    return Number((saltPerWaste * wasteAmount).toFixed(2));
  }

  /**
   * 计算能耗效率
   */
  static calculateEnergyEfficiency(gasConsumption: number, powerConsumption: number, wasteAmount: number): {
    gasEfficiency: number;
    powerEfficiency: number;
    totalEnergyConsumption: number;
  } {
    const gasEfficiency = wasteAmount > 0 ? Number((gasConsumption / wasteAmount).toFixed(3)) : 0;
    const powerEfficiency = wasteAmount > 0 ? Number((powerConsumption / wasteAmount).toFixed(3)) : 0;
    
    // 总能耗（标准化为kWh等效）
    // 1 Nm³天然气 ≈ 10 kWh
    const totalEnergyConsumption = Number((gasConsumption * 10 + powerConsumption).toFixed(2));

    return {
      gasEfficiency,
      powerEfficiency,
      totalEnergyConsumption
    };
  }

  /**
   * 计算理论产量
   */
  static calculateTheoreticalOutput(wasteAmount: number, saltPerWaste: number): number {
    return Number((wasteAmount * saltPerWaste * SALT_SPECS.THEORETICAL_YIELD).toFixed(2));
  }

  /**
   * 计算温度效率指数
   */
  static calculateTemperatureEfficiency(actualTemperature: number): number {
    const efficiency = Math.min(actualTemperature / SALT_SPECS.STANDARD_TEMPERATURE, 1.2);
    return Number((efficiency * 100).toFixed(1));
  }

  /**
   * 计算液位利用率
   */
  static calculateLevelUtilization(currentLevel: number, maxLevel: number = 10): number {
    return Number(((currentLevel / maxLevel) * 100).toFixed(1));
  }

  /**
   * 验证和修正数据
   */
  private static validateAndCorrect(record: SaltProcessRecord): SaltProcessRecord {
    // 确保所有数值字段都是有效数字
    const numericFields = [
      'sequenceNumber', 'wasteAmount', 'sodiumNitrate', 'potassiumNitrate',
      'saltPerWaste', 'accumulatedSalt', 'moltenSaltTemperature', 'moltenSaltLevel',
      'gasConsumptionPerWaste', 'powerConsumptionPerWaste', 'staffCount',
      'totalNitrate', 'efficiency'
    ];
    
    for (const field of numericFields) {
      const value = (record as any)[field];
      if (value !== undefined && value !== null) {
        (record as any)[field] = Number(value) || 0;
      }
    }

    // 数据合理性检查
    if (record.moltenSaltTemperature && record.moltenSaltTemperature > 1000) {
      console.warn(`温度值异常: ${record.moltenSaltTemperature}°C，可能需要检查`);
    }

    if (record.moltenSaltLevel && record.moltenSaltLevel < 0) {
      record.moltenSaltLevel = 0;
    }

    if (record.efficiency && record.efficiency > 200) {
      console.warn(`效率值异常: ${record.efficiency}%，可能需要检查计算方式`);
    }

    return record;
  }
}

/**
 * 批量数据计算工具
 */
export class BatchCalculator {
  /**
   * 批量计算熔盐入库统计数据
   */
  static calculateMoltenSaltBatch(records: Partial<MoltenSaltInventoryRecord>[]): MoltenSaltInventoryRecord[] {
    return records.map(record => MoltenSaltCalculator.calculateRecord(record));
  }

  /**
   * 批量计算化盐量记录数据
   */
  static calculateSaltProcessBatch(records: Partial<SaltProcessRecord>[]): SaltProcessRecord[] {
    return records.map(record => SaltProcessCalculator.calculateRecord(record));
  }

  /**
   * 计算批次统计信息
   */
  static calculateBatchStatistics(records: MoltenSaltInventoryRecord[]): {
    totalSodiumBags: number;
    totalPotassiumBags: number;
    totalWeight: number;
    averageDailyOutput: number;
    dateRange: { start: string; end: string };
  } {
    if (records.length === 0) {
      return {
        totalSodiumBags: 0,
        totalPotassiumBags: 0,
        totalWeight: 0,
        averageDailyOutput: 0,
        dateRange: { start: '', end: '' }
      };
    }

    const totalSodiumBags = records.reduce((sum, record) => sum + (record.sodiumBags || 0), 0);
    const totalPotassiumBags = records.reduce((sum, record) => sum + (record.potassiumBags || 0), 0);
    const totalWeight = records.reduce((sum, record) => sum + (record.totalWeight || 0), 0);
    
    const dates = records.map(record => record.date).filter(Boolean).sort();
    const dateRange = {
      start: dates[0] || '',
      end: dates[dates.length - 1] || ''
    };

    const averageDailyOutput = records.length > 0 ? Number((totalWeight / records.length).toFixed(2)) : 0;

    return {
      totalSodiumBags,
      totalPotassiumBags,
      totalWeight,
      averageDailyOutput,
      dateRange
    };
  }
}
