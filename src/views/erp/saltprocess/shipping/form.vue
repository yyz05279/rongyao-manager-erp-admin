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
                  clearable
                  style="width: 100%"
                  @change="handleProjectChange"
                >
                  <el-option
                    v-for="project in projectList"
                    :key="String(project.id)"
                    :label="String(project.name || '')"
                    :value="String(project.id)"
                  >
                    <span>{{ project.name }}</span>
                  </el-option>
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
                  clearable
                  style="width: 100%"
                >
                  <el-option
                    v-for="person in responsiblePersonList"
                    :key="String(person.id)"
                    :label="String(person.name || '')"
                    :value="String(person.id)"
                  >
                    <span>{{ person.name }}</span>
                  </el-option>
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

        <!-- 车辆和司机信息 -->
        <el-card class="form-card vehicle-driver-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span class="card-title">车辆和司机信息</span>
            </div>
          </template>

          <div class="driver-vehicle-section">
            <div class="driver-info-card">
              <!-- 左侧：车辆和司机信息 -->
              <div class="info-section">
                <div class="info-row">
                  <span class="info-label">车牌号：</span>
                  <div class="info-value">
                    <el-input
                      v-model="formData.vehiclePlate"
                      placeholder="如：苏A12345"
                      style="max-width: 200px;"
                    >
                      <template #prefix>
                        <el-icon><Van /></el-icon>
                      </template>
                    </el-input>
                  </div>
                </div>
                <div class="info-row">
                  <span class="info-label">车辆描述：</span>
                  <div class="info-value">
                    <el-input
                      v-model="formData.vehicleDescription"
                      placeholder="如：17.5米车"
                    />
                  </div>
                </div>
                <div class="info-row">
                  <span class="info-label">司机姓名：</span>
                  <div class="info-value">
                    <el-input
                      v-model="formData.driverName"
                      placeholder="请输入司机姓名"
                      style="max-width: 200px;"
                    >
                      <template #prefix>
                        <el-icon><User /></el-icon>
                      </template>
                    </el-input>
                  </div>
                </div>
                <div class="info-row">
                  <span class="info-label">司机电话：</span>
                  <div class="info-value">
                    <el-input
                      v-model="formData.driverPhone"
                      placeholder="请输入司机电话"
                      maxlength="11"
                      style="max-width: 200px;"
                    >
                      <template #prefix>
                        <el-icon><Phone /></el-icon>
                      </template>
                    </el-input>
                  </div>
                </div>
              </div>

              <!-- 右侧：驾照照片 -->
              <div class="license-section">
                <div class="license-title">
                  <el-icon><CreditCard /></el-icon>
                  <span>司机驾照</span>
                </div>

                <div v-if="driverLicenseImages.length === 0" class="license-upload-empty">
                  <el-upload
                    :auto-upload="false"
                    :show-file-list="false"
                    accept="image/*"
                    :on-change="handleLicenseUpload"
                  >
                    <div class="upload-box">
                      <el-icon :size="36" class="upload-icon"><Plus /></el-icon>
                      <div class="upload-text">点击上传驾照</div>
                    </div>
                  </el-upload>
                </div>

                <div v-else class="license-image-preview">
                  <el-image
                    :src="driverLicenseImages[0].url"
                    :preview-src-list="driverLicenseImages.map(img => img.url)"
                    fit="contain"
                    class="license-img"
                  >
                    <template #error>
                      <div class="image-error">
                        <el-icon><Picture /></el-icon>
                        <div>加载失败</div>
                      </div>
                    </template>
                  </el-image>
                  <div class="license-actions">
                    <el-button
                      type="primary"
                      size="small"
                      :icon="View"
                      @click="previewLicenseImage"
                    >
                      预览
                    </el-button>
                    <el-button
                      type="danger"
                      size="small"
                      :icon="Delete"
                      @click="removeLicenseImage"
                    >
                      删除
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 发货照片 -->
        <el-card class="form-card shipping-photos-card" shadow="never">
          <template #header>
            <div class="card-header">
              <div class="section-title-with-icon">
                <el-icon><Picture /></el-icon>
                <span class="card-title">发货照片</span>
                <el-tag v-if="shippingPhotoImages.length > 0" type="info" size="small">
                  {{ shippingPhotoImages.length }} 张
                </el-tag>
              </div>
            </div>
          </template>

          <div v-if="shippingPhotoImages.length === 0" class="no-images">
            <el-empty description="暂无图片">
              <el-upload
                :auto-upload="false"
                :show-file-list="false"
                accept="image/*"
                multiple
                :on-change="handleShippingPhotoUpload"
              >
                <el-button type="primary" :icon="Plus">添加发货照片</el-button>
              </el-upload>
            </el-empty>
          </div>

          <div v-else class="image-gallery">
            <div v-for="(image, idx) in shippingPhotoImages" :key="idx" class="image-item">
              <el-image
                :src="image.url"
                :preview-src-list="shippingPhotoImages.map(img => img.url)"
                :initial-index="idx"
                fit="cover"
                class="preview-image"
              >
                <template #error>
                  <div class="image-error">
                    <el-icon :size="40"><Picture /></el-icon>
                    <div>加载失败</div>
                  </div>
                </template>
              </el-image>
              <div class="image-overlay">
                <span>照片 {{ idx + 1 }}</span>
                <el-button
                  type="danger"
                  size="small"
                  :icon="Delete"
                  circle
                  @click="removeShippingPhoto(idx)"
                />
              </div>
            </div>
            <!-- 添加更多照片按钮 -->
            <div class="image-item add-more-item">
              <el-upload
                :auto-upload="false"
                :show-file-list="false"
                accept="image/*"
                multiple
                :on-change="handleShippingPhotoUpload"
              >
                <div class="add-more-box">
                  <el-icon :size="40" class="add-icon"><Plus /></el-icon>
                  <div class="add-more-text">添加照片</div>
                </div>
              </el-upload>
            </div>
          </div>
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
            
            <el-table-column label="子项名称" min-width="150">
              <template #default="{ row, $index }">
                <el-input
                  v-model="row.itemName"
                  placeholder="请输入子项名称"
                  @blur="validateItem($index, 'itemName')"
                />
              </template>
            </el-table-column>
            
            <el-table-column label="所属子系统" min-width="150">
              <template #default="{ row }">
                <el-input
                  v-model="row.subsystem"
                  placeholder="请输入所属子系统"
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
            
            <!-- 单重和总重：手动输入，不自动填充（subsystemWeights是子系统整体重量，不是子项单重） -->
            <el-table-column label="单重(kg)" width="120">
              <template #default="{ row }">
                <el-input
                  v-model.number="row.unitWeight"
                  type="number"
                  placeholder="单重"
                  size="small"
                />
              </template>
            </el-table-column>
            
            <el-table-column label="总重(kg)" width="120">
              <template #default="{ row }">
                <el-input
                  v-model.number="row.totalWeight"
                  type="number"
                  placeholder="总重"
                  size="small"
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
import { Plus, Delete, View, Van, User, Phone, CreditCard, Picture } from '@element-plus/icons-vue';
import type { UploadFile } from 'element-plus';
// 根据环境配置自动选择API
import {
  getShippingList,
  addShippingList,
  getProjectSimpleList,
  getResponsiblePersonList,
  parseShippingListVO,
  getFullPhotoUrls
} from '@/api/erp/saltprocess/shipping/api-config';
import { updateShippingList } from '@/api/erp/saltprocess/shipping/index';
import { uploadImage } from '@/api/erp/common/upload';
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
const responsiblePersonList = ref<{ id: string | number; name: string }[]>([]);

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

// 图片数据
interface ImageItem {
  file?: File;
  url: string;
}

const shippingPhotoImages = ref<ImageItem[]>([]);
const driverLicenseImages = ref<ImageItem[]>([]);

// 计算属性
const isEdit = computed(() => !!route.params.id);

// 方法
const initData = async () => {
  loading.value = true;
  try {
    // 加载基础数据（项目列表和负责人列表）
    console.log('📋 开始加载项目列表和负责人列表...');
    const [projects, persons] = await Promise.all([
      getProjectSimpleList(),
      getResponsiblePersonList()
    ]);
    
    projectList.value = projects.data || [];
    responsiblePersonList.value = persons.data || [];
    
    console.log('✅ 项目列表加载完成:', {
      数量: projectList.value.length,
      列表: projectList.value
    });
    console.log('✅ 负责人列表加载完成:', {
      数量: responsiblePersonList.value.length,
      列表: responsiblePersonList.value
    });
    
    // 如果是编辑模式，加载详情数据
    if (isEdit.value) {
      const id = route.params.id as string;
      const response = await getShippingList(id);
      
      // 使用解析工具处理后端数据
      const detail: ShippingListVO = parseShippingListVO(response.data);
      
      console.log('✅ 编辑模式 - 加载发货清单详情:', {
        清单编号: detail.listCode,
        项目ID: detail.projectId,
        项目名称: detail.projectName,
        负责人ID: detail.responsiblePersonId,
        负责人名称: detail.responsiblePerson,
        明细数量: detail.items?.length || 0,
        子系统重量数量: detail.subsystemWeights?.length || 0,
        发货照片数量: detail.shippingPhotoUrls?.length || 0,
        驾照照片数量: detail.driverLicensePhotoUrls?.length || 0
      });

      // 填充表单数据，保留所有增强字段
      // 注意：projectId和responsiblePersonId必须是ID值，不能是名称
      Object.assign(formData, {
        id: detail.id || detail.shippingListId,
        projectId: String(detail.projectId), // 确保是字符串类型
        batchNumber: detail.batchNumber,
        responsiblePersonId: String(detail.responsiblePersonId || detail.responsiblePerson || ''), // 确保是字符串类型
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
      
      // 加载现有照片（使用统一的URL生成工具）
      if (detail.shippingPhotoUrls && detail.shippingPhotoUrls.length > 0) {
        const fullUrls = getFullPhotoUrls(detail.shippingPhotoUrls);
        shippingPhotoImages.value = fullUrls.map(url => ({ url }));
      }
      
      if (detail.driverLicensePhotoUrls && detail.driverLicensePhotoUrls.length > 0) {
        const fullUrls = getFullPhotoUrls(detail.driverLicensePhotoUrls);
        driverLicenseImages.value = fullUrls.map(url => ({ url }));
      }
      
      console.log('✅ 表单数据填充完成:', {
        项目ID: formData.projectId,
        负责人ID: formData.responsiblePersonId,
        明细项数量: formData.items.length,
        子系统重量: formData.subsystemWeights?.length || 0,
        发货照片: shippingPhotoImages.value.length,
        驾照照片: driverLicenseImages.value.length
      });
      
      // 验证下拉列表中是否存在对应的项目和负责人
      const projectExists = projectList.value.some(p => String(p.id) === String(formData.projectId));
      const personExists = responsiblePersonList.value.some(p => String(p.id) === String(formData.responsiblePersonId));
      
      console.log('📊 下拉列表验证:', {
        项目ID存在: projectExists,
        负责人ID存在: personExists,
        项目列表: projectList.value.map(p => ({ id: p.id, name: p.name })),
        负责人列表: responsiblePersonList.value.map(p => ({ id: p.id, name: p.name }))
      });
      
      if (!projectExists) {
        console.warn('⚠️ 项目列表中未找到项目ID:', formData.projectId);
      }
      if (!personExists) {
        console.warn('⚠️ 负责人列表中未找到负责人ID:', formData.responsiblePersonId);
      }
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
 * 自动拆分itemName为子系统和子项名称
 */
const convertShippingItemsToForm = (items: ShippingItemVO[]): ShippingItemForm[] => {
  return items.map(item => {
    // 拆分itemName：格式为"子系统名-子项名"
    let subsystem = '';
    let itemName = item.itemName;
    
    if (item.itemName && item.itemName.includes('-')) {
      const parts = item.itemName.split('-');
      subsystem = parts[0].trim();  // 子系统名称
      itemName = parts.slice(1).join('-').trim();  // 子项名称（处理多个"-"的情况）
    }
    
    console.log('📝 拆分物品名称:', {
      原始名称: item.itemName,
      子系统: subsystem,
      子项名称: itemName
    });
    
    return {
      id: item.id,
      itemName: itemName,
      specification: item.specification,
      subsystem: subsystem,  // 添加子系统字段
      equipmentType: item.equipmentType,
      quantity: item.quantity,
      unit: item.unit,
      unitWeight: item.unitWeight,
      totalWeight: item.totalWeight,
      unitVolume: item.unitVolume,
      totalVolume: item.totalVolume,
      manufacturer: item.manufacturer,
      model: item.model,
      serialNumber: item.serialNumber,
      packageType: item.packageType,
      packageQuantity: item.packageQuantity,
      isFragile: item.isFragile,
      isHazardous: item.isHazardous,
      storageRequirement: item.storageRequirement,
      remarks: item.remarks
    };
  });
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
 * 发货照片上传
 */
const handleShippingPhotoUpload = (uploadFile: UploadFile) => {
  const file = uploadFile.raw;
  if (!file) return;
  
  // 验证文件类型
  const isImage = file.type.startsWith('image/');
  if (!isImage) {
    ElMessage.error('只能上传图片文件！');
    return;
  }
  
  // 验证文件大小（限制为10MB）
  const isLt10M = file.size / 1024 / 1024 < 10;
  if (!isLt10M) {
    ElMessage.error('图片大小不能超过 10MB!');
    return;
  }
  
  // 创建预览URL
  const url = URL.createObjectURL(file);
  shippingPhotoImages.value.push({ file, url });
};

/**
 * 删除发货照片
 */
const removeShippingPhoto = (index: number) => {
  const image = shippingPhotoImages.value[index];
  if (image.url && image.file) {
    URL.revokeObjectURL(image.url);
  }
  shippingPhotoImages.value.splice(index, 1);
};

/**
 * 驾照照片上传
 */
const handleLicenseUpload = (uploadFile: UploadFile) => {
  const file = uploadFile.raw;
  if (!file) return;
  
  // 验证文件类型
  const isImage = file.type.startsWith('image/');
  if (!isImage) {
    ElMessage.error('只能上传图片文件！');
    return;
  }
  
  // 验证文件大小
  const isLt10M = file.size / 1024 / 1024 < 10;
  if (!isLt10M) {
    ElMessage.error('图片大小不能超过 10MB!');
    return;
  }
  
  // 只保留一张驾照照片
  if (driverLicenseImages.value.length > 0) {
    const oldImage = driverLicenseImages.value[0];
    if (oldImage.url && oldImage.file) {
      URL.revokeObjectURL(oldImage.url);
    }
    driverLicenseImages.value = [];
  }
  
  // 创建预览URL
  const url = URL.createObjectURL(file);
  driverLicenseImages.value.push({ file, url });
};

/**
 * 预览驾照照片
 */
const previewLicenseImage = () => {
  // Element Plus 的 Image 组件会自动处理预览
};

/**
 * 删除驾照照片
 */
const removeLicenseImage = () => {
  if (driverLicenseImages.value.length > 0) {
    const image = driverLicenseImages.value[0];
    if (image.url && image.file) {
      URL.revokeObjectURL(image.url);
    }
    driverLicenseImages.value = [];
  }
};

/**
 * 上传图片到服务器
 */
const uploadImagesToServer = async (images: ImageItem[], category: string): Promise<string[]> => {
  const uploadedUrls: string[] = [];
  
  for (const image of images) {
    if (image.file) {
      try {
        const response = await uploadImage(image.file, category as any);
        if (response.data && response.data.fileUrl) {
          uploadedUrls.push(response.data.fileUrl);
        }
      } catch (error) {
        console.error('上传图片失败:', error);
        throw error;
      }
    } else if (image.url) {
      // 如果是已存在的URL（编辑模式下加载的旧照片），保留原URL
      // 需要提取相对路径
      const relativeUrl = image.url.replace(import.meta.env.VITE_APP_BASE_API || '', '');
      uploadedUrls.push(relativeUrl);
    }
  }
  
  return uploadedUrls;
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
    ElMessage.warning(`第 ${index + 1} 行子项名称不能为空`);
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
    
    try {
      // 1. 上传图片（如果有新图片）
      let shippingPhotoUrls: string[] = [];
      let driverLicensePhotoUrls: string[] = [];
      
      if (shippingPhotoImages.value.length > 0 || driverLicenseImages.value.length > 0) {
        ElMessage.info('正在上传图片...');
        
        const uploadTasks: Promise<void>[] = [];
        
        // 上传发货照片
        if (shippingPhotoImages.value.length > 0) {
          const task = uploadImagesToServer(shippingPhotoImages.value, 'shipping-photos').then(urls => {
            shippingPhotoUrls = urls;
          });
          uploadTasks.push(task);
        }
        
        // 上传驾照照片
        if (driverLicenseImages.value.length > 0) {
          const task = uploadImagesToServer(driverLicenseImages.value, 'driver-license').then(urls => {
            driverLicensePhotoUrls = urls;
          });
          uploadTasks.push(task);
        }
        
        await Promise.all(uploadTasks);
        
        console.log('✅ 图片上传完成:', {
          发货照片: shippingPhotoUrls.length,
          驾照照片: driverLicensePhotoUrls.length
        });
      }
      
      // 2. 准备提交数据，保留所有增强字段
      const submitData: ExtendedShippingListForm = {
        ...formData,
        // 确保ID字段正确
        id: formData.id,
        // 更新照片URL
        shippingPhotoUrls: shippingPhotoUrls.length > 0 ? shippingPhotoUrls : formData.shippingPhotoUrls,
        driverLicensePhotoUrls: driverLicensePhotoUrls.length > 0 ? driverLicensePhotoUrls : formData.driverLicensePhotoUrls
      };
      
      console.log('📤 提交发货清单数据:', {
        模式: isEdit.value ? '编辑' : '新增',
        清单ID: submitData.id,
        明细数量: submitData.items.length,
        子系统重量: submitData.subsystemWeights?.length || 0,
        发货照片: submitData.shippingPhotoUrls?.length || 0,
        驾照照片: submitData.driverLicensePhotoUrls?.length || 0
      });
      
      // 3. 提交表单
    if (isEdit.value) {
        await updateShippingList(submitData);
      ElMessage.success('更新成功');
    } else {
        await addShippingList(submitData);
      ElMessage.success('保存成功');
    }
    
    router.push('/saltprocess/shipping');
    } catch (uploadError) {
      console.error('❌ 上传或提交失败:', uploadError);
      ElMessage.error('操作失败，请重试');
    }
  } catch (error) {
    if (error !== 'validation failed') {
      console.error('❌ 表单验证失败:', error);
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

    .section-title-with-icon {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
      font-weight: 600;
      color: #303133;
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

    // 车辆和司机信息样式
    .vehicle-driver-card {
      .driver-vehicle-section {
        .driver-info-card {
          display: flex;
          gap: 20px;
          padding: 20px;
          background: #ecf5ff;
          border: 1px solid #b3d8ff;
          border-radius: 8px;
          transition: all 0.3s;

          &:hover {
            box-shadow: 0 2px 12px rgba(64, 158, 255, 0.2);
          }

          .info-section {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 12px;

            .info-row {
              display: flex;
              align-items: center;

              .info-label {
                min-width: 90px;
                font-weight: 600;
                color: #606266;
                font-size: 14px;
              }

              .info-value {
                flex: 1;
              }
            }
          }

          .license-section {
            flex-shrink: 0;
            width: 300px;
            display: flex;
            flex-direction: column;

            .license-title {
              display: flex;
              align-items: center;
              gap: 6px;
              margin-bottom: 12px;
              font-weight: 600;
              font-size: 14px;
              color: #303133;

              .el-icon {
                color: #409eff;
              }
            }

            .license-upload-empty {
              .upload-box {
                width: 300px;
                height: 188px;
                border: 2px dashed #b3d8ff;
                border-radius: 8px;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.3s;
                background: rgba(255, 255, 255, 0.7);

                &:hover {
                  border-color: #409eff;
                  background: #fff;

                  .upload-icon {
                    color: #409eff;
                  }
                }

                .upload-icon {
                  color: #909399;
                  transition: color 0.3s;
                }

                .upload-text {
                  margin-top: 8px;
                  font-size: 13px;
                  color: #606266;
                }
              }
            }

            .license-image-preview {
              position: relative;
              width: 300px;
              height: 188px;
              border: 2px solid #409eff;
              border-radius: 8px;
              overflow: hidden;
              background: #fff;

              .license-img {
                width: 100%;
                height: 100%;
                display: block;
              }

              .license-actions {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                padding: 10px;
                background: linear-gradient(to top, rgba(0, 0, 0, 0.7) 0%, transparent 100%);
                display: flex;
                justify-content: center;
                gap: 8px;
                opacity: 0;
                transition: opacity 0.3s;
              }

              &:hover .license-actions {
                opacity: 1;
              }

              .image-error {
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                height: 100%;
                color: #909399;
                background: #f5f7fa;
              }
            }
          }
        }
      }
    }

    // 发货照片样式
    .shipping-photos-card {
      .no-images {
        padding: 40px 0;
      }

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
            display: flex;
            justify-content: space-between;
            align-items: center;

            span {
              font-size: 14px;
              font-weight: 500;
            }
          }

          &.add-more-item {
            border: 2px dashed #d9ecff;
            background: #f0f9ff;
            cursor: pointer;
            transition: all 0.3s ease;

            &:hover {
              border-color: #409eff;
              background: #ecf5ff;
              transform: translateY(-2px);
              box-shadow: 0 4px 8px rgba(64, 158, 255, 0.15);

              .add-more-box {
                .add-icon {
                  color: #409eff;
                  transform: scale(1.1);
                }

                .add-more-text {
                  color: #409eff;
                }
              }
            }

            .add-more-box {
              width: 100%;
              height: 100%;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 20px;

              .add-icon {
                color: #a0cfff;
                transition: all 0.3s ease;
              }

              .add-more-text {
                margin-top: 12px;
                font-size: 14px;
                color: #909399;
                font-weight: 500;
                transition: all 0.3s ease;
              }
            }
          }
        }
      }
    }

    .empty-items {
      padding: 40px 0;
      text-align: center;
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
@media (max-width: 1024px) {
  .shipping-form {
    .form-content {
      .vehicle-driver-card {
        .driver-vehicle-section {
          .driver-info-card {
            flex-direction: column;

            .license-section {
              width: 100%;
              max-width: 400px;
              margin: 0 auto;
            }
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .shipping-form {
    padding: 10px;

    .form-content {
      .el-col {
        margin-bottom: 16px;
      }

      .image-gallery {
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
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
