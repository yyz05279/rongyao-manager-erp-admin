/**
 * 自动修复 TypeScript 编译错误的脚本
 * 处理流水线 Build 错误
 */

import * as fs from 'fs';
import * as path from 'path';

const projectRoot = '/Users/yyz/Desktop/haitang-web-admin';

// 修复列表
const fixes = [
  {
    file: 'src/views/erp/purchase/in/components/PurchaseInItemForm.vue',
    description: '修复 Props 类型定义和添加缺失方法',
    fixes: [
      {
        find: `const props = defineProps<{
  items: undefined
  disabled: false
}>()`,
        replace: `interface PurchaseInItem {
  id?: string | number;
  warehouseId?: string | number;
  productId?: string | number;
  productName?: string;
  stockCount?: number;
  count?: number;
  productPrice?: number;
  totalProductPrice?: number;
  taxPercent?: number;
  taxPrice?: number;
  totalPrice?: number;
  remark?: string;
}

const props = withDefaults(defineProps<{
  items?: PurchaseInItem[];
  disabled?: boolean;
}>(), {
  items: () => [],
  disabled: false
})`
      },
      {
        find: `/** 初始化 */
onMounted(async () => {
  const res  = await getWareHouseSimpleList()
  warehouseList.value = res.data
  defaultWarehouse.value = warehouseList.value.find((item) => item.defaultStatus)
})`,
        replace: `/** 仓库变更处理 */
const onChangeWarehouse = (warehouseId: string | number, row: any) => {
  // 仓库变更时的处理逻辑
  row.warehouseId = warehouseId
}

/** 初始化 */
onMounted(async () => {
  const res  = await getWareHouseSimpleList()
  warehouseList.value = res.data
  defaultWarehouse.value = warehouseList.value.find((item) => item.defaultStatus)
})`
      }
    ]
  }
];

console.log('开始修复 TypeScript 编译错误...');
console.log(`项目根目录: ${projectRoot}`);

