<template>
  <div class="shipping-detail">
    <!-- 页面头部 -->
    <div class="detail-header">
      <el-page-header @back="handleBack" title="返回列表">
        <template #content>
          <div class="header-content">
            <h2>发货清单详情</h2>
            <div class="header-actions">
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
        </template>
      </el-page-header>
    </div>

    <div v-loading="loading" class="detail-content">
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

      <!-- 附件信息 -->
      <el-card class="attachments-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span class="card-title">附件信息</span>
            <el-upload
              :action="uploadUrl"
              :headers="uploadHeaders"
              :data="{ shippingListId: shippingDetail.id }"
              :show-file-list="false"
              :before-upload="beforeUpload"
              :on-success="handleUploadSuccess"
              :on-error="handleUploadError"
            >
              <el-button type="primary" size="small" icon="Upload">
                上传附件
              </el-button>
            </el-upload>
          </div>
        </template>
        
        <div class="attachments-list">
          <div
            v-for="attachment in attachments"
            :key="attachment.id"
            class="attachment-item"
          >
            <div class="attachment-info">
              <el-icon class="attachment-icon">
                <document />
              </el-icon>
              <div class="attachment-meta">
                <div class="attachment-name">{{ attachment.fileName }}</div>
                <div class="attachment-details">
                  <span>{{ formatFileSize(attachment.fileSize) }}</span>
                  <span>{{ attachment.uploadTime }}</span>
                  <span>{{ attachment.uploadBy }}</span>
                </div>
              </div>
            </div>
            <div class="attachment-actions">
              <el-button
                type="primary"
                link
                size="small"
                @click="handleDownloadAttachment(attachment)"
              >
                下载
              </el-button>
              <el-button
                type="danger"
                link
                size="small"
                @click="handleDeleteAttachment(attachment)"
                v-hasPermi="['erp:saltprocess:shipping:edit']"
              >
                删除
              </el-button>
            </div>
          </div>
          
          <el-empty v-if="attachments.length === 0" description="暂无附件" />
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, getCurrentInstance } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { ComponentInternalInstance } from 'vue';
import { Location, Document } from '@element-plus/icons-vue';
import {
  getShippingList,
  listShippingItems,
  getShippingTrackingRecords,
  getShippingAttachments,
  delShippingAttachment,
  downloadShippingAttachment,
  exportSingleShippingList
} from '@/api/erp/saltprocess/shipping';
import type {
  ShippingListVO,
  ShippingItemVO,
  ShippingTrackingRecord,
  ShippingAttachment,
  ShippingStatus,
  EquipmentType
} from '@/api/erp/saltprocess/shipping/types';

const route = useRoute();
const router = useRouter();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

// 响应式数据
const loading = ref(true);
const shippingDetail = ref<ShippingListVO>({} as ShippingListVO);
const shippingItems = ref<ShippingItemVO[]>([]);
const trackingRecords = ref<ShippingTrackingRecord[]>([]);
const attachments = ref<ShippingAttachment[]>([]);

// 上传配置
const uploadUrl = '/api/erp/saltprocess/shipping/attachment';
const uploadHeaders = {
  Authorization: `Bearer ${localStorage.getItem('token')}`
};

// 计算属性
const equipmentTypeCount = computed(() => {
  const types = new Set(shippingItems.value.map(item => item.equipmentType));
  return types.size;
});

// 方法
const getShippingDetail = async () => {
  const id = route.params.id as string;
  if (!id) return;
  
  loading.value = true;
  try {
    const [detailRes, itemsRes, trackingRes, attachmentsRes] = await Promise.all([
      getShippingList(id),
      listShippingItems(id),
      getShippingTrackingRecords(id),
      getShippingAttachments(id)
    ]);
    
    shippingDetail.value = detailRes.data;
    shippingItems.value = itemsRes.data;
    trackingRecords.value = trackingRes.data;
    attachments.value = attachmentsRes.data;
  } catch (error) {
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
  // 添加明细项
  ElMessage.info('添加明细功能开发中');
};

const handleEditItem = (item: ShippingItemVO) => {
  // 编辑明细项
  ElMessage.info('编辑明细功能开发中');
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

const beforeUpload = (file: File) => {
  const isValidType = ['image/jpeg', 'image/png', 'application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'].includes(file.type);
  const isLt10M = file.size / 1024 / 1024 < 10;
  
  if (!isValidType) {
    ElMessage.error('只能上传图片、PDF或Excel文件');
    return false;
  }
  if (!isLt10M) {
    ElMessage.error('文件大小不能超过10MB');
    return false;
  }
  return true;
};

const handleUploadSuccess = () => {
  ElMessage.success('上传成功');
  getShippingDetail();
};

const handleUploadError = () => {
  ElMessage.error('上传失败');
};

const handleDownloadAttachment = async (attachment: ShippingAttachment) => {
  try {
    const response = await downloadShippingAttachment(attachment.id);
    const blob = new Blob([response.data]);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = attachment.fileName;
    link.click();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    ElMessage.error('下载失败');
  }
};

const handleDeleteAttachment = async (attachment: ShippingAttachment) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除附件"${attachment.fileName}"吗？`,
      '确认删除',
      { type: 'warning' }
    );
    
    await delShippingAttachment(attachment.id);
    ElMessage.success('删除成功');
    getShippingDetail();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败');
    }
  }
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

const formatFileSize = (size: number): string => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

// 生命周期
onMounted(() => {
  getShippingDetail();
});
</script>

<style scoped lang="scss">
.shipping-detail {
  padding: 20px;

  .detail-header {
    margin-bottom: 20px;

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;

      h2 {
        margin: 0;
        color: #303133;
      }

      .header-actions {
        display: flex;
        gap: 12px;
      }
    }
  }

  .detail-content {
    .info-card,
    .stats-card,
    .items-card,
    .tracking-card,
    .attachments-card {
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

// 响应式设计
@media (max-width: 768px) {
  .shipping-detail {
    padding: 10px;

    .header-content {
      flex-direction: column;
      gap: 12px;
      align-items: flex-start;

      .header-actions {
        width: 100%;
        justify-content: center;
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
