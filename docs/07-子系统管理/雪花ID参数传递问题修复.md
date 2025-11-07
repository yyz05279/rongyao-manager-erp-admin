# 雪花 ID 参数传递问题修复

## 问题描述

在查询子系统中子项的物料数据时，发现 `templateId` 参数没有正确传递到后端，导致查询时缺少 `template_id` 条件，无法实现数据隔离。

### 问题日志

```log
参数类型[param],参数:[{"templateId":["1985928480973324290"]}]
Execute SQL：SELECT ... WHERE (item_template_id = xxx) AND tenant_id = '000000' ORDER BY create_time DESC
```

可以看到：

1. `templateId` 参数被解析为**数组**：`["1985928480973324290"]`
2. SQL 查询中**没有** `template_id` 条件

## 根本原因

### 1. 雪花 ID 精度问题

雪花 ID（Snowflake ID）是 64 位长整型：

-   **Java Long**：64 位有符号整数，范围 `-2^63 ~ 2^63-1`
-   **JavaScript Number**：双精度浮点数，只能安全表示 53 位整数（`Number.MAX_SAFE_INTEGER = 2^53 - 1 = 9007199254740991`）

**示例问题**：

```javascript
// JavaScript 中的精度丢失
const id = 1985928480973324290; // 雪花ID
console.log(id); // 1985928480973324300 ❌ 精度丢失！

// 正确做法：使用字符串
const idStr = "1985928480973324290";
console.log(idStr); // "1985928480973324290" ✅ 精度保持
```

### 2. 参数传递格式问题

从日志来看，前端传递的参数格式是：

```json
{ "templateId": ["1985928480973324290"] }
```

而后端 Controller 定义是：

```java
@RequestParam(required = false) Long templateId
```

**分析**：

-   后端期望接收单个 `Long` 值
-   前端传递的是**字符串数组**
-   Spring Boot 无法将数组转换为单个 Long 值，导致 `templateId` 为 `null`

## 解决方案

### 方案一：修改前端传参方式（推荐）

**问题代码（猜测）**：

```typescript
// 可能的错误写法1：使用 params 对象
const params = {
    templateId: [templateId], // ❌ 传递了数组
};

// 可能的错误写法2：URLSearchParams 重复添加
const params = new URLSearchParams();
params.append("templateId", templateId);
// 如果多次调用 append，会形成数组
```

**正确写法**：

```typescript
// ✅ 方式1：直接传递字符串（推荐）
export const listMaterialsByItem = (
    itemTemplateId: string,
    templateId?: string
): AxiosPromise<MaterialVO[]> => {
    return request({
        url: `/erp/subsystem/material-template/list-by-item/${itemTemplateId}`,
        method: "get",
        params: {
            templateId: templateId, // 直接传递字符串，不要用数组
        },
    });
};

// ✅ 方式2：使用 URLSearchParams
export const listMaterialsByItem = (
    itemTemplateId: string,
    templateId?: string
): AxiosPromise<MaterialVO[]> => {
    const params = new URLSearchParams();
    if (templateId) {
        params.set("templateId", templateId); // 使用 set，不要用 append
    }

    return request({
        url: `/erp/subsystem/material-template/list-by-item/${itemTemplateId}`,
        method: "get",
        params: params,
    });
};

// ✅ 方式3：构造完整 URL
export const listMaterialsByItem = (
    itemTemplateId: string,
    templateId?: string
): AxiosPromise<MaterialVO[]> => {
    let url = `/erp/subsystem/material-template/list-by-item/${itemTemplateId}`;
    if (templateId) {
        url += `?templateId=${templateId}`;
    }

    return request({
        url: url,
        method: "get",
    });
};
```

### 方案二：修改后端参数接收方式（备选）

如果前端无法修改，可以修改后端来兼容数组格式：

```java
@Operation(summary = "根据子项模板ID查询物料列表")
@SaCheckPermission("erp:subsystem:template:query")
@GetMapping("/list-by-item/{itemTemplateId}")
public R<List<ErpSubsystemMaterialTemplateVo>> listByItemTemplateId(
        @NotNull(message = "子项模板ID不能为空") @PathVariable Long itemTemplateId,
        @RequestParam(required = false) String templateId) {  // 改为 String 类型

    // 转换 String → Long
    Long templateIdLong = null;
    if (templateId != null && !templateId.trim().isEmpty()) {
        try {
            templateIdLong = Long.parseLong(templateId);
        } catch (NumberFormatException e) {
            log.warn("templateId 格式错误: {}", templateId);
        }
    }

    return R.ok(materialTemplateService.queryListByItemTemplateId(itemTemplateId, templateIdLong));
}
```

或者接收数组并取第一个值：

```java
@GetMapping("/list-by-item/{itemTemplateId}")
public R<List<ErpSubsystemMaterialTemplateVo>> listByItemTemplateId(
        @NotNull(message = "子项模板ID不能为空") @PathVariable Long itemTemplateId,
        @RequestParam(required = false) String[] templateId) {  // 接收数组

    // 如果数组不为空，取第一个值
    Long templateIdLong = null;
    if (templateId != null && templateId.length > 0) {
        try {
            templateIdLong = Long.parseLong(templateId[0]);
        } catch (NumberFormatException e) {
            log.warn("templateId 格式错误: {}", templateId[0]);
        }
    }

    return R.ok(materialTemplateService.queryListByItemTemplateId(itemTemplateId, templateIdLong));
}
```

## 推荐做法

**优先级排序**：

1. **✅ 修改前端传参方式**：

    - 确保 `templateId` 作为**单个字符串**传递，而不是数组
    - 使用 `params.set()` 而不是 `params.append()`
    - 检查是否有中间件或拦截器错误地将参数转换为数组

2. **✅ 后端保持现有类型（Long）**：

    - Spring Boot 会自动将字符串转换为 Long
    - 无需额外处理

3. **⚠️ 如果前端确实无法修改**：
    - 使用方案二的后端兼容方案
    - 但这只是权宜之计，建议还是修复前端

## 验证步骤

### 1. 查看前端代码

检查调用该接口的前端代码，确认参数传递方式：

```typescript
// 在 Vue 组件或 API 文件中查找
listMaterialsByItem(itemTemplateId, templateId);
```

### 2. 添加调试日志

在 Service 层已添加详细日志：

```java
log.info("【物料查询】itemTemplateId={}, templateId={}", itemTemplateId, templateId);
```

### 3. 测试验证

**步骤**：

1. 在前端操作：查询子系统中子项的物料列表
2. 查看后端日志：
    ```bash
    tail -50 /Users/yyz/Desktop/HaiTang-erp/logs/app.log | grep "物料查询"
    ```
3. 确认输出：
    ```log
    【物料查询】itemTemplateId=1986239297161666561, templateId=1985928480973324290
    【物料查询】查询子项[1986239297161666561]在子系统[1985928480973324290]中的物料配置（关联模式）
    【物料查询】查询到X条物料记录
    ```

### 4. 验证 SQL

查看 SQL 日志，确认包含 `template_id` 条件：

```sql
SELECT ...
FROM erp_subsystem_material_template
WHERE (item_template_id = xxx)
  AND (template_id = xxx)  -- ✅ 必须包含此条件
  AND tenant_id = '000000'
ORDER BY create_time DESC
```

## 相关文档

-   [子系统物料查询 API 使用指南](./子系统物料查询API使用指南.md)
-   [子项添加流程说明](./子项添加流程说明.md)

## 技术要点

### JavaScript 数字精度

```javascript
// ❌ 错误：Number 类型会丢失精度
const id: number = 1985928480973324290;

// ✅ 正确：String 类型保持精度
const id: string = "1985928480973324290";
```

### TypeScript 接口定义

```typescript
// VO 对象中所有 ID 字段都应该是 string
export interface MaterialVO {
    id?: string; // ✅
    templateId?: string; // ✅
    itemTemplateId?: string; // ✅
    materialId?: string; // ✅
}

// ❌ 错误定义
export interface MaterialVO {
    id?: number; // ❌ 会丢失精度
    templateId?: number; // ❌
}
```

### Spring Boot 自动转换

Spring Boot 可以自动处理以下转换：

```
String → Long        ✅ 自动转换
String → Integer     ✅ 自动转换
String[] → String    ❌ 无法自动转换（会取第一个元素或报错）
String[] → Long      ❌ 无法转换
```

## 注意事项

1. **所有雪花 ID 在前端都必须使用 String 类型**
2. **URL 参数中的 ID 自动转换为字符串，无需特殊处理**
3. **不要使用 `params.append()` 多次添加同一个参数**
4. **使用 `params.set()` 确保参数是单个值**

---

**修复时间**：2025-11-06
**修复人员**：开发团队
**影响范围**：子系统物料查询功能
