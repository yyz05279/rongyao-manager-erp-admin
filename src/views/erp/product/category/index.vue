<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div class="search" v-show="showSearch">
        <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="68px">
          <el-form-item label="分类名称" prop="name">
            <el-input v-model="queryParams.name" placeholder="请输入分类名称" clearable style="width: 240px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="分类编码" prop="code">
            <el-input v-model="queryParams.code" placeholder="请输入分类编码" clearable style="width: 240px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="开启状态" prop="status">
            <el-select v-model="queryParams.status" placeholder="请选择开启状态" clearable>
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd()" v-hasPermi="['erp:category:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="info" plain icon="Sort" @click="handleToggleExpandAll">展开/折叠</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>
      <el-table
        v-loading="loading"
        :data="productCategoryList"
        row-key="id"
        :default-expand-all="isExpandAll"
        :tree-props="{children: 'children', hasChildren: 'hasChildren'}"
        ref="productCategoryTableRef"
      >
        <el-table-column label="分类名称" align="center" prop="name" />
        <el-table-column label="分类编码" align="center" prop="code" />
        <el-table-column label="分类排序" align="center" prop="sort" />
        <el-table-column label="开启状态" align="center" prop="status">
          <template #default="scope">
            <dict-tag :options="sys_normal_disable" :value="scope.row.status"/>
          </template>
        </el-table-column>
        <el-table-column
          label="创建时间"
          align="center"
          prop="createTime"
          :formatter="dateFormatter"
          width="180px"
        />
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['erp:category:edit']" />
            </el-tooltip>
            <el-tooltip content="新增" placement="top">
              <el-button link type="primary" icon="Plus" @click="handleAdd(scope.row)" v-hasPermi="['erp:category:add']" />
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['erp:category:remove']" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加或修改产品分类对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="productCategoryFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="父分类" prop="parentId">
          <el-tree-select
            v-model="form.parentId"
            :data="productCategoryOptions"
            :props="{ value: 'id', label: 'name', children: 'children' }"
            value-key="id"
            placeholder="请选择父分类编号"
            check-strictly
          />
        </el-form-item>
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="分类编码" prop="code">
          <el-input v-model="form.code" placeholder="请输入分类编码" />
        </el-form-item>
        <el-row>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio
                  v-for="dict in sys_normal_disable"
                  :key="dict.value"
                  :label="dict.value"
                >{{dict.label}}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序" prop="sort">
              <el-input-number v-model="form.sort" controls-position="right" :min="1" :precision="0" />
            </el-form-item>
          </el-col>
        </el-row>
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

<script setup name="ProductCategory" lang="ts">
import { listProductCategory, getProductCategory, delProductCategory, addProductCategory, updateProductCategory } from "@/api/erp/product/category";
import { ProductCategoryVO, ProductCategoryQuery, ProductCategoryForm } from '@/api/erp/product/category/types';

type ProductCategoryOption = {
  id: number;
  name: string;
  children?: ProductCategoryOption[];
}

const { proxy } = getCurrentInstance() as ComponentInternalInstance;;

const { sys_normal_disable } = toRefs<any>(proxy?.useDict('sys_normal_disable'));

const productCategoryList = ref<ProductCategoryVO[]>([]);
const productCategoryOptions = ref<ProductCategoryOption[]>([]);
const buttonLoading = ref(false);
const showSearch = ref(true);
const isExpandAll = ref(true);
const loading = ref(false);

const queryFormRef = ref<ElFormInstance>();
const productCategoryFormRef = ref<ElFormInstance>();
const productCategoryTableRef = ref<ElTableInstance>()

const dialog = reactive<DialogOption>({
    visible: false,
    title: ''
});


const initFormData: ProductCategoryForm = {
    id: undefined,
    parentId: undefined,
    name: undefined,
    code: undefined,
    sort: undefined,
    status: undefined,
}

const data = reactive<PageData<ProductCategoryForm, ProductCategoryQuery>>({
  form: {...initFormData},
  queryParams: {
    parentId: undefined,
    name: undefined,
    code: undefined,
    status: undefined,
    params: {
    }
  },
  rules: {
    parentId: [
      { required: true, message: "父分类编号不能为空", trigger: "blur" }
    ],
    name: [
      { required: true, message: "分类名称不能为空", trigger: "blur" }
    ],
    code: [
      { required: true, message: "分类编码不能为空", trigger: "blur" }
    ],
    status: [
      { required: true, message: "开启状态不能为空", trigger: "change" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询产品分类列表 */
const getList = async () => {
  loading.value = true;
  const res = await listProductCategory(queryParams.value);
  const data = proxy?.handleTree<ProductCategoryVO>(res.data, "id", );

  if (data) {
    productCategoryList.value = data;
    loading.value = false;
  }
}

/** 查询产品分类下拉树结构 */
const getTreeselect = async () => {
  const res = await listProductCategory();
  productCategoryOptions.value = [];
  const data: ProductCategoryOption = { id: 0, name: '顶级节点', children: [] };
  data.children = proxy?.handleTree<ProductCategoryOption>(res.data, "id", "parentId");
  productCategoryOptions.value.push(data);
}

// 取消按钮
const cancel = () => {
  reset();
  dialog.visible = false;
}

// 表单重置
const reset = () => {
  form.value = {...initFormData}
  productCategoryFormRef.value?.resetFields();
}

/** 搜索按钮操作 */
const handleQuery = () => {
  getList();
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value?.resetFields();
  handleQuery();
}

/** 新增按钮操作 */
const handleAdd = (row?: ProductCategoryVO) => {
  reset();
  getTreeselect();
  if (row != null && row.code) {
      form.value.parentId = row.code;
  } else {
      form.value.parentId = 0;
  }
  dialog.visible = true;
  dialog.title = "添加产品分类";
}

/** 展开/折叠操作 */
const handleToggleExpandAll = () => {
  isExpandAll.value = !isExpandAll.value;
  toggleExpandAll(productCategoryList.value, isExpandAll.value)
}

/** 展开/折叠操作 */
const toggleExpandAll = (data: ProductCategoryVO[], status: boolean) => {
  data.forEach((item) => {
    productCategoryTableRef.value?.toggleRowExpansion(item, status)
    if (item.children && item.children.length > 0) toggleExpandAll(item.children, status)
  })
}

/** 修改按钮操作 */
const handleUpdate = async (row: ProductCategoryVO) => {
  reset();
  await getTreeselect();
  if (row != null) {
    form.value.parentId = row.parentId;
  }
  const res = await getProductCategory(row.id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改产品分类";
}

/** 提交按钮 */
const submitForm = () => {
  productCategoryFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateProductCategory(form.value).finally(() => buttonLoading.value = false);
      } else {
        await addProductCategory(form.value).finally(() => buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("操作成功");
      dialog.visible = false;
      getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row: ProductCategoryVO) => {
  await proxy?.$modal.confirm('是否确认删除产品分类名称为"' + row.name+ '"，编号为"' + row.code + '"的数据项？');
  loading.value = true;
  await delProductCategory(row.id).finally(() => loading.value = false);
  await getList();
  proxy?.$modal.msgSuccess("删除成功");
}

onMounted(() => {
  getList();
});
</script>
