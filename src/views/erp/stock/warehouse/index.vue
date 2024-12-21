<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div class="search" v-show="showSearch">
        <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="68px">
          <el-form-item label="仓库名称" prop="name">
            <el-input v-model="queryParams.name" placeholder="请输入仓库名称" clearable style="width: 240px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="负责人" prop="principal">
            <el-input v-model="queryParams.principal" placeholder="请输入负责人" clearable style="width: 240px" @keyup.enter="handleQuery" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['erp:warehouse:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['erp:warehouse:edit']">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['erp:warehouse:remove']">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['erp:warehouse:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="warehouseList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="仓库名称" align="center" prop="name" />
        <el-table-column label="仓库地址" align="center" prop="address" />
        <el-table-column label="仓储费" align="center" prop="warehousePrice" />
        <el-table-column label="搬运费" align="center" prop="truckagePrice" />
        <el-table-column label="负责人" align="center" prop="principal" />
        <el-table-column label="排序" align="center" prop="sort" />
        <el-table-column label="开启状态" align="center" prop="status">
          <template #default="scope">
            <dict-tag :options="sys_normal_disable" :value="scope.row.status"/>
          </template>
        </el-table-column>
        <el-table-column label="是否默认" align="center" prop="defaultStatus">
          <template #default="scope">
            <el-switch
              v-model="scope.row.defaultStatus"
              :active-value="0"
              :inactive-value="1"
              @click="handleChangeDefaultStatus(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="备注" align="center" prop="remark" />
        <el-table-column label="创建时间" align="center" prop="createTime" width="180">
        </el-table-column>
        <el-table-column label="创建人" align="center" prop="createBy" />
        <el-table-column label="更新时间" align="center" prop="updateTime" width="180">
        </el-table-column>
        <el-table-column label="更新人" align="center" prop="updateBy" />
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['erp:warehouse:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['erp:warehouse:remove']"></el-button>
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
    <!-- 添加或修改仓库信息对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="900px" append-to-body>
      <el-form ref="warehouseFormRef" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="仓库名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入仓库名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="负责人" prop="principal">
              <el-input v-model="form.principal" placeholder="请输入负责人" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="仓储费:元" prop="warehousePrice">
              <el-input v-model="form.warehousePrice" placeholder="请输入仓储费，单位：元" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="搬运费:元" prop="truckagePrice">
              <el-input v-model="form.truckagePrice" placeholder="请输入搬运费，单位：元" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="仓库地址" prop="address">
          <el-input v-model="form.address" placeholder="请输入仓库地址" />
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
        <el-form-item label="备注" prop="remark">
            <el-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
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

<script setup name="Warehouse" lang="ts">
import { listWarehouse, getWarehouse, delWarehouse, addWarehouse, updateWarehouse, changeDefaultStatus } from '@/api/erp/stock/warehouse';
import { WarehouseVO, WarehouseQuery, WarehouseForm } from '@/api/erp/stock/warehouse/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { sys_normal_disable } = toRefs<any>(proxy?.useDict( 'sys_normal_disable'));

const warehouseList = ref<WarehouseVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const warehouseFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

// 列显隐信息
const columns = ref<FieldOption[]>([
  { key: 0, label: `仓库名称`, visible: false,children: [] },
  { key: 1, label: `仓库地址`, visible: true,children: [] },
  { key: 2, label: `仓储费`, visible: true,children: [] },
  { key: 3, label: `搬运费`, visible: true,children: [] },
  { key: 4, label: `负责人`, visible: true,children: [] },
  { key: 5, label: `排序`, visible: true,children: [] },
  { key: 6, label: `开启状态`, visible: true,children: [] },
  { key: 7, label: `是否默认`, visible: true,children: [] }
]);

const initFormData: WarehouseForm = {
  id: undefined,
  name: undefined,
  address: undefined,
  sort: undefined,
  remark: '',
  principal: undefined,
  warehousePrice: undefined,
  truckagePrice: undefined,
  status: undefined,
  defaultStatus: undefined
}
const data = reactive<PageData<WarehouseForm, WarehouseQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: undefined,
    address: undefined,
    sort: undefined,
    principal: undefined,
    status: undefined,
    defaultStatus: undefined,
    params: {
    }
  },
  rules: {
    name: [
      { required: true, message: "仓库名称不能为空", trigger: "blur" }
    ],
    address: [
      { required: true, message: "仓库地址不能为空", trigger: "blur" }
    ],
    principal: [
      { required: true, message: "负责人不能为空", trigger: "blur" }
    ],
    status: [
      { required: true, message: "开启状态不能为空", trigger: "change" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询仓库信息列表 */
const getList = async () => {
  loading.value = true;
  const res = await listWarehouse(queryParams.value);
  console.log("res:",res)
  warehouseList.value = res.rows;
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
  warehouseFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: WarehouseVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "添加仓库信息";
}

/** 修改按钮操作 */
const handleUpdate = async (row?: WarehouseVO) => {
  reset();
  const _id = row?.id || ids.value[0]
  const res = await getWarehouse(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改仓库信息";
}

/** 提交按钮 */
const submitForm = () => {
  warehouseFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateWarehouse(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addWarehouse(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("修改成功");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: WarehouseVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除仓库信息编号为"' + _ids + '"的数据项？').finally(() => loading.value = false);
  await delWarehouse(_ids);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('system/warehouse/export', {
    ...queryParams.value
  }, `warehouse_${new Date().getTime()}.xlsx`)
}

/** 修改默认状态  */
const handleChangeDefaultStatus = async (row: WarehouseVO) => {
  try {
    // 修改状态的二次确认
    const text = row.defaultStatus === 0 ? "设置" : "取消"
    await proxy?.$modal.confirm('确认要"' + text + '""' + row.name + '"为默认吗?').finally(() => loading.value = false);
    // 发起修改状态
    await changeDefaultStatus(row.id, row.defaultStatus);
    proxy?.$modal.msgSuccess(text + "成功");
    // 刷新列表
    await getList()
  } catch (err) {
    // 取消后，进行恢复按钮
    row.defaultStatus = row.defaultStatus === 0 ? 1 : 0;
  }
}

onMounted(() => {
  getList();
});
</script>
