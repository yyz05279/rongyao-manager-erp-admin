<template>
  <div class="shipping-management">

    <!-- 搜索区域 -->
    <el-card class="search-card" shadow="never">
      <el-form
        ref="queryFormRef"
        :model="queryParams"
        :inline="true"
        label-width="80px"
        class="search-form"
      >
        <el-form-item label="项目名称" prop="projectName">
          <el-input
            v-model="queryParams.projectName"
            placeholder="请输入项目名称"
            clearable
            style="width: 200px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <el-form-item label="清单编号" prop="listCode">
          <el-input
            v-model="queryParams.listCode"
            placeholder="请输入清单编号"
            clearable
            style="width: 200px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <el-form-item label="批次号" prop="batchNumber">
          <el-input
            v-model="queryParams.batchNumber"
            placeholder="请输入批次号"
            clearable
            style="width: 150px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <el-form-item label="负责人" prop="responsiblePerson">
          <el-input
            v-model="queryParams.responsiblePerson"
            placeholder="请输入负责人"
            clearable
            style="width: 150px"
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <el-form-item label="发货状态" prop="status">
          <el-select
            v-model="queryParams.status"
            placeholder="请选择发货状态"
            clearable
            style="width: 150px"
          >
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="设备类型" prop="equipmentType">
          <el-select
            v-model="queryParams.equipmentType"
            placeholder="请选择设备类型"
            clearable
            style="width: 150px"
          >
            <el-option
              v-for="item in equipmentTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="发货日期">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 240px"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作区域 -->
    <el-card class="operation-card" shadow="never">
      <div class="operation-bar">
        <div class="operation-left">
          <el-button
            type="primary"
            icon="Plus"
            @click="handleAdd"
            v-hasPermi="['erp:saltprocess:shipping:add']"
          >
            新增发货清单
          </el-button>

          <el-button
            type="success"
            icon="Upload"
            @click="handleEnhancedImport"
            v-hasPermi="['erp:saltprocess:shipping:import']"
          >
            Excel导入
          </el-button>

          <el-button
            type="warning"
            icon="Download"
            @click="handleExport"
            v-hasPermi="['erp:saltprocess:shipping:export']"
          >
            导出数据
          </el-button>

          <el-button
            type="danger"
            icon="Delete"
            :disabled="multiple"
            @click="handleDelete"
            v-hasPermi="['erp:saltprocess:shipping:remove']"
          >
            批量删除
          </el-button>
        </div>

        <div class="operation-right">
          <el-tooltip content="刷新" placement="top">
            <el-button circle icon="Refresh" @click="getList" />
          </el-tooltip>

          <el-tooltip content="显示/隐藏搜索" placement="top">
            <el-button circle icon="Search" @click="showSearch = !showSearch" />
          </el-tooltip>
        </div>
      </div>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card" shadow="never">
      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="shippingList"
        row-key="id"
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
        stripe
        border
      >
        <el-table-column type="selection" width="50" align="center" />

        <el-table-column
          label="清单编号"
          prop="listCode"
          width="140"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <el-link
              type="primary"
              @click="handleDetail(row)"
              :underline="false"
            >
              {{ row.listCode }}
            </el-link>
          </template>
        </el-table-column>

        <el-table-column
          label="项目名称"
          prop="projectName"
          min-width="150"
          show-overflow-tooltip
        />

        <el-table-column
          label="批次号"
          prop="batchNumber"
          width="100"
          align="center"
        />

        <el-table-column
          label="负责人"
          prop="responsiblePerson"
          width="100"
          align="center"
        />

        <el-table-column
          label="发货日期"
          prop="shippingDate"
          width="110"
          align="center"
          sortable="custom"
        />

        <el-table-column
          label="发货状态"
          prop="status"
          width="100"
          align="center"
        >
          <template #default="{ row }">
            <el-tag
              :type="getStatusTagType(row.status)"
              size="small"
            >
              {{ row.statusName || getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column
          label="总件数"
          prop="totalItems"
          width="80"
          align="center"
        />

        <el-table-column
          label="总重量(kg)"
          prop="totalWeight"
          width="100"
          align="center"
        >
          <template #default="{ row }">
            {{ typeof row.totalWeight === 'number' ? row.totalWeight.toFixed(2) : row.totalWeight || '0.00' }}
          </template>
        </el-table-column>

        <el-table-column
          label="发货方式"
          prop="shippingMethod"
          width="100"
          align="center"
        >
          <template #default="{ row }">
            {{ row.shippingMethodName || getShippingMethodLabel(row.shippingMethod) }}
          </template>
        </el-table-column>

        <el-table-column
          label="创建时间"
          prop="createTime"
          width="160"
          align="center"
          sortable="custom"
        />

        <el-table-column
          label="操作"
          width="200"
          align="center"
          fixed="right"
        >
          <template #default="{ row }">
            <el-button
              type="primary"
              link
              icon="View"
              @click="handleDetail(row)"
              v-hasPermi="['erp:saltprocess:shipping:query']"
            >
              详情
            </el-button>

            <el-button
              type="primary"
              link
              icon="Edit"
              @click="handleUpdate(row)"
              v-hasPermi="['erp:saltprocess:shipping:edit']"
            >
              编辑
            </el-button>

            <el-button
              type="primary"
              link
              icon="Delete"
              @click="handleDelete(row)"
              v-hasPermi="['erp:saltprocess:shipping:remove']"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <pagination
        v-show="total > 0"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
      />
    </el-card>

    <!-- Excel导入对话框（使用增强版） -->
    <EnhancedShippingImportDialog
      v-if="importDialog.visible"
      v-model:visible="importDialog.visible"
      @success="handleImportSuccess"
    />

    <!-- 导出参数选择对话框 -->
    <el-dialog title="Excel导出设置" v-model="exportDialog.visible" width="700px" append-to-body>
      <div class="export-dialog-content">
        <el-alert
          title="导出说明"
          type="info"
          :closable="false"
          show-icon
          style="margin-bottom: 20px;"
        >
          <template #default>
            <p>• 支持导出发货清单主表数据和明细数据</p>
            <p>• 支持最多导出10,000条记录</p>
            <p>• 建议按日期范围分批导出大量数据</p>
          </template>
        </el-alert>

        <el-form :model="exportParams" label-width="120px">
          <el-form-item label="导出类型">
            <el-radio-group v-model="exportParams.exportFormat">
              <el-radio value="list">发货清单汇总</el-radio>
              <el-radio value="items">发货明细汇总</el-radio>
              <el-radio value="combined">清单+明细</el-radio>
            </el-radio-group>
            <div class="form-item-tip">
              <span v-if="exportParams.exportFormat === 'list'">
                导出发货清单主表信息（项目、批次、负责人、状态等）
              </span>
              <span v-else-if="exportParams.exportFormat === 'items'">
                导出发货明细信息（物品名称、规格、数量、重量等）
              </span>
              <span v-else>
                导出完整信息（清单+明细，分多个工作表）
              </span>
            </div>
          </el-form-item>

          <el-form-item label="导出范围">
            <el-radio-group v-model="exportParams.exportType">
              <el-radio value="current">当前查询结果</el-radio>
              <el-radio value="custom">自定义条件</el-radio>
            </el-radio-group>
            <div class="form-item-tip">
              <span v-if="exportParams.exportType === 'current'">
                将导出当前页面查询条件下的所有数据
              </span>
              <span v-else>
                可以设置更详细的筛选条件进行导出
              </span>
            </div>
          </el-form-item>

          <template v-if="exportParams.exportType === 'custom'">
            <el-form-item label="项目名称">
              <el-input v-model="exportParams.projectName" placeholder="请输入项目名称" clearable />
            </el-form-item>

            <el-form-item label="日期范围">
              <el-date-picker
                v-model="exportParams.dateRange"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                clearable
              />
            </el-form-item>

            <el-form-item label="发货状态">
              <el-select v-model="exportParams.status" placeholder="请选择发货状态" clearable>
                <el-option label="草稿" value="DRAFT" />
                <el-option label="待发货" value="PENDING" />
                <el-option label="部分发货" value="PARTIAL_SHIPPED" />
                <el-option label="已发货" value="SHIPPED" />
                <el-option label="已送达" value="DELIVERED" />
                <el-option label="已完成" value="COMPLETED" />
                <el-option label="已取消" value="CANCELLED" />
              </el-select>
            </el-form-item>

            <el-form-item label="发货方式">
              <el-select v-model="exportParams.shippingMethod" placeholder="请选择发货方式" clearable>
                <el-option label="卡车运输" value="TRUCK" />
                <el-option label="铁路运输" value="RAIL" />
                <el-option label="海运" value="SEA" />
                <el-option label="空运" value="AIR" />
              </el-select>
            </el-form-item>

            <el-form-item label="批次号">
              <el-input v-model="exportParams.batchNumber" placeholder="请输入批次号" clearable />
            </el-form-item>

            <template v-if="exportParams.exportFormat === 'items' || exportParams.exportFormat === 'combined'">
              <el-form-item label="设备类型">
                <el-select v-model="exportParams.equipmentType" placeholder="请选择设备类型" clearable>
                  <el-option label="机械设备" value="MECHANICAL" />
                  <el-option label="电控设备" value="ELECTRICAL" />
                  <el-option label="管路设备" value="PIPELINE" />
                  <el-option label="燃烧器" value="BURNER" />
                  <el-option label="辅助设备" value="AUXILIARY" />
                  <el-option label="标准件" value="STANDARD_PARTS" />
                </el-select>
              </el-form-item>

              <el-form-item label="物品名称">
                <el-input v-model="exportParams.itemName" placeholder="请输入物品名称" clearable />
              </el-form-item>

              <el-form-item label="制造商">
                <el-input v-model="exportParams.manufacturer" placeholder="请输入制造商" clearable />
              </el-form-item>
            </template>
          </template>
        </el-form>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="exportDialog.visible = false">取消</el-button>
          <el-button type="primary" @click="confirmExport" :loading="exportDialog.loading">
            确认导出
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="ShippingManagement" lang="ts">
import { ref, reactive, onMounted, computed, getCurrentInstance } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRouter } from 'vue-router';
import type { ComponentInternalInstance } from 'vue';
// 直接使用真实API接口
import {
  listShippingList,
  delShippingList
} from '@/api/erp/saltprocess/shipping/index';
import type {
  ShippingListVO,
  ShippingListQuery,
  ShippingStatus
} from '@/api/erp/saltprocess/shipping/types';
import EnhancedShippingImportDialog from './components/EnhancedShippingImportDialog.vue';

const router = useRouter();
const { proxy } = getCurrentInstance() as ComponentInternalInstance;

// 响应式数据
const loading = ref(true);
const showSearch = ref(true);
const shippingList = ref<ShippingListVO[]>([]);
const total = ref(0);
const ids = ref<string[]>([]);
const single = ref(true);
const multiple = ref(true);
const dateRange = ref<[string, string] | []>([]);

// 查询参数
const queryParams = reactive<ShippingListQuery>({
  pageNum: 1,
  pageSize: 10,
  projectName: '',
  listCode: '',
  batchNumber: '',
  responsiblePerson: '',
  status: undefined,
  equipmentType: undefined
});

// 对话框状态
const importDialog = reactive({
  visible: false
});

// 导出对话框状态
const exportDialog = reactive({
  visible: false,
  loading: false
});

// 导出参数
const exportParams = reactive({
  exportFormat: 'list', // list: 发货清单汇总, items: 发货明细汇总, combined: 清单+明细
  exportType: 'current', // current: 当前查询结果, custom: 自定义条件
  projectName: '',
  dateRange: null as [string, string] | null,
  status: '',
  shippingMethod: '',
  batchNumber: '',
  equipmentType: '',
  itemName: '',
  manufacturer: ''
});

// 表单引用
const queryFormRef = ref();
const tableRef = ref();

// 状态选项
const statusOptions = [
  { label: '草稿', value: 'DRAFT' },
  { label: '待发货', value: 'PENDING' },
  { label: '部分发货', value: 'PARTIAL_SHIPPED' },
  { label: '已发货', value: 'SHIPPED' },
  { label: '已送达', value: 'DELIVERED' },
  { label: '已完成', value: 'COMPLETED' },
  { label: '已取消', value: 'CANCELLED' }
];

// 设备类型选项
const equipmentTypeOptions = [
  { label: '机械设备', value: 'MECHANICAL' },
  { label: '电控设备', value: 'ELECTRICAL' },
  { label: '管路设备', value: 'PIPELINE' },
  { label: '燃烧器', value: 'BURNER' },
  { label: '辅助设备', value: 'AUXILIARY' },
  { label: '标准件', value: 'STANDARD_PARTS' }
];

// 计算属性
const isMultipleSelected = computed(() => ids.value.length > 1);

// 方法
const getList = async () => {
  loading.value = true;
  try {
    const params = {
      ...queryParams,
      shippingDateStart: dateRange.value?.[0],
      shippingDateEnd: dateRange.value?.[1]
    };
    const response = await listShippingList(params);

    // 调试日志 - 查看原始响应数据
    console.log('=== 发货清单API响应 ===');
    console.log('完整响应:', response);

    // 处理接口返回的数据结构
    // 注意：响应拦截器已经返回了 res.data，所以 response 本身就是数据对象
    const data = (response as any).rows || [];

    console.log('提取的rows数据:', data);
    console.log('数据条数:', data.length);

    // 映射字段：shippingListId -> id
    shippingList.value = data.map((item: any) => {
      const mappedItem = {
        ...item,
        id: item.shippingListId || item.id
      };
      console.log('映射后的单条数据:', mappedItem);
      return mappedItem;
    });

    total.value = (response as any).total || 0;

    console.log('最终shippingList:', shippingList.value);
    console.log('总数:', total.value);
  } catch (error) {
    console.error('获取发货清单列表失败:', error);
    ElMessage.error('获取发货清单列表失败');
  } finally {
    loading.value = false;
  }
};

const handleQuery = () => {
  queryParams.pageNum = 1;
  getList();
};

const resetQuery = () => {
  queryFormRef.value?.resetFields();
  dateRange.value = [];
  handleQuery();
};

const handleSelectionChange = (selection: ShippingListVO[]) => {
  ids.value = selection.map(item => item.id || item.shippingListId).filter((id): id is string => !!id);
  single.value = selection.length !== 1;
  multiple.value = !selection.length;
};

const handleSortChange = ({ prop, order }: { prop: string; order: string }) => {
  // 处理排序逻辑
  getList();
};

const handleAdd = () => {
  router.push('/saltprocess/shipping/create');
};

const handleUpdate = (row: ShippingListVO) => {
  router.push(`/saltprocess/shipping/edit/${row.id}`);
};

const handleDetail = (row: ShippingListVO) => {
  router.push(`/saltprocess/shipping/detail/${row.id}`);
};

const handleDelete = async (row?: ShippingListVO) => {
  const deleteIds = row ? [(row.id || row.shippingListId)!] : ids.value;
  const names = row ? [row.listCode] : shippingList.value
    .filter(item => deleteIds.includes((item.id || item.shippingListId)!))
    .map(item => item.listCode);

  try {
    await ElMessageBox.confirm(
      `是否确认删除发货清单"${names.join('、')}"？`,
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );

    await delShippingList(deleteIds);
    ElMessage.success('删除成功');
    getList();
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败');
    }
  }
};

// 打开Excel导入对话框（使用增强版）
const handleEnhancedImport = () => {
  importDialog.visible = true;
};

// 导入成功回调
const handleImportSuccess = (id?: string) => {
  ElMessage.success('发货清单导入成功');
  getList();
  if (id) {
    // 可以选择跳转到详情页面
    // router.push(`/saltprocess/shipping/detail/${id}`);
  }
};

const handleExport = () => {
  // 重置导出参数
  exportParams.exportFormat = 'list';
  exportParams.exportType = 'current';
  exportParams.projectName = queryParams.projectName || '';
  exportParams.dateRange = null;
  exportParams.status = queryParams.status || '';
  exportParams.shippingMethod = '';
  exportParams.batchNumber = queryParams.batchNumber || '';
  exportParams.equipmentType = '';
  exportParams.itemName = '';
  exportParams.manufacturer = '';

  // 显示导出对话框
  exportDialog.visible = true;
};

const confirmExport = () => {
  // 验证自定义条件
  if (exportParams.exportType === 'custom') {
    if (exportParams.dateRange && exportParams.dateRange.length === 2) {
      const startDate = new Date(exportParams.dateRange[0]);
      const endDate = new Date(exportParams.dateRange[1]);
      const diffTime = endDate.getTime() - startDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // 检查日期范围是否过大（超过1年）
      if (diffDays > 365) {
        ElMessage.warning('导出日期范围不能超过1年，请缩小日期范围');
        return;
      }
    }

    // 检查是否至少设置了一个筛选条件
    const hasCondition = exportParams.projectName ||
                        exportParams.dateRange ||
                        exportParams.status ||
                        exportParams.shippingMethod ||
                        exportParams.batchNumber ||
                        exportParams.equipmentType ||
                        exportParams.itemName ||
                        exportParams.manufacturer;

    if (!hasCondition) {
      ElMessage.warning('请至少设置一个筛选条件');
      return;
    }
  }

  // 构建导出参数
  const downloadParams: any = {};

  if (exportParams.exportType === 'current') {
    // 使用当前查询条件
    if (queryParams.projectName) {
      downloadParams.projectName = queryParams.projectName;
    }
    if (queryParams.listCode) {
      downloadParams.listCode = queryParams.listCode;
    }
    if (queryParams.batchNumber) {
      downloadParams.batchNumber = queryParams.batchNumber;
    }
    if (queryParams.status) {
      downloadParams.status = queryParams.status;
    }
    // shippingMethod 不在 queryParams 中，跳过
    if (dateRange.value && dateRange.value.length === 2) {
      downloadParams.startDate = dateRange.value[0];
      downloadParams.endDate = dateRange.value[1];
    }
  } else {
    // 使用自定义条件
    if (exportParams.projectName) {
      downloadParams.projectName = exportParams.projectName;
    }
    if (exportParams.dateRange && exportParams.dateRange.length === 2) {
      downloadParams.startDate = exportParams.dateRange[0];
      downloadParams.endDate = exportParams.dateRange[1];
    }
    if (exportParams.status) {
      downloadParams.status = exportParams.status;
    }
    if (exportParams.shippingMethod) {
      downloadParams.shippingMethod = exportParams.shippingMethod;
    }
    if (exportParams.batchNumber) {
      downloadParams.batchNumber = exportParams.batchNumber;
    }
    if (exportParams.equipmentType) {
      downloadParams.equipmentType = exportParams.equipmentType;
    }
    if (exportParams.itemName) {
      downloadParams.itemName = exportParams.itemName;
    }
    if (exportParams.manufacturer) {
      downloadParams.manufacturer = exportParams.manufacturer;
    }
  }

  // 添加导出格式参数
  downloadParams.exportFormat = exportParams.exportFormat;

  // 生成文件名
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:]/g, '').replace('T', '_').split('.')[0];
  let fileName = '';

  switch (exportParams.exportFormat) {
    case 'list':
      fileName = `发货清单汇总_${timestamp}.xlsx`;
      break;
    case 'items':
      fileName = `发货明细汇总_${timestamp}.xlsx`;
      break;
    case 'combined':
      fileName = `发货清单完整数据_${timestamp}.xlsx`;
      break;
    default:
      fileName = `发货清单_${timestamp}.xlsx`;
  }

  // 根据导出格式选择不同的API端点
  let apiUrl = '';
  switch (exportParams.exportFormat) {
    case 'list':
      apiUrl = '/erp/saltprocess/shipping/export';
      break;
    case 'items':
      apiUrl = '/erp/saltprocess/shipping/export-items';
      break;
    case 'combined':
      apiUrl = '/erp/saltprocess/shipping/export-combined';
      break;
    default:
      apiUrl = '/erp/saltprocess/shipping/export';
  }

  // 使用项目的通用下载方法
  proxy?.download(apiUrl, downloadParams, fileName);

  // 关闭对话框
  exportDialog.visible = false;

  ElMessage.success('导出请求已提交，请稍候下载');
};

// 辅助方法
const getStatusTagType = (status: ShippingStatus): string => {
  const typeMap = {
    DRAFT: 'info',
    PENDING: 'warning',
    PARTIAL_SHIPPED: 'primary',
    SHIPPED: 'success',
    DELIVERED: 'success',
    COMPLETED: 'success',
    CANCELLED: 'danger'
  };
  return typeMap[status] || 'info';
};

const getStatusLabel = (status: ShippingStatus): string => {
  const option = statusOptions.find(item => item.value === status);
  return option?.label || status;
};

const getShippingMethodLabel = (method: string): string => {
  const methodMap: Record<string, string> = {
    TRUCK: '卡车',
    RAIL: '铁路',
    SEA: '海运',
    AIR: '空运'
  };
  return methodMap[method] || method;
};

// 生命周期
onMounted(() => {
  getList();
});
</script>

<style scoped lang="scss">
.shipping-management {
  padding: 20px;

  .search-card,
  .operation-card,
  .table-card {
    margin-bottom: 20px;

    :deep(.el-card__body) {
      padding: 20px;
    }
  }

  .search-form {
    .el-form-item {
      margin-bottom: 16px;
    }
  }

  .operation-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .operation-left {
      display: flex;
      gap: 12px;
    }

    .operation-right {
      display: flex;
      gap: 8px;
    }
  }

  .table-card {
    :deep(.el-table) {
      .el-table__header {
        th {
          background-color: #f5f7fa;
          color: #606266;
          font-weight: 600;
        }
      }

      .el-table__row {
        &:hover {
          background-color: #f5f7fa;
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .shipping-management {
    padding: 10px;

    .search-form {
      .el-form-item {
        width: 100%;
        margin-bottom: 12px;

        .el-input,
        .el-select,
        .el-date-picker {
          width: 100% !important;
        }
      }
    }

    .operation-bar {
      flex-direction: column;
      gap: 12px;

      .operation-left,
      .operation-right {
        width: 100%;
        justify-content: center;
      }
    }
  }
}
</style>

<style scoped lang="scss">
.shipping-management {
  padding: 20px;

  .search-card,
  .operation-card,
  .table-card {
    margin-bottom: 20px;

    :deep(.el-card__body) {
      padding: 20px;
    }
  }

  .search-form {
    .el-form-item {
      margin-bottom: 16px;
    }
  }

  .operation-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .operation-left {
      display: flex;
      gap: 12px;
    }

    .operation-right {
      display: flex;
      gap: 8px;
    }
  }

  .table-card {
    :deep(.el-table) {
      .el-table__header {
        th {
          background-color: #f5f7fa;
          color: #606266;
          font-weight: 600;
        }
      }

      .el-table__row {
        &:hover {
          background-color: #f5f7fa;
        }
      }
    }
  }

  // 导出对话框样式
  .export-dialog-content {
    .form-item-tip {
      font-size: 12px;
      color: #909399;
      margin-top: 5px;
      line-height: 1.4;
    }
  }

  // 响应式设计
  @media (max-width: 768px) {
    padding: 10px;

    .search-form {
      .el-form-item {
        width: 100%;
        margin-bottom: 12px;
      }
    }

    .operation-bar {
      flex-direction: column;
      gap: 16px;
      align-items: stretch;

      .operation-left,
      .operation-right {
        justify-content: center;
      }
    }

    :deep(.el-table) {
      .el-table__header,
      .el-table__body {
        min-width: 800px;
      }
    }
  }
}
</style>
