# 前端 Excel 解析实现方案

## 技术架构

### 前端解析 + 后端处理模式

```
前端 (Vue3 + 若依)                    后端 (Spring Boot)
┌─────────────────────┐              ┌─────────────────────┐
│ Excel文件上传        │              │                     │
│        ↓            │              │                     │
│ 客户端解析(xlsx.js)  │              │                     │
│        ↓            │              │                     │
│ 数据预览和编辑       │   JSON数据    │  数据验证和处理      │
│        ↓            │ ────────────→ │        ↓            │
│ 数据验证和清洗       │              │  产品匹配/创建       │
│        ↓            │              │        ↓            │
│ 发送JSON到后端      │              │  保存到数据库        │
└─────────────────────┘              └─────────────────────┘
```

## 前端实现

### 1. Excel 解析组件 (MaterialImportUpload.vue)

```vue
<template>
    <div class="material-import-container">
        <!-- 文件上传区域 -->
        <el-card class="upload-card">
            <template #header>
                <div class="card-header">
                    <span>物料清单导入</span>
                    <el-button type="primary" @click="downloadTemplate">
                        <el-icon><Download /></el-icon>
                        下载模板
                    </el-button>
                </div>
            </template>

            <el-upload
                ref="uploadRef"
                class="upload-demo"
                drag
                :auto-upload="false"
                :on-change="handleFileChange"
                :before-upload="beforeUpload"
                accept=".xlsx,.xls"
                :limit="1"
            >
                <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                <div class="el-upload__text">
                    将Excel文件拖到此处，或<em>点击上传</em>
                </div>
                <template #tip>
                    <div class="el-upload__tip">
                        支持 .xlsx/.xls 格式，文件大小不超过50MB
                    </div>
                </template>
            </el-upload>
        </el-card>

        <!-- 解析进度 -->
        <el-card v-if="parsing" class="progress-card">
            <el-progress
                :percentage="parseProgress"
                :status="parseStatus"
                :stroke-width="8"
            >
                <template #default="{ percentage }">
                    <span class="percentage-value">{{ percentage }}%</span>
                </template>
            </el-progress>
            <p class="progress-text">{{ parseMessage }}</p>
        </el-card>

        <!-- 数据预览和编辑 -->
        <el-card v-if="materialData.length > 0" class="preview-card">
            <template #header>
                <div class="card-header">
                    <span>数据预览 (共{{ materialData.length }}条记录)</span>
                    <div>
                        <el-button @click="validateData">验证数据</el-button>
                        <el-button
                            type="success"
                            @click="submitData"
                            :loading="submitting"
                        >
                            导入数据
                        </el-button>
                    </div>
                </div>
            </template>

            <!-- 统计信息 -->
            <div class="statistics-bar">
                <el-tag type="info">总计: {{ materialData.length }}</el-tag>
                <el-tag type="success">有效: {{ validCount }}</el-tag>
                <el-tag type="warning" v-if="warningCount > 0"
                    >警告: {{ warningCount }}</el-tag
                >
                <el-tag type="danger" v-if="errorCount > 0"
                    >错误: {{ errorCount }}</el-tag
                >
            </div>

            <!-- 数据表格 -->
            <el-table
                :data="paginatedData"
                style="width: 100%"
                :row-class-name="getRowClassName"
                max-height="500"
            >
                <el-table-column type="index" label="序号" width="60" />
                <el-table-column
                    prop="materialName"
                    label="物料名称"
                    width="200"
                >
                    <template #default="{ row, $index }">
                        <el-input
                            v-model="row.materialName"
                            @change="validateRow($index)"
                            :class="{ 'error-input': row.errors?.materialName }"
                        />
                        <div v-if="row.errors?.materialName" class="error-text">
                            {{ row.errors.materialName }}
                        </div>
                    </template>
                </el-table-column>
                <el-table-column
                    prop="specification"
                    label="规格型号"
                    width="200"
                >
                    <template #default="{ row, $index }">
                        <el-input
                            v-model="row.specification"
                            @change="validateRow($index)"
                        />
                    </template>
                </el-table-column>
                <el-table-column prop="quantity" label="数量" width="100">
                    <template #default="{ row, $index }">
                        <el-input-number
                            v-model="row.quantity"
                            @change="validateRow($index)"
                            :min="0"
                            :precision="2"
                            size="small"
                        />
                    </template>
                </el-table-column>
                <el-table-column prop="unit" label="单位" width="80">
                    <template #default="{ row }">
                        <el-select
                            v-model="row.unit"
                            placeholder="选择单位"
                            size="small"
                        >
                            <el-option label="台" value="台" />
                            <el-option label="套" value="套" />
                            <el-option label="件" value="件" />
                            <el-option label="个" value="个" />
                            <el-option label="支" value="支" />
                            <el-option label="根" value="根" />
                            <el-option label="米" value="米" />
                            <el-option label="kg" value="kg" />
                        </el-select>
                    </template>
                </el-table-column>
                <el-table-column
                    prop="materialType"
                    label="物料类型"
                    width="120"
                >
                    <template #default="{ row }">
                        <el-tag :type="getMaterialTypeTag(row.materialType)">
                            {{ getMaterialTypeName(row.materialType) }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="remarks1" label="备注" width="150" />
                <el-table-column prop="remarks2" label="备注2" width="150" />
                <el-table-column label="状态" width="80">
                    <template #default="{ row }">
                        <el-icon v-if="!row.hasErrors" color="green"
                            ><Check
                        /></el-icon>
                        <el-icon v-else color="red"><Close /></el-icon>
                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页 -->
            <el-pagination
                v-if="materialData.length > pageSize"
                v-model:current-page="currentPage"
                v-model:page-size="pageSize"
                :page-sizes="[20, 50, 100, 200]"
                :total="materialData.length"
                layout="total, sizes, prev, pager, next, jumper"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
            />
        </el-card>

        <!-- 导入结果 -->
        <el-dialog v-model="showResult" title="导入结果" width="600px">
            <div v-if="importResult">
                <el-result
                    :icon="importResult.success ? 'success' : 'error'"
                    :title="importResult.success ? '导入成功' : '导入失败'"
                    :sub-title="importResult.summary"
                >
                    <template #extra>
                        <div class="result-stats">
                            <el-descriptions :column="2" border>
                                <el-descriptions-item label="总记录数">
                                    {{ importResult.totalRecords }}
                                </el-descriptions-item>
                                <el-descriptions-item label="成功记录">
                                    {{ importResult.successRecords }}
                                </el-descriptions-item>
                                <el-descriptions-item label="新建产品">
                                    {{ importResult.newProductRecords }}
                                </el-descriptions-item>
                                <el-descriptions-item label="匹配产品">
                                    {{ importResult.matchedProductRecords }}
                                </el-descriptions-item>
                            </el-descriptions>
                        </div>

                        <!-- 错误信息 -->
                        <div
                            v-if="importResult.errors?.length > 0"
                            class="error-list"
                        >
                            <h4>错误信息：</h4>
                            <el-scrollbar max-height="200px">
                                <div
                                    v-for="error in importResult.errors"
                                    :key="error.rowNumber"
                                    class="error-item"
                                >
                                    <el-tag type="danger" size="small"
                                        >第{{ error.rowNumber }}行</el-tag
                                    >
                                    {{ error.materialName }}:
                                    {{ error.errorMessage }}
                                </div>
                            </el-scrollbar>
                        </div>
                    </template>
                </el-result>
            </div>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { UploadFilled, Download, Check, Close } from "@element-plus/icons-vue";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
    importMaterialData,
    validateMaterialData,
} from "@/api/material/import";

// 响应式数据
const uploadRef = ref();
const materialData = ref([]);
const parsing = ref(false);
const parseProgress = ref(0);
const parseStatus = ref("");
const parseMessage = ref("");
const submitting = ref(false);
const showResult = ref(false);
const importResult = ref(null);

// 分页相关
const currentPage = ref(1);
const pageSize = ref(50);

// 计算属性
const paginatedData = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    const end = start + pageSize.value;
    return materialData.value.slice(start, end);
});

const validCount = computed(() => {
    return materialData.value.filter((item) => !item.hasErrors).length;
});

const errorCount = computed(() => {
    return materialData.value.filter((item) => item.hasErrors).length;
});

const warningCount = computed(() => {
    return materialData.value.filter((item) => item.hasWarnings).length;
});

// Props
const props = defineProps({
    projectId: {
        type: String,
        required: true,
    },
    batchNumber: {
        type: String,
        default: "",
    },
    responsiblePerson: {
        type: String,
        default: "",
    },
});

// 文件上传前验证
const beforeUpload = (file) => {
    const isExcel =
        file.type ===
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        file.type === "application/vnd.ms-excel";
    const isLt50M = file.size / 1024 / 1024 < 50;

    if (!isExcel) {
        ElMessage.error("只支持Excel文件格式!");
        return false;
    }
    if (!isLt50M) {
        ElMessage.error("文件大小不能超过50MB!");
        return false;
    }
    return false; // 阻止自动上传，手动处理
};

// 文件选择处理
const handleFileChange = (file) => {
    if (file.raw) {
        parseExcelFile(file.raw);
    }
};

// Excel文件解析
const parseExcelFile = async (file) => {
    parsing.value = true;
    parseProgress.value = 0;
    parseMessage.value = "正在读取文件...";

    try {
        // 读取文件
        const buffer = await file.arrayBuffer();
        parseProgress.value = 20;
        parseMessage.value = "正在解析Excel结构...";

        // 解析工作簿
        const workbook = XLSX.read(buffer, { type: "array" });
        parseProgress.value = 40;
        parseMessage.value = "正在提取数据...";

        const allMaterials = [];

        // 遍历所有工作表
        for (let i = 0; i < workbook.SheetNames.length; i++) {
            const sheetName = workbook.SheetNames[i];
            const worksheet = workbook.Sheets[sheetName];

            parseMessage.value = `正在解析工作表: ${sheetName}`;

            // 转换为JSON数据
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            // 解析工作表数据
            const sheetMaterials = parseSheetData(
                jsonData,
                sheetName,
                file.name
            );
            allMaterials.push(...sheetMaterials);

            parseProgress.value =
                40 + ((i + 1) / workbook.SheetNames.length) * 40;
        }

        parseProgress.value = 90;
        parseMessage.value = "正在验证数据...";

        // 数据清洗和验证
        materialData.value = cleanAndValidateData(allMaterials);

        parseProgress.value = 100;
        parseMessage.value = "解析完成!";
        parseStatus.value = "success";

        setTimeout(() => {
            parsing.value = false;
        }, 1000);

        ElMessage.success(`成功解析 ${materialData.value.length} 条记录`);
    } catch (error) {
        console.error("Excel解析失败:", error);
        parseStatus.value = "exception";
        parseMessage.value = "解析失败: " + error.message;
        ElMessage.error("Excel文件解析失败: " + error.message);

        setTimeout(() => {
            parsing.value = false;
        }, 2000);
    }
};

// 解析工作表数据
const parseSheetData = (jsonData, sheetName, fileName) => {
    if (!jsonData || jsonData.length === 0) return [];

    // 查找表头行
    let headerRowIndex = -1;
    for (let i = 0; i < Math.min(10, jsonData.length); i++) {
        const row = jsonData[i];
        if (row && containsHeaderKeywords(row)) {
            headerRowIndex = i;
            break;
        }
    }

    if (headerRowIndex === -1) {
        console.warn(`工作表 ${sheetName} 未找到表头行`);
        return [];
    }

    // 构建列映射
    const headerRow = jsonData[headerRowIndex];
    const columnMapping = buildColumnMapping(headerRow);

    // 解析数据行
    const materials = [];
    for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (!row || isEmptyRow(row)) continue;

        const material = parseRowData(
            row,
            columnMapping,
            sheetName,
            fileName,
            i + 1
        );
        if (material) {
            materials.push(material);
        }
    }

    return materials;
};

// 检查是否包含表头关键词
const containsHeaderKeywords = (row) => {
    const keywords = [
        "序号",
        "物品名称",
        "物料名称",
        "设备名称",
        "名称",
        "类别",
        "规格",
        "数量",
        "单位",
    ];
    const rowStr = row.join("").toLowerCase();

    return keywords.some((keyword) => rowStr.includes(keyword));
};

// 构建列映射
const buildColumnMapping = (headerRow) => {
    const mapping = {};

    headerRow.forEach((header, index) => {
        if (!header) return;

        const headerStr = header.toString().trim().toLowerCase();

        if (headerStr.includes("序号")) mapping.sequenceNumber = index;
        else if (
            headerStr.includes("物品名称") ||
            headerStr.includes("物料名称") ||
            headerStr.includes("设备名称") ||
            headerStr.includes("名称") ||
            headerStr.includes("类别")
        )
            mapping.materialName = index;
        else if (
            headerStr.includes("规格") ||
            headerStr.includes("型号") ||
            headerStr.includes("参数")
        )
            mapping.specification = index;
        else if (headerStr.includes("数量")) mapping.quantity = index;
        else if (headerStr.includes("单位")) mapping.unit = index;
        else if (headerStr.includes("材质")) mapping.materialCategory = index;
        else if (
            headerStr.includes("备注") ||
            (headerStr.includes("备注") && !headerStr.includes("2"))
        )
            mapping.remarks1 = index;
        else if (headerStr.includes("备注2")) mapping.remarks2 = index;
        else if (headerStr.includes("重量")) mapping.weight = index;
    });

    return mapping;
};

// 解析行数据
const parseRowData = (row, columnMapping, sheetName, fileName, rowNumber) => {
    const getValue = (field) => {
        const index = columnMapping[field];
        return index !== undefined ? row[index] : null;
    };

    const materialName = getValue("materialName");
    if (!materialName) return null;

    // 根据文件名判断物料类型
    const materialType = determineMaterialType(fileName);

    return {
        sequenceNumber: getValue("sequenceNumber") || "",
        materialName: materialName.toString().trim(),
        materialType,
        specification: getValue("specification") || "",
        quantity: parseFloat(getValue("quantity")) || 1,
        unit: getValue("unit") || "",
        materialCategory: getValue("materialCategory") || "",
        remarks1: getValue("remarks1") || "",
        remarks2: getValue("remarks2") || "",
        unitWeight: parseFloat(getValue("weight")) || null,
        fileSource: fileName,
        sheetName,
        rowNumber,
        hasErrors: false,
        hasWarnings: false,
        errors: {},
        warnings: {},
    };
};

// 判断物料类型
const determineMaterialType = (fileName) => {
    const name = fileName.toLowerCase();
    if (name.includes("电控")) return "ELECTRICAL";
    if (name.includes("机械")) return "MECHANICAL";
    if (name.includes("装车") || name.includes("发货")) return "SHIPPING_INFO";
    return "GENERAL";
};

// 检查空行
const isEmptyRow = (row) => {
    return !row.some(
        (cell) => cell !== null && cell !== undefined && cell !== ""
    );
};

// 数据清洗和验证
const cleanAndValidateData = (materials) => {
    return materials.map((material) => {
        // 数据清洗
        if (material.materialName) {
            material.materialName = material.materialName.toString().trim();
        }
        if (material.specification) {
            material.specification = material.specification.toString().trim();
        }

        // 数据验证
        validateMaterialItem(material);

        return material;
    });
};

// 验证单个物料项
const validateMaterialItem = (material) => {
    material.errors = {};
    material.warnings = {};
    material.hasErrors = false;
    material.hasWarnings = false;

    // 必填字段验证
    if (!material.materialName) {
        material.errors.materialName = "物料名称不能为空";
        material.hasErrors = true;
    }

    // 数量验证
    if (material.quantity <= 0) {
        material.errors.quantity = "数量必须大于0";
        material.hasErrors = true;
    }

    // 单位验证
    if (!material.unit) {
        material.warnings.unit = "建议填写单位";
        material.hasWarnings = true;
    }
};

// 验证行数据
const validateRow = (index) => {
    const actualIndex = (currentPage.value - 1) * pageSize.value + index;
    const material = materialData.value[actualIndex];
    validateMaterialItem(material);
};

// 验证所有数据
const validateData = async () => {
    try {
        const result = await validateMaterialData(materialData.value);

        if (result.errors && result.errors.length > 0) {
            // 将服务端验证错误映射到前端数据
            result.errors.forEach((error) => {
                const material = materialData.value[error.rowNumber - 1];
                if (material) {
                    material.errors[error.fieldName] = error.errorMessage;
                    material.hasErrors = true;
                }
            });
        }

        ElMessage.success("数据验证完成");
    } catch (error) {
        ElMessage.error("数据验证失败: " + error.message);
    }
};

// 提交数据
const submitData = async () => {
    // 检查是否有错误
    if (errorCount.value > 0) {
        const confirm = await ElMessageBox.confirm(
            `检测到 ${errorCount.value} 条错误记录，是否继续导入有效数据？`,
            "确认导入",
            {
                confirmButtonText: "继续导入",
                cancelButtonText: "取消",
                type: "warning",
            }
        ).catch(() => false);

        if (!confirm) return;
    }

    submitting.value = true;

    try {
        // 过滤掉有错误的记录
        const validMaterials = materialData.value.filter(
            (item) => !item.hasErrors
        );

        const importData = {
            projectId: props.projectId,
            batchNumber: props.batchNumber,
            responsiblePerson: props.responsiblePerson,
            shippingDate: new Date().toISOString().split("T")[0],
            materialItems: validMaterials,
            fileSource: "前端Excel解析导入",
            remarks: `共${materialData.value.length}条记录，有效${validMaterials.length}条`,
        };

        const result = await importMaterialData(importData);

        importResult.value = result;
        showResult.value = true;

        if (result.success) {
            ElMessage.success("数据导入成功!");
            // 清空数据
            materialData.value = [];
            uploadRef.value.clearFiles();
        }
    } catch (error) {
        ElMessage.error("数据导入失败: " + error.message);
    } finally {
        submitting.value = false;
    }
};

// 下载模板
const downloadTemplate = () => {
    // 创建模板数据
    const templateData = [
        ["序号", "物料名称", "规格型号", "数量", "单位", "备注", "备注2"],
        [1, "示例设备1", "型号ABC-123", 2, "台", "新采购", ""],
        [2, "示例设备2", "规格XYZ-456", 1, "套", "库存", "测试备注"],
        [3, "示例设备3", "参数DEF-789", 5, "件", "", ""],
    ];

    // 创建工作簿
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(templateData);

    // 设置列宽
    ws["!cols"] = [
        { wch: 8 }, // 序号
        { wch: 20 }, // 物料名称
        { wch: 20 }, // 规格型号
        { wch: 8 }, // 数量
        { wch: 8 }, // 单位
        { wch: 15 }, // 备注
        { wch: 15 }, // 备注2
    ];

    XLSX.utils.book_append_sheet(wb, ws, "物料清单模板");

    // 导出文件
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], { type: "application/octet-stream" });
    saveAs(blob, "物料清单导入模板.xlsx");
};

// 获取物料类型标签样式
const getMaterialTypeTag = (type) => {
    const tagMap = {
        GENERAL: "",
        MECHANICAL: "success",
        ELECTRICAL: "warning",
        SHIPPING_INFO: "info",
    };
    return tagMap[type] || "";
};

// 获取物料类型名称
const getMaterialTypeName = (type) => {
    const nameMap = {
        GENERAL: "通用物料",
        MECHANICAL: "机械设备",
        ELECTRICAL: "电控设备",
        SHIPPING_INFO: "发货信息",
    };
    return nameMap[type] || "未知类型";
};

// 获取行样式
const getRowClassName = ({ row }) => {
    if (row.hasErrors) return "error-row";
    if (row.hasWarnings) return "warning-row";
    return "";
};

// 分页处理
const handleSizeChange = (val) => {
    pageSize.value = val;
    currentPage.value = 1;
};

const handleCurrentChange = (val) => {
    currentPage.value = val;
};
</script>

<style scoped>
.material-import-container {
    padding: 20px;
}

.upload-card,
.progress-card,
.preview-card {
    margin-bottom: 20px;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.upload-demo {
    width: 100%;
}

.progress-card {
    text-align: center;
}

.progress-text {
    margin-top: 10px;
    color: #666;
}

.statistics-bar {
    margin-bottom: 15px;
}

.statistics-bar .el-tag {
    margin-right: 10px;
}

.error-input {
    border-color: #f56c6c !important;
}

.error-text {
    color: #f56c6c;
    font-size: 12px;
    margin-top: 2px;
}

:deep(.error-row) {
    background-color: #fef0f0;
}

:deep(.warning-row) {
    background-color: #fdf6ec;
}

.result-stats {
    margin: 20px 0;
}

.error-list {
    margin-top: 20px;
    text-align: left;
}

.error-item {
    margin-bottom: 8px;
    padding: 8px;
    background-color: #fef0f0;
    border-radius: 4px;
}

.percentage-value {
    font-weight: bold;
}
</style>
```

### 2. API 接口调用 (api/material/import.js)

```javascript
import request from "@/utils/request";

// 导入物料清单数据
export function importMaterialData(data) {
    return request({
        url: "/erp/material/import/data",
        method: "post",
        data: data,
    });
}

// 验证物料数据
export function validateMaterialData(data) {
    return request({
        url: "/erp/material/import/validate",
        method: "post",
        data: data,
    });
}

// 匹配现有产品
export function matchExistingProduct(materialName, specification) {
    return request({
        url: "/erp/material/import/match-product",
        method: "get",
        params: {
            materialName,
            specification,
        },
    });
}
```

### 3. 页面集成 (views/material/import.vue)

```vue
<template>
    <div class="app-container">
        <el-form
            :model="importForm"
            :rules="rules"
            ref="formRef"
            label-width="120px"
        >
            <el-row :gutter="20">
                <el-col :span="12">
                    <el-form-item label="项目" prop="projectId">
                        <el-select
                            v-model="importForm.projectId"
                            placeholder="请选择项目"
                            style="width: 100%"
                            filterable
                        >
                            <el-option
                                v-for="project in projectList"
                                :key="project.id"
                                :label="project.projectName"
                                :value="project.id"
                            />
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="批次号" prop="batchNumber">
                        <el-input
                            v-model="importForm.batchNumber"
                            placeholder="请输入批次号"
                        />
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row :gutter="20">
                <el-col :span="12">
                    <el-form-item label="负责人" prop="responsiblePerson">
                        <el-input
                            v-model="importForm.responsiblePerson"
                            placeholder="请输入负责人"
                        />
                    </el-form-item>
                </el-col>
            </el-row>
        </el-form>

        <!-- Excel导入组件 -->
        <MaterialImportUpload
            :project-id="importForm.projectId"
            :batch-number="importForm.batchNumber"
            :responsible-person="importForm.responsiblePerson"
            @success="handleImportSuccess"
        />
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { ElMessage } from "element-plus";
import MaterialImportUpload from "@/components/MaterialImportUpload.vue";
import { listProject } from "@/api/project";

const formRef = ref();
const projectList = ref([]);

const importForm = ref({
    projectId: "",
    batchNumber: "",
    responsiblePerson: "",
});

const rules = {
    projectId: [{ required: true, message: "请选择项目", trigger: "change" }],
};

// 获取项目列表
const getProjectList = async () => {
    try {
        const response = await listProject();
        projectList.value = response.rows || [];
    } catch (error) {
        ElMessage.error("获取项目列表失败");
    }
};

// 导入成功回调
const handleImportSuccess = (result) => {
    ElMessage.success("物料清单导入成功!");
    // 可以跳转到发货清单详情页
    // router.push(`/shipping/list/${result.shippingListId}`)
};

onMounted(() => {
    getProjectList();
});
</script>
```

## 后端接口调整

由于前端已经完成了 Excel 解析，后端只需要保留 JSON 数据导入接口：

```java
// 简化后的控制器
@RestController
@RequestMapping("/erp/material/import")
public class MaterialImportController {

    @PostMapping("/data")
    public R<MaterialImportResultVo> importMaterialList(@RequestBody MaterialImportBo importBo) {
        // 直接处理前端解析好的数据
        MaterialImportResultVo result = materialImportService.importMaterialList(importBo);
        return R.ok(result);
    }

    @PostMapping("/validate")
    public R<MaterialImportResultVo> validateMaterialData(@RequestBody List<MaterialImportBo.MaterialItemBo> materialItems) {
        MaterialImportResultVo result = materialImportService.validateMaterialData(materialItems);
        return R.ok(result);
    }

    @GetMapping("/match-product")
    public R<Long> matchExistingProduct(@RequestParam String materialName,
                                       @RequestParam(required = false) String specification) {
        Long productId = materialImportService.matchExistingProduct(materialName, specification);
        return R.ok(productId);
    }
}
```

## 方案优势总结

### 🚀 **性能提升**

- 文件解析在客户端完成，减轻服务器压力
- 只传输 JSON 数据，减少网络带宽占用
- 支持大文件本地处理

### 💡 **用户体验**

- 实时数据预览和编辑
- 即时错误提示和修正
- 进度显示和状态反馈
- 支持数据验证和清洗

### 🔧 **技术优势**

- 前后端职责分离
- 减少服务器资源消耗
- 更好的错误处理和用户交互
- 支持离线数据处理

### 📱 **扩展性**

- 易于添加新的文件格式支持
- 可以集成更多数据验证规则
- 支持自定义模板和字段映射
- 便于集成到若依框架的权限体系

这种方案充分利用了现代浏览器的能力，提供了更好的用户体验，同时减轻了服务器负担，是一个非常实用的解决方案。
