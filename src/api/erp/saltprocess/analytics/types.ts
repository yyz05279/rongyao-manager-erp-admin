/**
 * 数据分析模块 - 类型定义
 */
import { SaltType, ProjectStatus, QualityLevel } from '../types';

// 分析时间周期
export enum AnalysisPeriod {
  DAILY = 'DAILY',                 // 日
  WEEKLY = 'WEEKLY',               // 周
  MONTHLY = 'MONTHLY',             // 月
  QUARTERLY = 'QUARTERLY',         // 季度
  YEARLY = 'YEARLY'                // 年
}

// 图表类型
export enum ChartType {
  LINE = 'LINE',                   // 折线图
  BAR = 'BAR',                     // 柱状图
  PIE = 'PIE',                     // 饼图
  SCATTER = 'SCATTER',             // 散点图
  AREA = 'AREA',                   // 面积图
  RADAR = 'RADAR'                  // 雷达图
}

// 生产统计数据
export interface ProductionStatistics {
  period: string;
  totalProjects: number;
  completedProjects: number;
  inProgressProjects: number;
  cancelledProjects: number;
  completionRate: number;
  onTimeCompletionRate: number;
  totalOutput: number;
  targetOutput: number;
  outputAchievementRate: number;
  averageProductionTime: number; // 小时
  productionEfficiency: number; // %
  equipmentUtilization: number; // %
  energyConsumption: number; // kWh
  energyEfficiency: number; // kWh/kg
  productTypeDistribution: ProductTypeDistribution[];
}

// 产品类型分布
export interface ProductTypeDistribution {
  productType: SaltType;
  count: number;
  percentage: number;
  output: number;
  outputPercentage: number;
}

// 质量分析数据
export interface QualityAnalytics {
  period: string;
  totalInspections: number;
  passedInspections: number;
  failedInspections: number;
  passRate: number;
  qualityDistribution: QualityDistribution[];
  defectAnalysis: DefectAnalysis[];
  qualityTrend: QualityTrendPoint[];
  testItemPerformance: TestItemPerformance[];
  nonconformityRate: number;
  averageInspectionTime: number; // 分钟
}

// 质量等级分布
export interface QualityDistribution {
  qualityLevel: QualityLevel;
  count: number;
  percentage: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
}

// 缺陷分析
export interface DefectAnalysis {
  defectType: string;
  count: number;
  percentage: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  cost: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
}

// 质量趋势点
export interface QualityTrendPoint {
  date: string;
  passRate: number;
  qualificationRate: number;
  premiumRate: number;
  defectRate: number;
}

// 检验项目性能
export interface TestItemPerformance {
  itemName: string;
  totalTests: number;
  passedTests: number;
  passRate: number;
  averageValue: number;
  standardDeviation: number;
  cpk: number; // 工艺能力指数
  trend: 'IMPROVING' | 'DECLINING' | 'STABLE';
}

// 成本分析数据
export interface CostAnalytics {
  period: string;
  totalCost: number;
  rawMaterialCost: number;
  laborCost: number;
  energyCost: number;
  equipmentCost: number;
  qualityCost: number;
  overheadCost: number;
  unitCost: number;
  costTrend: CostTrendPoint[];
  costBreakdown: CostBreakdown[];
  costComparison: CostComparison[];
  costSavings: number;
  costEfficiency: number;
}

// 成本趋势点
export interface CostTrendPoint {
  date: string;
  totalCost: number;
  unitCost: number;
  rawMaterialCost: number;
  laborCost: number;
  energyCost: number;
}

// 成本分解
export interface CostBreakdown {
  costType: string;
  amount: number;
  percentage: number;
  budgetAmount: number;
  variance: number;
  variancePercentage: number;
}

// 成本对比
export interface CostComparison {
  period: string;
  currentCost: number;
  previousCost: number;
  variance: number;
  variancePercentage: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
}

// 设备分析数据
export interface EquipmentAnalytics {
  period: string;
  totalEquipment: number;
  activeEquipment: number;
  utilizationRate: number;
  averageUptime: number; // %
  averageDowntime: number; // 小时
  maintenanceCost: number;
  energyConsumption: number;
  efficiency: number;
  equipmentPerformance: EquipmentPerformance[];
  faultAnalysis: FaultAnalysis[];
  maintenanceSchedule: MaintenanceSchedule[];
}

// 设备性能
export interface EquipmentPerformance {
  equipmentId: string;
  equipmentName: string;
  equipmentType: string;
  utilizationRate: number;
  uptime: number;
  downtime: number;
  efficiency: number;
  energyConsumption: number;
  maintenanceCost: number;
  faultCount: number;
  performance: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'POOR';
}

// 故障分析
export interface FaultAnalysis {
  faultType: string;
  count: number;
  percentage: number;
  averageRepairTime: number; // 小时
  totalCost: number;
  frequency: number; // 次/月
  trend: 'UP' | 'DOWN' | 'STABLE';
}

// 维护计划
export interface MaintenanceSchedule {
  equipmentId: string;
  equipmentName: string;
  maintenanceType: 'PREVENTIVE' | 'CORRECTIVE' | 'PREDICTIVE';
  scheduledDate: string;
  estimatedDuration: number; // 小时
  estimatedCost: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
}

// 人员分析数据
export interface PersonnelAnalytics {
  period: string;
  totalPersonnel: number;
  activePersonnel: number;
  productivity: number;
  efficiency: number;
  trainingHours: number;
  safetyIncidents: number;
  personnelPerformance: PersonnelPerformance[];
  skillAnalysis: SkillAnalysis[];
  workloadDistribution: WorkloadDistribution[];
}

// 人员绩效
export interface PersonnelPerformance {
  personnelId: string;
  personnelName: string;
  role: string;
  productivity: number;
  efficiency: number;
  qualityScore: number;
  safetyScore: number;
  trainingHours: number;
  workHours: number;
  performance: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'POOR';
}

// 技能分析
export interface SkillAnalysis {
  skillName: string;
  requiredLevel: number;
  averageLevel: number;
  gap: number;
  personnelCount: number;
  trainingNeeded: boolean;
}

// 工作负荷分布
export interface WorkloadDistribution {
  role: string;
  personnelCount: number;
  averageWorkload: number;
  maxWorkload: number;
  utilizationRate: number;
  overloadCount: number;
}

// 综合仪表板数据
export interface DashboardData {
  period: string;
  kpis: KPIMetric[];
  productionSummary: ProductionSummary;
  qualitySummary: QualitySummary;
  costSummary: CostSummary;
  equipmentSummary: EquipmentSummary;
  alerts: DashboardAlert[];
  charts: DashboardChart[];
  lastUpdateTime: string;
}

// KPI指标
export interface KPIMetric {
  name: string;
  value: number;
  unit: string;
  target: number;
  achievement: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
  status: 'EXCELLENT' | 'GOOD' | 'WARNING' | 'CRITICAL';
}

// 生产汇总
export interface ProductionSummary {
  totalOutput: number;
  completionRate: number;
  efficiency: number;
  onTimeDelivery: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
}

// 质量汇总
export interface QualitySummary {
  passRate: number;
  qualificationRate: number;
  defectRate: number;
  customerSatisfaction: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
}

// 成本汇总
export interface CostSummary {
  totalCost: number;
  unitCost: number;
  budgetVariance: number;
  costSavings: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
}

// 设备汇总
export interface EquipmentSummary {
  utilizationRate: number;
  uptime: number;
  efficiency: number;
  maintenanceCost: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
}

// 仪表板警报
export interface DashboardAlert {
  id: string;
  type: 'PRODUCTION' | 'QUALITY' | 'COST' | 'EQUIPMENT' | 'SAFETY';
  level: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  title: string;
  message: string;
  value?: number;
  threshold?: number;
  createTime: string;
  status: 'ACTIVE' | 'HANDLED' | 'CLOSED';
}

// 仪表板图表
export interface DashboardChart {
  id: string;
  title: string;
  type: ChartType;
  category: 'PRODUCTION' | 'QUALITY' | 'COST' | 'EQUIPMENT';
  data: ChartData;
  config: ChartConfig;
}

// 图表数据
export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

// 图表数据集
export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string[];
  borderColor?: string;
  borderWidth?: number;
  fill?: boolean;
}

// 图表配置
export interface ChartConfig {
  responsive: boolean;
  maintainAspectRatio: boolean;
  plugins: {
    legend: {
      display: boolean;
      position: string;
    };
    title: {
      display: boolean;
      text: string;
    };
  };
  scales?: {
    x: {
      display: boolean;
      title: {
        display: boolean;
        text: string;
      };
    };
    y: {
      display: boolean;
      title: {
        display: boolean;
        text: string;
      };
    };
  };
}

// 报告生成参数
export interface ReportGenerationParams {
  reportType: 'PRODUCTION' | 'QUALITY' | 'COST' | 'EQUIPMENT' | 'COMPREHENSIVE';
  period: AnalysisPeriod;
  startDate: string;
  endDate: string;
  includeCharts: boolean;
  includeDetails: boolean;
  format: 'PDF' | 'EXCEL' | 'WORD';
  filters?: Record<string, any>;
}

// 分析报告
export interface AnalyticsReport {
  reportId: string;
  reportType: string;
  title: string;
  period: string;
  generateTime: string;
  generatedBy: string;
  summary: ReportSummary;
  sections: ReportSection[];
  charts: DashboardChart[];
  recommendations: string[];
}

// 报告汇总
export interface ReportSummary {
  keyFindings: string[];
  achievements: string[];
  challenges: string[];
  trends: string[];
  recommendations: string[];
}

// 报告章节
export interface ReportSection {
  sectionId: string;
  title: string;
  content: string;
  data: any;
  charts: string[];
  insights: string[];
}
