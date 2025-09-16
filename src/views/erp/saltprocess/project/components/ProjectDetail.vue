<template>
  <div class="project-detail" v-loading="loading">
    <el-tabs v-model="activeTab" type="border-card">
      <!-- 基本信息 -->
      <el-tab-pane label="基本信息" name="basic">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="项目编码">
            {{ projectData.projectCode }}
          </el-descriptions-item>
          <el-descriptions-item label="项目名称">
            {{ projectData.projectName }}
          </el-descriptions-item>
          <el-descriptions-item label="项目类型">
            <el-tag :type="getProjectTypeTag(projectData.projectType)">
              {{ getProjectTypeText(projectData.projectType) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="项目状态">
            <el-tag :type="getStatusTag(projectData.status)">
              {{ getStatusText(projectData.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="项目进度">
            <el-progress
              :percentage="projectData.progress"
              :status="getProgressStatus(projectData.progress)"
            />
          </el-descriptions-item>
          <el-descriptions-item label="当前阶段">
            {{ projectData.currentPhase }}
          </el-descriptions-item>
          <el-descriptions-item label="项目负责人">
            {{ projectData.managerName }}
          </el-descriptions-item>
          <el-descriptions-item label="开始时间">
            {{ parseTime(projectData.startDate, '{y}-{m}-{d}') }}
          </el-descriptions-item>
          <el-descriptions-item label="结束时间">
            {{ parseTime(projectData.endDate, '{y}-{m}-{d}') }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ parseTime(projectData.createTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="项目描述" :span="2">
            {{ projectData.description || '暂无描述' }}
          </el-descriptions-item>
        </el-descriptions>
      </el-tab-pane>

      <!-- TODO: 工艺配置标签页已临时隐藏 - 2025-9-16需求变更 -->
      <!-- 恢复方法：移除 v-if="false" 和此注释即可 -->
      <!-- 工艺配置 -->
      <el-tab-pane label="工艺配置" name="process" v-if="false">
        <div v-if="projectData.processConfig">
          <el-card class="config-card" shadow="never">
            <template #header>
              <span class="card-title">{{ projectData.processConfig.configName }}</span>
            </template>

            <!-- 预热配置 -->
            <el-collapse v-model="activeCollapse">
              <el-collapse-item title="预热配置" name="preheating">
                <el-descriptions :column="2" border size="small">
                  <el-descriptions-item label="目标温度">
                    {{ projectData.processConfig.preheatingConfig.targetTemperature }}°C
                  </el-descriptions-item>
                  <el-descriptions-item label="目标压力">
                    {{ projectData.processConfig.preheatingConfig.targetPressure }} MPa
                  </el-descriptions-item>
                  <el-descriptions-item label="温度容差">
                    ±{{ projectData.processConfig.preheatingConfig.tolerance }}°C
                  </el-descriptions-item>
                  <el-descriptions-item label="持续时间">
                    {{ projectData.processConfig.preheatingConfig.duration }} 分钟
                  </el-descriptions-item>
                  <el-descriptions-item label="升温速率">
                    {{ projectData.processConfig.preheatingConfig.heatingRate }}°C/min
                  </el-descriptions-item>
                </el-descriptions>
              </el-collapse-item>

              <!-- 化盐配置 -->
              <el-collapse-item title="化盐配置" name="saltmaking">
                <el-descriptions :column="2" border size="small">
                  <el-descriptions-item label="目标温度">
                    {{ projectData.processConfig.saltmakingConfig.targetTemperature }}°C
                  </el-descriptions-item>
                  <el-descriptions-item label="目标压力">
                    {{ projectData.processConfig.saltmakingConfig.targetPressure }} MPa
                  </el-descriptions-item>
                  <el-descriptions-item label="搅拌速度">
                    {{ projectData.processConfig.saltmakingConfig.stirringSpeed }} rpm
                  </el-descriptions-item>
                  <el-descriptions-item label="反应时间">
                    {{ projectData.processConfig.saltmakingConfig.reactionTime }} 分钟
                  </el-descriptions-item>
                </el-descriptions>

                <!-- 配比配置 -->
                <div class="ratio-config">
                  <h4>配比配置</h4>
                  <el-table :data="projectData.processConfig.saltmakingConfig.ratioConfig" size="small">
                    <el-table-column prop="componentName" label="组分名称" />
                    <el-table-column prop="targetRatio" label="目标配比(%)" />
                    <el-table-column prop="tolerance" label="容差(%)" />
                    <el-table-column prop="priority" label="优先级" />
                  </el-table>
                </div>
              </el-collapse-item>

              <!-- 提温配置 -->
              <el-collapse-item title="提温配置" name="heating">
                <el-descriptions :column="2" border size="small">
                  <el-descriptions-item label="最终温度">
                    {{ projectData.processConfig.heatingConfig.finalTemperature }}°C
                  </el-descriptions-item>
                  <el-descriptions-item label="保温时间">
                    {{ projectData.processConfig.heatingConfig.holdingTime }} 分钟
                  </el-descriptions-item>
                </el-descriptions>

                <!-- 提温阶段 -->
                <div class="heating-stages">
                  <h4>提温阶段</h4>
                  <el-table :data="projectData.processConfig.heatingConfig.stages" size="small">
                    <el-table-column prop="stageName" label="阶段名称" />
                    <el-table-column prop="startTemperature" label="起始温度(°C)" />
                    <el-table-column prop="endTemperature" label="结束温度(°C)" />
                    <el-table-column prop="heatingRate" label="升温速率(°C/min)" />
                    <el-table-column prop="duration" label="持续时间(分钟)" />
                  </el-table>
                </div>
              </el-collapse-item>
            </el-collapse>
          </el-card>
        </div>
        <el-empty v-else description="暂无工艺配置" />
      </el-tab-pane>

      <!-- TODO: 质量标准标签页已临时隐藏 - 2025-9-16需求变更 -->
      <!-- 恢复方法：移除 v-if="false" 和此注释即可 -->
      <!-- 质量标准 -->
      <el-tab-pane label="质量标准" name="quality" v-if="false">
        <div v-if="projectData.qualityStandards && projectData.qualityStandards.length > 0">
          <el-card
            v-for="standard in projectData.qualityStandards"
            :key="standard.id"
            class="standard-card"
            shadow="never"
          >
            <template #header>
              <span class="card-title">{{ standard.standardName }}</span>
            </template>
            <el-table :data="standard.testItems" size="small">
              <el-table-column prop="itemName" label="检验项目" />
              <el-table-column prop="itemCode" label="项目编码" />
              <el-table-column prop="standardValue" label="标准值" />
              <el-table-column prop="tolerance" label="容差" />
              <el-table-column prop="unit" label="单位" />
              <el-table-column prop="testMethod" label="检验方法" />
              <el-table-column prop="isRequired" label="是否必检">
                <template #default="scope">
                  <el-tag :type="scope.row.isRequired ? 'success' : 'info'" size="small">
                    {{ scope.row.isRequired ? '是' : '否' }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </el-card>
        </div>
        <el-empty v-else description="暂无质量标准" />
      </el-tab-pane>

      <!-- TODO: 资源计划标签页已临时隐藏 - 2025-9-16需求变更 -->
      <!-- 恢复方法：移除 v-if="false" 和此注释即可 -->
      <!-- 资源计划 -->
      <el-tab-pane label="资源计划" name="resource" v-if="false">
        <div v-if="projectData.resourcePlan">
          <el-card class="resource-card" shadow="never">
            <template #header>
              <span class="card-title">{{ projectData.resourcePlan.planName }}</span>
            </template>

            <!-- 人员计划 -->
            <div class="resource-section">
              <h4>人员计划</h4>
              <el-table :data="projectData.resourcePlan.personnelPlan" size="small">
                <el-table-column prop="roleName" label="角色" />
                <el-table-column prop="requiredCount" label="需求人数" />
                <el-table-column label="已分配人员">
                  <template #default="scope">
                    <el-tag
                      v-for="person in scope.row.assignedPersonnel"
                      :key="person.userId"
                      size="small"
                      style="margin-right: 4px;"
                    >
                      {{ person.userName }}
                    </el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </div>

            <!-- 设备计划 -->
            <div class="resource-section">
              <h4>设备计划</h4>
              <el-table :data="projectData.resourcePlan.equipmentPlan" size="small">
                <el-table-column prop="equipmentName" label="设备名称" />
                <el-table-column prop="equipmentType" label="设备类型" />
                <el-table-column prop="requiredDuration" label="需求时长(小时)" />
                <el-table-column prop="scheduledStartTime" label="计划开始时间">
                  <template #default="scope">
                    {{ parseTime(scope.row.scheduledStartTime) }}
                  </template>
                </el-table-column>
                <el-table-column prop="scheduledEndTime" label="计划结束时间">
                  <template #default="scope">
                    {{ parseTime(scope.row.scheduledEndTime) }}
                  </template>
                </el-table-column>
              </el-table>
            </div>

            <!-- 物料计划 -->
            <div class="resource-section">
              <h4>物料计划</h4>
              <el-table :data="projectData.resourcePlan.materialPlan" size="small">
                <el-table-column prop="materialName" label="物料名称" />
                <el-table-column prop="specification" label="规格" />
                <el-table-column prop="requiredQuantity" label="需求数量" />
                <el-table-column prop="unit" label="单位" />
                <el-table-column prop="estimatedCost" label="预估成本" />
                <el-table-column prop="supplierName" label="供应商" />
              </el-table>
            </div>
          </el-card>
        </div>
        <el-empty v-else description="暂无资源计划" />
      </el-tab-pane>

      <!-- 项目进度 -->
      <el-tab-pane label="项目进度" name="progress">
        <project-progress :project-id="projectId" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup name="ProjectDetail" lang="ts">
import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { getSaltProject } from '@/api/erp/saltprocess/project';
import type { SaltProjectVO } from '@/api/erp/saltprocess/project/types';
import { parseTime } from '@/utils/ruoyi';
import ProjectProgress from './ProjectProgress.vue';

// Props
interface Props {
  projectId: string;
}

const props = defineProps<Props>();

// Emits
interface Emits {
  close: [];
}

const emit = defineEmits<Emits>();

// 响应式数据
const loading = ref(false);
const activeTab = ref('basic');
const activeCollapse = ref(['preheating', 'saltmaking', 'heating']);
const projectData = ref<SaltProjectVO>({} as SaltProjectVO);

// 生命周期
onMounted(() => {
  loadProjectData();
});

// 方法
const loadProjectData = async () => {
  loading.value = true;
  try {
    const { data } = await getSaltProject(props.projectId);
    projectData.value = data;
  } catch (error) {
    console.error('加载项目详情失败:', error);
    ElMessage.error('加载项目详情失败');
  } finally {
    loading.value = false;
  }
};

// 工具方法 - 支持数字和字符串类型的枚举值
const getProjectTypeText = (type: string | number): string => {
  // 数字到字符串的映射（后端返回数字）
  const numberToStringMap = {
    1: 'BINARY_SALT',
    2: 'TERNARY_SALT',
    3: 'CUSTOM'
  };

  const stringType = typeof type === 'number' ? numberToStringMap[type as keyof typeof numberToStringMap] : type;

  const typeMap = {
    'BINARY_SALT': '二元化盐项目',
    'TERNARY_SALT': '三元化盐项目',
    'CUSTOM': '定制项目'
  };
  return typeMap[stringType as keyof typeof typeMap] || String(type);
};

const getProjectTypeTag = (type: string | number): string => {
  const numberToStringMap = {
    1: 'BINARY_SALT',
    2: 'TERNARY_SALT',
    3: 'CUSTOM'
  };

  const stringType = typeof type === 'number' ? numberToStringMap[type as keyof typeof numberToStringMap] : type;

  const tagMap = {
    'BINARY_SALT': 'primary',
    'TERNARY_SALT': 'success',
    'CUSTOM': 'warning'
  };
  return tagMap[stringType as keyof typeof tagMap] || '';
};

const getStatusText = (status: string | number): string => {
  const numberToStringMap = {
    1: 'PLANNING',
    2: 'IN_PROGRESS',
    3: 'COMPLETED',
    4: 'SUSPENDED',
    5: 'CANCELLED'
  };

  const stringStatus = typeof status === 'number' ? numberToStringMap[status as keyof typeof numberToStringMap] : status;

  const statusMap = {
    'PLANNING': '规划中',
    'IN_PROGRESS': '进行中',
    'COMPLETED': '已完成',
    'SUSPENDED': '已暂停',
    'CANCELLED': '已取消'
  };
  return statusMap[stringStatus as keyof typeof statusMap] || String(status);
};

const getStatusTag = (status: string | number): string => {
  const numberToStringMap = {
    1: 'PLANNING',
    2: 'IN_PROGRESS',
    3: 'COMPLETED',
    4: 'SUSPENDED',
    5: 'CANCELLED'
  };

  const stringStatus = typeof status === 'number' ? numberToStringMap[status as keyof typeof numberToStringMap] : status;

  const tagMap = {
    'PLANNING': 'info',
    'IN_PROGRESS': 'primary',
    'COMPLETED': 'success',
    'SUSPENDED': 'warning',
    'CANCELLED': 'danger'
  };
  return tagMap[stringStatus as keyof typeof tagMap] || '';
};

const getProgressStatus = (progress: number): string => {
  if (progress === 100) return 'success';
  if (progress >= 80) return '';
  if (progress >= 50) return 'warning';
  return 'exception';
};
</script>

<style scoped lang="scss">
.project-detail {
  .config-card,
  .standard-card,
  .resource-card {
    margin-bottom: 16px;

    .card-title {
      font-size: 16px;
      font-weight: 600;
      color: #2c3e50;
    }
  }

  .ratio-config,
  .heating-stages,
  .resource-section {
    margin-top: 20px;

    h4 {
      margin-bottom: 12px;
      color: #2c3e50;
      font-size: 14px;
      font-weight: 600;
    }
  }
}
</style>
