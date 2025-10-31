<template>
  <div class="shipping-form">
    <!-- 页面头部 -->
    <div class="form-header">
      <el-page-header @back="handleBack" title="返回列表">
        <template #content>
          <h2>{{ isEdit ? '编辑发货清单' : '新增发货清单' }}</h2>
        </template>
      </el-page-header>
    </div>

    <div v-loading="loading" class="form-content">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
        class="shipping-form-main"
      >
        <!-- 基本信息 -->
        <el-card class="form-card" shadow="never">
          <template #header>
            <span class="card-title">基本信息</span>
          </template>

          <el-row :gutter="24">
            <el-col :span="12">
              <el-form-item label="项目" prop="projectId">
                <el-select
                  v-model="formData.projectId"
                  placeholder="请选择项目"
                  filterable
                  style="width: 100%"
                  @change="handleProjectChange"
                >
                  <el-option
                    v-for="project in projectList"
                    :key="project.id"
                    :label="project.name"
                    :value="project.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="批次号" prop="batchNumber">
                <el-input
                  v-model="formData.batchNumber"
                  placeholder="请输入批次号，如：第一车"
                />
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="负责人" prop="responsiblePersonId">
                <el-select
                  v-model="formData.responsiblePersonId"
                  placeholder="请选择负责人"
                  filterable
                  style="width: 100%"
                >
                  <el-option
                    v-for="person in responsiblePersonList"
                    :key="person.id"
                    :label="person.name"
                    :value="person.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="发货日期" prop="shippingDate">
                <el-date-picker
                  v-model="formData.shippingDate"
                  type="date"
                  placeholder="请选择发货日期"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="预计送达日期">
                <el-date-picker
                  v-model="formData.expectedDeliveryDate"
                  type="date"
                  placeholder="请选择预计送达日期"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="发货方式" prop="shippingMethod">
                <el-select
                  v-model="formData.shippingMethod"
                  placeholder="请选择发货方式"
                  style="width: 100%"
                >
                  <el-option label="卡车运输" value="TRUCK" />
                  <el-option label="铁路运输" value="RAIL" />
                  <el-option label="海运" value="SEA" />
                  <el-option label="空运" value="AIR" />
                </el-select>
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="车辆信息">
                <el-input
                  v-model="formData.vehicleInfo"
                  placeholder="请输入车辆信息"
                />
              </el-form-item>
            </el-col>

            <el-col :span="12">
              <el-form-item label="司机信息">
                <el-input
                  v-model="formData.driverInfo"
                  placeholder="请输入司机信息"
                />
              </el-form-item>
            </el-col>

            <el-col :span="24">
              <el-form-item label="备注">
                <el-input
                  v-model="formData.remarks"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入备注信息"
                />
              </el-form-item>
            </el-col>
          </el-row>
        </el-card>

        <!-- 发货明细 -->
        <el-card class="form-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="card-title">发货明细</span>
              <div class="header-actions">
                <el-button
                  type="primary"
                  size="small"
                  icon="Plus"
                  @click="handleAddItem"
                >
                  添加明细
                </el-button>
                <el-button
                  type="success"
                  size="small"
                  icon="Upload"
                  @click="handleImportItems"
                >
                  Excel导入
                </el-button>
              </div>
            </div>
          </template>

          <el-table
            :data="formData.items"
            border
            stripe
            max-height="400"
          >
            <el-table-column label="序号" type="index" width="60" />

            <el-table-column label="物品名称" min-width="150">
              <template #default="{ row, $index }">
                <el-input
                  v-model="row.itemName"
                  placeholder="请输入物品名称"
                  @blur="validateItem($index, 'itemName')"
                />
              </template>
            </el-table-column>

            <el-table-column label="规格型号" min-width="120">
              <template #default="{ row }">
                <el-input
                  v-model="row.specification"
                  placeholder="请输入规格型号"
                />
              </template>
            </el-table-column>

            <el-table-column label="设备类型" width="120">
              <template #default="{ row }">
                <el-select
                  v-model="row.equipmentType"
                  placeholder="选择类型"
                  size="small"
                >
                  <el-option label="机械" value="MECHANICAL" />
                  <el-option label="电控" value="ELECTRICAL" />
                  <el-option label="管路" value="PIPELINE" />
                  <el-option label="燃烧器" value="BURNER" />
                  <el-option label="辅助" value="AUXILIARY" />
                  <el-option label="标准件" value="STANDARD_PARTS" />
                </el-select>
              </template>
            </el-table-column>

            <el-table-column label="数量" width="100">
              <template #default="{ row }">
                <el-input-number
                  v-model="row.quantity"
                  :min="1"
                  :precision="0"
                  size="small"
                  style="width: 100%"
                  @change="calculateTotalWeight(row)"
                />
              </template>
            </el-table-column>

            <el-table-column label="单位" width="80">
              <template #default="{ row }">
                <el-input
                  v-model="row.unit"
                  placeholder="单位"
                  size="small"
                />
              </template>
            </el-table-column>

            <el-table-column label="单重(kg)" width="100">
              <template #default="{ row }">
                <el-input-number
                  v-model="row.unitWeight"
                  :min="0"
                  :precision="2"
                  size="small"
                  style="width: 100%"
                  @change="calculateTotalWeight(row)"
                />
              </template>
            </el-table-column>

            <el-table-column label="总重(kg)" width="100">
              <template #default="{ row }">
                <el-input-number
                  v-model="row.totalWeight"
                  :min="0"
                  :precision="2"
                  size="small"
                  style="width: 100%"
                  readonly
                />
              </template>
            </el-table-column>

            <el-table-column label="制造商" min-width="120">
              <template #default="{ row }">
                <el-input
                  v-model="row.manufacturer"
                  placeholder="制造商"
                  size="small"
                />
              </template>
            </el-table-column>

            <el-table-column label="特殊标识" width="120">
              <template #default="{ row }">
                <div class="special-flags">
                  <el-checkbox v-model="row.isFragile" size="small">易碎</el-checkbox>
                  <el-checkbox v-model="row.isHazardous" size="small">危险</el-checkbox>
                </div>
              </template>
            </el-table-column>

            <el-table-column label="操作" width="80" fixed="right">
              <template #default="{ $index }">
                <el-button
                  type="danger"
                  link
                  size="small"
                  @click="handleRemoveItem($index)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <div v-if="formData.items.length === 0" class="empty-items">
            <el-empty description="暂无发货明细，请添加明细项" />
          </div>
        </el-card>

        <!-- 操作按钮 -->
        <div class="form-actions">
          <el-button @click="handleBack">取消</el-button>
          <el-button
            type="primary"
            :loading="submitting"
            @click="handleSubmit"
          >
            {{ isEdit ? '更新' : '保存' }}
          </el-button>
        </div>
      </el-form>
    </div>

    <!-- 明细项编辑对话框 -->
    <ItemEditDialog
      v-model:visible="itemDialog.visible"
      :item-data="itemDialog.data"
      @confirm="handleItemConfirm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
// 根据环境配置自动选择API
import {
  getShippingList,
  addShippingList,
  getProjectSimpleList,
  getResponsiblePersonList,
  parseShippingListVO
} from '@/api/erp/saltprocess/shipping/api-config';
import { updateShippingList } from '@/api/erp/saltprocess/shipping/index';
import type {
  ShippingListForm,
  ShippingListVO,
  ShippingItemForm,
  ShippingItemVO,
  ShippingMethod,
  EquipmentType,
  SubsystemWeight,
  EnhancedShippingListForm
} from '@/api/erp/saltprocess/shipping/types';
import ItemEditDialog from './components/ItemEditDialog.vue';

const route = useRoute();
const router = useRouter();

// 响应式数据
const loading = ref(false);
const submitting = ref(false);
const formRef = ref();
const projectList = ref<{ id: string; name: string }[]>([]);
const responsiblePersonList = ref<{ id: string; name: string }[]>([]);

// 表单数据 - 使用增强版表单类型以支持所有字段
interface ExtendedShippingListForm extends EnhancedShippingListForm {
  subsystemWeights?: SubsystemWeight[];
}

const formData = reactive<ExtendedShippingListForm>({
  projectId: '',
  batchNumber: '',
  responsiblePersonId: '',
  shippingDate: '',
  expectedDeliveryDate: '',
  shippingMethod: 'TRUCK' as ShippingMethod,
  vehicleInfo: '',
  driverInfo: '',
  // 增强版字段
  vehiclePlate: '',
  vehicleDescription: '',
  driverName: '',
  driverPhone: '',
  shippingPhotoUrls: [],
  driverLicensePhotoUrls: [],
  // 子系统重量
  subsystemWeights: [],
  remarks: '',
  items: []
});

// 表单验证规则
const formRules = {
  projectId: [
    { required: true, message: '请选择项目', trigger: 'change' }
  ],
  batchNumber: [
    { required: true, message: '请输入批次号', trigger: 'blur' }
  ],
  responsiblePersonId: [
    { required: true, message: '请选择负责人', trigger: 'change' }
  ],
  shippingDate: [
    { required: true, message: '请选择发货日期', trigger: 'change' }
  ],
  shippingMethod: [
    { required: true, message: '请选择发货方式', trigger: 'change' }
  ]
};

// 对话框状态
const itemDialog = reactive({
  visible: false,
  data: {} as ShippingItemForm
});

// 计算属性
const isEdit = computed(() => !!route.params.id);

// 方法
const initData = async () => {
  loading.value = true;
  try {
    // 加载基础数据
    const [projects, persons] = await Promise.all([
      getProjectSimpleList(),
      getResponsiblePersonList()
    ]);

    projectList.value = projects.data;
    responsiblePersonList.value = persons.data;

    // 如果是编辑模式，加载详情数据
    if (isEdit.value) {
      const id = route.params.id as string;
      const response = await getShippingList(id);

      // 使用解析工具处理后端数据
      const detail: ShippingListVO = parseShippingListVO(response.data);

      console.log('✅ 编辑模式 - 加载发货清单详情:', {
        清单编号: detail.listCode,
        项目名称: detail.projectName,
        明细数量: detail.items?.length || 0,
        子系统重量数量: detail.subsystemWeights?.length || 0,
        发货照片数量: detail.shippingPhotoUrls?.length || 0,
        驾照照片数量: detail.driverLicensePhotoUrls?.length || 0
      });

      // 填充表单数据，保留所有增强字段
      Object.assign(formData, {
        id: detail.id || detail.shippingListId,
        projectId: detail.projectId,
        batchNumber: detail.batchNumber,
        responsiblePersonId: detail.responsiblePersonId || detail.responsiblePerson,
        shippingDate: detail.shippingDate,
        expectedDeliveryDate: detail.expectedDeliveryDate,
        shippingMethod: detail.shippingMethod,

        // 基础车辆和司机信息（兼容旧版）
        vehicleInfo: detail.vehicleInfo,
        driverInfo: detail.driverInfo,

        // 增强版字段
        vehiclePlate: detail.vehiclePlate,
        vehicleDescription: detail.vehicleDescription,
        driverName: detail.driverName,
        driverPhone: detail.driverPhone,

        // 照片字段
        shippingPhotoUrls: detail.shippingPhotoUrls || [],
        driverLicensePhotoUrls: detail.driverLicensePhotoUrls || [],

        // 子系统重量
        subsystemWeights: detail.subsystemWeights || [],

        // 备注
        remarks: detail.remarks,

        // 发货明细 - 从详情中提取
        items: convertShippingItemsToForm(detail.items || [])
      });

      console.log('✅ 表单数据填充完成:', {
        明细项数量: formData.items.length,
        子系统重量: formData.subsystemWeights?.length || 0,
        发货照片: formData.shippingPhotoUrls?.length || 0,
        驾照照片: formData.driverLicensePhotoUrls?.length || 0
      });
    }
  } catch (error) {
    console.error('❌ 初始化数据失败:', error);
    ElMessage.error('初始化数据失败');
  } finally {
    loading.value = false;
  }
};

/**
 * 将详情中的ShippingItemVO转换为表单ShippingItemForm
 */
const convertShippingItemsToForm = (items: ShippingItemVO[]): ShippingItemForm[] => {
  return items.map(item => ({
    id: item.id,
    itemName: item.itemName,
    specification: item.specification,
    equipmentType: item.equipmentType,
    quantity: item.quantity,
    unit: item.unit,
    unitWeight: item.unitWeight,
    unitVolume: item.unitVolume,
    manufacturer: item.manufacturer,
    model: item.model,
    serialNumber: item.serialNumber,
    packageType: item.packageType,
    packageQuantity: item.packageQuantity,
    isFragile: item.isFragile,
    isHazardous: item.isHazardous,
    storageRequirement: item.storageRequirement,
    remarks: item.remarks
  }));
};

const handleProjectChange = (projectId: string) => {
  const project = projectList.value.find(p => p.id === projectId);
  if (project) {
    // 可以根据项目自动设置一些默认值
  }
};

const handleAddItem = () => {
  const newItem: ShippingItemForm = {
    itemName: '',
    specification: '',
    equipmentType: 'AUXILIARY' as EquipmentType,
    quantity: 1,
    unit: '个',
    unitWeight: 0,
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

  formData.items.push(newItem);
};

const handleRemoveItem = (index: number) => {
  formData.items.splice(index, 1);
};

const handleImportItems = () => {
  ElMessage.info('Excel导入功能开发中，请使用增强版导入或手动添加明细');
};

/**
 * 计算明细项的总重量
 */
const calculateTotalWeight = (row: ShippingItemForm) => {
  if (row.quantity && row.unitWeight) {
    row.totalWeight = row.quantity * row.unitWeight;
  }
};

const validateItem = (index: number, field: string) => {
  const item = formData.items[index];
  if (field === 'itemName' && !item.itemName) {
    ElMessage.warning(`第 ${index + 1} 行物品名称不能为空`);
  }
};

const handleItemConfirm = (itemData: ShippingItemForm) => {
  // 处理明细项确认
  ElMessage.success('明细项保存成功');
};

const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();

    if (formData.items.length === 0) {
      ElMessage.warning('请至少添加一条发货明细');
      return;
    }

    // 验证明细项
    const invalidItems = formData.items.filter(item => !item.itemName || !item.quantity);
    if (invalidItems.length > 0) {
      ElMessage.warning('请完善发货明细信息');
      return;
    }

    submitting.value = true;

    // 准备提交数据，保留所有增强字段
    const submitData: ExtendedShippingListForm = {
      ...formData,
      // 确保ID字段正确
      id: formData.id
    };

    console.log('📤 提交发货清单数据:', {
      模式: isEdit.value ? '编辑' : '新增',
      清单ID: submitData.id,
      明细数量: submitData.items.length,
      子系统重量: submitData.subsystemWeights?.length || 0,
      发货照片: submitData.shippingPhotoUrls?.length || 0,
      驾照照片: submitData.driverLicensePhotoUrls?.length || 0
    });

    if (isEdit.value) {
      await updateShippingList(submitData);
      ElMessage.success('更新成功');
    } else {
      await addShippingList(submitData);
      ElMessage.success('保存成功');
    }

    router.push('/saltprocess/shipping');
  } catch (error) {
    console.error('❌ 提交失败:', error);
    if (error !== 'validation failed') {
      ElMessage.error(isEdit.value ? '更新失败' : '保存失败');
    }
  } finally {
    submitting.value = false;
  }
};

const handleBack = () => {
  router.push('/saltprocess/shipping');
};

// 生命周期
onMounted(() => {
  initData();
});
</script>

<style scoped lang="scss">
.shipping-form {
  padding: 20px;

  .form-header {
    margin-bottom: 20px;

    h2 {
      margin: 0;
      color: #303133;
    }
  }

  .form-content {
    .form-card {
      margin-bottom: 20px;

      :deep(.el-card__body) {
        padding: 24px;
      }
    }

    .card-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .header-actions {
        display: flex;
        gap: 12px;
      }
    }

    .special-tags {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
    }

    .items-summary {
      margin-top: 20px;
      padding: 20px;
      background-color: #f5f7fa;
      border-radius: 6px;
    }
  }

  .form-actions {
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-top: 30px;
    padding: 20px;
    background-color: #fff;
    border-top: 1px solid #ebeef5;
    position: sticky;
    bottom: 0;
    z-index: 10;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .shipping-form {
    padding: 10px;

    .form-content {
      .el-col {
        margin-bottom: 16px;
      }
    }

    .form-actions {
      flex-direction: column;

      .el-button {
        width: 100%;
      }
    }
  }
}
</style>
