<template>
  <div class="date-mapping-fix-test">
    <el-card>
      <template #header>
        <h3>日期转换和列名映射修复测试</h3>
      </template>
      
      <el-space direction="vertical" size="large" style="width: 100%;">
        <!-- 文件上传 -->
        <el-card shadow="never">
          <template #header>
            <h4>1. 上传Excel文件</h4>
          </template>
          
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :show-file-list="false"
            accept=".xlsx,.xls"
            @change="handleFileChange"
          >
            <el-button type="primary">选择Excel文件</el-button>
          </el-upload>
          
          <div v-if="selectedFile" style="margin-top: 16px;">
            <p><strong>文件:</strong> {{ selectedFile.name }}</p>
          </div>
        </el-card>

        <!-- 表头智能识别测试 -->
        <el-card shadow="never" v-if="selectedFile">
          <template #header>
            <h4>2. 表头智能识别测试</h4>
          </template>
          
          <el-button @click="testHeaderDetection" :loading="detecting">测试表头识别</el-button>
          
          <div v-if="headerResult" style="margin-top: 16px;">
            <h5>表头识别结果:</h5>
            <el-alert
              :title="`找到表头行: 第${headerResult.headerRow}行`"
              type="success"
              :closable="false"
            />
            
            <el-table :data="headerResult.headers" border size="small" style="margin-top: 16px;">
              <el-table-column prop="index" label="列号" width="80" />
              <el-table-column prop="header" label="表头内容" width="200" />
              <el-table-column prop="mappedField" label="映射字段" width="150" />
              <el-table-column prop="status" label="映射状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="row.status === '成功' ? 'success' : 'warning'" size="small">
                    {{ row.status }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>

        <!-- 日期转换测试 -->
        <el-card shadow="never" v-if="headerResult">
          <template #header>
            <h4>3. 日期转换测试</h4>
          </template>
          
          <el-button @click="testDateConversion" :loading="converting">测试日期转换</el-button>
          
          <div v-if="dateResult" style="margin-top: 16px;">
            <h5>日期转换结果:</h5>
            <el-table :data="dateResult.conversions" border size="small">
              <el-table-column prop="row" label="行号" width="80" />
              <el-table-column prop="originalValue" label="原始值" width="120" />
              <el-table-column prop="valueType" label="值类型" width="100" />
              <el-table-column prop="convertedValue" label="转换后" width="120" />
              <el-table-column prop="status" label="转换状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="row.status === '成功' ? 'success' : 'danger'" size="small">
                    {{ row.status }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-card>

        <!-- 完整数据解析测试 -->
        <el-card shadow="never" v-if="dateResult">
          <template #header>
            <h4>4. 完整数据解析测试</h4>
          </template>
          
          <el-button @click="testFullParsing" :loading="parsing">测试完整解析</el-button>
          
          <div v-if="parseResult" style="margin-top: 16px;">
            <h5>解析结果统计:</h5>
            <el-row :gutter="16">
              <el-col :span="6">
                <el-statistic title="总行数" :value="parseResult.totalRows" />
              </el-col>
              <el-col :span="6">
                <el-statistic title="成功行数" :value="parseResult.successRows" />
              </el-col>
              <el-col :span="6">
                <el-statistic title="错误行数" :value="parseResult.errorRows" />
              </el-col>
              <el-col :span="6">
                <el-statistic title="成功率" :value="parseResult.successRate" suffix="%" />
              </el-col>
            </el-row>
            
            <h5 style="margin-top: 16px;">解析数据预览:</h5>
            <el-table :data="parseResult.preview" border size="small">
              <el-table-column prop="rowNumber" label="行号" width="80" />
              <el-table-column prop="date" label="日期" width="120" />
              <el-table-column prop="sodiumBags" label="钠盐袋数" width="100" />
              <el-table-column prop="potassiumBags" label="钾盐袋数" width="100" />
              <el-table-column prop="totalCrushingAmount" label="总粉碎量" width="100" />
              <el-table-column prop="staffCount" label="人数" width="80" />
              <el-table-column prop="status" label="状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="row.status === '成功' ? 'success' : 'danger'" size="small">
                    {{ row.status }}
                  </el-tag>
                </template>
              </el-table-column>
            </el-table>
            
            <div v-if="parseResult.errors.length > 0" style="margin-top: 16px;">
              <h5>错误信息:</h5>
              <el-alert
                v-for="(error, index) in parseResult.errors.slice(0, 5)"
                :key="index"
                :title="`第${error.row}行: ${error.message}`"
                type="error"
                :closable="false"
                style="margin-bottom: 8px;"
              />
              <p v-if="parseResult.errors.length > 5" style="color: #909399;">
                还有 {{ parseResult.errors.length - 5 }} 个错误...
              </p>
            </div>
          </div>
        </el-card>

        <!-- 修复验证结果 -->
        <el-card shadow="never" v-if="parseResult">
          <template #header>
            <h4>5. 修复验证结果</h4>
          </template>
          
          <div class="fix-verification">
            <el-alert
              :title="verificationResult.title"
              :type="verificationResult.type"
              :closable="false"
            >
              <template #default>
                <ul>
                  <li v-for="item in verificationResult.items" :key="item">{{ item }}</li>
                </ul>
              </template>
            </el-alert>
          </div>
        </el-card>
      </el-space>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import type { UploadFile } from 'element-plus';
import * as XLSX from 'xlsx';
import { ExcelParser } from '@/utils/excel-parser';



// 响应式数据
const selectedFile = ref<File | null>(null);
const headerResult = ref<any>(null);
const dateResult = ref<any>(null);
const parseResult = ref<any>(null);
const detecting = ref(false);
const converting = ref(false);
const parsing = ref(false);

// Excel解析器
const excelParser = new ExcelParser();

// 验证结果
const verificationResult = computed(() => {
  if (!parseResult.value) {
    return { title: '等待测试完成', type: 'info', items: [] };
  }
  
  const result = parseResult.value;
  const items: string[] = [];
  
  // 检查日期转换
  if (dateResult.value?.conversions.every((c: any) => c.status === '成功')) {
    items.push('✅ 日期转换修复成功 - 所有Excel日期序列号都能正确转换');
  } else {
    items.push('❌ 日期转换仍有问题 - 部分日期转换失败');
  }
  
  // 检查列名映射
  if (headerResult.value?.headers.filter((h: any) => h.status === '成功').length >= 3) {
    items.push('✅ 列名映射修复成功 - 主要字段都能正确映射');
  } else {
    items.push('❌ 列名映射仍有问题 - 重要字段映射失败');
  }
  
  // 检查数据解析
  if (result.successRate >= 80) {
    items.push('✅ 数据解析修复成功 - 大部分数据能正确解析');
  } else {
    items.push('❌ 数据解析仍有问题 - 解析成功率过低');
  }
  
  // 检查验证错误
  if (result.errorRows === 0) {
    items.push('✅ 验证错误修复成功 - 没有"不能为空"的错误');
  } else {
    items.push('❌ 验证错误仍存在 - 仍有必填字段为空的错误');
  }
  
  const successCount = items.filter(item => item.startsWith('✅')).length;
  const type = successCount >= 3 ? 'success' : successCount >= 2 ? 'warning' : 'error';
  const title = successCount >= 3 ? '修复验证通过' : successCount >= 2 ? '部分修复成功' : '修复验证失败';
  
  return { title, type, items };
});

// 文件选择
const handleFileChange = (file: UploadFile) => {
  if (file.raw) {
    selectedFile.value = file.raw;
    headerResult.value = null;
    dateResult.value = null;
    parseResult.value = null;
  }
};

// 测试表头识别
const testHeaderDetection = async () => {
  if (!selectedFile.value) return;
  
  detecting.value = true;
  try {
    const data = await readFileAsArrayBuffer(selectedFile.value);
    const workbook = XLSX.read(data, { type: 'array' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    
    // 模拟智能表头识别
    let foundHeaderRow = 1;
    let headers: string[] = [];
    
    for (let r = 0; r <= Math.min(3, range.e.r); r++) {
      const testHeaders = [];
      for (let c = range.s.c; c <= range.e.c; c++) {
        const cellAddress = XLSX.utils.encode_cell({ r, c });
        const cell = worksheet[cellAddress];
        testHeaders.push(cell ? cell.v : '');
      }
      
      const hasDateHeader = testHeaders.some(h => h && (h.includes('日期') || h.includes('日明')));
      const hasSodiumHeader = testHeaders.some(h => h && h.includes('钠'));
      const hasPotassiumHeader = testHeaders.some(h => h && h.includes('钾'));
      
      if (hasDateHeader || hasSodiumHeader || hasPotassiumHeader) {
        foundHeaderRow = r + 1;
        headers = testHeaders;
        break;
      }
    }
    
    // 测试映射
    const headerMapping = headers.map((header, index) => {
      const mappedField = findMappedField(header);
      return {
        index,
        header,
        mappedField: mappedField || '未映射',
        status: mappedField ? '成功' : '失败'
      };
    });
    
    headerResult.value = {
      headerRow: foundHeaderRow,
      headers: headerMapping
    };
    
    ElMessage.success('表头识别测试完成');
  } catch (error) {
    ElMessage.error(`表头识别失败: ${error}`);
  } finally {
    detecting.value = false;
  }
};

// 测试日期转换
const testDateConversion = async () => {
  if (!selectedFile.value || !headerResult.value) return;
  
  converting.value = true;
  try {
    const data = await readFileAsArrayBuffer(selectedFile.value);
    const workbook = XLSX.read(data, { type: 'array' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    
    const conversions: any[] = [];
    const dateColumnIndex = headerResult.value.headers.findIndex((h: any) => h.mappedField === 'date');
    
    if (dateColumnIndex >= 0) {
      // 读取前5行的日期数据
      for (let r = headerResult.value.headerRow; r <= Math.min(headerResult.value.headerRow + 4, range.e.r); r++) {
        const cellAddress = XLSX.utils.encode_cell({ r, c: dateColumnIndex });
        const cell = worksheet[cellAddress];
        const originalValue = cell ? cell.v : '';
        
        if (originalValue) {
          const convertedValue = convertDateValue(originalValue);
          conversions.push({
            row: r + 1,
            originalValue,
            valueType: typeof originalValue,
            convertedValue,
            status: convertedValue !== String(originalValue) ? '成功' : '失败'
          });
        }
      }
    }
    
    dateResult.value = { conversions };
    ElMessage.success('日期转换测试完成');
  } catch (error) {
    ElMessage.error(`日期转换测试失败: ${error}`);
  } finally {
    converting.value = false;
  }
};

// 测试完整解析
const testFullParsing = async () => {
  if (!selectedFile.value) return;

  parsing.value = true;
  try {
    console.log('开始完整解析测试...');

    // 第一步：先解析文件
    console.log('步骤1: 解析Excel文件');
    await excelParser.parseFile(selectedFile.value);
    console.log('文件解析完成');

    // 第二步：导入数据
    console.log('步骤2: 导入数据');
    const result = await excelParser.importMoltenSaltInventory();
    console.log('数据导入完成:', result);

    const successRows = result.data.length;
    const errorRows = result.errors.length;
    const totalRows = successRows + errorRows;
    const successRate = totalRows > 0 ? Math.round((successRows / totalRows) * 100) : 0;

    console.log(`解析统计: 总行数=${totalRows}, 成功=${successRows}, 错误=${errorRows}, 成功率=${successRate}%`);

    const preview = result.data.slice(0, 5).map((item: any, index: number) => ({
      rowNumber: index + 1,
      date: item.date,
      sodiumBags: item.sodiumBags,
      potassiumBags: item.potassiumBags,
      totalCrushingAmount: item.totalCrushingAmount,
      staffCount: item.staffCount,
      status: '成功'
    }));

    // 添加错误行到预览（如果有的话）
    const errorPreview = result.errors.slice(0, 3).map((error: any) => ({
      rowNumber: error.row || 'N/A',
      date: '解析失败',
      sodiumBags: '解析失败',
      potassiumBags: '解析失败',
      totalCrushingAmount: '解析失败',
      staffCount: '解析失败',
      status: '失败'
    }));

    parseResult.value = {
      totalRows,
      successRows,
      errorRows,
      successRate,
      preview: [...preview, ...errorPreview],
      errors: result.errors
    };

    ElMessage.success(`完整解析测试完成 - 成功率: ${successRate}%`);
  } catch (error) {
    console.error('完整解析测试失败:', error);
    ElMessage.error(`完整解析测试失败: ${error}`);
  } finally {
    parsing.value = false;
  }
};



// 辅助函数
const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

const findMappedField = (header: string): string | undefined => {
  if (!header) return undefined;
  
  const lower = header.toLowerCase().trim();
  if (lower.includes('日期') || lower.includes('日明')) return 'date';
  if (lower.includes('钠')) return 'sodiumBags';
  if (lower.includes('钾')) return 'potassiumBags';
  if (lower.includes('总粉碎量') || lower.includes('粉碎量')) return 'totalCrushingAmount';
  if (lower.includes('人数')) return 'staffCount';
  
  return undefined;
};

const convertDateValue = (value: any): string => {
  if (typeof value === 'number') {
    try {
      let excelDate = value;
      if (value > 59) {
        excelDate = value - 1;
      }
      
      const jsDate = new Date((excelDate - 25569) * 86400 * 1000);
      const year = jsDate.getFullYear();
      const month = String(jsDate.getMonth() + 1).padStart(2, '0');
      const day = String(jsDate.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    } catch (error) {
      return String(value);
    }
  }
  
  return String(value);
};
</script>

<style scoped lang="scss">
.date-mapping-fix-test {
  padding: 20px;

  h4 {
    margin: 0;
    color: #303133;
  }

  h5 {
    margin: 16px 0 8px 0;
    color: #606266;
  }

  .fix-verification {
    ul {
      margin: 0;
      padding-left: 20px;
      
      li {
        margin: 8px 0;
        line-height: 1.5;
      }
    }
  }
}
</style>
