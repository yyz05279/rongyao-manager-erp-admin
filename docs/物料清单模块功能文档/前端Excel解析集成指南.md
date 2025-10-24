# 前端 Excel 解析集成指南

## 概述

本指南详细说明如何在若依框架+Vue3 环境下集成 Excel 解析功能，实现前端解析、后端处理的物料清单导入方案。

## 技术架构对比

### 原方案 vs 新方案

| 对比项     | 原方案（后端解析） | 新方案（前端解析）  |
| ---------- | ------------------ | ------------------- |
| 文件处理   | 服务器端处理       | 客户端处理          |
| 服务器压力 | 高                 | 低                  |
| 用户体验   | 上传后等待         | 实时预览编辑        |
| 网络传输   | 文件+数据          | 仅数据              |
| 错误处理   | 批量反馈           | 实时反馈            |
| 数据验证   | 服务端验证         | 前端+服务端双重验证 |

## 集成步骤

### 1. 安装依赖包

```bash
# 在若依前端项目根目录执行
npm install xlsx xlsx-style file-saver --save
```

### 2. 创建 Excel 解析工具类

在 `src/utils/` 目录下创建 `excelParser.js`：

```javascript
import * as XLSX from "xlsx";

/**
 * Excel解析工具类
 */
export class ExcelParser {
    /**
     * 解析Excel文件
     * @param {File} file - Excel文件
     * @param {Object} options - 解析选项
     * @returns {Promise<Array>} 解析结果
     */
    static async parseFile(file, options = {}) {
        const {
            headerRowIndex = null, // 表头行索引，null表示自动检测
            sheetNames = null, // 指定工作表名称，null表示解析所有
            materialTypeDetector = this.defaultMaterialTypeDetector,
        } = options;

        try {
            const buffer = await file.arrayBuffer();
            const workbook = XLSX.read(buffer, { type: "array" });

            const results = [];
            const sheetsToProcess = sheetNames || workbook.SheetNames;

            for (const sheetName of sheetsToProcess) {
                if (!workbook.Sheets[sheetName]) continue;

                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                    header: 1,
                });

                const sheetResult = this.parseSheetData(
                    jsonData,
                    sheetName,
                    file.name,
                    headerRowIndex,
                    materialTypeDetector
                );

                results.push(...sheetResult);
            }

            return results;
        } catch (error) {
            throw new Error(`Excel文件解析失败: ${error.message}`);
        }
    }

    /**
     * 解析工作表数据
     */
    static parseSheetData(
        jsonData,
        sheetName,
        fileName,
        headerRowIndex,
        materialTypeDetector
    ) {
        if (!jsonData || jsonData.length === 0) return [];

        // 查找表头行
        const headerIndex =
            headerRowIndex !== null
                ? headerRowIndex
                : this.findHeaderRow(jsonData);
        if (headerIndex === -1) return [];

        // 构建列映射
        const columnMapping = this.buildColumnMapping(jsonData[headerIndex]);

        // 解析数据行
        const materials = [];
        for (let i = headerIndex + 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            if (!row || this.isEmptyRow(row)) continue;

            const material = this.parseRowData(
                row,
                columnMapping,
                sheetName,
                fileName,
                i + 1,
                materialTypeDetector(fileName)
            );

            if (material) {
                materials.push(material);
            }
        }

        return materials;
    }

    /**
     * 查找表头行
     */
    static findHeaderRow(jsonData) {
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

        for (let i = 0; i < Math.min(10, jsonData.length); i++) {
            const row = jsonData[i];
            if (!row) continue;

            const rowStr = row.join("").toLowerCase();
            if (keywords.some((keyword) => rowStr.includes(keyword))) {
                return i;
            }
        }

        return -1;
    }

    /**
     * 构建列映射
     */
    static buildColumnMapping(headerRow) {
        const mapping = {};

        headerRow.forEach((header, index) => {
            if (!header) return;

            const headerStr = header.toString().trim().toLowerCase();

            // 字段映射规则
            const mappingRules = {
                sequenceNumber: ["序号"],
                materialName: [
                    "物品名称",
                    "物料名称",
                    "设备名称",
                    "名称",
                    "类别",
                ],
                specification: ["规格", "型号", "参数", "主要参数", "规格型号"],
                quantity: ["数量", "qty"],
                unit: ["单位", "计量单位"],
                materialCategory: ["材质", "类别"],
                remarks1: ["备注", "备注"],
                remarks2: ["备注2"],
                weight: ["重量", "单重", "总重"],
                manufacturer: ["制造商", "厂家"],
                model: ["型号", "规格型号"],
            };

            for (const [field, keywords] of Object.entries(mappingRules)) {
                if (keywords.some((keyword) => headerStr.includes(keyword))) {
                    if (!mapping[field]) {
                        // 避免重复映射
                        mapping[field] = index;
                    }
                    break;
                }
            }
        });

        return mapping;
    }

    /**
     * 解析行数据
     */
    static parseRowData(
        row,
        columnMapping,
        sheetName,
        fileName,
        rowNumber,
        materialType
    ) {
        const getValue = (field) => {
            const index = columnMapping[field];
            return index !== undefined ? row[index] : null;
        };

        const materialName = getValue("materialName");
        if (!materialName) return null;

        return {
            sequenceNumber: this.cleanValue(getValue("sequenceNumber")),
            materialName: this.cleanValue(materialName),
            materialType,
            specification: this.cleanValue(getValue("specification")),
            quantity: this.parseNumber(getValue("quantity")) || 1,
            unit: this.cleanValue(getValue("unit")),
            materialCategory: this.cleanValue(getValue("materialCategory")),
            manufacturer: this.cleanValue(getValue("manufacturer")),
            model: this.cleanValue(getValue("model")),
            remarks1: this.cleanValue(getValue("remarks1")),
            remarks2: this.cleanValue(getValue("remarks2")),
            unitWeight: this.parseNumber(getValue("weight")),
            fileSource: fileName,
            sheetName,
            rowNumber,
            // 前端验证字段
            hasErrors: false,
            hasWarnings: false,
            errors: {},
            warnings: {},
        };
    }

    /**
     * 默认物料类型检测器
     */
    static defaultMaterialTypeDetector(fileName) {
        const name = fileName.toLowerCase();
        if (name.includes("电控")) return "ELECTRICAL";
        if (name.includes("机械")) return "MECHANICAL";
        if (name.includes("装车") || name.includes("发货"))
            return "SHIPPING_INFO";
        return "GENERAL";
    }

    /**
     * 清理文本值
     */
    static cleanValue(value) {
        if (value === null || value === undefined) return "";
        return value.toString().trim();
    }

    /**
     * 解析数字
     */
    static parseNumber(value) {
        if (value === null || value === undefined || value === "") return null;

        const num = parseFloat(value);
        return isNaN(num) ? null : num;
    }

    /**
     * 检查空行
     */
    static isEmptyRow(row) {
        return !row.some(
            (cell) => cell !== null && cell !== undefined && cell !== ""
        );
    }

    /**
     * 创建Excel模板
     */
    static createTemplate() {
        const templateData = [
            [
                "序号",
                "物料名称",
                "规格型号",
                "数量",
                "单位",
                "材质",
                "制造商",
                "备注",
                "备注2",
            ],
            [
                1,
                "示例风机设备",
                "ABC-123型",
                2,
                "台",
                "不锈钢",
                "海棠机械",
                "新采购",
                "",
            ],
            [
                2,
                "示例控制柜",
                "XYZ-456型",
                1,
                "套",
                "",
                "海棠电控",
                "库存",
                "测试设备",
            ],
            [
                3,
                "示例管道",
                "DN100",
                10,
                "米",
                "碳钢",
                "海棠管业",
                "",
                "标准件",
            ],
        ];

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(templateData);

        // 设置列宽
        ws["!cols"] = [
            { wch: 8 }, // 序号
            { wch: 20 }, // 物料名称
            { wch: 15 }, // 规格型号
            { wch: 8 }, // 数量
            { wch: 8 }, // 单位
            { wch: 10 }, // 材质
            { wch: 12 }, // 制造商
            { wch: 15 }, // 备注
            { wch: 15 }, // 备注2
        ];

        XLSX.utils.book_append_sheet(wb, ws, "物料清单模板");
        return wb;
    }
}

/**
 * 数据验证器
 */
export class MaterialDataValidator {
    /**
     * 验证物料数据
     */
    static validateMaterials(materials) {
        return materials.map((material) => {
            const validatedMaterial = { ...material };
            this.validateMaterial(validatedMaterial);
            return validatedMaterial;
        });
    }

    /**
     * 验证单个物料
     */
    static validateMaterial(material) {
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

        if (material.quantity > 10000) {
            material.warnings.quantity = "数量较大，请确认是否正确";
            material.hasWarnings = true;
        }

        // 单位验证
        if (!material.unit) {
            material.warnings.unit = "建议填写计量单位";
            material.hasWarnings = true;
        }

        // 规格验证
        if (!material.specification) {
            material.warnings.specification = "建议填写规格型号";
            material.hasWarnings = true;
        }

        // 物料名称长度验证
        if (material.materialName && material.materialName.length > 200) {
            material.errors.materialName = "物料名称长度不能超过200个字符";
            material.hasErrors = true;
        }
    }

    /**
     * 检查重复物料
     */
    static checkDuplicates(materials) {
        const seen = new Map();

        materials.forEach((material, index) => {
            const key = `${material.materialName}_${
                material.specification || ""
            }`;

            if (seen.has(key)) {
                const firstIndex = seen.get(key);

                // 标记重复
                if (!material.warnings.duplicate) {
                    material.warnings.duplicate = `与第${firstIndex + 1}行重复`;
                    material.hasWarnings = true;
                }

                if (!materials[firstIndex].warnings.duplicate) {
                    materials[firstIndex].warnings.duplicate = `与第${
                        index + 1
                    }行重复`;
                    materials[firstIndex].hasWarnings = true;
                }
            } else {
                seen.set(key, index);
            }
        });
    }
}
```

### 3. 创建 API 接口文件

在 `src/api/material/` 目录下创建 `frontendImport.js`：

```javascript
import request from "@/utils/request";

// 导入前端解析的物料清单数据
export function importParsedMaterialData(data) {
    return request({
        url: "/erp/material/frontend-import/data",
        method: "post",
        data: data,
    });
}

// 验证前端解析的物料数据
export function validateParsedMaterialData(data) {
    return request({
        url: "/erp/material/frontend-import/validate",
        method: "post",
        data: data,
    });
}

// 匹配现有产品
export function matchExistingProduct(materialName, specification) {
    return request({
        url: "/erp/material/frontend-import/match-product",
        method: "get",
        params: {
            materialName,
            specification,
        },
    });
}

// 批量匹配产品
export function batchMatchProducts(matchRequests) {
    return request({
        url: "/erp/material/frontend-import/batch-match-products",
        method: "post",
        data: matchRequests,
    });
}

// 获取产品分类列表
export function getProductCategories() {
    return request({
        url: "/erp/material/frontend-import/product-categories",
        method: "get",
    });
}

// 获取常用单位列表
export function getCommonUnits() {
    return request({
        url: "/erp/material/frontend-import/common-units",
        method: "get",
    });
}
```

### 4. 集成到若依菜单系统

#### 4.1 添加菜单配置

在若依后台管理系统中添加菜单：

```sql
-- 添加物料导入菜单
INSERT INTO sys_menu (menu_name, parent_id, order_num, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time, update_by, update_time, remark)
VALUES ('物料清单导入', 2000, 1, 'material-import', 'material/import/index', 1, 0, 'C', '0', '0', 'erp:material:import', 'upload', 'admin', sysdate(), '', null, '物料清单导入功能');

-- 添加相关权限
INSERT INTO sys_menu (menu_name, parent_id, order_num, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time, update_by, update_time, remark)
VALUES ('物料导入', (SELECT menu_id FROM sys_menu WHERE menu_name = '物料清单导入'), 1, '', '', 1, 0, 'F', '0', '0', 'erp:material:import', '#', 'admin', sysdate(), '', null, '');

INSERT INTO sys_menu (menu_name, parent_id, order_num, path, component, is_frame, is_cache, menu_type, visible, status, perms, icon, create_by, create_time, update_by, update_time, remark)
VALUES ('物料查询', (SELECT menu_id FROM sys_menu WHERE menu_name = '物料清单导入'), 2, '', '', 1, 0, 'F', '0', '0', 'erp:material:query', '#', 'admin', sysdate(), '', null, '');
```

#### 4.2 创建路由配置

在 `src/router/index.js` 中添加路由：

```javascript
{
  path: '/material',
  component: Layout,
  redirect: '/material/import',
  name: 'Material',
  meta: { title: '物料管理', icon: 'box' },
  children: [
    {
      path: 'import',
      name: 'MaterialImport',
      component: () => import('@/views/material/import/index'),
      meta: { title: '物料清单导入', icon: 'upload' }
    }
  ]
}
```

### 5. 创建页面文件

在 `src/views/material/import/` 目录下创建 `index.vue`：

```vue
<template>
    <div class="app-container">
        <!-- 页面标题 -->
        <el-row class="mb-3">
            <el-col :span="24">
                <el-card>
                    <template #header>
                        <div class="card-header">
                            <span class="title">物料清单导入</span>
                            <el-button type="primary" @click="downloadTemplate">
                                <el-icon><Download /></el-icon>
                                下载模板
                            </el-button>
                        </div>
                    </template>
                    <p class="description">
                        支持Excel文件(.xlsx,
                        .xls)格式，文件将在浏览器中解析，提供实时预览和编辑功能。
                    </p>
                </el-card>
            </el-col>
        </el-row>

        <!-- 项目信息表单 -->
        <el-row class="mb-3">
            <el-col :span="24">
                <el-card>
                    <template #header>
                        <span>项目信息</span>
                    </template>
                    <el-form
                        :model="projectForm"
                        :rules="projectRules"
                        ref="projectFormRef"
                        label-width="120px"
                    >
                        <el-row :gutter="20">
                            <el-col :span="8">
                                <el-form-item label="项目" prop="projectId">
                                    <el-select
                                        v-model="projectForm.projectId"
                                        placeholder="请选择项目"
                                        style="width: 100%"
                                        filterable
                                        @change="handleProjectChange"
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
                            <el-col :span="8">
                                <el-form-item label="批次号" prop="batchNumber">
                                    <el-input
                                        v-model="projectForm.batchNumber"
                                        placeholder="请输入批次号"
                                    />
                                </el-form-item>
                            </el-col>
                            <el-col :span="8">
                                <el-form-item
                                    label="负责人"
                                    prop="responsiblePerson"
                                >
                                    <el-input
                                        v-model="projectForm.responsiblePerson"
                                        placeholder="请输入负责人"
                                    />
                                </el-form-item>
                            </el-col>
                        </el-row>
                    </el-form>
                </el-card>
            </el-col>
        </el-row>

        <!-- Excel导入组件 -->
        <MaterialImportUpload
            v-if="projectForm.projectId"
            :project-id="projectForm.projectId"
            :project-name="selectedProjectName"
            :batch-number="projectForm.batchNumber"
            :responsible-person="projectForm.responsiblePerson"
            @success="handleImportSuccess"
        />

        <!-- 提示信息 -->
        <el-row v-else>
            <el-col :span="24">
                <el-card>
                    <el-empty description="请先选择项目信息">
                        <el-button type="primary" @click="focusProjectSelect"
                            >选择项目</el-button
                        >
                    </el-empty>
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>

<script setup name="MaterialImport">
import { ref, computed, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { Download } from "@element-plus/icons-vue";
import MaterialImportUpload from "@/components/MaterialImportUpload.vue";
import { listProject } from "@/api/project";
import { ExcelParser } from "@/utils/excelParser";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

// 响应式数据
const projectFormRef = ref();
const projectList = ref([]);

const projectForm = ref({
    projectId: "",
    batchNumber: "",
    responsiblePerson: "",
});

const projectRules = {
    projectId: [{ required: true, message: "请选择项目", trigger: "change" }],
};

// 计算属性
const selectedProjectName = computed(() => {
    const project = projectList.value.find(
        (p) => p.id === projectForm.value.projectId
    );
    return project ? project.projectName : "";
});

// 获取项目列表
const getProjectList = async () => {
    try {
        const response = await listProject();
        projectList.value = response.rows || [];
    } catch (error) {
        ElMessage.error("获取项目列表失败");
    }
};

// 项目选择变化
const handleProjectChange = (projectId) => {
    const project = projectList.value.find((p) => p.id === projectId);
    if (project) {
        // 自动填充负责人（如果项目有经理信息）
        if (project.managerName && !projectForm.value.responsiblePerson) {
            projectForm.value.responsiblePerson = project.managerName;
        }
    }
};

// 聚焦项目选择
const focusProjectSelect = () => {
    // 这里可以添加聚焦逻辑
    ElMessage.info("请在上方选择项目信息");
};

// 下载模板
const downloadTemplate = () => {
    try {
        const wb = ExcelParser.createTemplate();
        const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const blob = new Blob([wbout], { type: "application/octet-stream" });
        saveAs(blob, "物料清单导入模板.xlsx");

        ElMessage.success("模板下载成功");
    } catch (error) {
        ElMessage.error("模板下载失败: " + error.message);
    }
};

// 导入成功回调
const handleImportSuccess = (result) => {
    ElMessage.success("物料清单导入成功!");

    // 可以跳转到发货清单详情页或刷新列表
    if (result.shippingListId) {
        ElMessage.info(`发货清单已创建，编号: ${result.listCode}`);
        // this.$router.push(`/shipping/list/${result.shippingListId}`)
    }
};

// 生命周期
onMounted(() => {
    getProjectList();
});
</script>

<style scoped>
.app-container {
    padding: 20px;
}

.mb-3 {
    margin-bottom: 20px;
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.title {
    font-size: 18px;
    font-weight: bold;
}

.description {
    color: #666;
    margin: 0;
    line-height: 1.5;
}
</style>
```

## 部署和配置

### 1. Nginx 配置（如果需要）

```nginx
# 增加文件上传大小限制
client_max_body_size 50M;

# 静态资源缓存
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 2. 若依框架配置

在 `vue.config.js` 中确保正确的代理配置：

```javascript
module.exports = {
    devServer: {
        proxy: {
            "/erp": {
                target: "http://localhost:8080",
                changeOrigin: true,
                pathRewrite: {
                    "^/erp": "/erp",
                },
            },
        },
    },
};
```

## 使用说明

### 1. 基本使用流程

1. **选择项目**: 在项目信息表单中选择目标项目
2. **填写信息**: 输入批次号和负责人信息
3. **上传文件**: 拖拽或点击上传 Excel 文件
4. **实时预览**: 查看解析后的数据，支持在线编辑
5. **数据验证**: 系统自动验证数据完整性
6. **确认导入**: 点击导入按钮完成数据入库

### 2. 支持的 Excel 格式

- **文件格式**: .xlsx, .xls
- **文件大小**: 最大 50MB
- **工作表**: 支持多工作表解析
- **表头**: 自动识别表头行
- **数据类型**: 自动转换数据类型

### 3. 错误处理

- **文件格式错误**: 提示用户选择正确格式
- **解析失败**: 显示具体错误信息
- **数据验证**: 实时显示验证结果
- **网络错误**: 友好的错误提示

## 优势总结

### 🚀 **性能优势**

- 客户端解析，服务器压力小
- 大文件本地处理，响应速度快
- 只传输 JSON 数据，网络效率高

### 💡 **用户体验**

- 实时数据预览和编辑
- 即时错误提示和修正
- 进度显示和状态反馈
- 支持数据模板下载

### 🔧 **技术优势**

- 前后端职责分离
- 易于维护和扩展
- 集成到若依权限体系
- 支持多种数据验证规则

### 📱 **扩展性**

- 易于添加新文件格式
- 可自定义解析规则
- 支持多种物料类型
- 便于集成其他业务模块

这种前端 Excel 解析方案充分利用了现代浏览器的能力，在若依框架下提供了优秀的用户体验和技术架构。
