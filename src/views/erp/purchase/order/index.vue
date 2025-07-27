<template>
  <div class="p-2">
    <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
      <div class="search" v-show="showSearch">
        <el-form :model="queryParams" ref="queryFormRef" :inline="true" label-width="68px">
          <el-form-item label="采购单号" prop="no">
            <el-input v-model="queryParams.no" placeholder="请输入采购单号" clearable style="width: 240px" @keyup.enter="handleQuery" />
          </el-form-item>
          <el-form-item label="供应商" prop="supplierId">
            <el-select v-model="queryParams.supplierId"  placeholder="请选择产品" clearable style="width: 100%">
              <el-option v-for="item in supplierList" :key="item.id" :label="item.name" :value="item.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="采购状态" prop="status">
            <el-select v-model="queryParams.status" placeholder="请选择开启状态" clearable>
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
          <el-form-item label="入库数量" prop="inStatus">
            <el-select
              v-model="queryParams.inStatus"
              placeholder="请选择入库数量"
              clearable
            >
              <el-option label="未入库" value="0" />
              <el-option label="部分入库" value="1" />
              <el-option label="全部入库" value="2" />
            </el-select>
          </el-form-item>
          <el-form-item label="退货数量" prop="returnStatus">
            <el-select
              v-model="queryParams.returnStatus"
              placeholder="请选择退货数量"
              clearable
            >
              <el-option label="未退货" value="0" />
              <el-option label="部分退货" value="1" />
              <el-option label="全部退货" value="2" />
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
            <el-button type="primary" plain icon="Plus" @click="openForm('create')" v-hasPermi="['erp:purchaseOrder:add']">新增</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="success" plain icon="Edit" :disabled="single" @click="openForm('update')" v-hasPermi="['erp:purchaseOrder:edit']">修改</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain icon="Delete" :disabled="multiple" @click="handleDelete()" v-hasPermi="['erp:purchaseOrder:remove']">删除</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['erp:purchaseOrder:export']">导入</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="warning" plain icon="Download" @click="handleExport" v-hasPermi="['erp:purchaseOrder:export']">导出</el-button>
          </el-col>
          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
        </el-row>
      </template>

      <el-table v-loading="loading" :data="purchaseOrderList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="采购单号" min-width="180" align="center" prop="no" />
        <el-table-column label="状态"  min-width="100" align="center" prop="status">
          <template #default="scope">
            <dict-tag :options="erp_audit_status" :value="scope.row.status"/>
          </template>
        </el-table-column>
        <el-table-column label="产品信息" min-width="180" align="center" prop="productNames" />
        <el-table-column label="供应商" min-width="180" align="center" prop="supplierName"/>
        <el-table-column label="订单时间" min-width="100" align="center" prop="orderTime">
          <template #default="scope">
            <span>{{ parseTime(scope.row.orderTime, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="总数量" min-width="100" align="center" prop="totalCount" />
        <el-table-column label="入库数量" min-width="100" align="center" prop="inCount" />
        <el-table-column label="退货数量" min-width="100" align="center" prop="returnCount" />
        <el-table-column label="合计金额"  min-width="100" align="center" prop="totalPrice" />
        <el-table-column label="合计税额"  min-width="100" align="center" prop="totalTaxPrice" />
        <el-table-column label="支付金额" min-width="100" align="center" prop="depositPrice" />
        <el-table-column label="创建人" min-width="100" align="center" prop="createBy" />
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width" fixed="right" width="300">
          <template #default="scope">
            <el-tooltip content="详情" placement="top">
              <el-button link type="primary" icon="View" @click="openForm('detail', scope.row)" v-hasPermi="['erp:purchaseorder:query']"></el-button>
            </el-tooltip>
            <el-tooltip content="编辑" placement="top">
              <el-button link type="primary" icon="Edit" @click="openForm('update', scope.row)" v-hasPermi="['erp:purchaseOrder:edit']" v-if="scope.row.status === 10"></el-button>
            </el-tooltip>
            <el-tooltip content="审批" placement="top">
                <el-button link type="primary" icon="Check" @click="handleUpdateStatus(scope.row.id, 20)" v-hasPermi="['erp:purchaseorder:check']"   v-if="scope.row.status === 10" ></el-button>
            </el-tooltip>
            <el-tooltip content="反审批" placement="top">
              <el-button link type="danger" icon="Close" @click="handleUpdateStatus(scope.row.id, 10)" v-hasPermi="['erp:purchaseorder:check']" v-if="scope.row.status === 20"  ></el-button>
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['erp:purchaseOrder:remove']" v-if="scope.row.status === 10"></el-button>
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
    <PurchaseOrderForms  ref="formRef" @success="getList" />
  </div>
</template>

<script setup name="PurchaseOrder" lang="ts">
import {listPurchaseOrder, delPurchaseOrder, updatePurchaseOrderStatus,} from '@/api/erp/purchase/order';
import { PurchaseOrderVO, PurchaseOrderQuery, PurchaseOrderForm } from '@/api/erp/purchase/order/types';
import PurchaseOrderForms from "@/views/erp/purchase/order/PurchaseOrderForm.vue";
import {ProductVO} from "@/api/erp/product/product/types";
import {SupplierVO} from "@/api/erp/purchase/supplier/types";
import {getProductSimpleList} from "@/api/erp/product/product";
import {getSupplierSimpleList} from "@/api/erp/purchase/supplier";
import {getSimpleUserList} from "@/api/system/user";
import {UserVO} from "@/api/system/user/types";

const { proxy } = getCurrentInstance() as ComponentInternalInstance;
const { erp_audit_status } = toRefs<any>(proxy?.useDict('erp_audit_status'));

const purchaseOrderList = ref<PurchaseOrderVO[]>([]);// 列表的数据
const total = ref(0);// 列表的总页数
const dateRange = ref<[DateModelType, DateModelType]>(['', '']);

const buttonLoading = ref(false);
const loading = ref(true);// 列表的加载中

const showSearch = ref(true);

const ids = ref<Array<string | number>>([]);
const nos = ref<Array<string>>([]);
const single = ref(true);
const multiple = ref(true);


const productList = ref<ProductVO[]>([]) // 产品列表
const supplierList = ref<SupplierVO[]>([]) // 供应商列表
const userList = ref<UserVO[]>([]) // 用户列表

const queryFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const initFormData: PurchaseOrderForm = {
  id: undefined,
  no: undefined,
  status: undefined,
  supplierId: undefined,
  accountId: undefined,
  orderTime: undefined,
  totalCount: undefined,
  totalPrice: undefined,
  totalProductPrice: undefined,
  totalTaxPrice: undefined,
  discountPercent: undefined,
  discountPrice: undefined,
  depositPrice: undefined,
  fileUrl: undefined,
  remark: undefined,
  inCount: undefined,
  returnCount: undefined,
  purchaseOrderItems:[]
}
const data = reactive<PageData<PurchaseOrderForm, PurchaseOrderQuery>>({
  form: {...initFormData},
  queryParams: {
    no: undefined,
    supplierId: undefined,
    productId: undefined,
    status: undefined,
    remark: undefined,
    createBy: undefined,
    inStatus: undefined,
    returnStatus: undefined,
    params: {
    },
    pageNum: 1,
    pageSize: 10,
  },
  rules: {}
});

const { queryParams, form, rules } = toRefs(data);

/** 查询采购订单列表 */
const getList = async () => {
  loading.value = true;
  const res = await listPurchaseOrder(proxy?.addDateRange(queryParams.value, dateRange.value,"OrderTime"));
  purchaseOrderList.value = res.rows;
  total.value = res.total;
  loading.value = false;
}

/** 查询产品精简列表 */
const getProductList = async () => {
  const res = await getProductSimpleList();
  productList.value = res.data;
}

/** 查询供应商精简列表 */
const getSupplierList = async () => {
  const res = await getSupplierSimpleList();
  supplierList.value = res.data;
}

/** 查询用户精简列表 */
const getUserList = async () => {
  const res = await getSimpleUserList();
  userList.value = res.data;
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
const resetQuery = () => {
  dateRange.value = ['', ''];
  queryFormRef.value?.resetFields();
  handleQuery();
}

/** 多选框选中数据 */
const handleSelectionChange = (selection: PurchaseOrderVO[]) => {
  ids.value = selection.map(item => item.id);
  nos.value = selection.map(item => item.no);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, row?: PurchaseOrderVO) => {
  const _id = row?.id || ids.value[0]
  const _no = row?.no || nos.value[0]
  console.log("id：",_id)
  console.log("no：",_no)
  console.log("type：",type)
  formRef.value.open(type, _id)
}

/** 删除按钮操作 */
const handleDelete = async (row?: PurchaseOrderVO) => {
  const _ids = row?.id || ids.value;
  const _nos = row?.no || nos.value;
  await proxy?.$modal.confirm('是否确认删除采购订单编号为"' + _nos + '"的数据项？').finally(() => loading.value = false);
  await delPurchaseOrder(_ids);
  proxy?.$modal.msgSuccess("删除成功");
  await getList();
}
/** 审批/反审批操作 */
const handleUpdateStatus = async (id: number, status: number) => {
  try {
    // 审批的二次确认
    await proxy?.$modal.confirm(`确定${status === 20 ? '审批' : '反审批'}该订单吗？`)
    // 发起审批
    await updatePurchaseOrderStatus(id, status)
    proxy?.$modal.msgSuccess(`${status === 20 ? '审批' : '反审批'}成功`)
    // 刷新列表
    await getList()
  } catch {}
}
/** 导出按钮操作 */
const handleExport = () => {
  proxy?.download('erp/purchaseOrder/export', {
    ...queryParams.value
  }, `purchaseOrder_${new Date().getTime()}.xlsx`)
}

onMounted(() => {
  getList();
  //查询条件：产品
  getProductList();
  //查询条件：供应商
  getSupplierList();
  //查询条件：用户
  getUserList();
});
// TODO hhhbx：可优化功能：列表界面，支持导入
// TODO hhhbx：可优化功能：详情界面，支持打印
</script>
