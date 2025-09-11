<template>
  <div class="salt-records-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/index' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/saltprocess' }">化盐工艺流程</el-breadcrumb-item>
        <el-breadcrumb-item>化盐记录</el-breadcrumb-item>
      </el-breadcrumb>
      <h1 class="page-title">化盐记录管理</h1>
      <p class="page-description">管理化盐工艺过程中的各类数据记录，包括预热记录、二元化盐记录、三元化盐记录等</p>
    </div>

    <!-- 记录模块卡片 -->
    <div class="records-grid">
      <!-- 预热记录模块 -->
      <el-card class="record-module-card" shadow="hover" @click="navigateToModule('preheating')">
        <div class="module-icon">
          <svg-icon icon-class="heating" size="48" />
        </div>
        <div class="module-info">
          <h3>预热记录</h3>
          <p>管理预热工艺过程中的温度、压力、时间等数据记录</p>
          <div class="module-stats">
            <el-statistic title="总记录数" :value="preheatingStats.totalRecords" />
            <el-statistic title="今日新增" :value="preheatingStats.todayRecords" />
          </div>
        </div>
        <div class="module-actions">
          <el-button type="primary" size="small" @click.stop="navigateToModule('preheating')">
            查看记录
          </el-button>
        </div>
      </el-card>

      <!-- 二元化盐记录模块 -->
      <el-card class="record-module-card" shadow="hover" @click="navigateToModule('binary')">
        <div class="module-icon">
          <svg-icon icon-class="chemistry" size="48" />
        </div>
        <div class="module-info">
          <h3>二元化盐记录</h3>
          <p>管理二元化盐工艺的配比、反应、质量等数据记录</p>
          <div class="module-stats">
            <el-statistic title="总记录数" :value="binaryStats.totalRecords" />
            <el-statistic title="今日新增" :value="binaryStats.todayRecords" />
          </div>
        </div>
        <div class="module-actions">
          <el-button type="primary" size="small" @click.stop="navigateToModule('binary')">
            查看记录
          </el-button>
        </div>
      </el-card>

      <!-- 三元化盐记录模块 -->
      <el-card class="record-module-card" shadow="hover" @click="navigateToModule('ternary')">
        <div class="module-icon">
          <svg-icon icon-class="chemistry-flask" size="48" />
        </div>
        <div class="module-info">
          <h3>三元化盐记录</h3>
          <p>管理三元化盐工艺的配比、稳定性、质量等数据记录</p>
          <div class="module-stats">
            <el-statistic title="总记录数" :value="ternaryStats.totalRecords" />
            <el-statistic title="今日新增" :value="ternaryStats.todayRecords" />
          </div>
        </div>
        <div class="module-actions">
          <el-button type="primary" size="small" @click.stop="navigateToModule('ternary')">
            查看记录
          </el-button>
        </div>
      </el-card>
    </div>

    <!-- 快速统计 -->
    <el-card class="statistics-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>记录统计概览</span>
          <el-button type="text" @click="refreshStats">刷新</el-button>
        </div>
      </template>
      <el-row :gutter="20">
        <el-col :span="6">
          <el-statistic title="总记录数" :value="totalStats.totalRecords" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="今日新增" :value="totalStats.todayRecords" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="本周新增" :value="totalStats.weekRecords" />
        </el-col>
        <el-col :span="6">
          <el-statistic title="本月新增" :value="totalStats.monthRecords" />
        </el-col>
      </el-row>
    </el-card>

    <!-- 最近记录 -->
    <el-card class="recent-records-card" shadow="never">
      <template #header>
        <div class="card-header">
          <span>最近记录</span>
          <el-button type="text" @click="viewAllRecords">查看全部</el-button>
        </div>
      </template>
      <el-table :data="recentRecords" size="small">
        <el-table-column prop="recordCode" label="记录编码" width="150" />
        <el-table-column prop="recordType" label="记录类型" width="120">
          <template #default="scope">
            <el-tag :type="getRecordTypeTag(scope.row.recordType)">
              {{ getRecordTypeText(scope.row.recordType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="projectName" label="项目名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="operatorName" label="操作员" width="100" />
        <el-table-column prop="createTime" label="创建时间" width="160">
          <template #default="scope">
            {{ parseTime(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="scope">
            <el-button type="text" size="small" @click="viewRecord(scope.row)">
              查看
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup name="SaltProcessRecords" lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { parseTime } from '@/utils/ruoyi';

const router = useRouter();

// 响应式数据
const preheatingStats = ref({
  totalRecords: 0,
  todayRecords: 0
});

const binaryStats = ref({
  totalRecords: 0,
  todayRecords: 0
});

const ternaryStats = ref({
  totalRecords: 0,
  todayRecords: 0
});

const totalStats = ref({
  totalRecords: 0,
  todayRecords: 0,
  weekRecords: 0,
  monthRecords: 0
});

const recentRecords = ref([]);

// 生命周期
onMounted(() => {
  loadStatistics();
  loadRecentRecords();
});

// 方法
const loadStatistics = async () => {
  try {
    // TODO: 调用API获取统计数据
    // 模拟数据
    preheatingStats.value = { totalRecords: 156, todayRecords: 8 };
    binaryStats.value = { totalRecords: 234, todayRecords: 12 };
    ternaryStats.value = { totalRecords: 89, todayRecords: 5 };
    
    totalStats.value = {
      totalRecords: 479,
      todayRecords: 25,
      weekRecords: 156,
      monthRecords: 678
    };
  } catch (error) {
    console.error('加载统计数据失败:', error);
  }
};

const loadRecentRecords = async () => {
  try {
    // TODO: 调用API获取最近记录
    // 模拟数据
    recentRecords.value = [
      {
        id: '1',
        recordCode: 'PH20241201001',
        recordType: 'preheating',
        projectName: '项目A-预热工艺',
        operatorName: '张三',
        createTime: '2024-12-01 14:30:00'
      },
      {
        id: '2',
        recordCode: 'BM20241201002',
        recordType: 'binary',
        projectName: '项目B-二元化盐',
        operatorName: '李四',
        createTime: '2024-12-01 13:45:00'
      }
    ];
  } catch (error) {
    console.error('加载最近记录失败:', error);
  }
};

const navigateToModule = (moduleType: string) => {
  router.push(`/saltprocess/records/${moduleType}`);
};

const refreshStats = () => {
  loadStatistics();
  loadRecentRecords();
};

const viewAllRecords = () => {
  // TODO: 实现查看全部记录功能
  ElMessage.info('查看全部记录功能开发中');
};

const viewRecord = (record: any) => {
  router.push(`/saltprocess/records/${record.recordType}/detail/${record.id}`);
};

const getRecordTypeTag = (type: string) => {
  const tagMap = {
    preheating: 'warning',
    binary: 'primary',
    ternary: 'success'
  };
  return tagMap[type] || 'info';
};

const getRecordTypeText = (type: string) => {
  const textMap = {
    preheating: '预热记录',
    binary: '二元化盐',
    ternary: '三元化盐'
  };
  return textMap[type] || '未知类型';
};
</script>

<style scoped lang="scss">
.salt-records-container {
  padding: 20px;

  .page-header {
    margin-bottom: 24px;

    .page-title {
      font-size: 24px;
      font-weight: 600;
      color: #2c3e50;
      margin: 16px 0 8px 0;
    }

    .page-description {
      color: #666;
      font-size: 14px;
      margin: 0;
    }
  }

  .records-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 20px;
    margin-bottom: 24px;

    .record-module-card {
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
      }

      .module-icon {
        text-align: center;
        margin-bottom: 16px;
        color: #409eff;
      }

      .module-info {
        text-align: center;
        margin-bottom: 16px;

        h3 {
          font-size: 18px;
          font-weight: 600;
          color: #2c3e50;
          margin: 0 0 8px 0;
        }

        p {
          color: #666;
          font-size: 14px;
          margin: 0 0 16px 0;
        }

        .module-stats {
          display: flex;
          justify-content: space-around;
        }
      }

      .module-actions {
        text-align: center;
      }
    }
  }

  .statistics-card,
  .recent-records-card {
    margin-bottom: 24px;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
}
</style>
