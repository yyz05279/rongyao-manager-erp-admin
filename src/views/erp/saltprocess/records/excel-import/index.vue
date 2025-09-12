<template>
  <div class="excel-import-page">
    <!-- 页面标题 -->
    <div class="page-header">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/index' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/saltprocess' }">化盐工艺流程</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/saltprocess/records' }">化盐记录</el-breadcrumb-item>
        <el-breadcrumb-item>Excel数据导入</el-breadcrumb-item>
      </el-breadcrumb>
      <h1 class="page-title">Excel数据导入管理</h1>
      <p class="page-description">
        支持熔盐入库统计表和化盐量记录表的Excel数据导入，自动计算缺失字段，提供数据预览和验证功能
      </p>
    </div>

    <!-- 功能操作区 -->
    <el-card class="action-card" shadow="never">
      <div class="action-buttons">
        <el-button type="primary" size="large" @click="openImportDialog">
          <el-icon><upload /></el-icon>
          导入Excel数据
        </el-button>
        <el-button size="large" @click="downloadTemplate">
          <el-icon><download /></el-icon>
          下载模板
        </el-button>
        <el-button size="large" @click="clearData" :disabled="importedData.length === 0">
          <el-icon><delete /></el-icon>
          清空数据
        </el-button>
        <el-button size="large" @click="exportCurrentData" :disabled="importedData.length === 0">
          <el-icon><document /></el-icon>
          导出当前数据
        </el-button>
      </div>
    </el-card>

    <!-- 数据类型切换 -->
    <el-card class="type-switch-card" shadow="never" v-if="importedData.length > 0">
      <el-radio-group v-model="currentDataType" @change="handleDataTypeChange">
        <el-radio-button value="molten_salt_inventory">熔盐入库统计</el-radio-button>
        <el-radio-button value="salt_process">化盐量记录</el-radio-button>
      </el-radio-group>
      
      <div class="data-info">
        <el-tag size="small" type="info">
          当前显示: {{ getDataTypeDisplayName(currentDataType) }}
        </el-tag>
        <el-tag size="small" type="success">
          记录数: {{ getCurrentTypeData().length }}
        </el-tag>
      </div>
    </el-card>

    <!-- 数据展示区域 -->
    <div v-if="importedData.length > 0" class="data-display-section">
      <DataDisplayTable
        :data="getCurrentTypeData()"
        :data-type="currentDataType"
        :loading="loading"
        @refresh="handleRefresh"
        @export="handleExport"
      />
    </div>

    <!-- 空状态 -->
    <el-empty 
      v-else 
      description="暂无导入数据" 
      class="empty-state"
    >
      <el-button type="primary" @click="openImportDialog">开始导入数据</el-button>
    </el-empty>

    <!-- 导入对话框 -->
    <EnhancedImportDialog
      v-model:visible="importDialogVisible"
      @success="handleImportSuccess"
    />

    <!-- 导入历史记录 -->
    <el-card class="history-card" shadow="never" v-if="importHistory.length > 0">
      <template #header>
        <div class="card-header">
          <span class="card-title">📋 导入历史</span>
          <el-button size="small" @click="clearHistory">清空历史</el-button>
        </div>
      </template>
      
      <el-timeline>
        <el-timeline-item
          v-for="(item, index) in importHistory.slice(0, 5)"
          :key="index"
          :timestamp="item.timestamp"
          :type="item.success ? 'success' : 'danger'"
        >
          <div class="history-item">
            <div class="history-title">
              {{ item.fileName }} - {{ getDataTypeDisplayName(item.dataType) }}
            </div>
            <div class="history-details">
              <el-tag size="small" :type="item.success ? 'success' : 'danger'">
                {{ item.success ? '成功' : '失败' }}
              </el-tag>
              <span class="history-count">{{ item.recordCount }} 条记录</span>
              <span class="history-size">{{ formatFileSize(item.fileSize) }}</span>
            </div>
          </div>
        </el-timeline-item>
      </el-timeline>
      
      <div v-if="importHistory.length > 5" class="more-history">
        还有 {{ importHistory.length - 5 }} 条历史记录...
      </div>
    </el-card>
  </div>
</template>

<script setup name="ExcelImportPage" lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Upload, Download, Delete, Document } from '@element-plus/icons-vue';
import * as XLSX from 'xlsx';
import EnhancedImportDialog from './components/EnhancedImportDialog.vue';
import DataDisplayTable from './components/DataDisplayTable.vue';
import type {
  MoltenSaltInventoryRecord,
  SaltProcessRecord
} from '@/api/erp/saltprocess/records/excel-import/types';

// 响应式数据
const importDialogVisible = ref(false);
const loading = ref(false);
const currentDataType = ref<'molten_salt_inventory' | 'salt_process'>('molten_salt_inventory');

// 导入的数据存储
const importedData = ref<{
  moltenSaltInventory: MoltenSaltInventoryRecord[];
  saltProcess: SaltProcessRecord[];
}>({
  moltenSaltInventory: [],
  saltProcess: []
});

// 导入历史记录
interface ImportHistoryItem {
  timestamp: string;
  fileName: string;
  dataType: 'molten_salt_inventory' | 'salt_process';
  recordCount: number;
  fileSize: number;
  success: boolean;
}

const importHistory = ref<ImportHistoryItem[]>([]);

// 计算属性
const getCurrentTypeData = () => {
  return currentDataType.value === 'molten_salt_inventory' 
    ? importedData.value.moltenSaltInventory 
    : importedData.value.saltProcess;
};

// 方法
const getDataTypeDisplayName = (type: string) => {
  return type === 'molten_salt_inventory' ? '熔盐入库统计表' : '化盐量记录表';
};

const formatFileSize = (size: number): string => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const openImportDialog = () => {
  importDialogVisible.value = true;
};

const handleImportSuccess = (data: any[]) => {
  if (data.length === 0) return;

  // 根据数据结构判断类型
  const firstRecord = data[0];
  let dataType: 'molten_salt_inventory' | 'salt_process';
  
  if ('sodiumBags' in firstRecord || 'potassiumBags' in firstRecord) {
    dataType = 'molten_salt_inventory';
    importedData.value.moltenSaltInventory = data as MoltenSaltInventoryRecord[];
  } else {
    dataType = 'salt_process';
    importedData.value.saltProcess = data as SaltProcessRecord[];
  }

  currentDataType.value = dataType;

  // 添加到历史记录
  const historyItem: ImportHistoryItem = {
    timestamp: new Date().toLocaleString(),
    fileName: '导入文件', // 这里可以从导入对话框传递实际文件名
    dataType,
    recordCount: data.length,
    fileSize: 0, // 这里可以从导入对话框传递实际文件大小
    success: true
  };
  
  importHistory.value.unshift(historyItem);
  
  // 保持历史记录不超过20条
  if (importHistory.value.length > 20) {
    importHistory.value = importHistory.value.slice(0, 20);
  }

  ElMessage.success(`成功导入 ${data.length} 条${getDataTypeDisplayName(dataType)}记录`);
};

const handleDataTypeChange = () => {
  // 数据类型切换时的处理逻辑
};

const downloadTemplate = () => {
  // 创建熔盐入库统计表模板
  const moltenSaltTemplate = [
    {
      '日期': '2024-12-01',
      '钠（单位：袋）': 24,
      '钾（单位：袋）': 30,
      '总粉碎量': 54
    }
  ];

  // 创建化盐量记录表模板
  const saltProcessTemplate = [
    {
      '序号': 1,
      '日期': '2024-12-01',
      '垃圾': 100,
      '硝酸钠': 60,
      '硝酸钾': 40,
      '每垃圾化盐量': 1.2,
      '累积化盐量': 120,
      '熔盐罐熔盐温度': 450,
      '熔盐罐熔盐液位': 2.5,
      '每垃圾天然气耗量': 15,
      '每垃圾用电量': 8,
      '人数': 3,
      '记录人': '张三',
      '备注': '正常运行'
    }
  ];

  // 创建工作簿
  const wb = XLSX.utils.book_new();
  
  // 添加工作表
  const ws1 = XLSX.utils.json_to_sheet(moltenSaltTemplate);
  const ws2 = XLSX.utils.json_to_sheet(saltProcessTemplate);
  
  XLSX.utils.book_append_sheet(wb, ws1, '熔盐入库统计表');
  XLSX.utils.book_append_sheet(wb, ws2, '化盐量记录表');

  // 下载文件
  XLSX.writeFile(wb, '盐化工艺数据导入模板.xlsx');
  ElMessage.success('模板下载成功');
};

const clearData = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要清空所有导入的数据吗？此操作不可恢复。',
      '确认清空',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );

    importedData.value = {
      moltenSaltInventory: [],
      saltProcess: []
    };

    ElMessage.success('数据已清空');
  } catch {
    // 用户取消操作
  }
};

const exportCurrentData = () => {
  const currentData = getCurrentTypeData();
  if (currentData.length === 0) {
    ElMessage.warning('没有可导出的数据');
    return;
  }

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(currentData);
  
  const sheetName = getDataTypeDisplayName(currentDataType.value);
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  
  const fileName = `${sheetName}_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
  
  ElMessage.success('数据导出成功');
};

const clearHistory = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要清空导入历史记录吗？',
      '确认清空',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );

    importHistory.value = [];
    ElMessage.success('历史记录已清空');
  } catch {
    // 用户取消操作
  }
};

const handleRefresh = () => {
  // 刷新数据的逻辑
  ElMessage.info('数据已刷新');
};

const handleExport = (data: any[]) => {
  // 处理从子组件传来的导出事件
  console.log('导出数据:', data);
};

// 生命周期
onMounted(() => {
  // 页面加载时的初始化逻辑
});
</script>

<style scoped lang="scss">
.excel-import-page {
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
      color: #606266;
      font-size: 14px;
      line-height: 1.5;
      margin: 0;
    }
  }

  .action-card {
    margin-bottom: 20px;

    .action-buttons {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }
  }

  .type-switch-card {
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .data-info {
      display: flex;
      gap: 8px;
    }
  }

  .data-display-section {
    margin-bottom: 20px;
  }

  .empty-state {
    margin: 60px 0;
  }

  .history-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .card-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }

    .history-item {
      .history-title {
        font-weight: 500;
        color: #303133;
        margin-bottom: 4px;
      }

      .history-details {
        display: flex;
        gap: 12px;
        align-items: center;
        font-size: 12px;
        color: #909399;
      }
    }

    .more-history {
      text-align: center;
      color: #909399;
      font-size: 12px;
      margin-top: 12px;
    }
  }
}
</style>
