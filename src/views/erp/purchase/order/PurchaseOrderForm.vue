<template>
<!--   添加或修改采购订单对话框-->
  <el-dialog :title="dialog.title" v-model="dialog.visible" width="1080px" append-to-body>
    <el-form ref="formRef" :model="formData"  label-width="100px" :rules="formRules" v-loading="formLoading" :disabled="disabled">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-form-item label="采购单编号" prop="no">
            <el-input disabled v-model="formData.orderNo" placeholder="保存时自动生成" />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="订单时间" prop="orderTime">
            <el-date-picker clearable
                            v-model="formData.orderTime"
                            type="date"
                            value-format="x"
                            placeholder="请选择订单时间">
            </el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="供应商" prop="supplierId">
            <el-select
              v-model="formData.supplierId"
              clearable
              filterable
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
        <el-col :span="16">
          <el-form-item label="备注" prop="remark">
            <el-input
              type="textarea"
              v-model="formData.remark"
              :rows="1"
              placeholder="请输入备注"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="附件" prop="fileUrl">
            <file-upload :is-show-tip="false"  v-model="formData.fileUrl"  :limit="1"/>
          </el-form-item>
        </el-col>
      </el-row>
      <!-- 子表的表单 -->
      <ContentWrap>
        <el-tabs v-model="subTabsName" class="-mt-15px -mb-10px">
          <el-tab-pane label="订单产品清单" name="item">
            <PurchaseOrderItemForm ref="itemFormRef" :items="formData.items" :disabled="disabled" />
          </el-tab-pane>
        </el-tabs>
      </ContentWrap>
      <el-row :gutter="20" >
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
          <el-form-item label="付款优惠" prop="discountPrice">
            <el-input
              disabled
              v-model="formData.discountPrice"
              :formatter="erpPriceInputFormatter"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="优惠后金额">
            <el-input disabled v-model="formData.totalPrice"
                      :formatter="erpPriceInputFormatter" />
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
          <el-form-item label="支付订金" prop="depositPrice">
            <el-input-number
              v-model="formData.depositPrice"
              controls-position="right"
              :min="0"
              :precision="2"
              placeholder="请输入支付订金"
              class="!w-1/1"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button :disabled="formLoading"  v-if="!disabled" type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script setup lang="ts">
import { ref } from "vue";
const { proxy } = getCurrentInstance() as ComponentInternalInstance;
import {ProductVO} from "@/api/erp/product/product/types";
import {SupplierVO} from "@/api/erp/purchase/supplier/types";
import {getProductSimpleList} from "@/api/erp/product/product";
import {getSupplierSimpleList} from "@/api/erp/purchase/supplier";
import PurchaseOrderItemForm from './components/PurchaseOrderItemForm.vue'
import {erpPriceInputFormatter, erpPriceMultiply} from "@/utils";
import {addPurchaseOrder, updatePurchaseOrder} from "@/api/erp/purchase/order";
import {PurchaseOrderForm, PurchaseOrderVO} from "@/api/erp/purchase/order/types";
import {UserVO} from "@/api/system/user/types";
import {getSimpleUserList} from "@/api/system/user";
import {getAccountSimpleList} from "@/api/erp/finance/account";
import {AccountVO} from "@/api/erp/finance/account/types";

/** ERP 销售订单表单 */
defineOptions({ name: 'PurchaseOrderForm' })

const formData =  ref({
  id: undefined,
  supplierId: undefined,
  accountId: undefined,
  orderTime: undefined,
  fileUrl: '',
  remark: undefined,
  discountPercent: 0,
  discountPrice: 0,
  totalPrice: 0,
  depositPrice: 0,
  items: [],
  orderNo: undefined, // 订单单号，后端返回
});
const formType = ref('') // 表单的类型：create - 新增；update - 修改；detail - 详情

const formRules = reactive({
  supplierId: [{ required: true, message: '供应商不能为空', trigger: 'blur' }],
  orderTime: [{ required: true, message: '订单时间不能为空', trigger: 'blur' }]
})

const disabled = computed(() => formType.value === 'detail')

const buttonLoading = ref(false);
const loading = ref(true);
const formLoading = ref(false) // 表单的加载中：1）修改时的数据加载；2）提交的按钮禁用

const formRef = ref() // 表单 Ref
const productList = ref<ProductVO[]>([]) // 产品列表
const supplierList = ref<SupplierVO[]>([]) // 供应商列表
const accountList = ref<AccountVO[]>([]); //收款账户
const userList = ref<UserVO[]>([]); //用户列表

/** 子表的表单 */
const subTabsName = ref('item')
const itemFormRef = ref();

//弹窗和标题
const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

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

/** 查询供应商精简列表 */
const getAccountList = async () => {
  const res = await getAccountSimpleList();
  accountList.value = res.data;
}
/** 打开弹窗 */
const open =  async (type: string, id?: number) => {
  dialog.visible = true;
  dialog.title = type == 'create'? "新增采购订单":"修改采购订单"

  formType.value = type
  reset();
  // 修改时，设置数据
  if (id) {
    console.log("修改采购订单：",id)
    formLoading.value = true
    try {
      // formData.value = await PurchaseOrderApi.getPurchaseOrder(id)
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

/** 提交表单 */
const emit = defineEmits(['success']) // 定义 success 事件，用于操作成功后的回调

/** 提交按钮 */
const submitForm = async () => {
  console.log("submitForm ===== start");
  // 校验表单
  await formRef.value.validate()
  await itemFormRef.value.validate()
  // 提交请求
  formLoading.value = true
  try {
    const data = formData.value as unknown as PurchaseOrderForm;
    console.log("req data:",data)
    if (formType.value === 'create') {
      await addPurchaseOrder(data)
      proxy?.$modal.msgSuccess("新增成功");
    } else {
      await updatePurchaseOrder(data)
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
  reset();
  dialog.visible = false;
}

/** 表单重置 */
/** 重置表单 */
const reset = () => {
  formData.value = {
    id: undefined,
    supplierId: undefined,
    accountId: 0,
    orderTime: undefined,
    remark: undefined,
    fileUrl: '',
    discountPercent: 0,
    discountPrice: 0,
    totalPrice: 0,
    depositPrice: 0,
    items: [],
    no: undefined
  }
  formRef.value?.resetFields()
}
/** 计算 discountPrice、totalPrice 价格 */
watch(
  () => formData.value,
  (val) => {
    if (!val) {
      return
    }
    const totalPrice = val.items.reduce((prev, curr) => prev + curr.totalPrice, 0)
    const discountPrice =
      val.discountPercent != null ? erpPriceMultiply(totalPrice, val.discountPercent / 100.0) : 0
    formData.value.discountPrice = discountPrice
    formData.value.totalPrice = totalPrice - discountPrice
  },
  { deep: true }
)
</script>

<style scoped lang="scss">

</style>
