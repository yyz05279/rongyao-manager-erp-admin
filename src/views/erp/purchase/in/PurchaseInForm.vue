<template>
  <!--   添加或修改采购入库单对话框-->
  <el-dialog :title="dialog.title" v-model="dialog.visible" width="1440px" append-to-body>
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
      :disabled="disabled"
    >
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="入库单号" prop="no">
            <el-input disabled v-model="formData.no" placeholder="保存时自动生成" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="关联订单" prop="orderNo">
            <el-input
              v-model="formData.orderNo"
              readonly
              clearable
              placeholder="请选择关联订单"
            >
              <template #append>
                <el-button
                  type="primary"
                  icon="el-icon-search"
                  @click="openPurchaseOrderInEnableList"
                >
                  选择
                </el-button>
              </template>
            </el-input>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="入库时间" prop="inTime">
            <el-date-picker
              v-model="formData.inTime"
              type="date"
              clearable
              value-format="x"
              placeholder="选择入库时间"
              class="!w-1/1"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="供应商" prop="supplierId">
            <el-select
              v-model="formData.supplierId"
              clearable
              filterable
              disabled
              placeholder="请选择供应商"
              class="!w-1/1"
            >
              <el-option
                v-for="item in supplierList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="备注" prop="remark">
            <el-input
              type="textarea"
              v-model="formData.remark"
              :rows="1"
              placeholder="请输入备注"
              class="!w-1/1"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="附件" prop="fileUrl">
            <file-upload :is-show-tip="false" v-model="formData.fileUrl" :limit="1" />
          </el-form-item>
        </el-col>
      </el-row>
      <!-- 子表的表单 -->
      <ContentWrap>
        <el-tabs v-model="subTabsName" class="-mt-15px -mb-10px">
          <el-tab-pane label="入库产品清单" name="item">
            <PurchaseInItemForm ref="itemFormRef" :items="formData.items" :disabled="disabled" />
          </el-tab-pane>
        </el-tabs>
      </ContentWrap>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="优惠率（%）" prop="discountPercent">
            <el-input-number
              v-model="formData.discountPercent"
              controls-position="right"
              :min="0"
              :precision="2"
              placeholder="请输入优惠率"
              class="!w-1/1"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="优惠金额" prop="discountPrice">
            <el-input
              disabled
              v-model="formData.discountPrice"
              :formatter="erpPriceInputFormatter"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="优惠后金额">
            <el-input
              disabled
              :model-value="formData.totalPrice - formData.otherPrice"
              :formatter="erpPriceInputFormatter"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="其它费用" prop="otherPrice">
            <el-input-number
              v-model="formData.otherPrice"
              controls-position="right"
              :min="0"
              :precision="2"
              placeholder="请输入其它费用"
              class="!w-1/1"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="结算账户" prop="accountId">
            <el-select
              v-model="formData.accountId"
              clearable
              filterable
              placeholder="请选择结算账户"
              class="!w-1/1"
            >
              <el-option
                v-for="item in accountList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="应付金额">
            <el-input disabled v-model="formData.totalPrice" :formatter="erpPriceInputFormatter" />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
      <el-button @click="submitForm" type="primary" :disabled="formLoading" v-if="!disabled">
        确 定
      </el-button>
      <el-button @click="cancel">取 消</el-button>
      </div>
    </template>
  </el-dialog>

  <!-- 可入库的订单列表 -->
  <PurchaseOrderInEnableList
    ref="purchaseOrderInEnableListRef"
    @success="handlePurchaseOrderChange"
  />
</template>
<script setup lang="ts">
import {getAccountSimpleList} from '@/api/erp/finance/account'
import {erpPriceInputFormatter, erpPriceMultiply} from '@/utils'
import PurchaseOrderInEnableList from '@/views/erp/purchase/order/components/PurchaseOrderInEnableList.vue'
import {SupplierVO} from "@/api/erp/purchase/supplier/types";
import {UserVO} from "@/api/system/user/types";
import {AccountVO} from "@/api/erp/finance/account/types";
import {getSimpleUserList} from "@/api/system/user";
import {getSupplierSimpleList} from "@/api/erp/purchase/supplier";
import {PurchaseOrderForm, PurchaseOrderVO} from "@/api/erp/purchase/order/types";
import {PurchaseInForm, PurchaseInVO} from "@/api/erp/purchase/in/types";
import PurchaseInItemForm from './components/PurchaseInItemForm.vue'
import {addPurchaseIn, updatePurchaseIn} from "@/api/erp/purchase/in";
const { proxy } = getCurrentInstance() as ComponentInternalInstance;


/** ERP 销售入库表单 */
defineOptions({ name: 'PurchaseInForm' })

const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用
const formType = ref('') // 表单的类型：create - 新增；update - 修改；detail - 详情
const formData = ref({
  id: undefined,
  supplierId: undefined,
  accountId: undefined,
  inTime: '',
  remark: '',
  fileUrl: '',
  discountPercent: 0,
  discountPrice: 0,
  totalPrice: 0,
  otherPrice: 0,
  orderNo: '',
  orderId: undefined,
  items: [],
  no: undefined // 入库单号，后端返回
})

const formRules = reactive({
  supplierId: [{ required: true, message: '供应商不能为空', trigger: 'blur' }],
  inTime: [{ required: true, message: '入库时间不能为空', trigger: 'blur' }]
})

const disabled = computed(() => formType.value === 'detail')
const formRef = ref() // 表单 Ref
const supplierList = ref<SupplierVO[]>([]) // 供应商列表
const accountList = ref<AccountVO[]>([]) // 账户列表
const userList = ref<UserVO[]>([]) // 用户列表

/** 子表的表单 */
const subTabsName = ref('item')
const itemFormRef = ref()

/** 弹窗和标题 */
const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

/** 计算 discountPrice、totalPrice 价格 */
watch(
  () => formData.value,
  (val) => {
    if (!val|| !Array.isArray(val.items)) {
      return
    }
    // 计算
    const totalPrice = val.items.reduce((prev, curr) => prev + curr.totalPrice, 0)
    const discountPrice =
      val.discountPercent != null ? erpPriceMultiply(totalPrice, val.discountPercent / 100.0) : 0
    formData.value.discountPrice = discountPrice
    formData.value.totalPrice = totalPrice - discountPrice + val.otherPrice
  },
  { deep: true }
)
/** 查询供应商精简列表 */
const getSupplierList = async () => {
  const res = await getSupplierSimpleList();
  supplierList.value = res.data;
}
// 加载用户列表
/** 查询用户精简列表 */
const getUserList = async () => {
  const res = await getSimpleUserList();
  userList.value = res.data;
}
/** 查询账户列表 */
const getAccountList = async () => {
  const res = await getAccountSimpleList();
  accountList.value = res.data;
}
/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialog.visible = true;
  dialog.title = type == 'create' ? "新增采购入库单" : "修改采购入库单"
  formType.value = type
  resetForm()
  // 修改时，设置数据
  if (id) {
    formLoading.value = true
    try {
      // formData.value = await PurchaseInApi.getPurchaseIn(id)
    } finally {
      formLoading.value = false
    }
  }
  // 加载供应商列表
  getSupplierList();
  // 加载用户列表
  getUserList();
  // 加载账户列表
  getAccountList()
  const defaultAccount = accountList.value.find((item) => item.defaultStatus === 0)
  if (defaultAccount) {
    formData.value.accountId = defaultAccount.id
  }
}
defineExpose({ open }) // 提供 open 方法，用于打开弹窗

/** 打开【可入库的订单列表】弹窗 */
const purchaseOrderInEnableListRef = ref() // 可入库的订单列表 Ref
const openPurchaseOrderInEnableList = () => {
  purchaseOrderInEnableListRef.value.open()
}

const handlePurchaseOrderChange = (order: PurchaseOrderVO) => {
  console.log("handlePurchaseOrderChange ===== start");
  console.log("order", order);
  // 将订单设置到入库单
  formData.value.orderId = order.id
  formData.value.orderNo = order.no
  formData.value.supplierId = order.supplierId
  formData.value.accountId = order.accountId
  formData.value.discountPercent = order.discountPercent
  formData.value.remark = order.remark
  formData.value.fileUrl = order.fileUrl
  // 将订单项设置到入库单项
  if (order.items && order.items.length > 0) {
    order.items.forEach((item: any) => {
      item.totalCount = item.count
      item.count = item.totalCount - (item.inCount || 0)
      item.orderItemId = item.id
      item.id = undefined
    })
    formData.value.items = order.items.filter((item: any) => item.count > 0)
  }
}

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调
const submitForm = async () => {
  console.log("submitForm ===== start");
  // 校验表单
  await formRef.value.validate()
  await itemFormRef.value.validate()
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as PurchaseInForm
    if (formType.value === 'create') {
      await addPurchaseIn(data)
      proxy?.$modal.msgSuccess("新增成功");
    } else {
      await updatePurchaseIn(data)
      proxy?.$modal.msgSuccess("修改成功");
    }
    dialog.visible =  false;
    // 发送操作成功的事件
    emit('success')
  } finally {
    formLoading.value = false
  }
}
/** 取消按钮 */
const cancel = () => {
  resetForm();
  dialog.visible = false;
}
/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    supplierId: undefined,
    accountId: undefined,
    inTime: undefined,
    remark: undefined,
    fileUrl: '',
    discountPercent: 0,
    discountPrice: 0,
    totalPrice: 0,
    otherPrice: 0,
    items: [],
    no: undefined,
    orderNo: undefined,
    orderId: undefined
  }
  formRef.value?.resetFields()
}
</script>
