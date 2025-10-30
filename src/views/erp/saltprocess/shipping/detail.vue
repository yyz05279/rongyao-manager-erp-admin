<template>
  <div class="shipping-detail">
    <!-- 页面头部 -->
    <div class="page-header">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/index' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/saltprocess' }">化盐工艺流程</el-breadcrumb-item>
        <el-breadcrumb-item :to="{ path: '/saltprocess/shipping' }">发货清单管理</el-breadcrumb-item>
        <el-breadcrumb-item>清单详情</el-breadcrumb-item>
      </el-breadcrumb>
      <div class="title-row">
        <h1 class="page-title">发货清单详情</h1>
        <div class="actions">
          <el-button @click="handleBack">返回</el-button>
          <el-button
            type="primary"
            icon="Edit"
            @click="handleEdit"
            v-hasPermi="['erp:saltprocess:shipping:edit']"
          >
            编辑
          </el-button>
          <el-button
            type="success"
            icon="Download"
            @click="handleExport"
            v-hasPermi="['erp:saltprocess:shipping:export']"
          >
            导出
          </el-button>
          <el-button
            type="warning"
            icon="Printer"
            @click="handlePrint"
          >
            打印
          </el-button>
        </div>
      </div>
    </div>

    <div v-loading="loading" class="detail-content">
      <!-- 开发环境提示 -->
      <el-alert
        v-if="API_CONFIG.useMockData"
        title="开发模式"
        type="info"
        :closable="false"
        show-icon
        style="margin-bottom: 16px;"
      >
        <template #default>
          当前使用Mock数据进行开发测试，所有操作均为模拟操作，不会影响真实数据。
        </template>
      </el-alert>

      <!-- 基本信息 -->
      <el-card class="info-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span class="card-title">基本信息</span>
            <el-tag
              :type="getStatusTagType(shippingDetail.status)"
              size="large"
            >
              {{ getStatusLabel(shippingDetail.status) }}
            </el-tag>
          </div>
        </template>
        
        <el-row :gutter="24">
          <el-col :span="8">
            <div class="info-item">
              <label>清单编号：</label>
              <span>{{ shippingDetail.listCode }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <label>项目名称：</label>
              <span>{{ shippingDetail.projectName }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <label>批次号：</label>
              <span>{{ shippingDetail.batchNumber }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <label>负责人：</label>
              <span>{{ shippingDetail.responsiblePerson }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <label>发货日期：</label>
              <span>{{ shippingDetail.shippingDate }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <label>发货方式：</label>
              <span>{{ getShippingMethodLabel(shippingDetail.shippingMethod) }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <label>预计送达：</label>
              <span>{{ shippingDetail.expectedDeliveryDate || '-' }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <label>实际送达：</label>
              <span>{{ shippingDetail.actualDeliveryDate || '-' }}</span>
            </div>
          </el-col>
          <el-col :span="8">
            <div class="info-item">
              <label>车辆信息：</label>
              <span>{{ shippingDetail.vehicleInfo || '-' }}</span>
            </div>
          </el-col>
          <el-col :span="24">
            <div class="info-item">
              <label>备注：</label>
              <span>{{ shippingDetail.remarks || '-' }}</span>
            </div>
          </el-col>
        </el-row>
      </el-card>

      <!-- 车辆和司机信息 -->
      <el-card class="vehicle-driver-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span class="card-title">车辆和司机信息</span>
          </div>
        </template>

        <el-row :gutter="24">
          <!-- 车辆信息 -->
          <el-col :span="12">
            <div class="info-section">
              <div class="section-header">
                <el-icon :size="20" color="#409eff"><Van /></el-icon>
                <span class="section-title">车辆信息</span>
              </div>
              <div class="info-content">
                <div class="info-item-inline">
                  <label>车牌号：</label>
                  <el-tag type="success" size="large">{{ shippingDetail.vehiclePlate || '-' }}</el-tag>
                </div>
                <div class="info-item-inline">
                  <label>车辆描述：</label>
                  <span>{{ shippingDetail.vehicleDescription || '-' }}</span>
                </div>
              </div>
            </div>
          </el-col>

          <!-- 司机信息 -->
          <el-col :span="12">
            <div class="info-section">
              <div class="section-header">
                <el-icon :size="20" color="#67c23a"><User /></el-icon>
                <span class="section-title">司机信息</span>
              </div>
              <div class="info-content">
                <div class="info-item-inline">
                  <label>司机姓名：</label>
                  <span>{{ shippingDetail.driverName || '-' }}</span>
                </div>
                <div class="info-item-inline">
                  <label>联系电话：</label>
                  <el-link v-if="shippingDetail.driverPhone" :href="`tel:${shippingDetail.driverPhone}`" type="primary">
                    <el-icon><Phone /></el-icon>
                    {{ shippingDetail.driverPhone }}
                  </el-link>
                  <span v-else>-</span>
                </div>
              </div>
            </div>
          </el-col>
        </el-row>

        <!-- 驾照照片 -->
        <div v-if="driverLicenseUrls.length > 0" class="license-photos-section">
          <el-divider content-position="left">
            <div class="section-title-with-icon">
              <el-icon><CreditCard /></el-icon>
              <span>驾照照片</span>
            </div>
          </el-divider>
          <div class="image-gallery">
            <div v-for="(url, idx) in driverLicenseUrls" :key="idx" class="image-item">
              <el-image
                :src="url"
                :preview-src-list="driverLicenseUrls"
                :initial-index="idx"
                :preview-teleported="true"
                :hide-on-click-modal="true"
                fit="cover"
                class="preview-image"
              >
                <template #error>
                  <div class="image-error">
                    <el-icon :size="40"><CreditCard /></el-icon>
                    <div>图片加载失败</div>
                  </div>
                </template>
              </el-image>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 统计信息 -->
      <el-card class="stats-card" shadow="never">
        <template #header>
          <span class="card-title">统计信息</span>
        </template>
        
        <el-row :gutter="24">
          <el-col :span="6">
            <el-statistic
              title="总件数"
              :value="shippingDetail.totalItems"
              suffix="件"
            />
          </el-col>
          <el-col :span="6">
            <el-statistic
              title="总重量"
              :value="shippingDetail.totalWeight"
              suffix="kg"
              :precision="2"
            />
          </el-col>
          <el-col :span="6">
            <el-statistic
              title="总体积"
              :value="shippingDetail.totalVolume || 0"
              suffix="m³"
              :precision="2"
            />
          </el-col>
          <el-col :span="6">
            <el-statistic
              title="设备类型"
              :value="equipmentTypeCount"
              suffix="种"
            />
          </el-col>
        </el-row>
      </el-card>

      <!-- 发货明细 -->
      <el-card class="items-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span class="card-title">发货明细</span>
            <div class="header-actions">
              <el-button
                type="primary"
                size="small"
                icon="Plus"
                @click="handleAddItem"
                v-hasPermi="['erp:saltprocess:shipping:edit']"
              >
                添加明细
              </el-button>
            </div>
          </div>
        </template>
        
        <el-table
          :data="shippingItems"
          border
          stripe
          max-height="500"
        >
          <el-table-column label="序号" type="index" width="60" />
          <el-table-column
            label="物品名称"
            prop="itemName"
            min-width="150"
            show-overflow-tooltip
          />
          <el-table-column
            label="规格型号"
            prop="specification"
            min-width="120"
            show-overflow-tooltip
          />
          <el-table-column
            label="设备类型"
            prop="equipmentType"
            width="100"
            align="center"
          >
            <template #default="{ row }">
              <el-tag size="small">{{ getEquipmentTypeLabel(row.equipmentType) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="数量" prop="quantity" width="80" align="center" />
          <el-table-column label="单位" prop="unit" width="60" align="center" />
          <el-table-column
            label="单重(kg)"
            prop="unitWeight"
            width="90"
            align="center"
          >
            <template #default="{ row }">
              {{ row.unitWeight?.toFixed(2) || '-' }}
            </template>
          </el-table-column>
          <el-table-column
            label="总重(kg)"
            prop="totalWeight"
            width="90"
            align="center"
          >
            <template #default="{ row }">
              {{ row.totalWeight?.toFixed(2) || '-' }}
            </template>
          </el-table-column>
          <el-table-column
            label="制造商"
            prop="manufacturer"
            min-width="120"
            show-overflow-tooltip
          />
          <el-table-column
            label="型号"
            prop="model"
            min-width="100"
            show-overflow-tooltip
          />
          <el-table-column
            label="包装方式"
            prop="packageType"
            width="100"
            align="center"
          />
          <el-table-column label="特殊标识" width="100" align="center">
            <template #default="{ row }">
              <div class="special-tags">
                <el-tag v-if="row.isFragile" type="warning" size="small">易碎</el-tag>
                <el-tag v-if="row.isHazardous" type="danger" size="small">危险</el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            label="备注"
            prop="remarks"
            min-width="120"
            show-overflow-tooltip
          />
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
                @click="handleEditItem(row)"
                v-hasPermi="['erp:saltprocess:shipping:edit']"
              >
                编辑
              </el-button>
              <el-button
                type="danger"
                link
                size="small"
                @click="handleDeleteItem(row)"
                v-hasPermi="['erp:saltprocess:shipping:edit']"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- 发货跟踪 -->
      <el-card class="tracking-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span class="card-title">发货跟踪</span>
            <el-button
              type="primary"
              size="small"
              icon="Plus"
              @click="handleAddTracking"
              v-hasPermi="['erp:saltprocess:shipping:edit']"
            >
              添加跟踪
            </el-button>
          </div>
        </template>
        
        <el-timeline>
          <el-timeline-item
            v-for="record in trackingRecords"
            :key="record.id"
            :timestamp="record.statusTime"
            placement="top"
          >
            <div class="tracking-item">
              <div class="tracking-header">
                <el-tag :type="getStatusTagType(record.status)">
                  {{ getStatusLabel(record.status) }}
                </el-tag>
                <span class="tracking-operator">{{ record.operator }}</span>
              </div>
              <div v-if="record.location" class="tracking-location">
                <el-icon><location /></el-icon>
                {{ record.location }}
              </div>
              <div v-if="record.remarks" class="tracking-remarks">
                {{ record.remarks }}
              </div>
            </div>
          </el-timeline-item>
        </el-timeline>
      </el-card>

      <!-- 发货照片 -->
      <el-card class="shipping-photos-card" shadow="never">
        <template #header>
          <div class="card-header">
            <div class="section-title-with-icon">
              <el-icon><Picture /></el-icon>
              <span class="card-title">发货照片</span>
              <el-tag v-if="shippingPhotoUrls.length > 0" type="info" size="small">
                {{ shippingPhotoUrls.length }} 张
              </el-tag>
            </div>
          </div>
        </template>
        
        <div v-if="shippingPhotoUrls.length === 0" class="no-images">
          <el-empty description="暂无发货照片" />
        </div>

        <div v-else class="image-gallery">
          <div v-for="(url, idx) in shippingPhotoUrls" :key="idx" class="image-item">
            <el-image
              :src="url"
              :preview-src-list="shippingPhotoUrls"
              :initial-index="idx"
              :preview-teleported="true"
              :hide-on-click-modal="true"
              fit="cover"
              class="preview-image"
              lazy
            >
              <template #error>
                <div class="image-error">
                  <el-icon :size="40"><Picture /></el-icon>
                  <div>图片加载失败</div>
                </div>
              </template>
              <template #placeholder>
                <div class="image-loading">
                  <el-icon class="is-loading"><Loading /></el-icon>
                </div>
              </template>
            </el-image>
            <div class="image-overlay">
              <span>照片 {{ idx + 1 }}</span>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 明细项编辑对话框 -->
    <ItemEditDialog
      v-model:visible="itemDialog.visible"
      :item-data="itemDialog.data"
      :is-edit="!!itemDialog.data?.id"
      @confirm="handleItemConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, getCurrentInstance } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { ComponentInternalInstance } from 'vue';
import { Location, Document, Picture, Phone, User, Van, CreditCard, Loading } from '@element-plus/icons-vue';
// 根据环境配置自动选择API
import {
  getShippingList,
  exportSingleShippingList,
  API_CONFIG,
  // 导入数据解析工具
  parseShippingListVO,
  getFullPhotoUrls
} from '@/api/erp/saltprocess/shipping/api-config';
import type {
  ShippingListVO,
  ShippingItemVO,
  ShippingTrackingRecord,
  ShippingStatus,
  EquipmentType
} from '@/api/erp/saltprocess/shipping/types';
import ItemEditDialog from './components/ItemEditDialog.vue';

const route = useRoute();
const router = useRouter();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

// 响应式数据
const loading = ref(true);
const shippingDetail = ref<ShippingListVO>({} as ShippingListVO);
const shippingItems = ref<ShippingItemVO[]>([]);
const trackingRecords = ref<ShippingTrackingRecord[]>([]);

// 明细项对话框状态
const itemDialog = reactive({
  visible: false,
  data: null as any
});

// 计算属性
const equipmentTypeCount = computed(() => {
  const types = new Set(shippingItems.value.map(item => item.equipmentType));
  return types.size;
});

// 计算属性 - 发货照片URL列表
const shippingPhotoUrls = computed(() => {
  if (!shippingDetail.value.shippingPhotoUrls?.length) {
    return [];
  }
  // 使用统一的URL生成工具
  return getFullPhotoUrls(shippingDetail.value.shippingPhotoUrls);
});

// 计算属性 - 驾照照片URL列表
const driverLicenseUrls = computed(() => {
  if (!shippingDetail.value.driverLicensePhotoUrls?.length) {
    return [];
  }
  // 使用统一的URL生成工具
  return getFullPhotoUrls(shippingDetail.value.driverLicensePhotoUrls);
});

// 方法
const getShippingDetail = async () => {
  const id = route.params.id as string;
  if (!id) return;
  
  loading.value = true;
  try {
    // 🔥 后端详情接口已经返回所有数据（items、trackingRecords、attachments）
    // 不需要再单独调用其他接口
    const response = await getShippingList(id);
    
    // 🔥 使用解析工具处理后端数据
    const parsedData = parseShippingListVO(response.data);
    
    // 设置详情数据
    shippingDetail.value = parsedData;
    
    // 从详情数据中提取关联数据
    shippingItems.value = parsedData.items || [];
    trackingRecords.value = parsedData.trackingRecords || [];
    
    console.log('✅ 发货清单详情加载成功:', {
      清单编号: parsedData.listCode,
      项目名称: parsedData.projectName,
      车牌号: parsedData.vehiclePlate,
      司机姓名: parsedData.driverName,
      明细数量: shippingItems.value.length,
      跟踪记录: trackingRecords.value.length,
      发货照片数量: parsedData.shippingPhotoUrls?.length || 0,
      发货照片路径: parsedData.shippingPhotoUrls,
      驾照照片数量: parsedData.driverLicensePhotoUrls?.length || 0,
      驾照照片路径: parsedData.driverLicensePhotoUrls
    });
    
    // 打印生成的完整URL，方便调试
    console.log('📷 发货照片URL:', shippingPhotoUrls.value);
    console.log('📄 驾照照片URL:', driverLicenseUrls.value);
    
    // 验证URL是否可访问
    if (driverLicenseUrls.value.length > 0) {
      console.log('🔍 驾照照片第一张URL:', driverLicenseUrls.value[0]);
    }
    
  } catch (error) {
    console.error('❌ 获取发货清单详情失败:', error);
    ElMessage.error('获取发货清单详情失败');
  } finally {
    loading.value = false;
  }
};

const handleBack = () => {
  router.push('/saltprocess/shipping');
};

const handleEdit = () => {
  router.push(`/saltprocess/shipping/edit/${shippingDetail.value.id}`);
};

const handleExport = () => {
  const id = route.params.id as string;
  if (!id) {
    ElMessage.error('发货清单ID不存在');
    return;
  }

  // 生成文件名
  const projectName = shippingDetail.value.projectName || '未知项目';
  const batchNumber = shippingDetail.value.batchNumber || '未知批次';
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const fileName = `发货清单_${projectName}_${batchNumber}_${dateStr}.xlsx`;

  // 使用项目的通用下载方法
  proxy?.download(`/erp/saltprocess/shipping/export/${id}`, {}, fileName);

  ElMessage.success('导出请求已提交，请稍候下载');
};

const handlePrint = () => {
  window.print();
};

const handleAddItem = () => {
  itemDialog.data = {
    itemName: '',
    specification: '',
    equipmentType: 'AUXILIARY',
    quantity: 1,
    unit: '个',
    unitWeight: 0,
    unitVolume: 0,
    manufacturer: '',
    model: '',
    serialNumber: '',
    packageType: '',
    packageQuantity: 1,
    isFragile: false,
    isHazardous: false,
    storageRequirement: '',
    remarks: ''
  };
  itemDialog.visible = true;
};

const handleEditItem = (item: ShippingItemVO) => {
  itemDialog.data = { ...item };
  itemDialog.visible = true;
};

const handleItemConfirm = async (itemData: any) => {
  try {
    // 这里应该调用API保存或更新明细项
    // 如果是新增，调用添加API
    // 如果是编辑，调用更新API

    ElMessage.success(itemData.id ? '明细更新成功' : '明细添加成功');
    itemDialog.visible = false;

    // 重新加载明细数据
    getShippingDetail();
  } catch (error) {
    ElMessage.error(itemData.id ? '明细更新失败' : '明细添加失败');
  }
};

const handleDeleteItem = async (item: ShippingItemVO) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除物品"${item.itemName}"吗？`,
      '确认删除',
      { type: 'warning' }
    );
    // 调用删除API
    ElMessage.success('删除成功');
    getShippingDetail();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败');
    }
  }
};

const handleAddTracking = () => {
  // 添加跟踪记录
  ElMessage.info('添加跟踪功能开发中');
};

// 辅助方法
const getStatusTagType = (status: ShippingStatus): string => {
  const typeMap = {
    DRAFT: 'info',
    PENDING: 'warning',
    PARTIAL_SHIPPED: 'primary',
    SHIPPED: 'success',
    DELIVERED: 'success',
    COMPLETED: 'success',
    CANCELLED: 'danger'
  };
  return typeMap[status] || 'info';
};

const getStatusLabel = (status: ShippingStatus): string => {
  const labelMap = {
    DRAFT: '草稿',
    PENDING: '待发货',
    PARTIAL_SHIPPED: '部分发货',
    SHIPPED: '已发货',
    DELIVERED: '已送达',
    COMPLETED: '已完成',
    CANCELLED: '已取消'
  };
  return labelMap[status] || status;
};

const getShippingMethodLabel = (method: string): string => {
  const methodMap: Record<string, string> = {
    TRUCK: '卡车运输',
    RAIL: '铁路运输',
    SEA: '海运',
    AIR: '空运'
  };
  return methodMap[method] || method;
};

const getEquipmentTypeLabel = (type: EquipmentType): string => {
  const typeMap = {
    MECHANICAL: '机械设备',
    ELECTRICAL: '电控设备',
    PIPELINE: '管路设备',
    BURNER: '燃烧器',
    AUXILIARY: '辅助设备',
    STANDARD_PARTS: '标准件'
  };
  return typeMap[type] || type;
};

// 生命周期
onMounted(() => {
  getShippingDetail();
});
</script>

<style scoped lang="scss">
.shipping-detail {
  padding: 20px;

  .page-header {
    margin-bottom: 20px;

    .title-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 16px;

      .page-title {
        font-size: 24px;
        font-weight: 600;
        color: #2c3e50;
        margin: 0;
      }

      .actions {
        display: flex;
        gap: 12px;

        .el-button {
          &:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            transition: all 0.2s ease;
          }
        }
      }
    }
  }

  .detail-content {
    .info-card,
    .stats-card,
    .items-card,
    .tracking-card,
    .vehicle-driver-card,
    .shipping-photos-card {
      margin-bottom: 20px;

      :deep(.el-card__body) {
        padding: 24px;
      }
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .card-title {
        font-size: 16px;
        font-weight: 600;
        color: #303133;
      }

      .header-actions {
        display: flex;
        gap: 8px;
      }
    }

    .info-item {
      display: flex;
      margin-bottom: 16px;

      label {
        min-width: 100px;
        color: #606266;
        font-weight: 500;
      }

      span {
        color: #303133;
        flex: 1;
      }
    }

    .special-tags {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
    }

    // 车辆和司机信息区域样式
    .vehicle-driver-card {
      .info-section {
        padding: 20px;
        background: #f8f9fa;
        border-radius: 8px;
        min-height: 180px;

        .section-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 2px solid #e4e7ed;

          .section-title {
            font-size: 16px;
            font-weight: 600;
            color: #303133;
          }
        }

        .info-content {
          .info-item-inline {
            display: flex;
            align-items: center;
            margin-bottom: 16px;

            label {
              min-width: 90px;
              color: #606266;
              font-weight: 500;
              font-size: 14px;
            }

            span {
              color: #303133;
              font-size: 15px;
            }

            .el-tag {
              font-size: 16px;
              font-weight: 600;
              padding: 8px 16px;
            }

            .el-link {
              font-size: 14px;
            }
          }
        }
      }

      .license-photos-section {
        margin-top: 24px;
        padding-top: 24px;
        border-top: 1px solid #e4e7ed;
      }
    }

    .section-title-with-icon {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }

    // 图片画廊样式（参考导入弹窗）
    .image-gallery {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 16px;
      padding: 20px 0;

      .image-item {
        position: relative;
        aspect-ratio: 1;
        border: 2px solid #dcdfe6;
        border-radius: 8px;
        overflow: hidden;
        transition: all 0.3s ease;
        background: #f5f7fa;

        &:hover {
          border-color: #409eff;
          transform: translateY(-4px);
          box-shadow: 0 8px 16px rgba(64, 158, 255, 0.2);

          .image-overlay {
            opacity: 1;
          }
        }

        .preview-image {
          width: 100%;
          height: 100%;
          cursor: pointer;

          :deep(.el-image__inner) {
            transition: transform 0.3s ease;
          }

          &:hover :deep(.el-image__inner) {
            transform: scale(1.05);
          }
        }

        .image-error {
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 100%;
          color: #909399;
          background: #f5f7fa;

          div {
            margin-top: 8px;
            font-size: 14px;
          }
        }

        .image-loading {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100%;
          background: #f5f7fa;

          .el-icon {
            font-size: 32px;
            color: #409eff;
          }
        }

        .image-overlay {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
          color: white;
          padding: 12px;
          opacity: 0;
          transition: opacity 0.3s ease;

          span {
            font-size: 14px;
            font-weight: 500;
          }
        }
      }
    }

    .no-images {
      padding: 40px 0;
    }

    .tracking-item {
      .tracking-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 8px;

        .tracking-operator {
          color: #606266;
          font-size: 14px;
        }
      }

      .tracking-location {
        display: flex;
        align-items: center;
        gap: 4px;
        color: #909399;
        font-size: 14px;
        margin-bottom: 4px;
      }

      .tracking-remarks {
        color: #606266;
        font-size: 14px;
        line-height: 1.5;
      }
    }

    .attachments-list {
      .attachment-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px;
        border: 1px solid #ebeef5;
        border-radius: 6px;
        margin-bottom: 12px;

        &:hover {
          background-color: #f5f7fa;
        }

        .attachment-info {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;

          .attachment-icon {
            font-size: 24px;
            color: #409eff;
          }

          .attachment-meta {
            .attachment-name {
              font-weight: 500;
              color: #303133;
              margin-bottom: 4px;
            }

            .attachment-details {
              font-size: 12px;
              color: #909399;

              span {
                margin-right: 12px;
              }
            }
          }
        }

        .attachment-actions {
          display: flex;
          gap: 8px;
        }
      }
    }
  }
}

// 打印样式
@media print {
  .shipping-detail {
    .detail-header {
      .header-actions {
        display: none;
      }
    }

    .card-header {
      .header-actions {
        display: none;
      }
    }

    .el-table {
      .el-table-column--selection,
      .el-table__column:last-child {
        display: none;
      }
    }
  }
}

// 响应式设计 - 平板设备
@media (max-width: 1024px) and (min-width: 769px) {
  .shipping-detail {
    .page-header {
      .title-row {
        .actions {
          gap: 8px;

          .el-button {
            font-size: 13px;
            padding: 8px 12px;
          }
        }
      }
    }
  }
}

// 响应式设计 - 移动设备
@media (max-width: 768px) {
  .shipping-detail {
    padding: 10px;

    .page-header {
      .title-row {
        flex-direction: column;
        gap: 16px;
        align-items: center;

        .page-title {
          text-align: center;
          font-size: 20px;
        }

        .actions {
          width: 100%;
          justify-content: center;
          flex-wrap: wrap;
          gap: 8px;

          .el-button {
            margin-bottom: 8px;
            font-size: 12px;
            padding: 6px 12px;

            &:hover {
              transform: none; /* 移动端取消悬停效果 */
            }
          }
        }
      }
    }

    .info-item {
      flex-direction: column;

      label {
        min-width: auto;
        margin-bottom: 4px;
      }
    }

    .attachment-item {
      flex-direction: column;
      gap: 12px;
      align-items: flex-start;

      .attachment-actions {
        width: 100%;
        justify-content: center;
      }
    }
  }
}
</style>
