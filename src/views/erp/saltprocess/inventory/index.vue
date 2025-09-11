<template>
  <div class="inventory-management">
    <!-- 搜索筛选区域 -->
    <el-card class="search-card" shadow="never">
      <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="80px">
        <el-form-item label="物料编码" prop="materialCode">
          <el-input
            v-model="queryParams.materialCode"
            placeholder="请输入物料编码"
            clearable
            style="width: 200px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="物料名称" prop="materialName">
          <el-input
            v-model="queryParams.materialName"
            placeholder="请输入物料名称"
            clearable
            style="width: 200px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="物料类型" prop="materialType">
          <el-select v-model="queryParams.materialType" placeholder="请选择类型" clearable style="width: 150px">
            <el-option label="原料" value="RAW_MATERIAL" />
            <el-option label="辅料" value="AUXILIARY_MATERIAL" />
            <el-option label="成品" value="FINISHED_PRODUCT" />
            <el-option label="半成品" value="SEMI_FINISHED_PRODUCT" />
          </el-select>
        </el-form-item>
        <el-form-item label="仓库" prop="warehouseId">
          <el-select v-model="queryParams.warehouseId" placeholder="请选择仓库" clearable style="width: 150px">
            <el-option
              v-for="warehouse in warehouseList"
              :key="warehouse.id"
              :label="warehouse.name"
              :value="warehouse.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="库存状态" prop="stockStatus">
          <el-select v-model="queryParams.stockStatus" placeholder="请选择状态" clearable style="width: 120px">
            <el-option label="正常" value="NORMAL" />
            <el-option label="不足" value="LOW_STOCK" />
            <el-option label="超储" value="OVERSTOCK" />
            <el-option label="缺货" value="OUT_OF_STOCK" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作按钮区域 -->
    <el-card class="toolbar-card" shadow="never">
      <el-row :gutter="10">
        <el-col :span="1.5">
          <el-button
            type="primary"
            plain
            icon="Plus"
            @click="handleAdd"
            v-hasPermi="['saltprocess:inventory:add']"
          >
            新增物料
          </el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            type="success"
            plain
            icon="Upload"
            @click="handleInbound"
            v-hasPermi="['saltprocess:inventory:inbound']"
          >
            入库
          </el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            type="warning"
            plain
            icon="Download"
            @click="handleOutbound"
            v-hasPermi="['saltprocess:inventory:outbound']"
          >
            出库
          </el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            type="info"
            plain
            icon="Operation"
            @click="handleTransfer"
            v-hasPermi="['saltprocess:inventory:transfer']"
          >
            调拨
          </el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            type="danger"
            plain
            icon="Delete"
            :disabled="multiple"
            @click="handleDelete"
            v-hasPermi="['saltprocess:inventory:remove']"
          >
            删除
          </el-button>
        </el-col>
        <el-col :span="1.5">
          <el-button
            type="info"
            plain
            icon="Download"
            @click="handleExport"
            v-hasPermi="['saltprocess:inventory:export']"
          >
            导出
          </el-button>
        </el-col>
        <right-toolbar v-model:showSearch="showSearch" @queryTable="getList" />
      </el-row>
    </el-card>

    <!-- 库存概览 -->
    <el-row :gutter="20" class="overview-section">
      <el-col :xs="24" :sm="6" :md="6" :lg="6">
        <el-card class="overview-card">
          <div class="overview-item">
            <div class="item-icon total">
              <el-icon><Box /></el-icon>
            </div>
            <div class="item-content">
              <div class="item-value">{{ overviewData.totalMaterials }}</div>
              <div class="item-label">物料总数</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="6" :md="6" :lg="6">
        <el-card class="overview-card">
          <div class="overview-item">
            <div class="item-icon low-stock">
              <el-icon><Warning /></el-icon>
            </div>
            <div class="item-content">
              <div class="item-value">{{ overviewData.lowStockCount }}</div>
              <div class="item-label">库存不足</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="6" :md="6" :lg="6">
        <el-card class="overview-card">
          <div class="overview-item">
            <div class="item-icon out-stock">
              <el-icon><CircleClose /></el-icon>
            </div>
            <div class="item-content">
              <div class="item-value">{{ overviewData.outOfStockCount }}</div>
              <div class="item-label">缺货物料</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="6" :md="6" :lg="6">
        <el-card class="overview-card">
          <div class="overview-item">
            <div class="item-icon value">
              <el-icon><Money /></el-icon>
            </div>
            <div class="item-content">
              <div class="item-value">¥{{ formatNumber(overviewData.totalValue) }}</div>
              <div class="item-label">库存总值</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 库存列表 -->
    <el-card class="table-card" shadow="never">
      <el-table
        v-loading="loading"
        :data="inventoryList"
        @selection-change="handleSelectionChange"
        @row-click="handleRowClick"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="物料编码" prop="materialCode" width="120" />
        <el-table-column label="物料名称" prop="materialName" min-width="180" show-overflow-tooltip />
        <el-table-column label="物料类型" prop="materialType" width="120" align="center">
          <template #default="scope">
            <el-tag :type="getMaterialTypeTag(scope.row.materialType)">
              {{ getMaterialTypeText(scope.row.materialType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="规格型号" prop="specification" width="150" show-overflow-tooltip />
        <el-table-column label="当前库存" prop="currentStock" width="100" align="center">
          <template #default="scope">
            <span :class="getStockClass(scope.row.currentStock, scope.row.minStock, scope.row.maxStock)">
              {{ scope.row.currentStock }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="单位" prop="unit" width="80" align="center" />
        <el-table-column label="安全库存" prop="safetyStock" width="100" align="center" />
        <el-table-column label="最小库存" prop="minStock" width="100" align="center" />
        <el-table-column label="最大库存" prop="maxStock" width="100" align="center" />
        <el-table-column label="单价" prop="unitPrice" width="100" align="center">
          <template #default="scope">
            ¥{{ scope.row.unitPrice }}
          </template>
        </el-table-column>
        <el-table-column label="库存价值" prop="stockValue" width="120" align="center">
          <template #default="scope">
            ¥{{ formatNumber(scope.row.stockValue) }}
          </template>
        </el-table-column>
        <el-table-column label="仓库" prop="warehouseName" width="100" align="center" />
        <el-table-column label="库位" prop="location" width="100" align="center" />
        <el-table-column label="库存状态" prop="stockStatus" width="100" align="center">
          <template #default="scope">
            <el-tag :type="getStockStatusTag(scope.row.stockStatus)" size="small">
              {{ getStockStatusText(scope.row.stockStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="最后更新时间" prop="lastUpdateTime" width="160" align="center">
          <template #default="scope">
            <span>{{ parseTime(scope.row.lastUpdateTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="200" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="查看详情" placement="top">
              <el-button
                link
                type="primary"
                icon="View"
                @click.stop="handleView(scope.row)"
                v-hasPermi="['saltprocess:inventory:query']"
              />
            </el-tooltip>
            <el-tooltip content="入库" placement="top">
              <el-button
                link
                type="success"
                icon="Upload"
                @click.stop="handleInbound(scope.row)"
                v-hasPermi="['saltprocess:inventory:inbound']"
              />
            </el-tooltip>
            <el-tooltip content="出库" placement="top">
              <el-button
                link
                type="warning"
                icon="Download"
                @click.stop="handleOutbound(scope.row)"
                v-hasPermi="['saltprocess:inventory:outbound']"
              />
            </el-tooltip>
            <el-tooltip content="编辑" placement="top">
              <el-button
                link
                type="primary"
                icon="Edit"
                @click.stop="handleUpdate(scope.row)"
                v-hasPermi="['saltprocess:inventory:edit']"
              />
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button
                link
                type="danger"
                icon="Delete"
                @click.stop="handleDelete(scope.row)"
                v-hasPermi="['saltprocess:inventory:remove']"
              />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="total > 0"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
      />
    </el-card>

    <!-- 物料表单对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="800px" append-to-body>
      <inventory-material-form
        v-if="dialog.visible"
        ref="materialFormRef"
        :material-id="dialog.materialId"
        @success="handleFormSuccess"
        @cancel="dialog.visible = false"
      />
    </el-dialog>

    <!-- 入库对话框 -->
    <el-dialog title="入库操作" v-model="inboundDialog.visible" width="600px" append-to-body>
      <inventory-inbound-form
        v-if="inboundDialog.visible"
        :material-id="inboundDialog.materialId"
        @success="handleInboundSuccess"
        @cancel="inboundDialog.visible = false"
      />
    </el-dialog>

    <!-- 出库对话框 -->
    <el-dialog title="出库操作" v-model="outboundDialog.visible" width="600px" append-to-body>
      <inventory-outbound-form
        v-if="outboundDialog.visible"
        :material-id="outboundDialog.materialId"
        @success="handleOutboundSuccess"
        @cancel="outboundDialog.visible = false"
      />
    </el-dialog>

    <!-- 调拨对话框 -->
    <el-dialog title="库存调拨" v-model="transferDialog.visible" width="600px" append-to-body>
      <inventory-transfer-form
        v-if="transferDialog.visible"
        @success="handleTransferSuccess"
        @cancel="transferDialog.visible = false"
      />
    </el-dialog>

    <!-- 物料详情对话框 -->
    <el-dialog title="物料详情" v-model="detailDialog.visible" width="1200px" append-to-body>
      <inventory-material-detail
        v-if="detailDialog.visible"
        :material-id="detailDialog.materialId"
        @close="detailDialog.visible = false"
      />
    </el-dialog>
  </div>
</template>

<script setup name="InventoryManagement" lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  Search,
  Refresh,
  Plus,
  Upload,
  Download,
  Operation,
  Delete,
  View,
  Edit,
  Box,
  Warning,
  CircleClose,
  Money
} from '@element-plus/icons-vue';
import {
  listInventoryMaterial,
  deleteInventoryMaterial,
  getInventoryOverview,
  exportInventoryList
} from '@/api/erp/saltprocess/inventory';
import type { InventoryMaterialQuery, InventoryMaterialVO } from '@/api/erp/saltprocess/inventory/types';
import { parseTime } from '@/utils/ruoyi';
import InventoryMaterialForm from './components/InventoryMaterialForm.vue';
import InventoryInboundForm from './components/InventoryInboundForm.vue';
import InventoryOutboundForm from './components/InventoryOutboundForm.vue';
import InventoryTransferForm from './components/InventoryTransferForm.vue';
import InventoryMaterialDetail from './components/InventoryMaterialDetail.vue';

// 响应式数据
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<string[]>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const inventoryList = ref<InventoryMaterialVO[]>([]);
const warehouseList = ref<any[]>([]);
const overviewData = ref<any>({
  totalMaterials: 0,
  lowStockCount: 0,
  outOfStockCount: 0,
  totalValue: 0
});

// 查询参数
const queryParams = reactive<InventoryMaterialQuery>({
  pageNum: 1,
  pageSize: 10,
  materialCode: '',
  materialName: '',
  materialType: '',
  warehouseId: '',
  stockStatus: ''
});

// 对话框
const dialog = reactive({
  visible: false,
  title: '',
  materialId: ''
});

const inboundDialog = reactive({
  visible: false,
  materialId: ''
});

const outboundDialog = reactive({
  visible: false,
  materialId: ''
});

const transferDialog = reactive({
  visible: false
});

const detailDialog = reactive({
  visible: false,
  materialId: ''
});

// 表单引用
const queryFormRef = ref();
const materialFormRef = ref();

// 生命周期
onMounted(() => {
  getList();
  loadOverviewData();
  loadWarehouseList();
});

// 方法
const getList = async () => {
  loading.value = true;
  try {
    const { data } = await listInventoryMaterial(queryParams);
    inventoryList.value = data.rows;
    total.value = data.total;
  } catch (error) {
    console.error('获取库存列表失败:', error);
  } finally {
    loading.value = false;
  }
};

const loadOverviewData = async () => {
  try {
    const { data } = await getInventoryOverview();
    overviewData.value = data;
  } catch (error) {
    console.error('加载概览数据失败:', error);
  }
};

const loadWarehouseList = async () => {
  // TODO: 从仓库管理API获取仓库列表
  warehouseList.value = [
    { id: '1', name: '原料仓库' },
    { id: '2', name: '成品仓库' },
    { id: '3', name: '辅料仓库' }
  ];
};

const handleQuery = () => {
  queryParams.pageNum = 1;
  getList();
};

const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
};

const handleSelectionChange = (selection: InventoryMaterialVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length !== 1;
  multiple.value = !selection.length;
};

const handleRowClick = (row: InventoryMaterialVO) => {
  handleView(row);
};

const handleAdd = () => {
  dialog.title = '新增物料';
  dialog.materialId = '';
  dialog.visible = true;
};

const handleUpdate = (row?: InventoryMaterialVO) => {
  const materialId = row?.id || ids.value[0];
  dialog.title = '修改物料';
  dialog.materialId = materialId;
  dialog.visible = true;
};

const handleView = (row: InventoryMaterialVO) => {
  detailDialog.materialId = row.id;
  detailDialog.visible = true;
};

const handleInbound = (row?: InventoryMaterialVO) => {
  if (row) {
    inboundDialog.materialId = row.id;
    inboundDialog.visible = true;
  } else {
    ElMessage.info('批量入库功能开发中');
  }
};

const handleOutbound = (row?: InventoryMaterialVO) => {
  if (row) {
    outboundDialog.materialId = row.id;
    outboundDialog.visible = true;
  } else {
    ElMessage.info('批量出库功能开发中');
  }
};

const handleTransfer = () => {
  transferDialog.visible = true;
};

const handleDelete = async (row?: InventoryMaterialVO) => {
  const materialIds = row?.id ? [row.id] : ids.value;
  const materialNames = row?.materialName ? [row.materialName] : 
    inventoryList.value.filter(item => materialIds.includes(item.id)).map(item => item.materialName);
  
  try {
    await ElMessageBox.confirm(
      `是否确认删除物料"${materialNames.join('、')}"？`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    await deleteInventoryMaterial(materialIds);
    ElMessage.success('删除成功');
    getList();
    loadOverviewData();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除物料失败:', error);
      ElMessage.error('删除失败');
    }
  }
};

const handleExport = async () => {
  try {
    await exportInventoryList(queryParams);
    ElMessage.success('导出成功');
  } catch (error) {
    console.error('导出失败:', error);
    ElMessage.error('导出失败');
  }
};

const handleFormSuccess = () => {
  dialog.visible = false;
  getList();
  loadOverviewData();
};

const handleInboundSuccess = () => {
  inboundDialog.visible = false;
  getList();
  loadOverviewData();
};

const handleOutboundSuccess = () => {
  outboundDialog.visible = false;
  getList();
  loadOverviewData();
};

const handleTransferSuccess = () => {
  transferDialog.visible = false;
  getList();
  loadOverviewData();
};

// 工具方法
const getMaterialTypeText = (type: string): string => {
  const typeMap = {
    'RAW_MATERIAL': '原料',
    'AUXILIARY_MATERIAL': '辅料',
    'FINISHED_PRODUCT': '成品',
    'SEMI_FINISHED_PRODUCT': '半成品'
  };
  return typeMap[type as keyof typeof typeMap] || type;
};

const getMaterialTypeTag = (type: string): string => {
  const tagMap = {
    'RAW_MATERIAL': 'primary',
    'AUXILIARY_MATERIAL': 'success',
    'FINISHED_PRODUCT': 'warning',
    'SEMI_FINISHED_PRODUCT': 'info'
  };
  return tagMap[type as keyof typeof tagMap] || '';
};

const getStockStatusText = (status: string): string => {
  const statusMap = {
    'NORMAL': '正常',
    'LOW_STOCK': '不足',
    'OVERSTOCK': '超储',
    'OUT_OF_STOCK': '缺货'
  };
  return statusMap[status as keyof typeof statusMap] || status;
};

const getStockStatusTag = (status: string): string => {
  const tagMap = {
    'NORMAL': 'success',
    'LOW_STOCK': 'warning',
    'OVERSTOCK': 'info',
    'OUT_OF_STOCK': 'danger'
  };
  return tagMap[status as keyof typeof tagMap] || '';
};

const getStockClass = (current: number, min: number, max: number): string => {
  if (current <= 0) return 'text-danger';
  if (current < min) return 'text-warning';
  if (current > max) return 'text-info';
  return 'text-success';
};

const formatNumber = (value: number): string => {
  if (!value) return '0';
  return value.toLocaleString();
};
</script>

<style scoped lang="scss">
.inventory-management {
  .search-card,
  .toolbar-card,
  .table-card {
    margin-bottom: 20px;
  }

  .overview-section {
    margin-bottom: 20px;

    .overview-card {
      .overview-item {
        display: flex;
        align-items: center;
        padding: 20px;

        .item-icon {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 16px;
          font-size: 24px;
          color: white;

          &.total {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }

          &.low-stock {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          }

          &.out-stock {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          }

          &.value {
            background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
          }
        }

        .item-content {
          flex: 1;

          .item-value {
            font-size: 28px;
            font-weight: 600;
            color: #2c3e50;
            line-height: 1;
            margin-bottom: 8px;
          }

          .item-label {
            font-size: 14px;
            color: #8492a6;
          }
        }
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

  .text-info {
    color: #909399;
  }
}
</style>
