<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div class="search" v-show="showSearch">
        <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="68px">
          <el-form-item label="物料名称" prop="name">
            <el-input v-model="queryParams.name" placeholder="请输入物料名称" clearable style="width: 240px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="物料编码" prop="itemCode">
            <el-input v-model="queryParams.itemCode" placeholder="请输入物料编码" clearable style="width: 240px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="生产日期" prop="productionDateRange">
            <el-date-picker
              v-model="productionDateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              style="width: 240px"
              clearable
              @change="handleProductionDateChange"
            />
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
        <el-table-column label="规格型号" align="center" prop="specification" width="120" />
        <el-table-column label="数量" align="center" prop="quantity" width="80" />
        <el-table-column label="单位" align="center" prop="unit" width="80" />
        <el-table-column label="单重(kg)" align="center" prop="unitWeight" width="100" />
        <el-table-column label="总重(kg)" align="center" prop="totalWeight" width="100" />
        <el-table-column label="制造商" align="center" prop="manufacturer" width="120" />
        <!-- <el-table-column label="型号" align="center" prop="model" width="120" /> -->
        <el-table-column label="生产日期" align="center" prop="productionDate" width="120">
          <template #default="scope">
            <span>{{ scope.row.productionDate || '-' }}</span>
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
      <el-form ref="materialFormRef" :model="form" :rules="rules" label-width="100px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="物料名称" prop="itemName">
              <el-input v-model="form.itemName" placeholder="请输入物料名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="物料编码" prop="itemCode">
              <el-input v-model="form.itemCode" placeholder="请输入物料编码" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="规格型号" prop="specification">
              <el-input v-model="form.specification" placeholder="请输入规格型号" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="数量" prop="quantity">
              <el-input-number v-model="form.quantity" placeholder="请输入数量" :min="0" :precision="0" class="!w-1/1" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="单位" prop="unit">
              <el-input v-model="form.unit" placeholder="请输入单位" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="单重(kg)" prop="unitWeight">
              <el-input-number v-model="form.unitWeight" placeholder="请输入单重" :min="0" :precision="2" class="!w-1/1" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="总重(kg)" prop="totalWeight">
              <el-input-number v-model="form.totalWeight" placeholder="请输入总重" :min="0" :precision="2" class="!w-1/1" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="单体积(m³)" prop="unitVolume">
              <el-input-number v-model="form.unitVolume" placeholder="请输入单体积" :min="0" :precision="2" class="!w-1/1" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="总体积(m³)" prop="totalVolume">
              <el-input-number v-model="form.totalVolume" placeholder="请输入总体积" :min="0" :precision="2" class="!w-1/1" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="制造商" prop="manufacturer">
              <el-input v-model="form.manufacturer" placeholder="请输入制造商" />
            </el-form-item>
          </el-col>
          <!-- <el-col :span="12">
            <el-form-item label="型号" prop="model">
              <el-input v-model="form.model" placeholder="请输入型号" />
            </el-form-item>
          </el-col> -->
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="序列号" prop="serialNumber">
              <el-input v-model="form.serialNumber" placeholder="请输入序列号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="生产日期" prop="productionDate">
              <el-date-picker
                v-model="form.productionDate"
                type="date"
                placeholder="请选择生产日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                style="width: 100%"
                clearable
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="是否易碎品" prop="isFragile">
              <el-radio-group v-model="form.isFragile">
                <el-radio :label="0">否</el-radio>
                <el-radio :label="1">是</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="是否危险品" prop="isHazardous">
              <el-radio-group v-model="form.isHazardous">
                <el-radio :label="0">否</el-radio>
                <el-radio :label="1">是</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="包装方式" prop="packagingMethod">
          <el-input v-model="form.packagingMethod" placeholder="请输入包装方式" />
        </el-form-item>
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
import { MaterialVO, MaterialQuery, MaterialForm } from '@/api/erp/material/material/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const materialList = ref<MaterialVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

// 生产日期范围查询
const productionDateRange = ref<[string, string] | null>(null);

const queryFormRef = ref<ElFormInstance>();
const materialFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: MaterialForm = {
  id: undefined,
  shippingListId: undefined,
  itemCode: undefined,
  itemName: undefined,
  specification: undefined,
  quantity: undefined,
  unit: undefined,
  unitWeight: undefined,
  totalWeight: undefined,
  unitVolume: undefined,
  totalVolume: undefined,
  manufacturer: undefined,
  model: undefined,
  serialNumber: undefined,
  productionDate: undefined,
  isFragile: 0,
  isHazardous: 0,
  packagingMethod: undefined,
  remarks: undefined,
}

const data = reactive<PageData<MaterialForm, MaterialQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: undefined,
    itemCode: undefined,
    params: {}
  },
  rules: {
    itemName: [
      { required: true, message: "物料名称不能为空", trigger: "blur" }
    ],
    quantity: [
      { required: true, message: "数量不能为空", trigger: "blur" }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

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
  productionDateRange.value = null;
  queryParams.value.productionDateStart = undefined;
  queryParams.value.productionDateEnd = undefined;
  handleQuery();
}

/** 处理生产日期范围变化 */
const handleProductionDateChange = (value: [string, string] | null) => {
  if (value && value.length === 2) {
    queryParams.value.productionDateStart = value[0];
    queryParams.value.productionDateEnd = value[1];
  } else {
    queryParams.value.productionDateStart = undefined;
    queryParams.value.productionDateEnd = undefined;
  }
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
  const _id = row?.id || ids.value[0]
  const res = await getMaterial(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改物料信息";
}

/** 提交按钮 */
const submitForm = () => {
  materialFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateMaterial(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addMaterial(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("操作成功");
      dialog.visible = false;
      await getList();
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
