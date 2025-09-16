<template>
  <div class="inventory-material-detail">
    <div v-loading="loading">
      <!-- 基本信息 -->
      <el-card class="info-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span class="card-title">基本信息</span>
            <div class="header-actions">
              <el-button
                type="primary"
                icon="Edit"
                @click="handleEdit"
                v-hasPermi="['saltprocess:inventory:edit']"
              >
                编辑
              </el-button>
            </div>
          </div>
        </template>
        <el-descriptions :column="3" border>
          <el-descriptions-item label="物料编码">{{ materialDetail.materialCode }}</el-descriptions-item>
          <el-descriptions-item label="物料名称">{{ materialDetail.materialName }}</el-descriptions-item>
          <el-descriptions-item label="物料类型">
            <el-tag :type="getMaterialTypeTag(materialDetail.materialType)">
              {{ getMaterialTypeText(materialDetail.materialType) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="规格型号">{{ materialDetail.specification || '-' }}</el-descriptions-item>
          <el-descriptions-item label="计量单位">{{ materialDetail.unit }}</el-descriptions-item>
          <el-descriptions-item label="库存状态">
            <el-tag :type="getStockStatusTag(materialDetail.stockStatus)">
              {{ getStockStatusText(materialDetail.stockStatus) }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 库存信息 -->
      <el-card class="stock-card" shadow="never">
        <template #header>
          <span class="card-title">库存信息</span>
        </template>
        <el-row :gutter="24">
          <el-col :span="6">
            <div class="stock-item">
              <div class="stock-label">当前库存</div>
              <div class="stock-value">{{ materialDetail.currentStock || 0 }} {{ materialDetail.unit }}</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stock-item">
              <div class="stock-label">可用库存</div>
              <div class="stock-value">{{ materialDetail.availableStock || 0 }} {{ materialDetail.unit }}</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stock-item">
              <div class="stock-label">预留库存</div>
              <div class="stock-value">{{ materialDetail.reservedStock || 0 }} {{ materialDetail.unit }}</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stock-item">
              <div class="stock-label">安全库存</div>
              <div class="stock-value">{{ materialDetail.safetyStock || 0 }} {{ materialDetail.unit }}</div>
            </div>
          </el-col>
        </el-row>
      </el-card>

      <!-- 库存明细 -->
      <el-card class="details-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span class="card-title">库存明细</span>
            <div class="header-actions">
              <el-button
                type="primary"
                size="small"
                icon="Plus"
                @click="handleAddDetail"
                v-hasPermi="['saltprocess:inventory:edit']"
              >
                添加明细
              </el-button>
            </div>
          </div>
        </template>
        
        <el-table
          :data="stockDetails"
          border
          stripe
          max-height="400"
        >
          <el-table-column label="序号" type="index" width="60" />
          <el-table-column label="批次号" prop="batchNo" width="150" />
          <el-table-column label="库位" prop="locationName" width="120" />
          <el-table-column label="数量" prop="quantity" width="100" align="center">
            <template #default="{ row }">
              {{ row.quantity }} {{ materialDetail.unit }}
            </template>
          </el-table-column>
          <el-table-column label="生产日期" prop="productionDate" width="120" />
          <el-table-column label="有效期" prop="expiryDate" width="120" />
          <el-table-column label="供应商" prop="supplierName" min-width="150" />
          <el-table-column label="质量等级" prop="qualityGrade" width="100" align="center">
            <template #default="{ row }">
              <el-tag v-if="row.qualityGrade" size="small">{{ row.qualityGrade }}</el-tag>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="备注" prop="remarks" min-width="120" show-overflow-tooltip />
          <el-table-column
            label="操作"
            width="120"
            align="center"
            fixed="right"
          >
            <template #default="{ row }">
              <el-button
                type="primary"
                link
                size="small"
                @click="handleEditDetail(row)"
                v-hasPermi="['saltprocess:inventory:edit']"
              >
                编辑
              </el-button>
              <el-button
                type="danger"
                link
                size="small"
                @click="handleDeleteDetail(row)"
                v-hasPermi="['saltprocess:inventory:remove']"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>

    <!-- 编辑物料对话框 -->
    <el-dialog title="编辑物料" v-model="editDialog.visible" width="800px" append-to-body>
      <inventory-material-form
        v-if="editDialog.visible"
        :material-id="materialId"
        @success="handleEditSuccess"
        @cancel="editDialog.visible = false"
      />
    </el-dialog>

    <!-- 添加/编辑明细对话框 -->
    <el-dialog 
      :title="detailDialog.title" 
      v-model="detailDialog.visible" 
      width="600px" 
      append-to-body
    >
      <inventory-detail-form
        v-if="detailDialog.visible"
        :material-id="materialId"
        :detail-data="detailDialog.data"
        @success="handleDetailSuccess"
        @cancel="detailDialog.visible = false"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Edit, Plus } from '@element-plus/icons-vue';
import { 
  getInventoryMaterial, 
  getInventoryDetails,
  deleteInventoryDetail
} from '@/api/erp/saltprocess/inventory';
import type { 
  InventoryMaterialVO, 
  InventoryDetailVO 
} from '@/api/erp/saltprocess/inventory/types';
import InventoryMaterialForm from './InventoryMaterialForm.vue';
import InventoryDetailForm from './InventoryDetailForm.vue';

// Props & Emits
interface Props {
  materialId: string;
}

interface Emits {
  (e: 'close'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 响应式数据
const loading = ref(false);
const materialDetail = ref<InventoryMaterialVO>({} as InventoryMaterialVO);
const stockDetails = ref<InventoryDetailVO[]>([]);

// 对话框状态
const editDialog = reactive({
  visible: false
});

const detailDialog = reactive({
  visible: false,
  title: '',
  data: null as InventoryDetailVO | null
});

// 生命周期
onMounted(() => {
  loadMaterialDetail();
  loadStockDetails();
});

// 方法
const loadMaterialDetail = async () => {
  loading.value = true;
  try {
    const { data } = await getInventoryMaterial(props.materialId);
    materialDetail.value = data;
  } catch (error) {
    console.error('加载物料详情失败:', error);
    ElMessage.error('加载物料详情失败');
  } finally {
    loading.value = false;
  }
};

const loadStockDetails = async () => {
  try {
    const { data } = await getInventoryDetails(props.materialId);
    stockDetails.value = data;
  } catch (error) {
    console.error('加载库存明细失败:', error);
    ElMessage.error('加载库存明细失败');
  }
};

const handleEdit = () => {
  editDialog.visible = true;
};

const handleEditSuccess = () => {
  editDialog.visible = false;
  loadMaterialDetail();
  ElMessage.success('编辑成功');
};

const handleAddDetail = () => {
  detailDialog.title = '添加库存明细';
  detailDialog.data = null;
  detailDialog.visible = true;
};

const handleEditDetail = (row: InventoryDetailVO) => {
  detailDialog.title = '编辑库存明细';
  detailDialog.data = row;
  detailDialog.visible = true;
};

const handleDetailSuccess = () => {
  detailDialog.visible = false;
  loadStockDetails();
  loadMaterialDetail(); // 重新加载物料信息以更新库存数量
  ElMessage.success('操作成功');
};

const handleDeleteDetail = async (row: InventoryDetailVO) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除批次"${row.batchNo}"的库存明细吗？`,
      '确认删除',
      { type: 'warning' }
    );
    
    await deleteInventoryDetail(row.id);
    ElMessage.success('删除成功');
    loadStockDetails();
    loadMaterialDetail();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败');
    }
  }
};

// 工具方法
const getMaterialTypeTag = (type: string) => {
  const tagMap: Record<string, string> = {
    'RAW_MATERIAL': 'primary',
    'FINISHED_PRODUCT': 'success',
    'SEMI_FINISHED': 'warning',
    'AUXILIARY': 'info'
  };
  return tagMap[type] || 'info';
};

const getMaterialTypeText = (type: string) => {
  const textMap: Record<string, string> = {
    'RAW_MATERIAL': '原料',
    'FINISHED_PRODUCT': '成品',
    'SEMI_FINISHED': '半成品',
    'AUXILIARY': '辅料'
  };
  return textMap[type] || '未知';
};

const getStockStatusTag = (status: string) => {
  const tagMap: Record<string, string> = {
    'NORMAL': 'success',
    'LOW_STOCK': 'warning',
    'OUT_OF_STOCK': 'danger',
    'OVERSTOCK': 'info'
  };
  return tagMap[status] || 'info';
};

const getStockStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    'NORMAL': '正常',
    'LOW_STOCK': '库存不足',
    'OUT_OF_STOCK': '缺货',
    'OVERSTOCK': '库存过多'
  };
  return textMap[status] || '未知';
};
</script>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'InventoryMaterialDetail'
});
</script>

<style scoped lang="scss">
.inventory-material-detail {
  .info-card,
  .stock-card,
  .details-card {
    margin-bottom: 16px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }

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

  .stock-item {
    text-align: center;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 8px;

    .stock-label {
      font-size: 14px;
      color: #6c757d;
      margin-bottom: 8px;
    }

    .stock-value {
      font-size: 20px;
      font-weight: 600;
      color: #2c3e50;
    }
  }
}
</style>
