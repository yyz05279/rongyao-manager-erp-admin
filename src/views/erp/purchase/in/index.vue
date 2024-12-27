<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div class="search" v-show="showSearch">
        <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="68px">
          <el-form-item label="入库单号" prop="no">
            <el-input v-model="queryParams.no" placeholder="请输入入库单号" clearable style="width: 240px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="关联订单" prop="accountId">
            <el-input v-model="queryParams.accountId" placeholder="请输入关联订单" clearable style="width: 240px" @keyup.enter="handleQuery"/>
          </el-form-item>
          <el-form-item label="供应商" prop="supplierId">
            <el-select v-model="queryParams.supplierId"  placeholder="请选择供应商" clearable style="width: 100%">
              <el-option v-for="item in supplierList" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="仓库" prop="wareHouseId">
            <el-select v-model="queryParams.wareHouseId"  placeholder="请选择仓库" clearable style="width: 100%">
              <el-option v-for="item in wareHouseList" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="订单时间" style="width: 308px">
          <el-date-picker
            v-model="dateRange"
            value-format="YYYY-MM-DD HH:mm:ss"
            type="daterange"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]"
          ></el-date-picker>
        </el-form-item>
          <el-form-item label="创建人" prop="createBy">
            <el-select
              v-model="queryParams.createBy"
              clearable
              filterable
              placeholder="请选择创建人"
              class="!w-240px"
            >
              <el-option
                v-for="item in userList"
                :key="item.userId"
                :label="item.nickName"
                :value="item.userId"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="付款状态" prop="paymentStatus">
            <el-select
              v-model="queryParams.paymentStatus"
              placeholder="请选择付款状态"
              clearable
              class="!w-240px"
            >
              <el-option label="未付款" value="0" />
              <el-option label="部分付款" value="1" />
              <el-option label="全部付款" value="2" />
            </el-select>
          </el-form-item>
          <el-form-item label="审核状态" prop="status">
             <el-select v-model="queryParams.status" placeholder="请选择审核状态" clearable>
            <el-option
              v-for="dict in erp_audit_status"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
          </el-form-item>
          <el-form-item label="产品" prop="productId">
            <el-select v-model="queryParams.productId"  placeholder="请选择产品" clearable style="width: 100%">
              <el-option v-for="item in productList" :key="item.id" :label="item.name" :value="item.id" />
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
            <el-button type="primary" plain icon="Plus" @click="handleAdd" v-hasPermi="['system:purchaseIn:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="handleUpdate()" v-hasPermi="['system:purchaseIn:edit']">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['system:purchaseIn:remove']">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['system:purchaseIn:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="purchaseInList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="编号" align="center" prop="id" v-if="true" />
        <el-table-column label="采购入库编号" align="center" prop="no" />
        <el-table-column label="采购状态" align="center" prop="status" />
        <el-table-column label="供应商编号" align="center" prop="supplierId" />
        <el-table-column label="入库时间" align="center" prop="inTime" width="180">
          <template #default="scope">
            <span>{{ parseTime(scope.row.inTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="总数量" align="center" prop="totalCount" />
        <el-table-column label="应付金额" align="center" prop="totalPrice" />
        <el-table-column label="已付金额" align="center" prop="paymentPrice" />
        <el-table-column label="已未金额" align="center" prop="paymentPrice" />
        <el-table-column label="备注" align="center" prop="remark" />
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-tooltip content="详情" placement="top">
              <el-button link type="primary" icon="View" @click="openForm('detail', scope.row)" v-hasPermi="['erp:purchaseIn:query']"></el-button>
            </el-tooltip>
            <el-tooltip content="修改" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:purchaseIn:edit']"></el-button>
            </el-tooltip>
            <el-tooltip content="审批" placement="top">
              <el-button link type="primary" icon="Check" @click="handleUpdateStatus(scope.row.id, 20)" v-hasPermi="['erp:purchaseorder:check']"   v-if="scope.row.status === 10" ></el-button>
            </el-tooltip>
            <el-tooltip content="反审批" placement="top">
              <el-button link type="danger" icon="Close" @click="handleUpdateStatus(scope.row.id, 10)" v-hasPermi="['erp:purchaseorder:check']" v-if="scope.row.status === 20"  ></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:purchaseIn:remove']"></el-button>
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
    <!-- 添加或修改ERP 采购入库对话框 -->
    <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
      <el-form ref="purchaseInFormRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="采购入库编号" prop="no">
          <el-input v-model="form.no" placeholder="请输入采购入库编号" />
        </el-form-item>
        <el-form-item label="供应商编号" prop="supplierId">
          <el-input v-model="form.supplierId" placeholder="请输入供应商编号" />
        </el-form-item>
        <el-form-item label="结算账户编号" prop="accountId">
          <el-input v-model="form.accountId" placeholder="请输入结算账户编号" />
        </el-form-item>
        <el-form-item label="入库时间" prop="inTime">
          <el-date-picker clearable
            v-model="form.inTime"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择入库时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="采购订单编号" prop="orderId">
          <el-input v-model="form.orderId" placeholder="请输入采购订单编号" />
        </el-form-item>
        <el-form-item label="采购订单号" prop="orderNo">
          <el-input v-model="form.orderNo" placeholder="请输入采购订单号" />
        </el-form-item>
        <el-form-item label="合计数量" prop="totalCount">
          <el-input v-model="form.totalCount" placeholder="请输入合计数量" />
        </el-form-item>
        <el-form-item label="合计价格，单位：元" prop="totalPrice">
          <el-input v-model="form.totalPrice" placeholder="请输入合计价格，单位：元" />
        </el-form-item>
        <el-form-item label="已付款金额，单位：元" prop="paymentPrice">
          <el-input v-model="form.paymentPrice" placeholder="请输入已付款金额，单位：元" />
        </el-form-item>
        <el-form-item label="合计产品价格，单位：元" prop="totalProductPrice">
          <el-input v-model="form.totalProductPrice" placeholder="请输入合计产品价格，单位：元" />
        </el-form-item>
        <el-form-item label="合计税额，单位：元" prop="totalTaxPrice">
          <el-input v-model="form.totalTaxPrice" placeholder="请输入合计税额，单位：元" />
        </el-form-item>
        <el-form-item label="优惠率，百分比" prop="discountPercent">
          <el-input v-model="form.discountPercent" placeholder="请输入优惠率，百分比" />
        </el-form-item>
        <el-form-item label="优惠金额，单位：元" prop="discountPrice">
          <el-input v-model="form.discountPrice" placeholder="请输入优惠金额，单位：元" />
        </el-form-item>
        <el-form-item label="其它金额，单位：元" prop="otherPrice">
          <el-input v-model="form.otherPrice" placeholder="请输入其它金额，单位：元" />
        </el-form-item>
        <el-form-item label="附件地址" prop="fileUrl">
            <el-input v-model="form.fileUrl" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
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

<script setup name="PurchaseIn" lang="ts">
import { listPurchaseIn, getPurchaseIn, delPurchaseIn, addPurchaseIn, updatePurchaseIn } from '@/api/erp/purchase/in/index';
import { PurchaseInVO, PurchaseInQuery, PurchaseInForm } from '@/api/erp/purchase/in/types';
import {ProductVO} from "@/api/erp/product/product/types";
import {getProductSimpleList} from "@/api/erp/product/product";
import {getSupplierSimpleList} from "@/api/erp/purchase/supplier";
import {SupplierVO} from "@/api/erp/purchase/supplier/types";
import {UserVO} from "@/api/system/user/types";
import {getSimpleUserList} from "@/api/system/user";
import {WarehouseVO} from "@/api/erp/stock/warehouse/types";
import {getWareHouseSimpleList} from "@/api/erp/stock/warehouse";

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { erp_audit_status } = toRefs<any>(proxy?.useDict('erp_audit_status'));

const purchaseInList = ref<PurchaseInVO[]>([]);
const buttonLoading = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref<Array<string | number>>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const purchaseInFormRef = ref<ElFormInstance>();

const productList = ref<ProductVO[]>([]) // 产品列表
const supplierList = ref<SupplierVO[]>([]) // 供应商列表
const userList = ref<UserVO[]>([]) // 用户列表
const wareHouseList = ref<WarehouseVO[]>([]) // 仓库列表
const dateRange = ref<[DateModelType, DateModelType]>(['', '']);

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: PurchaseInForm = {
  id: undefined,
  no: undefined,
  status: undefined,
  supplierId: undefined,
  accountId: undefined,
  inTime: undefined,
  orderId: undefined,
  orderNo: undefined,
  totalCount: undefined,
  totalPrice: undefined,
  paymentPrice: undefined,
  totalProductPrice: undefined,
  totalTaxPrice: undefined,
  discountPercent: undefined,
  discountPrice: undefined,
  otherPrice: undefined,
  fileUrl: undefined,
  remark: undefined,
}
const data = reactive<PageData<PurchaseInForm, PurchaseInQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    no: undefined,
    status: undefined,
    supplierId: undefined,
    accountId: undefined,
    orderId: undefined,
    orderNo: undefined,
    params: {
    }
  },
  rules: {
    id: [
      { required: true, message: "编号不能为空", trigger: "blur" }
    ],
    no: [
      { required: true, message: "采购入库编号不能为空", trigger: "blur" }
    ],
    status: [
      { required: true, message: "采购状态不能为空", trigger: "change" }
    ],
    supplierId: [
      { required: true, message: "供应商编号不能为空", trigger: "blur" }
    ],
    accountId: [
      { required: true, message: "结算账户编号不能为空", trigger: "blur" }
    ],
    inTime: [
      { required: true, message: "入库时间不能为空", trigger: "blur" }
    ],
    orderId: [
      { required: true, message: "采购订单编号不能为空", trigger: "blur" }
    ],
    orderNo: [
      { required: true, message: "采购订单号不能为空", trigger: "blur" }
    ],
    totalCount: [
      { required: true, message: "合计数量不能为空", trigger: "blur" }
    ],
    totalPrice: [
      { required: true, message: "合计价格，单位：元不能为空", trigger: "blur" }
    ],
    paymentPrice: [
      { required: true, message: "已付款金额，单位：元不能为空", trigger: "blur" }
    ],
    totalProductPrice: [
      { required: true, message: "合计产品价格，单位：元不能为空", trigger: "blur" }
    ],
    totalTaxPrice: [
      { required: true, message: "合计税额，单位：元不能为空", trigger: "blur" }
    ],
    discountPercent: [
      { required: true, message: "优惠率，百分比不能为空", trigger: "blur" }
    ],
    discountPrice: [
      { required: true, message: "优惠金额，单位：元不能为空", trigger: "blur" }
    ],
    otherPrice: [
      { required: true, message: "其它金额，单位：元不能为空", trigger: "blur" }
    ],
    fileUrl: [
      { required: true, message: "附件地址不能为空", trigger: "blur" }
    ],
    remark: [
      { required: true, message: "备注不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询产品精简列表 */
const getProductList = async () => {
  const res = await getProductSimpleList();
  productList.value = res.data;
}

/** 查询仓库精简列表 */
const getWareHouseList = async () => {
  const res = await getWareHouseSimpleList();
  wareHouseList.value = res.data;
}
/** 查询用户精简列表 */
const getUserList = async () => {
  const res = await getSimpleUserList();
  userList.value = res.data;
}

/** 查询供应商精简列表 */
const getSupplierList = async () => {
  const res = await getSupplierSimpleList();
  supplierList.value = res.data;
}
/** 查询ERP 采购入库列表 */
const getList = async () => {
  loading.value = true;
  const res = await listPurchaseIn(proxy?.addDateRange(queryParams.value, dateRange.value,"InTime"));
  purchaseInList.value = res.rows;
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
  purchaseInFormRef.value?.resetFields();
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
const handleSelectionChange = (selection: PurchaseInVO[]) => {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
const handleAdd = () => {
  reset();
  dialog.visible = true;
  dialog.title = "添加ERP 采购入库";
}

/** 修改按钮操作 */
const handleUpdate = async (row?: PurchaseInVO) => {
  reset();
  const _id = row?.id || ids.value[0]
  const res = await getPurchaseIn(_id);
  Object.assign(form.value, res.data);
  dialog.visible = true;
  dialog.title = "修改ERP 采购入库";
}

/** 提交按钮 */
const submitForm = () => {
  purchaseInFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        await updatePurchaseIn(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        await addPurchaseIn(form.value).finally(() =>  buttonLoading.value = false);
      }
      proxy?.$modal.msgSuccess("修改成功");
      dialog.visible = false;
      await getList();
    }
  });
}

/** 删除按钮操作 */
const handleDelete = async (row?: PurchaseInVO) => {
  const _ids = row?.id || ids.value;
  await proxy?.$modal.confirm('是否确认删除ERP 采购入库编号为"' + _ids + '"的数据项？').finally(() => loading.value = false);
  await delPurchaseIn(_ids);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}

/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('system/purchaseIn/export', {
    ...queryParams.value
  }, `purchaseIn_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList();
  //查询条件：产品
  getProductList();
  //查询条件：供应商
  getSupplierList();
  //查询条件：创建人
  getUserList();
  //查询条件：仓库
  getWareHouseList();
});
</script>
