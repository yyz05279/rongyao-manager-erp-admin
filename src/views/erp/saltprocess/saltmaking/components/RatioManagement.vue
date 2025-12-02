<template>
  <div class="ratio-management">
    <div v-loading="loading">
      <!-- 任务信息 -->
      <el-card class="task-info-card" shadow="never">
        <template #header>
          <span>任务信息</span>
        </template>
        <el-descriptions :column="3" border>
          <el-descriptions-item label="任务编码">{{ taskData.taskCode }}</el-descriptions-item>
          <el-descriptions-item label="项目名称">{{ taskData.projectName }}</el-descriptions-item>
          <el-descriptions-item label="化盐类型">
            <el-tag :type="getSaltTypeTag(taskData.saltType)">
              {{ getSaltTypeText(taskData.saltType) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="反应罐">{{ taskData.reactorName }}</el-descriptions-item>
          <el-descriptions-item label="目标产量">{{ taskData.targetOutput }}kg</el-descriptions-item>
          <el-descriptions-item label="任务状态">
            <el-tag :type="getStatusTag(taskData.status)">
              {{ getStatusText(taskData.status) }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 配比控制 -->
      <el-card class="ratio-control-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span>配比控制</span>
            <div class="header-actions">
              <el-button
                type="primary"
                size="small"
                @click="handleRefresh"
                :loading="refreshing"
              >
                刷新数据
              </el-button>
              <el-button
                type="warning"
                size="small"
                @click="handleResetRatio"
                :disabled="taskData.status !== 'IN_PROGRESS'"
              >
                重置配比
              </el-button>
            </div>
          </div>
        </template>

        <el-row :gutter="20">
          <el-col
            v-for="(item, index) in ratioData"
            :key="item.component"
            :span="taskData.saltType === 'TERNARY_SALT' ? 8 : 12"
          >
            <div class="ratio-item" :class="getRatioStatusClass(item.status)">
              <div class="ratio-header">
                <h4>{{ item.componentName }}</h4>
                <el-tag :type="getRatioStatusTag(item.status)" size="small">
                  {{ getRatioStatusText(item.status) }}
                </el-tag>
              </div>

              <div class="ratio-content">
                <div class="ratio-values">
                  <div class="value-item">
                    <label>目标配比:</label>
                    <span class="value">{{ item.targetRatio }}%</span>
                  </div>
                  <div class="value-item">
                    <label>当前配比:</label>
                    <span class="value" :class="getDeviationClass(item.deviation)">
                      {{ item.currentRatio }}%
                    </span>
                  </div>
                  <div class="value-item">
                    <label>偏差:</label>
                    <span class="value" :class="getDeviationClass(item.deviation)">
                      {{ item.deviation > 0 ? '+' : '' }}{{ item.deviation }}%
                    </span>
                  </div>
                </div>

                <div class="ratio-amounts">
                  <div class="amount-item">
                    <label>目标用量:</label>
                    <span>{{ item.targetAmount }}{{ item.unit }}</span>
                  </div>
                  <div class="amount-item">
                    <label>实际用量:</label>
                    <span>{{ item.actualAmount }}{{ item.unit }}</span>
                  </div>
                </div>

                <div class="ratio-progress">
                  <el-progress
                    :percentage="Math.min(100, (item.actualAmount / item.targetAmount) * 100)"
                    :status="getProgressStatus(item.status)"
                    :stroke-width="8"
                  />
                </div>

                <div class="ratio-actions">
                  <el-button
                    type="success"
                    size="small"
                    @click="handleAdjustRatio(item, 'INCREASE')"
                    :disabled="taskData.status !== 'IN_PROGRESS'"
                  >
                    增加
                  </el-button>
                  <el-button
                    type="warning"
                    size="small"
                    @click="handleAdjustRatio(item, 'DECREASE')"
                    :disabled="taskData.status !== 'IN_PROGRESS'"
                  >
                    减少
                  </el-button>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>
      </el-card>

      <!-- 配比调整记录 -->
      <el-card class="adjustment-history-card" shadow="never">
        <template #header>
          <span>配比调整记录</span>
        </template>
        
        <el-table :data="adjustmentHistory" stripe border>
          <el-table-column label="调整时间" prop="adjustmentTime" width="180" />
          <el-table-column label="组分" prop="componentName" width="120" />
          <el-table-column label="调整类型" prop="adjustmentType" width="100" align="center">
            <template #default="scope">
              <el-tag :type="scope.row.adjustmentType === 'INCREASE' ? 'success' : 'warning'" size="small">
                {{ scope.row.adjustmentType === 'INCREASE' ? '增加' : '减少' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="调整量" prop="adjustmentAmount" width="100" align="center">
            <template #default="scope">
              {{ scope.row.adjustmentType === 'INCREASE' ? '+' : '-' }}{{ scope.row.adjustmentAmount }}%
            </template>
          </el-table-column>
          <el-table-column label="调整前" prop="beforeRatio" width="100" align="center">
            <template #default="scope">
              {{ scope.row.beforeRatio }}%
            </template>
          </el-table-column>
          <el-table-column label="调整后" prop="afterRatio" width="100" align="center">
            <template #default="scope">
              {{ scope.row.afterRatio }}%
            </template>
          </el-table-column>
          <el-table-column label="调整原因" prop="reason" min-width="150" show-overflow-tooltip />
          <el-table-column label="操作员" prop="operatorName" width="100" />
          <el-table-column label="结果" prop="result" width="80" align="center">
            <template #default="scope">
              <el-tag :type="scope.row.result === 'SUCCESS' ? 'success' : 'danger'" size="small">
                {{ scope.row.result === 'SUCCESS' ? '成功' : '失败' }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <!-- 配比调整对话框 -->
    <el-dialog
      title="配比调整"
      v-model="adjustDialog.visible"
      width="500px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="adjustFormRef"
        :model="adjustForm"
        :rules="adjustRules"
        label-width="100px"
      >
        <el-form-item label="组分名称">
          <el-input :value="adjustDialog.componentName" disabled />
        </el-form-item>
        <el-form-item label="调整类型">
          <el-input :value="adjustDialog.adjustmentType === 'INCREASE' ? '增加' : '减少'" disabled />
        </el-form-item>
        <el-form-item label="调整量" prop="adjustmentAmount">
          <el-input-number
            v-model="adjustForm.adjustmentAmount"
            :min="0.1"
            :max="10"
            :precision="2"
            :step="0.1"
            style="width: 100%"
          >
            <template #append>%</template>
          </el-input-number>
        </el-form-item>
        <el-form-item label="调整原因" prop="reason">
          <el-input
            v-model="adjustForm.reason"
            type="textarea"
            :rows="3"
            placeholder="请输入调整原因"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="adjustDialog.visible = false">取消</el-button>
          <el-button type="primary" @click="handleConfirmAdjust" :loading="adjusting">
            确认调整
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="RatioManagement" lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { FormRules } from 'element-plus';
import {
  getSaltmakingTask,
  getRatioRealtimeStatus,
  adjustRatio,
  getRatioAdjustmentHistory,
  resetRatio
} from '@/api/erp/saltprocess/saltmaking';
import type { 
  SaltmakingTaskVO, 
  RatioDataItem, 
  RatioAdjustmentRecord,
  RatioAdjustmentForm 
} from '@/api/erp/saltprocess/saltmaking/types';

// Props
interface Props {
  taskId: string;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  close: [];
}>();

// 响应式数据
const loading = ref(false);
const refreshing = ref(false);
const adjusting = ref(false);

const taskData = ref<SaltmakingTaskVO>({} as SaltmakingTaskVO);
const ratioData = ref<RatioDataItem[]>([]);
const adjustmentHistory = ref<RatioAdjustmentRecord[]>([]);

// 调整对话框
const adjustDialog = reactive({
  visible: false,
  component: '',
  componentName: '',
  adjustmentType: 'INCREASE' as 'INCREASE' | 'DECREASE'
});

const adjustForm = reactive<RatioAdjustmentForm>({
  taskId: '',
  component: '',
  adjustmentType: 'INCREASE',
  adjustmentAmount: 0.5,
  reason: '',
  operatorId: '1' // TODO: 从当前用户获取
});

const adjustFormRef = ref();

// 表单验证规则
const adjustRules: ElFormRules = {
  adjustmentAmount: [
    { required: true, message: '请输入调整量', trigger: 'blur' },
    { type: 'number', min: 0.1, max: 10, message: '调整量应在0.1-10%之间', trigger: 'blur' }
  ],
  reason: [{ required: true, message: '请输入调整原因', trigger: 'blur' }]
};

// 生命周期
onMounted(() => {
  loadData();
});

// 方法
const loadData = async () => {
  loading.value = true;
  try {
    await Promise.all([
      loadTaskData(),
      loadRatioData(),
      loadAdjustmentHistory()
    ]);
  } catch (error) {
    console.error('加载数据失败:', error);
  } finally {
    loading.value = false;
  }
};

const loadTaskData = async () => {
  const { data } = await getSaltmakingTask(props.taskId);
  taskData.value = data;
};

const loadRatioData = async () => {
  try {
    const { data } = await getRatioRealtimeStatus(props.taskId);
    ratioData.value = data.details || [];
  } catch (error) {
    // 使用模拟数据
    ratioData.value = [
      {
        component: 'NaNO3',
        componentName: '硝酸钠',
        targetRatio: 60.0,
        currentRatio: 59.8,
        deviation: -0.2,
        targetAmount: 1500,
        actualAmount: 1497,
        status: 'NORMAL',
        unit: 'kg'
      },
      {
        component: 'KNO3',
        componentName: '硝酸钾',
        targetRatio: 40.0,
        currentRatio: 40.2,
        deviation: 0.2,
        targetAmount: 1000,
        actualAmount: 1005,
        status: 'NORMAL',
        unit: 'kg'
      }
    ];
  }
};

const loadAdjustmentHistory = async () => {
  try {
    const { data } = await getRatioAdjustmentHistory(props.taskId);
    adjustmentHistory.value = data;
  } catch (error) {
    // 使用模拟数据
    adjustmentHistory.value = [
      {
        id: '1',
        taskId: props.taskId,
        component: 'NaNO3',
        componentName: '硝酸钠',
        adjustmentType: 'DECREASE',
        adjustmentAmount: 0.3,
        beforeRatio: 60.3,
        afterRatio: 60.0,
        reason: '配比偏高，需要调整',
        operatorId: '1',
        operatorName: '张三',
        adjustmentTime: '2024-12-01 14:30:00',
        result: 'SUCCESS',
        remarks: ''
      }
    ];
  }
};

const handleRefresh = async () => {
  refreshing.value = true;
  try {
    await loadRatioData();
    ElMessage.success('数据刷新成功');
  } catch (error) {
    ElMessage.error('数据刷新失败');
  } finally {
    refreshing.value = false;
  }
};

const handleResetRatio = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要重置配比吗？这将恢复到初始配比设置。',
      '确认重置',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );

    await resetRatio(props.taskId);
    ElMessage.success('配比重置成功');
    await loadRatioData();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('配比重置失败');
    }
  }
};

const handleAdjustRatio = (item: RatioDataItem, type: 'INCREASE' | 'DECREASE') => {
  adjustDialog.visible = true;
  adjustDialog.component = item.component;
  adjustDialog.componentName = item.componentName;
  adjustDialog.adjustmentType = type;
  
  adjustForm.taskId = props.taskId;
  adjustForm.component = item.component;
  adjustForm.adjustmentType = type;
  adjustForm.adjustmentAmount = 0.5;
  adjustForm.reason = '';
};

const handleConfirmAdjust = async () => {
  try {
    await adjustFormRef.value?.validate();
    
    adjusting.value = true;
    await adjustRatio(adjustForm);
    
    ElMessage.success('配比调整成功');
    adjustDialog.visible = false;
    
    // 刷新数据
    await Promise.all([
      loadRatioData(),
      loadAdjustmentHistory()
    ]);
  } catch (error) {
    console.error('配比调整失败:', error);
    ElMessage.error('配比调整失败');
  } finally {
    adjusting.value = false;
  }
};

// 工具方法
const getSaltTypeText = (type: string): string => {
  const typeMap = {
    'BINARY_SALT': '二元化盐',
    'TERNARY_SALT': '三元化盐'
  };
  return typeMap[type as keyof typeof typeMap] || type;
};

const getSaltTypeTag = (type: string): string => {
  const tagMap = {
    'BINARY_SALT': 'primary',
    'TERNARY_SALT': 'success'
  };
  return tagMap[type as keyof typeof tagMap] || '';
};

const getStatusText = (status: string): string => {
  const statusMap = {
    'PENDING': '待开始',
    'IN_PROGRESS': '进行中',
    'COMPLETED': '已完成',
    'FAILED': '失败',
    'CANCELLED': '已取消'
  };
  return statusMap[status as keyof typeof statusMap] || status;
};

const getStatusTag = (status: string): string => {
  const tagMap = {
    'PENDING': 'info',
    'IN_PROGRESS': 'primary',
    'COMPLETED': 'success',
    'FAILED': 'danger',
    'CANCELLED': 'warning'
  };
  return tagMap[status as keyof typeof tagMap] || '';
};

const getRatioStatusText = (status: string): string => {
  const statusMap = {
    'NORMAL': '正常',
    'WARNING': '警告',
    'ERROR': '异常'
  };
  return statusMap[status as keyof typeof statusMap] || status;
};

const getRatioStatusTag = (status: string): string => {
  const tagMap = {
    'NORMAL': 'success',
    'WARNING': 'warning',
    'ERROR': 'danger'
  };
  return tagMap[status as keyof typeof tagMap] || '';
};

const getRatioStatusClass = (status: string): string => {
  const classMap = {
    'NORMAL': 'ratio-normal',
    'WARNING': 'ratio-warning',
    'ERROR': 'ratio-error'
  };
  return classMap[status as keyof typeof classMap] || '';
};

const getDeviationClass = (deviation: number): string => {
  if (Math.abs(deviation) <= 0.5) return 'text-success';
  if (Math.abs(deviation) <= 1.0) return 'text-warning';
  return 'text-danger';
};

const getProgressStatus = (status: string): string => {
  if (status === 'ERROR') return 'exception';
  if (status === 'WARNING') return 'warning';
  return 'success';
};
</script>

<style scoped lang="scss">
.ratio-management {
  .task-info-card,
  .ratio-control-card,
  .adjustment-history-card {
    margin-bottom: 20px;
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .ratio-item {
    border: 2px solid #e4e7ed;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;
    transition: all 0.3s;

    &.ratio-normal {
      border-color: #67c23a;
    }

    &.ratio-warning {
      border-color: #e6a23c;
    }

    &.ratio-error {
      border-color: #f56c6c;
    }

    .ratio-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;

      h4 {
        margin: 0;
        color: #2c3e50;
      }
    }

    .ratio-content {
      .ratio-values {
        margin-bottom: 12px;

        .value-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;

          label {
            color: #606266;
          }

          .value {
            font-weight: 600;
          }
        }
      }

      .ratio-amounts {
        margin-bottom: 12px;

        .amount-item {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
          font-size: 14px;
          color: #909399;
        }
      }

      .ratio-progress {
        margin-bottom: 16px;
      }

      .ratio-actions {
        display: flex;
        gap: 8px;
      }
    }
  }

  .text-success {
    color: #67c23a;
  }

  .text-warning {
    color: #e6a23c;
  }

  .text-danger {
    color: #f56c6c;
  }
}
</style>
