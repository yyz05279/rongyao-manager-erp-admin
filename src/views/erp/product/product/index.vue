<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div class="search" v-show="showSearch">
        <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="68px">
          <el-form-item label="产品名称" prop="name">
            <el-input v-model="queryParams.name" placeholder="请输入产品名称" clearable style="width: 240px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="产品编号" prop="categoryId">
            <el-input v-model="queryParams.categoryId" placeholder="请输入产品编码" clearable style="width: 240px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="产品状态" prop="status">
            <el-select v-model="queryParams.status" placeholder="请选择产品状态" clearable>
              <el-option
                v-for="dict in sys_normal_disable"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
              />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['erp:product:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['erp:product:edit']">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['erp:product:remove']">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['erp:product:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="productList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="产品编号" align="center" prop="id" v-if="true" />
        <el-table-column label="产品名称" align="center" prop="name" />
        <el-table-column label="产品条码" align="center" prop="barCode" />
        <el-table-column label="产品分类编号" align="center" prop="categoryId" />
        <el-table-column label="单位编号" align="center" prop="unitId" />
        <el-table-column label="产品状态" align="center" prop="status">
          <template #default="scope">
            <dict-tag :options="sys_normal_disable" :value="scope.row.status"/>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['erp:product:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['erp:product:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <pagination
          v-show="total>0"
          :total="total"
          v-model:page="queryParams.pageNum"
          v-model:limit="queryParams.pageSize"
          @pagination="getList"
      />
    </el-card>
    <!-- 添加或修改产品信息对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="900px" append-to-body>
      <el-form ref="productFormRef" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="产品名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入产品名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="产品条码" prop="barCode">
              <el-input v-model="form.barCode" placeholder="请输入产品条码" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="分类编号" prop="categoryId">
<!--              <el-input v-model="form.categoryId" placeholder="请输入产品分类编号" />-->
              <el-tree-select
              v-model="form.categoryId"
              :data="categoryOptions"
              :props="{ value: 'id', label: 'label', children: 'children' }"
              value-key="id"
              placeholder="请选择产品分类"
              check-strictly
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="单位编号" prop="unitId">
              <el-select v-model="form.unitId"  placeholder="请选择租户套餐" clearable style="width: 100%">
                <el-option v-for="item in unitOptions" :key="item.id" :label="item.name" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="产品规格" prop="standard">
          <el-input v-model="form.standard" placeholder="请输入产品规格" />
        </el-form-item>
        <el-row>
          <el-col :span="12">
            <el-form-item label="产品状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio
                  v-for="dict in sys_normal_disable"
                  :key="dict.value"
                  :label="parseInt(dict.value)"
                >{{dict.label}}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="保质期" prop="expiryDay">
              <el-input-number
                v-model="form.expiryDay"
                placeholder="请输入保质期天数"
                :min="0"
                :precision="0"
                class="!w-1/1"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row>
          <el-col :span="12">
            <el-form-item label="基础重量" prop="weight">
              <el-input-number
                v-model="form.weight"
                placeholder="请输入重量（kg）"
                :min="0"
                class="!w-1/1"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="采购价格" prop="purchasePrice">
              <el-input-number
                v-model="form.purchasePrice"
                placeholder="请输入采购价格，单位：元"
                :min="0"
                class="!w-1/1"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="销售价格" prop="salePrice">
              <el-input-number
                v-model="form.salePrice"
                placeholder="请输入销售价格，单位：元"
                :min="0"
                class="!w-1/1"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="最低价格" prop="minPrice">
              <el-input-number
                v-model="form.minPrice"
                placeholder="请输入最低价格，单位：元"
                :min="0"
                class="!w-1/1"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="产品备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
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

<script setup name="Product" lang="ts">
import { listProduct, getProduct, delProduct, addProduct, updateProduct } from '@/api/erp/product/product';
import { ProductVO, ProductQuery, ProductForm } from '@/api/erp/product/product/types';
import {ProductCategoryVO} from "@/api/erp/product/category/types";
import {ProductUnitVO} from "@/api/erp/product/unit/types";
import {getProductUnitSimpleList} from "@/api/erp/product/unit";
import {categoryTreeSelect} from "@/api/erp/product/category";

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { sys_normal_disable } = toRefs<any>(proxy?.useDict('sys_normal_disable'));

const productList = ref<ProductVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const categoryOptions = ref<ProductCategoryVO[]>([]) // 产品分类列表
const unitOptions = ref<ProductUnitVO[]>([]) // 产品单位列表


const queryFormRef = ref<ElFormInstance>();
const productFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: ProductForm = {
  id: undefined,
  name: undefined,
  barCode: undefined,
  categoryId: undefined,
  unitId: undefined,
  status: undefined,
  standard: undefined,
  remark: undefined,
  expiryDay: undefined,
  weight: undefined,
  purchasePrice: undefined,
  salePrice: undefined,
  minPrice: undefined,
}
const data = reactive<PageData<ProductForm, ProductQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: undefined,
    barCode: undefined,
    categoryId: undefined,
    unitId: undefined,
    status: undefined,
    params: {
    }
  },
  rules: {
    id: [
      { required: true, message: "产品编号不能为空", trigger: "blur" }
    ],
    name: [
      { required: true, message: "产品名称不能为空", trigger: "blur" }
    ],
    barCode: [
      { required: true, message: "产品条码不能为空", trigger: "blur" }
    ],
    categoryId: [
      { required: true, message: "产品分类编号不能为空", trigger: "blur" }
    ],
    unitId: [
      { required: true, message: "单位编号不能为空", trigger: "blur" }
    ],
    status: [
      { required: true, message: "产品状态不能为空", trigger: "change" }
    ],
    expiryDay: [
      { required: true, message: "保质期天数不能为空", trigger: "blur" }
    ],
    weight: [
      { required: true, message: "基础重量不能为空", trigger: "blur" }
    ],
    purchasePrice: [
      { required: true, message: "采购价格，单位：元不能为空", trigger: "blur" }
    ],
    salePrice: [
      { required: true, message: "销售价格，单位：元不能为空", trigger: "blur" }
    ],
    minPrice: [
      { required: true, message: "最低价格，单位：元不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询所有下拉产品单位 */
const getUnitList = async () => {
  const res = await getProductUnitSimpleList();
  unitOptions.value = res.data;
}

/** 查询产品分类下拉树结构 */
const getcategoryOptionsTreeSelect = async () => {
  const res = await categoryTreeSelect();
  categoryOptions.value = res.data;
  console.log(categoryOptions.value);
};

/** 查询产品信息列表 */
// todo:产品列表中待显示分类名称盒单位名称
const getList = async () => {
  loading.value = true;
  const res = await listProduct(queryParams.value);
  productList.value = res.rows;
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
  productFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: ProductVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  getUnitList();
  dialog.visible = true;
  dialog.title = "添加产品信息";
}

/** 修改按钮操作 */
const handleUpdate = async (row?: ProductVO) => {
  reset();
  await getUnitList();
  const _id = row?.id || ids.value[0]
  const res = await getProduct(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改产品信息";
  console.log(form.value);
  // todo 产品分类
  // todo 产品单位
}

/** 提交按钮 */
const submitForm = () => {
  productFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateProduct(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addProduct(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("修改成功");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: ProductVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除产品信息编号为"' + _ids + '"的数据项？').finally(() => loading.value = false);
  await delProduct(_ids);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('erp/product/export', {
    ...queryParams.value
  }, `product_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getcategoryOptionsTreeSelect();
  getList();
});
</script>
