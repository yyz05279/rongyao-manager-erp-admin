<template>
<!--   添加或修改采购订单对话框-->
  <el-dialog :title="dialog.title" v-model="dialog.visible" width="500px" append-to-body>
    <el-form ref="purchaseOrderFormRef" :model="form"  label-width="80px">
      <el-form-item label="采购单编号" prop="no">
        <el-input v-model="form.no" placeholder="请输入采购单编号" />
      </el-form-item>
      <el-form-item label="订单时间" prop="orderTime">
        <el-date-picker clearable
                        v-model="form.orderTime"
                        type="datetime"
                        value-format="YYYY-MM-DD HH:mm:ss"
                        placeholder="请选择订单时间">
        </el-date-picker>
      </el-form-item>
      <el-form-item label="合计数量" prop="totalCount">
        <el-input v-model="form.totalCount" placeholder="请输入合计数量" />
      </el-form-item>
      <el-form-item label="合计价格，单位：元" prop="totalPrice">
        <el-input v-model="form.totalPrice" placeholder="请输入合计价格，单位：元" />
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
      <el-form-item label="定金金额，单位：元" prop="depositPrice">
        <el-input v-model="form.depositPrice" placeholder="请输入定金金额，单位：元" />
      </el-form-item>
      <el-form-item label="附件地址" prop="fileUrl">
        <file-upload v-model="form.fileUrl"/>
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
      </el-form-item>
      <el-form-item label="采购入库数量" prop="inCount">
        <el-input v-model="form.inCount" placeholder="请输入采购入库数量" />
      </el-form-item>
      <el-form-item label="采购退货数量" prop="returnCount">
        <el-input v-model="form.returnCount" placeholder="请输入采购退货数量" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </template>
  </el-dialog>
</template>
<script setup lang="ts">
import { ref } from "vue";
import {PurchaseOrderForm, PurchaseOrderQuery} from "@/api/erp/purchase/order/types";

/** ERP 销售订单表单 */
defineOptions({ name: 'PurchaseOrderForms' })

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
}

const data = reactive<PageData<PurchaseOrderForm, PurchaseOrderQuery>>({
  form: {...initFormData},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    no: undefined,
    status: undefined,
    supplierId: undefined,
    orderTime: undefined,
    params: {
    }
  },
  rules: {
    status: [
      { required: true, message: "采购状态不能为空", trigger: "change" }
    ],
    supplierId: [
      { required: true, message: "供应商不能为空", trigger: "change" }
    ],
    accountId: [
      { required: true, message: "结算账户不能为空", trigger: "change" }
    ],
    orderTime: [
      { required: true, message: "订单时间不能为空", trigger: "blur" }
    ],
    totalCount: [
      { required: true, message: "合计数量不能为空", trigger: "blur" }
    ],
    totalPrice: [
      { required: true, message: "合计价格，单位：元不能为空", trigger: "blur" }
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
    depositPrice: [
      { required: true, message: "定金金额，单位：元不能为空", trigger: "blur" }
    ],
    inCount: [
      { required: true, message: "采购入库数量不能为空", trigger: "blur" }
    ],
    returnCount: [
      { required: true, message: "采购退货数量不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

const buttonLoading = ref(false);
const loading = ref(true);
const purchaseOrderFormRef = ref<ElFormInstance>();

const dialog = reactive<DialogOption>({
  visible: false,
  title: ''
});


/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  console.log(type,id)
  reset();
  dialog.visible = true;
  dialog.title = "添加采购订单";
  // dialogVisible.value = true
  // dialogTitle.value = t('action.' + type)
  // formType.value = type
  // resetForm()
  // // 修改时，设置数据
  // if (id) {
  //   formLoading.value = true
  //   try {
  //     formData.value = await PurchaseOrderApi.getPurchaseOrder(id)
  //   } finally {
  //     formLoading.value = false
  //   }
  // }
  // // 加载供应商列表
  // supplierList.value = await SupplierApi.getSupplierSimpleList()
  // // 加载用户列表
  // userList.value = await UserApi.getSimpleUserList()
  // // 加载账户列表
  // accountList.value = await AccountApi.getAccountSimpleList()
  // const defaultAccount = accountList.value.find((item) => item.defaultStatus)
  // if (defaultAccount) {
  //   formData.value.accountId = defaultAccount.id
  // }
}

defineExpose({ open}) // 提供 open 方法，用于打开弹窗


/** 提交按钮 */
const submitForm = () => {
  purchaseOrderFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.id) {
        console.log('update');
        // await updatePurchaseOrder(form.value).finally(() =>  buttonLoading.value = false);
      } else {
        // await addPurchaseOrder(form.value).finally(() =>  buttonLoading.value = false);
      }
      // proxy?.$modal.msgSuccess("修改成功");
      dialog.visible = false;
      // await getList();
    }
  });
}

/** 取消按钮 */
const cancel = () => {
  reset();
  dialog.visible = false;
}

/** 表单重置 */
const reset = () => {
 console.log('reset');
}
</script>

<style scoped lang="scss">

</style>
