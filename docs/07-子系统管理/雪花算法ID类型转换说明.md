# 雪花算法 ID 类型转换说明

## 📋 问题背景

后端使用雪花算法（Snowflake）生成唯一 ID，生成的 ID 是 64 位长整数。在 JavaScript 中，`Number`类型只能安全表示最大为 `2^53-1` 的整数（即`Number.MAX_SAFE_INTEGER`）。超过这个范围的长整数会丢失精度，导致前后端 ID 不匹配的问题。

### 示例问题

```javascript
// 雪花算法生成的ID
const id = 1234567890123456789;

// JavaScript会丢失精度
console.log(id); // 输出: 1234567890123456800 (最后两位变了)

// 正确做法：使用字符串
const id = "1234567890123456789";
console.log(id); // 输出: "1234567890123456789" (精确)
```

## 🛠️ 解决方案

### 关键步骤

1. **请求拦截器**: 发送前自动将 ID 转为字符串，避免序列化精度丢失
2. **响应拦截器**: 接收后自动将大数字 ID 转为字符串
3. **类型定义**: 支持 `string | number` 两种类型
4. **组件修复**: 移除错误的 `Number()` 转换

### 1. 类型定义修改

将所有 ID 相关字段的类型从 `number` 改为 `string | number`，支持两种类型：

```typescript
// 修改前
export interface SubsystemTemplateVO {
  id: number;
  templateId: number;
  // ...
}

// 修改后
export interface SubsystemTemplateVO {
  id: string | number;
  templateId: string | number;
  // ...
}
```

#### 涉及的类型文件

- `/src/api/erp/subsystem/types.ts` - 所有子系统相关类型定义

#### 修改的类型接口

1. **子系统相关**

   - `SubsystemVO`
   - `SubsystemForm`
   - `SubsystemItemVO`
   - `SubsystemItemForm`
   - `SubsystemMaterialVO`
   - `SubsystemMaterialForm`
   - `SubsystemAttachmentVO`

2. **模板相关**

   - `SubsystemTemplateVO`
   - `SubsystemTemplateForm`
   - `SubsystemItemTemplateVO`
   - `SubsystemItemTemplateForm`
   - `SubsystemMaterialTemplateVO`
   - `SubsystemMaterialTemplateForm`

3. **查询参数**
   - `SubsystemItemQuery`
   - `SubsystemMaterialQuery`
   - `SubsystemMaterialTemplateQuery`

### 2. ID 转换工具

创建自动转换工具 `/src/utils/id-converter.ts`，自动将后端返回的长整数 ID 转换为字符串。

#### 核心功能

```typescript
/**
 * 递归转换对象中的ID字段
 * 1. 识别所有ID相关字段
 * 2. 将大于100000的数字或超出安全范围的数字转为字符串
 * 3. 递归处理嵌套对象和数组
 */
export function convertIdsToString(obj: any): any;

/**
 * 转换API响应数据中的ID字段
 * 专门处理标准API响应格式：{ code, msg, data, rows, total }
 */
export function convertResponseIds(response: any): any;
```

#### 自动识别的 ID 字段

- 明确的 ID 字段：`id`, `userId`, `projectId`, `subsystemId`, `itemId`, `materialId`, `templateId`, 等
- 以 `Id` 结尾的字段：如 `parentItemId`, `responsiblePersonId`

#### 转换规则

- **字符串**: 直接返回
- **数字 > 100000**: 转换为字符串
- **超出安全整数范围的数字**: 转换为字符串
- **其他数字**: 保持不变（如 status、count 等）

### 3. 请求拦截器集成 ⭐ 关键

在 `/src/utils/request.ts` 的**请求拦截器**中自动转换 ID：

```typescript
// 请求拦截器
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // ... 其他处理 ...

    // ⭐ 转换请求数据中的ID字段为字符串（处理雪花算法生成的长整数ID）
    // 在序列化之前转换，避免精度丢失
    if (config.data && !(config.data instanceof FormData)) {
      config.data = convertRequestIds(config.data);
    }
    if (config.params) {
      config.params = convertRequestIds(config.params);
    }

    // ... 其他处理 ...
    return config;
  }
);
```

**转换时机**：在数据序列化为 JSON 之前转换，这是最关键的一步！

### 4. 响应拦截器集成

在 `/src/utils/request.ts` 的响应拦截器中自动调用 ID 转换：

```typescript
// 响应拦截器
service.interceptors.response.use(
  (res: AxiosResponse) => {
    // ... 解密等操作 ...

    // 转换ID字段为字符串（处理雪花算法生成的长整数ID）
    res.data = convertResponseIds(res.data);

    // ... 其他处理 ...
    return Promise.resolve(res.data);
  }
);
```

**转换时机**：在数据解密之后、返回给业务代码之前进行转换。

### 5. API 接口参数类型更新

更新所有接受 ID 参数的 API 接口函数：

```typescript
// 修改前
export const getSubsystemTemplate = (id: number): AxiosPromise<SubsystemTemplateDetailVO>;

// 修改后
export const getSubsystemTemplate = (id: string | number): AxiosPromise<SubsystemTemplateDetailVO>;
```

#### 涉及的 API 文件

- `/src/api/erp/subsystem/template.ts`
- `/src/api/erp/subsystem/item-template.ts`
- `/src/api/erp/subsystem/material-template.ts`

### 6. 组件代码修复 ⚠️ 重要

移除组件中错误的 `Number()` 转换：

```typescript
// ❌ 错误：强制转换为Number会导致精度丢失
templateId: Number(props.templateId)

// ✅ 正确：直接使用，不要转换
templateId: props.templateId
```

**修复的文件**：

- `ItemTemplateManagement.vue` - 3 处
- `SubsystemForm.vue` - 1 处
- `SubsystemDetail.vue` - 1 处
- `SubItemForm.vue` - 2 处
- `MaterialForm.vue` - 4 处

## ✅ 修改后的优势

### 1. 精度保证

- ID 作为字符串传输，不会丢失精度
- 支持任意长度的 ID

### 2. 兼容性

- 类型定义为 `string | number`，兼容新旧两种格式
- 前端组件无需大规模修改

### 3. 自动化

- 响应拦截器自动转换，业务代码无感知
- 统一处理，避免遗漏

### 4. 类型安全

- TypeScript 类型检查确保类型正确
- 编译时发现潜在问题

## 🧪 测试验证

### 1. 类型检查

```bash
# 运行TypeScript类型检查
npm run type-check

# 运行linter
npm run lint
```

### 2. 功能测试

测试以下场景：

1. ✅ 列表查询 - 验证 ID 正确显示
2. ✅ 详情查询 - 使用 ID 获取详情
3. ✅ 新增操作 - 新增后返回的 ID 格式
4. ✅ 编辑操作 - 使用 ID 进行更新
5. ✅ 删除操作 - 使用 ID 进行删除
6. ✅ 关联查询 - 使用 ID 查询关联数据

### 3. 控制台验证

打开浏览器控制台，检查网络请求：

```javascript
// 检查响应数据中的ID类型
console.log(typeof response.data.id); // 应该是 "string"
```

## 📝 使用注意事项

### 1. 比较操作

```typescript
// ❌ 错误：不要使用严格相等
if (item.id === 123) { }

// ✅ 正确：使用宽松相等或转换后比较
if (item.id == 123) { }
if (String(item.id) === String(123)) { }
```

### 2. 作为对象键

```typescript
// ✅ ID作为字符串键
const map = {
  [item.id]: item  // ID会自动转为字符串键
};
```

### 3. 传参注意

```typescript
// ✅ 两种方式都支持
await getSubsystemTemplate('1234567890123456789');
await getSubsystemTemplate(1234567890123456789);
```

### 4. 添加自定义 ID 字段

如果有新的 ID 字段需要转换：

```typescript
import { addIdFields } from '@/utils/id-converter';

// 添加自定义ID字段
addIdFields(['customId', 'otherId']);
```

## 🔧 故障排查

### 问题 1: ID 显示为科学计数法

**原因**: ID 被当作数字处理  
**解决**: 检查 ID 转换工具是否正常工作

### 问题 2: ID 不匹配（请求失败）⚠️ 最常见

**原因**: 组件中使用了 `Number()` 强制转换，导致发送给后端的 ID 精度丢失  
**解决**:

1. 检查组件中是否有 `Number(props.xxxId)` 这样的代码
2. 移除 `Number()` 转换，直接使用原值
3. 检查请求拦截器是否正常工作

### 问题 3: TypeScript 类型错误

**原因**: 某些地方仍然使用 `number` 类型  
**解决**: 将类型改为 `string | number`

### 问题 4: 接收到的数据 ID 仍然是数字

**原因**: 响应拦截器未正常工作  
**解决**: 检查 `/src/utils/request.ts` 中的响应拦截器配置

## 📚 相关资源

- [JavaScript Number.MAX_SAFE_INTEGER](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Number/MAX_SAFE_INTEGER)
- [雪花算法（Snowflake）](https://en.wikipedia.org/wiki/Snowflake_ID)
- [JSON 大数字处理](https://datatracker.ietf.org/doc/html/rfc7159#section-6)

## 🔄 版本历史

| 版本 | 日期       | 说明                                           |
| ---- | ---------- | ---------------------------------------------- |
| v1.1 | 2025-01-06 | 修复请求拦截器，完整支持双向 ID 转换           |
| v1.0 | 2025-01-06 | 初始版本，完成基础 ID 类型转换（仅响应拦截器） |

---

**作者**: 海棠开发团队  
**更新日期**: 2025-01-06  
**适用版本**: v1.1.0+
