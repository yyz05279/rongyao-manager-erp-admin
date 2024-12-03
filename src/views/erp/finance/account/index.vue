<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div class="search" v-show="showSearch">
        <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="68px">
          <el-form-item label="账户编码" prop="no">
            <el-input v-model="queryParams.no" placeholder="请输入账户编码" clearable style="width: 240px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="账户名称" prop="name">
            <el-input v-model="queryParams.name" placeholder="请输入账户名称" clearable style="width: 240px" @keyup.enter="handleQuery" />
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
          <el-form-item label="备注" prop="remark">
            <el-input v-model="queryParams.remark" placeholder="请输入备注" clearable style="width: 240px" @keyup.enter="handleQuery" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['erp:account:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['erp:account:edit']">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['erp:account:remove']">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['erp:account:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="accountList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="账户编码" align="center" prop="no" />
        <el-table-column label="账户名称" align="center" prop="name" />
        <el-table-column label="开启状态" align="center" prop="status">
          <template #default="scope">
            <dict-tag :options="sys_normal_disable" :value="scope.row.status"/>
          </template>
        </el-table-column>
        <el-table-column label="备注" align="center" prop="remark" />
        <el-table-column label="是否默认" align="center" prop="defaultStatus" />
        <el-table-column label="是否默认" align="center" prop="defaultStatus">
          <template #default="scope">
            <el-switch
              v-model="scope.row.defaultStatus"
              :active-value="0"
              :inactive-value="1"
              @change="handleDefaultStatusChange(scope.row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="创建时间" align="center" prop="createTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.createTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="创建人" align="center" prop="createBy" />
        <el-table-column label="更新时间" align="center" prop="updateTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.updateTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="更新人" align="center" prop="updateBy" />
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['erp:account:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['erp:account:remove']"></el-button>
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
    <!-- 添加或修改ERP 结算账户对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="accountFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="账户名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入账户名称" />
        </el-form-item>
        <el-form-item label="账户编码" prop="no">
          <el-input v-model="form.no" placeholder="请输入账户编码" />
        </el-form-item>
        <el-form-item label="单位状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio
              v-for="dict in sys_normal_disable"
              :key="dict.value"
              :label="parseInt(dict.value)"
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" controls-position="right" :min="1" :precision="0" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入备注" />
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

<script setup name="Account" lang="ts">
import {
  listAccount,
  getAccount,
  delAccount,
  addAccount,
  updateAccount,
  updateAccountDefaultStatus
} from '@/api/erp/finance/account';
import { AccountVO, AccountQuery, AccountForm } from '@/api/erp/finance/account/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { sys_normal_disable } = toRefs<any>(proxy?.useDict('sys_normal_disable'));

const accountList = ref<AccountVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const accountFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: AccountForm = {
  id: undefined,
  name: undefined,
  no: undefined,
  remark: undefined,
  status: undefined,
  sort: undefined,
  defaultStatus: undefined,
}
const data = reactive<PageData<AccountForm, AccountQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: undefined,
    no: undefined,
    status: undefined,
    sort: undefined,
    remark: undefined,
    defaultStatus: undefined,
    params: {
    }
  },
  rules: {
    name: [
      { required: true, message: "账户名称不能为空", trigger: "blur" }
    ],
    no: [
      { required: true, message: "账户编码不能为空", trigger: "blur" }
    ],
    status: [
      { required: true, message: "开启状态不能为空", trigger: "change" }
    ]
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询ERP 结算账户列表 */
const getList = async () => {
  loading.value = true;
  const res = await listAccount(queryParams.value);
  accountList.value = res.rows;
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
  accountFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: AccountVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}
/** 修改默认状态 */
const handleDefaultStatusChange = async (row: AccountVO) => {
  try {
    // 修改状态的二次确认
    const text = row.defaultStatus  === 0 ? '设置' : '取消'
    await proxy?.$modal.confirm('确认要' + text + '"' + row.name + '"默认吗?').finally(() => loading.value = false);
    // 发起修改状态
    await updateAccountDefaultStatus(row.no,row.id, row.defaultStatus)
    proxy?.$modal.msgSuccess(text + "成功");
    // 刷新列表
    await getList()
  } catch (e) {
    // 取消后，进行恢复按钮
    row.defaultStatus = row.defaultStatus === 0 ? 1 : 0;
  }
}
/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "添加ERP 结算账户";
}

/** 修改按钮操作 */
const handleUpdate = async (row?: AccountVO) => {
  reset();
  const _id = row?.id || ids.value[0]
  const res = await getAccount(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改ERP 结算账户";
}

/** 提交按钮 */
const submitForm = () => {
  accountFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateAccount(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addAccount(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("修改成功");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: AccountVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除ERP 结算账户编号为"' + _ids + '"的数据项？').finally(() => loading.value = false);
  await delAccount(_ids);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('account/account/export', {
    ...queryParams.value
  }, `account_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList();
});
</script>
