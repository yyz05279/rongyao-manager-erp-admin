<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div class="search" v-show="showSearch">
        <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="68px">
          <el-form-item label="客户编号" prop="name">
            <el-input v-model="queryParams.id" placeholder="请输入客户编号" clearable style="width: 240px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="客户名称" prop="name">
            <el-input v-model="queryParams.name" placeholder="请输入客户名称" clearable style="width: 240px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="联系人" prop="contact">
            <el-input v-model="queryParams.contact" placeholder="请输入联系人" clearable style="width: 240px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="手机号码" prop="mobile">
            <el-input v-model="queryParams.mobile" placeholder="请输入手机号码" clearable style="width: 240px" @keyup.enter="handleQuery" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['erp:customer:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['erp:customer:edit']">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['erp:customer:remove']">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['erp:customer:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="customerList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="客户名称" align="center" prop="name" />
        <el-table-column label="联系人" align="center" prop="contact" />
        <el-table-column label="手机号码" align="center" prop="mobile" />
        <el-table-column label="电子邮箱" align="center" prop="email" />
        <el-table-column label="排序" align="center" prop="sort" />
        <el-table-column label="状态" align="center" key="status" v-if="columns[7].visible">
          <template #default="scope">
            <el-switch v-model="scope.row.status" active-value="0" inactive-value="1" @click="handleStatusChange(scope.row)" />
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['erp:customer:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['erp:customer:remove']"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <pagination v-show="total>0" :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize" @pagination="getList" />
    </el-card>
    <!-- 添加或修改客户信息对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="900px" append-to-body @close="closeDialog">
      <el-form ref="customerFormRef" :model="form" :rules="rules" label-width="80px">
        <el-row>
          <el-col :span="12">
            <el-form-item label="客户名称" prop="name">
              <el-input v-model="form.name" placeholder="请输入客户名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系人" prop="contact">
              <el-input v-model="form.contact" placeholder="请输入联系人" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="手机号码" prop="mobile">
              <el-input v-model="form.mobile" placeholder="请输入手机号码" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="telephone">
              <el-input v-model="form.telephone" placeholder="请输入联系电话" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="电子邮箱" prop="email">
              <el-input v-model="form.email" placeholder="请输入电子邮箱" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="传真" prop="fax">
              <el-input v-model="form.fax" placeholder="请输入传真" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.value">{{
                    dict.label }}</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="排序" prop="sort">
              <el-input-number v-model="form.sort" controls-position="right" :min="0" :precision="0" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="纳税号" prop="taxNo">
              <el-input v-model="form.taxNo" placeholder="请输入纳税人识别号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="税率" prop="taxPercent">
              <el-input-number v-model="form.taxPercent" :min="0" :precision="2" placeholder="请输入税率" class="!w-1/1" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="12">
            <el-form-item label="开户行" prop="bankName">
              <el-input v-model="form.bankName" placeholder="请输入开户行" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="开户账号" prop="bankAccount">
              <el-input v-model="form.bankAccount" placeholder="请输入开户账号" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="开户地址" prop="bankAddress">
          <el-input v-model="form.bankAddress" placeholder="请输入开户地址" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input type="textarea" v-model="form.remark" placeholder="请输入备注" />
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

<script setup name="ErpCustomer" lang="ts">
import { listCustomer, getCustomer, delCustomer, addCustomer, updateCustomer ,changeCustomerStatus } from '@/api/erp/sale/customer';
import { CustomerVO, CustomerQuery, CustomerForm } from '@/api/erp/sale/customer/types';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;

const customerList = ref<CustomerVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const { sys_normal_disable } = toRefs<any>(proxy?.useDict('sys_normal_disable'));

const queryFormRef = ref<ElFormInstance>();
const customerFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

// 列显隐信息
const columns = ref<FieldOption[]>([
  { key: 0, label: `客户编号`, visible: false,children: [] },
  { key: 1, label: `客户名称`, visible: true,children: [] },
  { key: 2, label: `联系人`, visible: true,children: [] },
  { key: 3, label: `手机号码`, visible: true,children: [] },
  { key: 4, label: `手机号码`, visible: true,children: [] },
  { key: 5, label: `电子邮箱`, visible: true,children: [] },
  { key: 6, label: `排序`, visible: true,children: [] },
  { key: 7, label: `状态`, visible: true,children: [] }
])

const initFormData: CustomerForm = {
  id: undefined,
  name: undefined,
  contact: undefined,
  mobile: undefined,
  telephone: undefined,
  email: undefined,
  fax: undefined,
  remark: '',
  status: "0",
  sort: undefined,
  taxNo: undefined,
  taxPercent: undefined,
  bankName: undefined,
  bankAccount: undefined,
  bankAddress: undefined
}
const data = reactive<PageData<CustomerForm, CustomerQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    id: undefined,
    name: undefined,
    contact: undefined,
    mobile: undefined,
    status: undefined,
    params: {
    }
  },
  rules: {
    id: [
      {required: true, message: "产品编号不能为空", trigger: "blur"}
    ],
    name: [
      {required: true, message: "客户名称不能为空", trigger: "blur"}
    ],
    contact: [
      {required: true, message: "联系人不能为空", trigger: "blur"}
    ],
    status: [
      {required: true, message: "开启状态不能为空", trigger: "change"}
    ],
    taxNo: [
      {required: true, message: "纳税人识别号不能为空", trigger: "blur"}
    ],
    taxPercent: [
      {required: true, message: "税率不能为空", trigger: "blur"}
    ],
    bankName: [
      {required: true, message: "开户行不能为空", trigger: "blur"}
    ],
    bankAccount: [
      {required: true, message: "开户账号不能为空", trigger: "blur"}
    ],
    bankAddress: [
      {required: true, message: "开户地址不能为空", trigger: "blur"}
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询客户信息列表 */
const getList = async () => {
  loading.value = true;
  const res = await listCustomer(queryParams.value);
  customerList.value = res.rows;
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
  customerFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: CustomerVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "添加客户信息";
}

/** 修改按钮操作 */
const handleUpdate = async (row?: CustomerVO) => {
  reset();
  const _id = row?.id || ids.value[0]
  const res = await getCustomer(_id);
  console.log(res.data.status);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改客户信息";
}

/** 提交按钮 */
const submitForm = () => {
  customerFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updateCustomer(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addCustomer(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("修改成功");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: CustomerVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除客户信息编号为"' + _ids + '"的数据项？').finally(() => loading.value = false);
  await delCustomer(_ids);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('erp/customer/export', {
    ...queryParams.value
  }, `customer_${new Date().getTime()}.xlsx`)
}
/** 客户状态修改  */
const handleStatusChange = async (row: CustomerVO) => {
  let text = row.status === "0" ? "启用" : "停用"
  try {
    await proxy?.$modal.confirm('确认要"' + text + '""' + row.name + '"用户吗?');
    await changeCustomerStatus(row.id, row.status);
    proxy?.$modal.msgSuccess(text + "成功");
  } catch (err) {
    row.status = row.status === "0" ? "1" : "0";
  }
}

/** 关闭客户弹窗 */
const closeDialog=()=>{
  dialog.visible = false;
  reset();
}
onMounted(() => {
  getList();
});
</script>
