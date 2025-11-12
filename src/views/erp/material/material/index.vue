<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div class="search" v-show="showSearch">
        <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="68px">
          <el-form-item label="物料名称" prop="materialName">
            <el-input v-model="queryParams.materialName" placeholder="请输入物料名称" clearable style="width: 240px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="物料编码" prop="materialCode">
            <el-input v-model="queryParams.materialCode" placeholder="请输入物料编码" clearable style="width: 240px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="物料类型" prop="materialType">
            <el-select v-model="queryParams.materialType" placeholder="请选择物料类型" clearable style="width: 240px">
              <el-option label="通用物料" value="GENERAL" />
              <el-option label="机械设备" value="MECHANICAL" />
              <el-option label="电气设备" value="ELECTRICAL" />
              <el-option label="管道材料" value="PIPELINE" />
              <el-option label="燃烧器" value="BURNER" />
              <el-option label="辅助材料" value="AUXILIARY" />
              <el-option label="标准件" value="STANDARD_PARTS" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </transition>

    <el-card shadow="never">
      <template #header>
        <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['erp:material:item:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['erp:material:item:edit']"
              >修改</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['erp:material:item:remove']"
              >删除</el-button
            >
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['erp:material:item:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="materialList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="物料编码" align="center" prop="materialCode" width="180" />
        <el-table-column label="物料名称" align="center" prop="materialName" width="150" />
        <el-table-column label="物料类型" align="center" prop="materialType" width="120">
          <template #default="scope">
            <el-tag v-if="scope.row.materialType" size="small">
              {{ getMaterialTypeLabel(scope.row.materialType) }}
            </el-tag>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="规格型号" align="center" prop="specification" width="120" />
        <el-table-column label="单位" align="center" prop="unit" width="80" />
        <el-table-column label="型号" align="center" prop="model" width="120" />
        <el-table-column label="包装规格" align="center" width="150">
          <template #default="scope">
            <span v-if="scope.row.packageQuantity">
              {{ scope.row.packageQuantity }}{{ scope.row.baseUnit }}/{{ scope.row.packageUnit }}
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column label="易碎品" align="center" prop="isFragile" width="80">
          <template #default="scope">
            <el-tag :type="scope.row.isFragile === 1 ? 'warning' : 'info'" size="small">
              {{ scope.row.isFragile === 1 ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="危险品" align="center" prop="isHazardous" width="80">
          <template #default="scope">
            <el-tag :type="scope.row.isHazardous === 1 ? 'danger' : 'info'" size="small">
              {{ scope.row.isHazardous === 1 ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="150" fixed="right">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['erp:material:item:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['erp:material:item:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination v-show="total>0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>

    <!-- 添加或修改物料信息对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="900px" append-to-body>
      <el-form ref="materialFormRef" :model="form" :rules="rules" label-width="120px">

        <!-- 基础信息 -->
        <el-divider content-position="left">基础信息</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="物料名称" prop="materialName">
              <el-input v-model="form.materialName" placeholder="请输入物料名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="物料类型" prop="materialType">
              <el-select v-model="form.materialType" placeholder="请选择物料类型" style="width: 100%">
                <el-option label="通用物料" value="GENERAL" />
                <el-option label="机械设备" value="MECHANICAL" />
                <el-option label="电气设备" value="ELECTRICAL" />
                <el-option label="管道材料" value="PIPELINE" />
                <el-option label="燃烧器" value="BURNER" />
                <el-option label="辅助材料" value="AUXILIARY" />
                <el-option label="标准件" value="STANDARD_PARTS" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="物料编码" prop="materialCode">
              <el-input
                v-model="form.materialCode"
                :placeholder="form.id ? '系统自动生成' : '保存后系统自动生成'"
                :disabled="true"
                readonly
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="规格型号" prop="specification">
              <el-input v-model="form.specification" placeholder="请输入规格型号" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="单位" prop="unit">
              <el-input v-model="form.unit" placeholder="请输入单位（如：袋、台、个）" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="型号" prop="model">
              <el-input v-model="form.model" placeholder="请输入型号" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="是否易碎品" prop="isFragile">
              <el-switch v-model="form.isFragile" :active-value="1" :inactive-value="0" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否危险品" prop="isHazardous">
              <el-switch v-model="form.isHazardous" :active-value="1" :inactive-value="0" />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 包装规格（可选） -->
        <el-divider content-position="left">包装规格（可选）</el-divider>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="包装数量" prop="packageQuantity">
              <el-input-number
                v-model="form.packageQuantity"
                :min="1"
                :precision="0"
                placeholder="每包/每箱的数量"
                style="width: 100%"
              />
              <span class="form-tip">如：500颗/袋、100米/卷</span>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              label="包装单位"
              prop="packageUnit"
              v-if="form.packageQuantity">
              <el-input v-model="form.packageUnit" placeholder="如：袋、箱、卷" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" v-if="form.packageQuantity">
          <el-col :span="12">
            <el-form-item
              label="基础单位"
              prop="baseUnit">
              <el-input v-model="form.baseUnit" placeholder="如：颗、个、米" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="包装重量(kg)" prop="packageWeight">
              <el-input-number
                v-model="form.packageWeight"
                :min="0"
                :precision="2"
                placeholder="单包重量"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" v-if="form.packageQuantity">
          <el-col :span="12">
            <el-form-item label="包装体积(m³)" prop="packageVolume">
              <el-input-number
                v-model="form.packageVolume"
                :min="0"
                :precision="2"
                placeholder="单包体积"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <!-- 备注 -->
        <el-form-item label="备注" prop="remarks">
          <el-input v-model="form.remarks" type="textarea" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Material" lang="ts">
import { listMaterial, getMaterial, delMaterial, addMaterial, updateMaterial } from '@/api/erp/material/material';
import { MaterialVO, MaterialQuery, MaterialForm, MaterialTypeOptions } from '@/api/erp/material/material/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const materialList = ref<MaterialVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const materialFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: MaterialForm = {
  id: undefined,
  materialName: undefined,
  materialType: undefined,
  specification: undefined,
  unit: undefined,
  model: undefined,
  isFragile: 0,
  isHazardous: 0,
  packageQuantity: undefined,
  packageUnit: undefined,
  baseUnit: undefined,
  packageWeight: undefined,
  packageVolume: undefined,
  remarks: undefined,
}

// 自定义验证器：包装单位验证
const validatePackageUnit = (_rule: any, value: any, callback: any) => {
  if (form.value.packageQuantity && !value) {
    callback(new Error('填写了包装数量，必须填写包装单位'));
  } else {
    callback();
  }
};

// 自定义验证器：基础单位验证
const validateBaseUnit = (_rule: any, value: any, callback: any) => {
  if (form.value.packageQuantity && !value) {
    callback(new Error('填写了包装数量，必须填写基础单位'));
  } else {
    callback();
  }
};

const data = reactive<PageData<MaterialForm, MaterialQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    materialName: undefined,
    materialCode: undefined,
    materialType: undefined,
    params: {}
  },
  rules: {
    materialName: [
      { required: true, message: "物料名称不能为空", trigger: "blur" }
    ],
    materialType: [
      { required: true, message: "物料类型不能为空", trigger: "change" }
    ],
    unit: [
      { required: true, message: "单位不能为空", trigger: "blur" }
    ],
    packageUnit: [
      { validator: validatePackageUnit, trigger: "blur" }
    ],
    baseUnit: [
      { validator: validateBaseUnit, trigger: "blur" }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

// 获取物料类型标签
const getMaterialTypeLabel = (type: string): string => {
  const option = MaterialTypeOptions.find(item => item.value === type);
  return option ? option.label : type;
};

/** 查询物料列表 */
const getList = async () => {
  loading.value = true;
  const res = await listMaterial(queryParams.value);
  materialList.value = res.rows;
  total.value = res.total;
  loading.value = false;
}

/** 取消按钮 */
const cancel = () => {
  reset();
  dialog.visible = false;
}

/** 表单重置 */
const reset = () => {
  form.value = {...initFormData};
  materialFormRef.value?.resetFields();
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
}

/** 多选框选中数据 */
const handleSelectionChange = (selection: MaterialVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "添加物料信息";
}

/** 修改按钮操作 */
const handleUpdate = async (row?: MaterialVO) => {
  reset();
  const _id = row?.id || ids.value[0];

  try {
    const res: any = await getMaterial(_id);

    // 打印调试信息（开发环境）
    if (import.meta.env.DEV) {
      console.log('🔍 [物料编辑] API响应数据:', res);
      console.log('🔍 [物料编辑] data字段:', res.data);
    }

    // 处理后端返回的数据，映射字段名并转换数据类型
    // 注意：响应拦截器返回的是 { code, msg, data }，实际数据在 res.data 中
    const backendData: any = res.data;

    // 数据验证
    if (!backendData) {
      proxy?.$modal.msgError("后台未返回物料数据，请联系管理员检查接口");
      console.error('❌ [物料编辑] 后台返回数据为空:', res);
      return;
    }

    if (!backendData.id) {
      proxy?.$modal.msgError("物料数据格式错误，缺少ID字段");
      console.error('❌ [物料编辑] 物料数据缺少ID:', backendData);
      return;
    }

    // 字段映射：后端字段 -> 前端字段
    form.value = {
      id: backendData.id,

      // 基础信息
      materialCode: backendData.materialCode || backendData.itemCode,
      materialName: backendData.materialName || backendData.itemName,
      materialType: backendData.materialType || backendData.equipmentType,
      specification: backendData.specification,
      unit: backendData.unit,
      model: backendData.model,
      // 布尔值转换为数字：false -> 0, true -> 1, null/undefined -> 0
      isFragile: backendData.isFragile === true || backendData.isFragile === 1 ? 1 : 0,
      isHazardous: backendData.isHazardous === true || backendData.isHazardous === 1 ? 1 : 0,

      // 包装规格
      packageQuantity: backendData.packageQuantity,
      packageUnit: backendData.packageUnit,
      baseUnit: backendData.baseUnit,
      packageWeight: backendData.packageWeight,
      packageVolume: backendData.packageVolume,

      // 其他信息
      remarks: backendData.remarks,
      version: backendData.version
    };

    if (import.meta.env.DEV) {
      console.log('✅ [物料编辑] 表单数据已填充:', form.value);
    }

    dialog.visible = true;
    dialog.title = "修改物料信息";
  } catch (error) {
    console.error('❌ [物料编辑] 获取物料详情失败:', error);
    proxy?.$modal.msgError("获取物料详情失败，请稍后重试");
  }
}

/** 提交按钮 */
const submitForm = () => {
  materialFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;

      try {
        // 准备提交数据，确保字段映射正确
        const submitData: any = {
          id: form.value.id,

          // 基础信息（使用后端字段名）
          materialName: form.value.materialName,
          materialType: form.value.materialType,
          specification: form.value.specification,
          unit: form.value.unit,
          model: form.value.model,
          // 根据文档要求，转换为 Boolean 类型
          isFragile: form.value.isFragile === 1 ? true : false,
          isHazardous: form.value.isHazardous === 1 ? true : false,

          // 包装规格（可选）
          packageQuantity: form.value.packageQuantity,
          packageUnit: form.value.packageUnit,
          baseUnit: form.value.baseUnit,
          packageWeight: form.value.packageWeight,
          packageVolume: form.value.packageVolume,

          // 其他信息
          remarks: form.value.remarks,
          version: form.value.version
        };

        if (import.meta.env.DEV) {
          console.log('📤 [物料提交] 提交数据:', submitData);
        }

        if (form.value.id) {
          await updateMaterial(submitData);
        } else {
          await addMaterial(submitData);
        }

        proxy?.$modal.msgSuccess("操作成功");
        dialog.visible = false;
        await getList();
      } catch (error) {
        console.error('❌ [物料提交] 提交失败:', error);
      } finally {
        buttonLoading.value = false;
      }
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: MaterialVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除物料信息编号为"' + _ids + '"的数据项？').finally(() => loading.value = false);
  await delMaterial(_ids);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('erp/saltprocess/material/item/export', {
    ...queryParams.value
  }, `material_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList();
});
</script>

<style scoped lang="scss">
.form-tip {
  display: block;
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  line-height: 1.5;
}

:deep(.el-divider__text) {
  font-weight: 600;
  color: #303133;
}
</style>
