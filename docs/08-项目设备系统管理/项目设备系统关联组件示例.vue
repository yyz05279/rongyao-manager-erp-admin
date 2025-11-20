<template>
  <div class="equipment-system-management">
    <!-- 页面头部 -->
    <div class="page-header">
      <h2>项目设备系统管理</h2>
      <div class="header-actions">
        <el-button type="primary" icon="Plus" @click="showAssociateDialog">
          关联设备系统
        </el-button>
        <el-button icon="Refresh" @click="refreshData">刷新</el-button>
      </div>
    </div>

    <!-- 数据表格 -->
    <el-table
      v-loading="loading"
      :data="tableData"
      border
      stripe
      style="width: 100%; margin-top: 20px"
    >
      <el-table-column prop="systemCode" label="系统编码" width="150" />
      <el-table-column prop="systemName" label="系统名称" min-width="200" />
      <el-table-column prop="projectName" label="所属项目" width="180" />
      <el-table-column prop="systemType" label="系统类型" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="getSystemTypeTag(row.systemType)">
            {{ getSystemTypeLabel(row.systemType) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="subsystemCount" label="子系统数" width="100" align="center" />
      <el-table-column prop="totalItems" label="子项数" width="100" align="center" />
      <el-table-column prop="status" label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="getStatusTag(row.status)">
            {{ getStatusLabel(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" align="center" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="handleView(row)">
            查看
          </el-button>
          <el-button link type="primary" size="small" @click="handleEdit(row)">
            编辑
          </el-button>
          <el-button link type="danger" size="small" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-model:current-page="queryParams.pageNum"
      v-model:page-size="queryParams.pageSize"
      :total="total"
      :page-sizes="[10, 20, 50, 100]"
      layout="total, sizes, prev, pager, next, jumper"
      style="margin-top: 20px; justify-content: flex-end"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />

    <!-- 项目设备系统关联弹窗 -->
    <ProjectEquipmentSystemForm
      v-model:visible="associateDialogVisible"
      @success="handleAssociateSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import ProjectEquipmentSystemForm from './components/ProjectEquipmentSystemForm.vue';
import { listProjectEquipmentSystem, delProjectEquipmentSystem } from '@/api/erp/saltprocess/equipment-system';
import type { ProjectEquipmentSystemVO } from '@/api/erp/saltprocess/equipment-system/types';

// ==================== 响应式数据 ====================

const loading = ref(false);
const tableData = ref<ProjectEquipmentSystemVO[]>([]);
const total = ref(0);
const associateDialogVisible = ref(false);

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10
});

// ==================== 生命周期 ====================

onMounted(() => {
  loadData();
});

// ==================== 方法 ====================

/**
 * 加载数据
 */
const loadData = async () => {
  try {
    loading.value = true;
    const res = await listProjectEquipmentSystem(queryParams);
    tableData.value = res.data.rows || [];
    total.value = res.data.total || 0;
  } catch (error) {
    console.error('加载数据失败:', error);
    ElMessage.error('加载数据失败');
  } finally {
    loading.value = false;
  }
};

/**
 * 刷新数据
 */
const refreshData = () => {
  queryParams.pageNum = 1;
  loadData();
};

/**
 * 显示关联弹窗
 */
const showAssociateDialog = () => {
  associateDialogVisible.value = true;
};

/**
 * 关联成功处理
 */
const handleAssociateSuccess = () => {
  ElMessage.success('设备系统关联成功');
  refreshData();
};

// 其他方法省略...
</script>

<style scoped lang="scss">
.equipment-system-management {
  padding: 20px;

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
      color: #303133;
    }

    .header-actions {
      display: flex;
      gap: 10px;
    }
  }
}
</style>

