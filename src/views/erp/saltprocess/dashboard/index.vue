<template>
  <div class="saltprocess-dashboard">
    <!-- KPI指标卡片 -->
    <el-row :gutter="20" class="kpi-cards">
      <el-col :xs="24" :sm="12" :md="6" :lg="6" v-for="kpi in kpiMetrics" :key="kpi.name">
        <el-card class="kpi-card" shadow="hover">
          <div class="kpi-content">
            <div class="kpi-icon">
              <el-icon :size="32" :color="getKPIColor(kpi.status)">
                <component :is="getKPIIcon(kpi.name)" />
              </el-icon>
            </div>
            <div class="kpi-info">
              <div class="kpi-value">
                {{ formatKPIValue(kpi.value, kpi.unit) }}
                <el-tag :type="getKPITagType(kpi.trend)" size="small" class="kpi-trend">
                  <el-icon><component :is="getTrendIcon(kpi.trend)" /></el-icon>
                  {{ kpi.achievement }}%
                </el-tag>
              </div>
              <div class="kpi-name">{{ kpi.name }}</div>
              <div class="kpi-target">目标: {{ kpi.target }}{{ kpi.unit }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 工艺流程状态 -->
    <el-row :gutter="20" class="process-status">
      <el-col :span="24">
        <el-card class="process-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">工艺流程状态</span>
              <el-button type="primary" size="small" @click="refreshProcessStatus">
                <el-icon><Refresh /></el-icon>
                刷新
              </el-button>
            </div>
          </template>
          <div class="process-flow">
            <div 
              v-for="(step, index) in processSteps" 
              :key="step.id"
              class="process-step"
              :class="getStepClass(step.status)"
            >
              <div class="step-icon">
                <el-icon :size="24">
                  <component :is="step.icon" />
                </el-icon>
              </div>
              <div class="step-content">
                <div class="step-title">{{ step.title }}</div>
                <div class="step-status">{{ step.statusText }}</div>
                <div class="step-progress">
                  <el-progress 
                    :percentage="step.progress" 
                    :status="getProgressStatus(step.status)"
                    :stroke-width="6"
                  />
                </div>
              </div>
              <div v-if="index < processSteps.length - 1" class="step-arrow">
                <el-icon><ArrowRight /></el-icon>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 实时监控数据 -->
    <el-row :gutter="20" class="monitoring-section">
      <el-col :xs="24" :sm="24" :md="12" :lg="8">
        <el-card class="monitoring-card" shadow="hover">
          <template #header>
            <span class="card-title">生产概况</span>
          </template>
          <div class="production-summary">
            <div class="summary-item">
              <span class="label">总产量</span>
              <span class="value">{{ productionSummary.totalOutput }} kg</span>
            </div>
            <div class="summary-item">
              <span class="label">完成率</span>
              <span class="value">{{ productionSummary.completionRate }}%</span>
            </div>
            <div class="summary-item">
              <span class="label">效率</span>
              <span class="value">{{ productionSummary.efficiency }}%</span>
            </div>
            <div class="summary-item">
              <span class="label">准时交付</span>
              <span class="value">{{ productionSummary.onTimeDelivery }}%</span>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="24" :md="12" :lg="8">
        <el-card class="monitoring-card" shadow="hover">
          <template #header>
            <span class="card-title">质量概况</span>
          </template>
          <div class="quality-summary">
            <div class="summary-item">
              <span class="label">合格率</span>
              <span class="value">{{ qualitySummary.passRate }}%</span>
            </div>
            <div class="summary-item">
              <span class="label">优等品率</span>
              <span class="value">{{ qualitySummary.qualificationRate }}%</span>
            </div>
            <div class="summary-item">
              <span class="label">缺陷率</span>
              <span class="value">{{ qualitySummary.defectRate }}%</span>
            </div>
            <div class="summary-item">
              <span class="label">客户满意度</span>
              <span class="value">{{ qualitySummary.customerSatisfaction }}%</span>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="24" :md="12" :lg="8">
        <el-card class="monitoring-card" shadow="hover">
          <template #header>
            <span class="card-title">设备状态</span>
          </template>
          <div class="equipment-summary">
            <div class="summary-item">
              <span class="label">利用率</span>
              <span class="value">{{ equipmentSummary.utilizationRate }}%</span>
            </div>
            <div class="summary-item">
              <span class="label">运行时间</span>
              <span class="value">{{ equipmentSummary.uptime }}%</span>
            </div>
            <div class="summary-item">
              <span class="label">效率</span>
              <span class="value">{{ equipmentSummary.efficiency }}%</span>
            </div>
            <div class="summary-item">
              <span class="label">维护成本</span>
              <span class="value">¥{{ formatNumber(equipmentSummary.maintenanceCost) }}</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 图表展示 -->
    <el-row :gutter="20" class="charts-section">
      <el-col :xs="24" :sm="24" :md="12" :lg="12">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <span class="card-title">生产趋势</span>
          </template>
          <div ref="productionChartRef" class="chart-container"></div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="24" :md="12" :lg="12">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <span class="card-title">质量分布</span>
          </template>
          <div ref="qualityChartRef" class="chart-container"></div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 预警信息 -->
    <el-row :gutter="20" class="alerts-section">
      <el-col :span="24">
        <el-card class="alerts-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <span class="card-title">实时预警</span>
              <el-badge :value="activeAlerts.length" :max="99" type="danger">
                <el-button type="text" @click="viewAllAlerts">查看全部</el-button>
              </el-badge>
            </div>
          </template>
          <div class="alerts-list">
            <div 
              v-for="alert in activeAlerts.slice(0, 5)" 
              :key="alert.id"
              class="alert-item"
              :class="`alert-${alert.level.toLowerCase()}`"
            >
              <div class="alert-icon">
                <el-icon><component :is="getAlertIcon(alert.level)" /></el-icon>
              </div>
              <div class="alert-content">
                <div class="alert-title">{{ alert.title }}</div>
                <div class="alert-message">{{ alert.message }}</div>
                <div class="alert-time">{{ formatTime(alert.createTime) }}</div>
              </div>
              <div class="alert-actions">
                <el-button size="small" type="primary" @click="handleAlert(alert.id)">
                  处理
                </el-button>
              </div>
            </div>
            <div v-if="activeAlerts.length === 0" class="no-alerts">
              <el-icon><SuccessFilled /></el-icon>
              <span>暂无预警信息</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="SaltProcessDashboard" lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { ElMessage } from 'element-plus';
import {
  Refresh,
  ArrowRight,
  TrendCharts,
  DataAnalysis,
  Monitor,
  Setting,
  SuccessFilled,
  Warning,
  InfoFilled,
  CircleCloseFilled,
  ArrowUp,
  ArrowDown,
  Minus
} from '@element-plus/icons-vue';
import * as echarts from 'echarts';
import { getDashboardData } from '@/api/erp/saltprocess/analytics';
import type { 
  DashboardData, 
  KPIMetric, 
  DashboardAlert,
  ProductionSummary,
  QualitySummary,
  EquipmentSummary
} from '@/api/erp/saltprocess/analytics/types';

// 响应式数据
const loading = ref(false);
const kpiMetrics = ref<KPIMetric[]>([]);
const productionSummary = ref<ProductionSummary>({
  totalOutput: 0,
  completionRate: 0,
  efficiency: 0,
  onTimeDelivery: 0,
  trend: 'STABLE'
});
const qualitySummary = ref<QualitySummary>({
  passRate: 0,
  qualificationRate: 0,
  defectRate: 0,
  customerSatisfaction: 0,
  trend: 'STABLE'
});
const equipmentSummary = ref<EquipmentSummary>({
  utilizationRate: 0,
  uptime: 0,
  efficiency: 0,
  maintenanceCost: 0,
  trend: 'STABLE'
});
const activeAlerts = ref<DashboardAlert[]>([]);

// 图表引用
const productionChartRef = ref<HTMLDivElement>();
const qualityChartRef = ref<HTMLDivElement>();

// 工艺流程步骤
const processSteps = reactive([
  {
    id: 'project',
    title: '项目管理',
    icon: 'Setting',
    status: 'completed',
    statusText: '已完成',
    progress: 100
  },
  {
    id: 'preheating',
    title: '预热工艺',
    icon: 'Monitor',
    status: 'in-progress',
    statusText: '进行中',
    progress: 75
  },
  {
    id: 'saltmaking',
    title: '化盐工艺',
    icon: 'DataAnalysis',
    status: 'pending',
    statusText: '待开始',
    progress: 0
  },
  {
    id: 'heating',
    title: '提温工艺',
    icon: 'TrendCharts',
    status: 'pending',
    statusText: '待开始',
    progress: 0
  }
]);

// 定时器
let refreshTimer: NodeJS.Timeout | null = null;

// 生命周期
onMounted(() => {
  loadDashboardData();
  startAutoRefresh();
});

onUnmounted(() => {
  stopAutoRefresh();
});

// 方法
const loadDashboardData = async () => {
  try {
    loading.value = true;
    const { data } = await getDashboardData('DAILY');
    
    kpiMetrics.value = data.kpis || [];
    productionSummary.value = data.productionSummary || productionSummary.value;
    qualitySummary.value = data.qualitySummary || qualitySummary.value;
    equipmentSummary.value = data.equipmentSummary || equipmentSummary.value;
    activeAlerts.value = data.alerts?.filter(alert => alert.status === 'ACTIVE') || [];
    
    // 初始化图表
    initCharts();
  } catch (error) {
    console.error('加载仪表板数据失败:', error);
    ElMessage.error('加载数据失败');
  } finally {
    loading.value = false;
  }
};

const initCharts = () => {
  // 初始化生产趋势图表
  if (productionChartRef.value) {
    const productionChart = echarts.init(productionChartRef.value);
    const productionOption = {
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'] },
      yAxis: { type: 'value' },
      series: [{
        name: '产量',
        type: 'line',
        data: [120, 132, 101, 134, 90, 230, 210],
        smooth: true
      }]
    };
    productionChart.setOption(productionOption);
  }
  
  // 初始化质量分布图表
  if (qualityChartRef.value) {
    const qualityChart = echarts.init(qualityChartRef.value);
    const qualityOption = {
      tooltip: { trigger: 'item' },
      series: [{
        name: '质量分布',
        type: 'pie',
        radius: '50%',
        data: [
          { value: 1048, name: '优等品' },
          { value: 735, name: '一等品' },
          { value: 580, name: '合格品' },
          { value: 484, name: '不合格品' }
        ]
      }]
    };
    qualityChart.setOption(qualityOption);
  }
};

const refreshProcessStatus = () => {
  ElMessage.success('流程状态已刷新');
  loadDashboardData();
};

const startAutoRefresh = () => {
  refreshTimer = setInterval(() => {
    loadDashboardData();
  }, 30000); // 30秒刷新一次
};

const stopAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer);
    refreshTimer = null;
  }
};

const handleAlert = (alertId: string) => {
  ElMessage.info(`处理预警: ${alertId}`);
};

const viewAllAlerts = () => {
  ElMessage.info('跳转到预警管理页面');
};

// 工具方法
const formatKPIValue = (value: number, unit: string): string => {
  return `${value.toLocaleString()}`;
};

const formatNumber = (value: number): string => {
  return value.toLocaleString();
};

const formatTime = (time: string): string => {
  return new Date(time).toLocaleString();
};

const getKPIColor = (status: string): string => {
  const colors = {
    'EXCELLENT': '#67C23A',
    'GOOD': '#409EFF',
    'WARNING': '#E6A23C',
    'CRITICAL': '#F56C6C'
  };
  return colors[status as keyof typeof colors] || '#909399';
};

const getKPIIcon = (name: string): string => {
  const icons = {
    '总产量': 'TrendCharts',
    '完成率': 'DataAnalysis',
    '质量合格率': 'Monitor',
    '设备利用率': 'Setting'
  };
  return icons[name as keyof typeof icons] || 'TrendCharts';
};

const getKPITagType = (trend: string): string => {
  const types = {
    'UP': 'success',
    'DOWN': 'danger',
    'STABLE': 'info'
  };
  return types[trend as keyof typeof types] || 'info';
};

const getTrendIcon = (trend: string): string => {
  const icons = {
    'UP': 'ArrowUp',
    'DOWN': 'ArrowDown',
    'STABLE': 'Minus'
  };
  return icons[trend as keyof typeof icons] || 'Minus';
};

const getStepClass = (status: string): string => {
  return `step-${status}`;
};

const getProgressStatus = (status: string): string => {
  const statusMap = {
    'completed': 'success',
    'in-progress': '',
    'pending': 'exception'
  };
  return statusMap[status as keyof typeof statusMap] || '';
};

const getAlertIcon = (level: string): string => {
  const icons = {
    'INFO': 'InfoFilled',
    'WARNING': 'Warning',
    'ERROR': 'CircleCloseFilled',
    'CRITICAL': 'CircleCloseFilled'
  };
  return icons[level as keyof typeof icons] || 'InfoFilled';
};
</script>

<style scoped lang="scss">
.saltprocess-dashboard {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 84px);

  .kpi-cards {
    margin-bottom: 20px;

    .kpi-card {
      height: 120px;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
      }

      .kpi-content {
        display: flex;
        align-items: center;
        height: 100%;

        .kpi-icon {
          margin-right: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 60px;
          height: 60px;
          border-radius: 12px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .kpi-info {
          flex: 1;

          .kpi-value {
            font-size: 24px;
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 4px;
            display: flex;
            align-items: center;
            gap: 8px;

            .kpi-trend {
              font-size: 12px;
              font-weight: normal;
            }
          }

          .kpi-name {
            font-size: 14px;
            color: #606266;
            margin-bottom: 2px;
          }

          .kpi-target {
            font-size: 12px;
            color: #909399;
          }
        }
      }
    }
  }

  .process-status {
    margin-bottom: 20px;

    .process-card {
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .card-title {
          font-size: 16px;
          font-weight: 600;
          color: #2c3e50;
        }
      }

      .process-flow {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 20px 0;

        .process-step {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;

          &.step-completed {
            .step-icon {
              background-color: #67c23a;
              color: white;
            }
          }

          &.step-in-progress {
            .step-icon {
              background-color: #409eff;
              color: white;
            }
          }

          &.step-pending {
            .step-icon {
              background-color: #dcdfe6;
              color: #909399;
            }
          }

          .step-icon {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 12px;
            transition: all 0.3s ease;
          }

          .step-content {
            text-align: center;
            width: 100%;

            .step-title {
              font-size: 14px;
              font-weight: 500;
              color: #2c3e50;
              margin-bottom: 4px;
            }

            .step-status {
              font-size: 12px;
              color: #909399;
              margin-bottom: 8px;
            }

            .step-progress {
              width: 100%;
            }
          }

          .step-arrow {
            position: absolute;
            right: -20px;
            top: 20px;
            color: #dcdfe6;
            font-size: 20px;
          }
        }
      }
    }
  }

  .monitoring-section {
    margin-bottom: 20px;

    .monitoring-card {
      height: 200px;

      .card-title {
        font-size: 16px;
        font-weight: 600;
        color: #2c3e50;
      }

      .production-summary,
      .quality-summary,
      .equipment-summary {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        height: 100%;

        .summary-item {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 12px;
          background-color: #f8f9fa;
          border-radius: 8px;

          .label {
            font-size: 12px;
            color: #909399;
            margin-bottom: 4px;
          }

          .value {
            font-size: 18px;
            font-weight: 600;
            color: #2c3e50;
          }
        }
      }
    }
  }

  .charts-section {
    margin-bottom: 20px;

    .chart-card {
      .card-title {
        font-size: 16px;
        font-weight: 600;
        color: #2c3e50;
      }

      .chart-container {
        height: 300px;
        width: 100%;
      }
    }
  }

  .alerts-section {
    .alerts-card {
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;

        .card-title {
          font-size: 16px;
          font-weight: 600;
          color: #2c3e50;
        }
      }

      .alerts-list {
        .alert-item {
          display: flex;
          align-items: center;
          padding: 12px;
          border-radius: 8px;
          margin-bottom: 8px;
          border-left: 4px solid;

          &.alert-info {
            background-color: #f0f9ff;
            border-left-color: #409eff;
          }

          &.alert-warning {
            background-color: #fdf6ec;
            border-left-color: #e6a23c;
          }

          &.alert-error,
          &.alert-critical {
            background-color: #fef0f0;
            border-left-color: #f56c6c;
          }

          .alert-icon {
            margin-right: 12px;
            font-size: 20px;
          }

          .alert-content {
            flex: 1;

            .alert-title {
              font-size: 14px;
              font-weight: 500;
              color: #2c3e50;
              margin-bottom: 4px;
            }

            .alert-message {
              font-size: 12px;
              color: #606266;
              margin-bottom: 4px;
            }

            .alert-time {
              font-size: 11px;
              color: #909399;
            }
          }

          .alert-actions {
            margin-left: 12px;
          }
        }

        .no-alerts {
          text-align: center;
          padding: 40px;
          color: #909399;

          .el-icon {
            font-size: 48px;
            margin-bottom: 12px;
            color: #67c23a;
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .saltprocess-dashboard {
    padding: 10px;

    .process-flow {
      flex-direction: column;
      gap: 20px;

      .process-step {
        .step-arrow {
          display: none;
        }
      }
    }

    .monitoring-section {
      .monitoring-card {
        height: auto;
        margin-bottom: 16px;
      }
    }

    .charts-section {
      .chart-card {
        margin-bottom: 16px;

        .chart-container {
          height: 250px;
        }
      }
    }
  }
}
</style>
