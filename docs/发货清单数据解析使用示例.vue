<template>
  <div class="shipping-list-detail">
    <el-card class="box-card" v-loading="loading">
      <!-- 基本信息 -->
      <template #header>
        <div class="card-header">
          <span>发货清单详情</span>
          <el-tag :type="getStatusTagType(shippingList.status)" size="large">
            {{ shippingList.statusName }}
          </el-tag>
        </div>
      </template>

      <!-- 清单信息 -->
      <el-descriptions :column="2" border title="清单信息">
        <el-descriptions-item label="清单编号">
          {{ shippingList.listCode }}
        </el-descriptions-item>
        
        <el-descriptions-item label="项目名称">
          {{ shippingList.projectName }}
        </el-descriptions-item>
        
        <el-descriptions-item label="批次号">
          {{ shippingList.batchNumber }}
        </el-descriptions-item>
        
        <el-descriptions-item label="负责人">
          {{ shippingList.responsiblePerson }}
        </el-descriptions-item>
        
        <el-descriptions-item label="发货方式">
          {{ shippingList.shippingMethodName }}
        </el-descriptions-item>
        
        <el-descriptions-item label="发货日期">
          {{ shippingList.shippingDate }}
        </el-descriptions-item>
        
        <el-descriptions-item label="预计送达" v-if="shippingList.expectedDeliveryDate">
          {{ shippingList.expectedDeliveryDate }}
        </el-descriptions-item>
        
        <el-descriptions-item label="实际送达" v-if="shippingList.actualDeliveryDate">
          {{ shippingList.actualDeliveryDate }}
        </el-descriptions-item>
      </el-descriptions>

      <!-- 车辆信息 -->
      <el-descriptions :column="2" border title="车辆信息" style="margin-top: 20px">
        <el-descriptions-item label="车牌号">
          <el-tag type="primary">{{ shippingList.vehiclePlate }}</el-tag>
        </el-descriptions-item>
        
        <el-descriptions-item label="车辆描述">
          {{ shippingList.vehicleDescription }}
        </el-descriptions-item>
        
        <el-descriptions-item label="司机姓名">
          {{ shippingList.driverName }}
        </el-descriptions-item>
        
        <el-descriptions-item label="司机电话">
          <el-link :href="`tel:${shippingList.driverPhone}`">
            {{ shippingList.driverPhone }}
          </el-link>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 统计信息 -->
      <el-descriptions :column="3" border title="统计信息" style="margin-top: 20px">
        <el-descriptions-item label="总件数">
          <el-statistic :value="shippingList.totalItems" suffix="件" />
        </el-descriptions-item>
        
        <el-descriptions-item label="总重量">
          <el-statistic :value="formatWeight(shippingList.totalWeight)" />
        </el-descriptions-item>
        
        <el-descriptions-item label="总体积">
          <el-statistic :value="formatVolume(shippingList.totalVolume)" />
        </el-descriptions-item>
      </el-descriptions>

      <!-- 设备分类统计 -->
      <el-descriptions 
        v-if="hasEquipmentStats" 
        :column="3" 
        border 
        title="设备分类统计" 
        style="margin-top: 20px"
      >
        <el-descriptions-item label="机械设备" v-if="shippingList.mechanicalCount">
          {{ shippingList.mechanicalCount }} 台
        </el-descriptions-item>
        
        <el-descriptions-item label="电控设备" v-if="shippingList.electricalCount">
          {{ shippingList.electricalCount }} 台
        </el-descriptions-item>
        
        <el-descriptions-item label="管路设备" v-if="shippingList.pipelineCount">
          {{ shippingList.pipelineCount }} 台
        </el-descriptions-item>
        
        <el-descriptions-item label="易碎品" v-if="shippingList.fragileCount">
          <el-tag type="warning">{{ shippingList.fragileCount }} 件</el-tag>
        </el-descriptions-item>
        
        <el-descriptions-item label="危险品" v-if="shippingList.hazardousCount">
          <el-tag type="danger">{{ shippingList.hazardousCount }} 件</el-tag>
        </el-descriptions-item>
      </el-descriptions>

      <!-- 发货照片 -->
      <div v-if="shippingPhotoUrls.length > 0" style="margin-top: 20px">
        <el-divider content-position="left">
          <h3>发货照片 ({{ shippingPhotoUrls.length }})</h3>
        </el-divider>
        <div class="photo-gallery">
          <el-image
            v-for="(url, index) in shippingPhotoUrls"
            :key="index"
            :src="url"
            :preview-src-list="shippingPhotoUrls"
            :initial-index="index"
            fit="cover"
            class="photo-item"
          >
            <template #error>
              <div class="image-error">
                <el-icon><icon-picture /></el-icon>
              </div>
            </template>
          </el-image>
        </div>
      </div>

      <!-- 司机驾照 -->
      <div v-if="driverLicenseUrls.length > 0" style="margin-top: 20px">
        <el-divider content-position="left">
          <h3>司机驾照</h3>
        </el-divider>
        <div class="photo-gallery">
          <el-image
            v-for="(url, index) in driverLicenseUrls"
            :key="index"
            :src="url"
            :preview-src-list="driverLicenseUrls"
            :initial-index="index"
            fit="cover"
            class="photo-item"
          >
            <template #error>
              <div class="image-error">
                <el-icon><icon-picture /></el-icon>
              </div>
            </template>
          </el-image>
        </div>
      </div>

      <!-- 备注信息 -->
      <div v-if="shippingList.remarks" style="margin-top: 20px">
        <el-divider content-position="left">
          <h3>备注信息</h3>
        </el-divider>
        <el-alert 
          :title="shippingList.remarks" 
          type="info" 
          :closable="false"
          show-icon
        />
      </div>

      <!-- 操作按钮 -->
      <div style="margin-top: 20px; text-align: center">
        <el-space>
          <el-button 
            type="primary" 
            v-if="isShippingListEditable(shippingList.status)"
            @click="handleEdit"
          >
            编辑清单
          </el-button>
          
          <el-button 
            type="danger" 
            v-if="isShippingListDeletable(shippingList.status)"
            @click="handleDelete"
          >
            删除清单
          </el-button>
          
          <el-button @click="handleExport">
            导出清单
          </el-button>
          
          <el-button @click="handlePrint">
            打印清单
          </el-button>
        </el-space>
      </div>
    </el-card>

    <!-- 发货明细列表 -->
    <el-card class="box-card" style="margin-top: 20px" v-if="shippingList.items?.length">
      <template #header>
        <div class="card-header">
          <span>发货明细 ({{ shippingList.items.length }})</span>
        </div>
      </template>

      <el-table :data="shippingList.items" border stripe>
        <el-table-column type="index" label="序号" width="60" />
        
        <el-table-column prop="itemName" label="物品名称" min-width="150" />
        
        <el-table-column prop="specification" label="规格型号" min-width="120" />
        
        <el-table-column prop="equipmentType" label="设备类型" width="120">
          <template #default="{ row }">
            <el-tag>{{ getEquipmentTypeName(row.equipmentType) }}</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="quantity" label="数量" width="100" align="right">
          <template #default="{ row }">
            {{ row.quantity }} {{ row.unit }}
          </template>
        </el-table-column>
        
        <el-table-column prop="unitWeight" label="单重(kg)" width="100" align="right" />
        
        <el-table-column prop="totalWeight" label="总重(kg)" width="100" align="right" />
        
        <el-table-column label="标识" width="120" align="center">
          <template #default="{ row }">
            <el-tag v-if="row.isFragile" type="warning" size="small">易碎</el-tag>
            <el-tag v-if="row.isHazardous" type="danger" size="small">危险</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="remarks" label="备注" min-width="150" />
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts" name="ShippingListDetail">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Picture as IconPicture } from '@element-plus/icons-vue';

// 导入API和工具函数
import { 
  getShippingList,
  delShippingList,
  exportSingleShippingList,
  // 导入数据解析工具
  parseShippingListVO,
  formatWeight,
  formatVolume,
  getStatusTagType,
  getEquipmentTypeName,
  isShippingListEditable,
  isShippingListDeletable,
  getFullPhotoUrls
} from '@/api/erp/saltprocess/shipping';

import type { ShippingListVO } from '@/api/erp/saltprocess/shipping/types';

// 路由参数
const route = useRoute();
const shippingListId = ref<string>(route.params.id as string);

// 页面状态
const loading = ref(false);
const shippingList = ref<ShippingListVO>({} as ShippingListVO);

// 计算属性 - 发货照片URL列表
const shippingPhotoUrls = computed(() => {
  if (!shippingList.value.shippingPhotoUrls?.length) {
    return [];
  }
  return getFullPhotoUrls(shippingList.value.shippingPhotoUrls);
});

// 计算属性 - 驾照照片URL列表
const driverLicenseUrls = computed(() => {
  if (!shippingList.value.driverLicensePhotoUrls?.length) {
    return [];
  }
  return getFullPhotoUrls(shippingList.value.driverLicensePhotoUrls);
});

// 计算属性 - 是否有设备统计数据
const hasEquipmentStats = computed(() => {
  return Boolean(
    shippingList.value.mechanicalCount ||
    shippingList.value.electricalCount ||
    shippingList.value.pipelineCount ||
    shippingList.value.fragileCount ||
    shippingList.value.hazardousCount
  );
});

/**
 * 获取发货清单详情
 */
const getDetail = async () => {
  loading.value = true;
  try {
    const response = await getShippingList(shippingListId.value);
    
    // 🔥 关键：使用解析工具处理后端返回的数据
    shippingList.value = parseShippingListVO(response.data);
    
    console.log('解析后的发货清单数据:', shippingList.value);
    console.log('车牌号:', shippingList.value.vehiclePlate);
    console.log('司机姓名:', shippingList.value.driverName);
    console.log('发货照片数量:', shippingList.value.shippingPhotoUrls?.length);
    
  } catch (error) {
    console.error('获取发货清单详情失败:', error);
    ElMessage.error('获取发货清单详情失败');
  } finally {
    loading.value = false;
  }
};

/**
 * 编辑清单
 */
const handleEdit = () => {
  // 跳转到编辑页面
  console.log('编辑清单:', shippingList.value.id);
};

/**
 * 删除清单
 */
const handleDelete = async () => {
  try {
    await ElMessageBox.confirm('确认删除该发货清单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    });

    await delShippingList(shippingList.value.id!);
    ElMessage.success('删除成功');
    
    // 返回列表页
    // router.back();
    
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error);
      ElMessage.error('删除失败');
    }
  }
};

/**
 * 导出清单
 */
const handleExport = async () => {
  try {
    loading.value = true;
    const response = await exportSingleShippingList(shippingList.value.id!);
    
    // 创建下载链接
    const blob = new Blob([response.data], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${shippingList.value.listCode}_发货清单.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);
    
    ElMessage.success('导出成功');
  } catch (error) {
    console.error('导出失败:', error);
    ElMessage.error('导出失败');
  } finally {
    loading.value = false;
  }
};

/**
 * 打印清单
 */
const handlePrint = () => {
  window.print();
};

// 页面加载时获取数据
onMounted(() => {
  if (shippingListId.value) {
    getDetail();
  }
});
</script>

<style scoped lang="scss">
.shipping-list-detail {
  padding: 20px;
  
  .box-card {
    margin-bottom: 20px;
  }
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    span {
      font-size: 18px;
      font-weight: 600;
    }
  }
  
  .photo-gallery {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    
    .photo-item {
      width: 200px;
      height: 200px;
      border-radius: 4px;
      cursor: pointer;
      transition: transform 0.3s;
      
      &:hover {
        transform: scale(1.05);
      }
      
      .image-error {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
        background-color: #f5f7fa;
        color: #909399;
        font-size: 48px;
      }
    }
  }
}

// 打印样式
@media print {
  .el-button,
  .el-divider,
  .el-card__header {
    display: none !important;
  }
}
</style>

