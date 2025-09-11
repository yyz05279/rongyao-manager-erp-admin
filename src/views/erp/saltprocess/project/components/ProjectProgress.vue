<template>
  <div class="project-progress-container">
    <div v-loading="loading">
      <!-- 总体进度概览 -->
      <el-card class="overview-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span>项目总体进度</span>
            <el-tag :type="getScheduleTag(progressData.isOnSchedule)" size="small">
              {{ progressData.isOnSchedule ? '按期进行' : '进度延迟' }}
            </el-tag>
          </div>
        </template>
        
        <div class="progress-overview">
          <div class="progress-circle">
            <el-progress
              type="circle"
              :percentage="progressData.overallProgress"
              :width="120"
              :stroke-width="8"
              :color="getProgressColor(progressData.overallProgress)"
            >
              <template #default="{ percentage }">
                <span class="percentage-text">{{ percentage }}%</span>
              </template>
            </el-progress>
          </div>
          
          <div class="progress-info">
            <div class="info-item">
              <label>当前阶段：</label>
              <span class="current-phase">{{ progressData.currentPhase }}</span>
            </div>
            <div class="info-item">
              <label>预计完成：</label>
              <span>{{ formatDate(progressData.estimatedCompletionDate) }}</span>
            </div>
            <div class="info-item" v-if="progressData.actualCompletionDate">
              <label>实际完成：</label>
              <span>{{ formatDate(progressData.actualCompletionDate) }}</span>
            </div>
            <div class="info-item" v-if="!progressData.isOnSchedule && progressData.delayDays">
              <label>延迟天数：</label>
              <span class="delay-text">{{ progressData.delayDays }} 天</span>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 阶段进度详情 -->
      <el-card class="phases-card" shadow="never">
        <template #header>
          <span>阶段进度详情</span>
        </template>
        
        <div class="phases-timeline">
          <div
            v-for="(phase, index) in progressData.phaseProgress"
            :key="phase.phaseCode"
            class="phase-item"
            :class="{ 'active': phase.status === 'IN_PROGRESS' }"
          >
            <!-- 阶段连接线 -->
            <div v-if="index > 0" class="phase-connector" :class="getConnectorClass(phase.status)"></div>
            
            <!-- 阶段图标 -->
            <div class="phase-icon" :class="getPhaseIconClass(phase.status)">
              <el-icon>
                <component :is="getPhaseIcon(phase.status)" />
              </el-icon>
            </div>
            
            <!-- 阶段内容 -->
            <div class="phase-content">
              <div class="phase-header">
                <h4 class="phase-name">{{ phase.phaseName }}</h4>
                <el-tag :type="getPhaseStatusTag(phase.status)" size="small">
                  {{ getPhaseStatusText(phase.status) }}
                </el-tag>
              </div>
              
              <div class="phase-progress">
                <el-progress
                  :percentage="phase.progress"
                  :stroke-width="6"
                  :color="getPhaseProgressColor(phase.status, phase.progress)"
                  :show-text="false"
                />
                <span class="progress-text">{{ phase.progress }}%</span>
              </div>
              
              <div class="phase-dates">
                <div class="date-item">
                  <span class="date-label">计划：</span>
                  <span>{{ formatDate(phase.plannedStartDate) }} - {{ formatDate(phase.plannedEndDate) }}</span>
                </div>
                <div class="date-item" v-if="phase.actualStartDate">
                  <span class="date-label">实际：</span>
                  <span>
                    {{ formatDate(phase.actualStartDate) }}
                    <template v-if="phase.actualEndDate"> - {{ formatDate(phase.actualEndDate) }}</template>
                    <template v-else-if="phase.status === 'IN_PROGRESS'"> - 进行中</template>
                  </span>
                </div>
              </div>
              
              <!-- 依赖关系 -->
              <div class="phase-dependencies" v-if="phase.dependencies.length > 0">
                <span class="dependencies-label">依赖阶段：</span>
                <el-tag
                  v-for="dep in phase.dependencies"
                  :key="dep"
                  size="small"
                  type="info"
                  class="dependency-tag"
                >
                  {{ getDependencyPhaseName(dep) }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 进度统计 -->
      <el-card class="statistics-card" shadow="never">
        <template #header>
          <span>进度统计</span>
        </template>
        
        <el-row :gutter="20">
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-value">{{ getPhaseCount('COMPLETED') }}</div>
              <div class="stat-label">已完成阶段</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-value">{{ getPhaseCount('IN_PROGRESS') }}</div>
              <div class="stat-label">进行中阶段</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-value">{{ getPhaseCount('NOT_STARTED') }}</div>
              <div class="stat-label">未开始阶段</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-item">
              <div class="stat-value">{{ getPhaseCount('DELAYED') }}</div>
              <div class="stat-label">延迟阶段</div>
            </div>
          </el-col>
        </el-row>
      </el-card>
    </div>
  </div>
</template>

<script setup name="ProjectProgress" lang="ts">
import { ref, onMounted, computed } from 'vue';
import { ElMessage } from 'element-plus';
import {
  SuccessFilled,
  Clock,
  Warning,
  CircleClose,
  Loading
} from '@element-plus/icons-vue';
import { getProjectProgress } from '@/api/erp/saltprocess/project';
import type { ProjectProgress } from '@/api/erp/saltprocess/project/types';
import { parseTime } from '@/utils/ruoyi';

// Props
interface Props {
  projectId: string;
}

const props = defineProps<Props>();

// 响应式数据
const loading = ref(false);
const progressData = ref<ProjectProgress>({
  projectId: '',
  currentPhase: '',
  phaseProgress: [],
  overallProgress: 0,
  estimatedCompletionDate: '',
  actualCompletionDate: undefined,
  isOnSchedule: true,
  delayDays: undefined
});

// 计算属性
const phaseMap = computed(() => {
  const map = new Map();
  progressData.value.phaseProgress.forEach(phase => {
    map.set(phase.phaseCode, phase.phaseName);
  });
  return map;
});

// 生命周期
onMounted(() => {
  if (props.projectId) {
    loadProgressData();
  }
});

// 方法
const loadProgressData = async () => {
  loading.value = true;
  try {
    const { data } = await getProjectProgress(props.projectId);
    progressData.value = data;
  } catch (error) {
    console.error('加载项目进度失败:', error);
    ElMessage.error('加载项目进度失败');
    
    // 使用模拟数据作为后备
    progressData.value = {
      projectId: props.projectId,
      currentPhase: '化盐工艺',
      phaseProgress: [
        {
          phaseName: '项目准备',
          phaseCode: 'PREPARATION',
          status: 'COMPLETED',
          progress: 100,
          plannedStartDate: '2024-11-01',
          plannedEndDate: '2024-11-05',
          actualStartDate: '2024-11-01',
          actualEndDate: '2024-11-04',
          dependencies: []
        },
        {
          phaseName: '预热阶段',
          phaseCode: 'PREHEATING',
          status: 'COMPLETED',
          progress: 100,
          plannedStartDate: '2024-11-06',
          plannedEndDate: '2024-11-15',
          actualStartDate: '2024-11-05',
          actualEndDate: '2024-11-14',
          dependencies: ['PREPARATION']
        },
        {
          phaseName: '化盐工艺',
          phaseCode: 'SALTMAKING',
          status: 'IN_PROGRESS',
          progress: 65,
          plannedStartDate: '2024-11-16',
          plannedEndDate: '2024-12-05',
          actualStartDate: '2024-11-15',
          actualEndDate: undefined,
          dependencies: ['PREHEATING']
        },
        {
          phaseName: '提温工艺',
          phaseCode: 'HEATING',
          status: 'NOT_STARTED',
          progress: 0,
          plannedStartDate: '2024-12-06',
          plannedEndDate: '2024-12-20',
          actualStartDate: undefined,
          actualEndDate: undefined,
          dependencies: ['SALTMAKING']
        },
        {
          phaseName: '质量检验',
          phaseCode: 'QUALITY_CHECK',
          status: 'NOT_STARTED',
          progress: 0,
          plannedStartDate: '2024-12-21',
          plannedEndDate: '2024-12-25',
          actualStartDate: undefined,
          actualEndDate: undefined,
          dependencies: ['HEATING']
        }
      ],
      overallProgress: 53,
      estimatedCompletionDate: '2024-12-25',
      actualCompletionDate: undefined,
      isOnSchedule: true,
      delayDays: undefined
    };
  } finally {
    loading.value = false;
  }
};

const formatDate = (dateStr: string) => {
  return parseTime(dateStr, '{y}-{m}-{d}');
};

const getScheduleTag = (isOnSchedule: boolean) => {
  return isOnSchedule ? 'success' : 'danger';
};

const getProgressColor = (percentage: number) => {
  if (percentage < 30) return '#f56c6c';
  if (percentage < 70) return '#e6a23c';
  return '#67c23a';
};

const getPhaseStatusTag = (status: string) => {
  const tagMap: Record<string, string> = {
    'NOT_STARTED': 'info',
    'IN_PROGRESS': 'primary',
    'COMPLETED': 'success',
    'DELAYED': 'danger'
  };
  return tagMap[status] || 'info';
};

const getPhaseStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    'NOT_STARTED': '未开始',
    'IN_PROGRESS': '进行中',
    'COMPLETED': '已完成',
    'DELAYED': '延迟'
  };
  return textMap[status] || '未知';
};

const getPhaseIcon = (status: string) => {
  const iconMap: Record<string, any> = {
    'NOT_STARTED': Clock,
    'IN_PROGRESS': Loading,
    'COMPLETED': SuccessFilled,
    'DELAYED': Warning
  };
  return iconMap[status] || CircleClose;
};

const getPhaseIconClass = (status: string) => {
  const classMap: Record<string, string> = {
    'NOT_STARTED': 'icon-pending',
    'IN_PROGRESS': 'icon-progress',
    'COMPLETED': 'icon-completed',
    'DELAYED': 'icon-delayed'
  };
  return classMap[status] || 'icon-pending';
};

const getConnectorClass = (status: string) => {
  return status === 'COMPLETED' ? 'connector-completed' : 'connector-pending';
};

const getPhaseProgressColor = (status: string, progress: number) => {
  if (status === 'DELAYED') return '#f56c6c';
  if (status === 'COMPLETED') return '#67c23a';
  if (status === 'IN_PROGRESS') {
    if (progress < 30) return '#f56c6c';
    if (progress < 70) return '#e6a23c';
    return '#409eff';
  }
  return '#dcdfe6';
};

const getPhaseCount = (status: string) => {
  return progressData.value.phaseProgress.filter(phase => phase.status === status).length;
};

const getDependencyPhaseName = (phaseCode: string) => {
  return phaseMap.value.get(phaseCode) || phaseCode;
};
</script>

<style scoped lang="scss">
.project-progress-container {
  .overview-card,
  .phases-card,
  .statistics-card {
    margin-bottom: 20px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .progress-overview {
    display: flex;
    align-items: center;
    gap: 40px;

    .progress-circle {
      flex-shrink: 0;
    }

    .percentage-text {
      font-size: 18px;
      font-weight: 600;
      color: #2c3e50;
    }

    .progress-info {
      flex: 1;

      .info-item {
        display: flex;
        margin-bottom: 12px;

        label {
          width: 80px;
          color: #606266;
          font-weight: 500;
        }

        .current-phase {
          color: #409eff;
          font-weight: 600;
        }

        .delay-text {
          color: #f56c6c;
          font-weight: 600;
        }
      }
    }
  }

  .phases-timeline {
    .phase-item {
      position: relative;
      display: flex;
      align-items: flex-start;
      margin-bottom: 30px;

      &:last-child {
        margin-bottom: 0;
      }

      &.active {
        .phase-content {
          border-left: 3px solid #409eff;
          padding-left: 15px;
        }
      }

      .phase-connector {
        position: absolute;
        left: 20px;
        top: -30px;
        width: 2px;
        height: 30px;

        &.connector-completed {
          background-color: #67c23a;
        }

        &.connector-pending {
          background-color: #dcdfe6;
        }
      }

      .phase-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 20px;
        flex-shrink: 0;

        &.icon-pending {
          background-color: #f4f4f5;
          color: #909399;
        }

        &.icon-progress {
          background-color: #ecf5ff;
          color: #409eff;
        }

        &.icon-completed {
          background-color: #f0f9ff;
          color: #67c23a;
        }

        &.icon-delayed {
          background-color: #fef0f0;
          color: #f56c6c;
        }
      }

      .phase-content {
        flex: 1;
        padding: 10px 0;

        .phase-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;

          .phase-name {
            margin: 0;
            font-size: 16px;
            font-weight: 600;
            color: #2c3e50;
          }
        }

        .phase-progress {
          display: flex;
          align-items: center;
          margin-bottom: 12px;

          .el-progress {
            flex: 1;
            margin-right: 10px;
          }

          .progress-text {
            font-weight: 600;
            color: #606266;
          }
        }

        .phase-dates {
          margin-bottom: 12px;

          .date-item {
            display: flex;
            margin-bottom: 4px;
            font-size: 14px;

            .date-label {
              width: 40px;
              color: #909399;
            }
          }
        }

        .phase-dependencies {
          .dependencies-label {
            font-size: 14px;
            color: #909399;
            margin-right: 8px;
          }

          .dependency-tag {
            margin-right: 4px;
          }
        }
      }
    }
  }

  .statistics-card {
    .stat-item {
      text-align: center;
      padding: 20px;
      border-radius: 8px;
      background-color: #f8f9fa;

      .stat-value {
        font-size: 32px;
        font-weight: 600;
        color: #2c3e50;
        margin-bottom: 8px;
      }

      .stat-label {
        font-size: 14px;
        color: #606266;
      }
    }
  }
}
</style>
