<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryFormRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="收款单号" prop="no">
        <el-input
          v-model="queryParams.no"
          placeholder="请输入收款单号"
          clearable
          style="width: 240px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="收款状态" prop="status">
        <el-select v-model="queryParams.status" placeholder="收款状态" clearable style="width: 240px">
          <el-option label="待收款" value="0" />
          <el-option label="已收款" value="1" />
          <el-option label="已取消" value="2" />
        </el-select>
      </el-form-item>
      <el-form-item label="收款时间" style="width: 308px">
        <el-date-picker
          v-model="dateRange"
          value-format="YYYY-MM-DD"
          type="daterange"
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        ></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['erp:receipt:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate()"
          v-hasPermi="['erp:receipt:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete()"
          v-hasPermi="['erp:receipt:remove']"
        >删除</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="receiptList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="收款单号" align="center" prop="no" />
      <el-table-column label="客户" align="center" prop="customerName" />
      <el-table-column label="结算账户" align="center" prop="accountName" />
      <el-table-column label="收款金额" align="center" prop="totalPrice">
        <template #default="scope">
          <span>¥{{ scope.row.totalPrice }}</span>
        </template>
      </el-table-column>
      <el-table-column label="收款状态" align="center" prop="status">
        <template #default="scope">
          <dict-tag :options="receipt_status" :value="scope.row.status" />
        </template>
      </el-table-column>
      <el-table-column label="收款时间" align="center" prop="receiptTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.receiptTime, '{y}-{m}-{d}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-tooltip content="修改" placement="top">
            <el-button
              link
              type="primary"
              icon="Edit"
              @click="handleUpdate(scope.row)"
              v-hasPermi="['erp:receipt:edit']"
            ></el-button>
          </el-tooltip>
          <el-tooltip content="删除" placement="top">
            <el-button
              link
              type="danger"
              icon="Delete"
              @click="handleDelete(scope.row)"
              v-hasPermi="['erp:receipt:remove']"
            ></el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改收款单对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="receiptFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="收款单号" prop="no">
          <el-input v-model="form.no" placeholder="请输入收款单号" />
        </el-form-item>
        <el-form-item label="客户" prop="customerId">
          <el-select v-model="form.customerId" placeholder="请选择客户" style="width: 100%">
            <el-option
              v-for="customer in customerList"
              :key="customer.id"
              :label="customer.name"
              :value="customer.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="结算账户" prop="accountId">
          <el-select v-model="form.accountId" placeholder="请选择结算账户" style="width: 100%">
            <el-option
              v-for="account in accountList"
              :key="account.id"
              :label="account.name"
              :value="account.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="收款金额" prop="totalPrice">
          <el-input-number v-model="form.totalPrice" :precision="2" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="收款时间" prop="receiptTime">
          <el-date-picker
            v-model="form.receiptTime"
            type="date"
            placeholder="选择收款时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancel">取 消</el-button>
          <el-button type="primary" @click="submitForm">确 定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Receipt" lang="ts">
import { listReceipt, getReceipt, delReceipt, addReceipt, updateReceipt } from '@/api/erp/finance/receipt';
import { ReceiptVO, ReceiptQuery, ReceiptForm } from '@/api/erp/finance/receipt/types';
import { getCustomerSimpleList } from '@/api/erp/sale/customer';
import { getAccountSimpleList } from '@/api/erp/finance/account';

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { receipt_status } = toRefs<any>(proxy?.useDict('receipt_status'));

const receiptList = ref<ReceiptVO[]>([]);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const dateRange = ref<[DateModelType, DateModelType]>(['', '']);

const queryFormRef = ref<ElFormInstance>();
const receiptFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: ReceiptForm = {
  id: undefined,
  no: '',
  status: 0,
  customerId: undefined,
  accountId: undefined,
  receiptTime: '',
  totalPrice: 0,
  remark: ''
};
const form = reactive<ReceiptForm>({ ...initFormData });

const queryParams = reactive<ReceiptQuery>({
  pageNum: 1,
  pageSize: 10,
  no: '',
  status: undefined,
  customerId: undefined,
  accountId: undefined,
  receiptTime: undefined
});

const rules: ElFormRules = {
  no: [{ required: true, message: '收款单号不能为空', trigger: 'blur' }],
  customerId: [{ required: true, message: '客户不能为空', trigger: 'change' }],
  accountId: [{ required: true, message: '结算账户不能为空', trigger: 'change' }],
  totalPrice: [{ required: true, message: '收款金额不能为空', trigger: 'blur' }],
  receiptTime: [{ required: true, message: '收款时间不能为空', trigger: 'blur' }]
};

const customerList = ref<any[]>([]);
const accountList = ref<any[]>([]);

/** 查询收款单列表 */
const getList = async () => {
  loading.value = true;
  queryParams.params = {};
  if (dateRange.value && dateRange.value.length === 2) {
    queryParams.params['beginReceiptTime'] = dateRange.value[0];
    queryParams.params['endReceiptTime'] = dateRange.value[1];
  }
  try {
    const response = await listReceipt(queryParams);
    receiptList.value = response.data;
    total.value = response.data.length;
  } finally {
    loading.value = false;
  }
};

/** 取消按钮 */
const cancel = () => {
  reset();
  dialog.visible = false;
};

/** 表单重置 */
const reset = () => {
  Object.assign(form, initFormData);
  receiptFormRef.value?.resetFields();
};

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNum = 1;
  getList();
};

/** 重置按钮操作 */
const resetQuery = () => {
  dateRange.value = ['', ''];
  queryFormRef.value?.resetFields();
  handleQuery();
};

/** 多选框选中数据 */
const handleSelectionChange = (selection: ReceiptVO[]) => {
  ids.value = selection.map((item) => item.id);
  single.value = selection.length !== 1;
  multiple.value = !selection.length;
};

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = '添加收款单';
};

/** 修改按钮操作 */
const handleUpdate = async (row?: ReceiptVO) => {
  reset();
  const _id = row?.id || ids.value[0];
  try {
    const response = await getReceipt(_id);
    Object.assign(form, response.data);
    dialog.visible = true;
    dialog.title = '修改收款单';
  } catch (error) {
    console.error(error);
  }
};

/** 提交按钮 */
const submitForm = () => {
  receiptFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      try {
        if (form.id) {
          await updateReceipt(form);
          proxy?.$modal.msgSuccess('修改成功');
        } else {
          await addReceipt(form);
          proxy?.$modal.msgSuccess('新增成功');
        }
        dialog.visible = false;
        await getList();
      } catch (error) {
        console.error(error);
      }
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: ReceiptVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除收款单编号为"' + _ids + '"的数据项？');
  try {
    await delReceipt(_ids);
    await getList();
    proxy?.$modal.msgSuccess('删除成功');
  } catch (error) {
    console.error(error);
  }
};

/** 初始化数据 */
const initData = async () => {
  try {
    const [customerResponse, accountResponse] = await Promise.all([
      getCustomerSimpleList(),
      getAccountSimpleList()
    ]);
    customerList.value = customerResponse.data;
    accountList.value = accountResponse.data;
  } catch (error) {
    console.error('初始化数据失败:', error);
  }
};

onMounted(() => {
  getList();
  initData();
});
</script>
