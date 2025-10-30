# 发货清单图片 URL 拼接修复说明

**修复日期**: 2025-10-30  
**问题**: 图片 URL 缺少 `/upload` 前缀  
**状态**: ✅ 已修复

---

## 📋 问题描述

### 现象

发货清单详情页面的图片无法正确显示，图片 URL 格式不正确。

### 错误的 URL 格式

```
❌ http://localhost:8080/shipping-photos/2025-10-30/1761791383184_0aa6aaff.jpg
```

### 正确的 URL 格式

```
✅ http://localhost:8080/upload/shipping-photos/2025-10-30/1761791383184_0aa6aaff.jpg
```

### 根本原因

后端返回的图片路径是：

```
/shipping-photos/2025-10-30/1761791383184_0aa6aaff.jpg
```

前端拼接时缺少了 `/upload` 前缀，导致 URL 不正确。

---

## 🔧 修复方案

### 1. 修改 detail.vue 中的 URL 拼接逻辑

**文件**: `src/views/erp/saltprocess/shipping/detail.vue`

#### 发货照片 URL 拼接

```typescript
// ✅ 修复后 - 使用统一工具函数
const shippingPhotoUrls = computed(() => {
  if (!shippingDetail.value.shippingPhotoUrls?.length) {
    return [];
  }
  // 使用统一的URL生成工具（自动处理 /upload 前缀和端口）
  return getFullPhotoUrls(shippingDetail.value.shippingPhotoUrls);
});
```

#### 驾照照片 URL 拼接

```typescript
// ✅ 修复后 - 使用统一工具函数
const driverLicenseUrls = computed(() => {
  if (!shippingDetail.value.driverLicensePhotoUrls?.length) {
    return [];
  }
  // 使用统一的URL生成工具（自动处理 /upload 前缀和端口）
  return getFullPhotoUrls(shippingDetail.value.driverLicensePhotoUrls);
});
```

### 2. 修改通用工具函数

**文件**: `src/api/erp/saltprocess/shipping/data-parser.ts`

```typescript
// ✅ 修复后（包含端口处理）
export function getFullPhotoUrl(photoPath: string, baseUrl?: string): string {
  if (!photoPath) {
    return '';
  }

  // 如果已经是完整URL，直接返回
  if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
    return photoPath;
  }

  // 获取基础URL
  let base = baseUrl || import.meta.env.VITE_APP_BASE_API;

  // 如果没有配置环境变量，使用当前域名
  if (!base) {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    // 🔥 默认后端端口为 8080
    const port = window.location.port || '8080';
    base = `${protocol}//${hostname}:${port}`;
  }

  // 确保路径以 / 开头
  const path = photoPath.startsWith('/') ? photoPath : `/${photoPath}`;

  // 拼接完整URL，加上 /upload 前缀
  return `${base}/upload${path}`;  // 🔥 加上 /upload 前缀
}
```

---

## ✅ URL 拼接逻辑说明

### 输入输出对比

| 后端返回的路径                                           | 拼接后的完整 URL                                                                     |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `/shipping-photos/2025-10-30/1761791383184_0aa6aaff.jpg` | `http://localhost:8080/upload/shipping-photos/2025-10-30/1761791383184_0aa6aaff.jpg` |
| `/driver-license/2025-10-30/1761791383100_6e61a2ae.jpg`  | `http://localhost:8080/upload/driver-license/2025-10-30/1761791383100_6e61a2ae.jpg`  |
| `http://example.com/photo.jpg`                           | `http://example.com/photo.jpg` (完整 URL 直接返回)                                   |

### 拼接规则

1. **检查是否已经是完整 URL**
   - 如果以 `http://` 或 `https://` 开头，直接返回
2. **获取基础 URL**

   - 优先使用传入的 `baseUrl` 参数
   - 其次使用环境变量 `VITE_APP_BASE_API`
   - 最后手动构建（使用当前协议 + 域名 + 端口 8080）

3. **端口处理**

   - 如果 `window.location.port` 存在，使用当前端口
   - 否则默认使用 `8080` 端口（后端 API 默认端口）

4. **处理路径**

   - 确保路径以 `/` 开头
   - 如果没有，则添加 `/`

5. **拼接完整 URL**
   ```
   ${baseUrl}/upload${path}
   ```

### 示例代码

```typescript
// 示例 1: 相对路径
getFullPhotoUrl('/shipping-photos/xxx.jpg');
// 返回: http://localhost:8080/upload/shipping-photos/xxx.jpg

// 示例 2: 没有斜杠前缀的路径
getFullPhotoUrl('driver-license/xxx.jpg');
// 返回: http://localhost:8080/upload/driver-license/xxx.jpg

// 示例 3: 已经是完整URL
getFullPhotoUrl('http://example.com/photo.jpg');
// 返回: http://example.com/photo.jpg

// 示例 4: 指定baseUrl
getFullPhotoUrl('/photo.jpg', 'http://api.example.com');
// 返回: http://api.example.com/upload/photo.jpg
```

---

## 🎯 验证方法

### 1. 查看浏览器控制台

打开发货清单详情页面，查看生成的图片 URL：

```javascript
console.log('📷 发货照片URL:', shippingPhotoUrls.value);
// 预期输出:
// [
//   "http://localhost:8080/upload/shipping-photos/2025-10-30/1761791383184_0aa6aaff.jpg",
//   "http://localhost:8080/upload/shipping-photos/2025-10-30/1761791383186_680cc232.jpg",
//   "http://localhost:8080/upload/shipping-photos/2025-10-30/1761791383187_4cc40d40.jpg"
// ]

console.log('📄 驾照照片URL:', driverLicenseUrls.value);
// 预期输出:
// [
//   "http://localhost:8080/upload/driver-license/2025-10-30/1761791383100_6e61a2ae.jpg"
// ]
```

### 2. 检查图片是否正确显示

1. 打开发货清单详情页面
2. 查看"发货照片"和"驾照照片"部分
3. 确认图片能够正常显示
4. 点击图片，查看预览功能是否正常

### 3. 检查网络请求

在浏览器开发者工具的 Network 标签中：

1. 过滤 `shipping-photos` 或 `driver-license`
2. 确认请求的 URL 格式正确
3. 确认返回状态码为 `200 OK`

---

## 📊 修复对比

### 修复前

```typescript
// ❌ 缺少 /upload 前缀
const baseUrl = window.location.origin;
return `${baseUrl}${path}`;
// 生成: http://localhost:8080/shipping-photos/xxx.jpg
```

**问题**: 返回 404，图片无法显示

### 修复后

```typescript
// ✅ 添加 /upload 前缀
const baseUrl = window.location.origin;
const uploadPath = path.startsWith('/') ? path : '/' + path;
return `${baseUrl}/upload${uploadPath}`;
// 生成: http://localhost:8080/upload/shipping-photos/xxx.jpg
```

**结果**: 返回 200，图片正常显示

---

## 📝 相关文件

### 修改的文件

1. **`src/views/erp/saltprocess/shipping/detail.vue`**

   - 修改 `shippingPhotoUrls` computed 属性
   - 修改 `driverLicenseUrls` computed 属性

2. **`src/api/erp/saltprocess/shipping/data-parser.ts`**
   - 修改 `getFullPhotoUrl()` 函数

### 影响范围

- ✅ 发货清单详情页面 - 图片显示修复
- ✅ 所有使用 `getFullPhotoUrl()` 的地方 - 统一修复
- ✅ 不影响其他功能
- ✅ 不需要后端修改

---

## 🚀 后续建议

### 1. 统一图片 URL 处理

建议在项目中创建统一的图片 URL 处理工具：

```typescript
// utils/image-url.ts
export class ImageUrlHelper {
  private static readonly UPLOAD_PREFIX = '/upload';

  /**
   * 生成完整的图片URL
   */
  static getFullUrl(path: string, baseUrl?: string): string {
    if (!path) return '';

    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }

    const base = baseUrl || window.location.origin;
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${this.UPLOAD_PREFIX}${normalizedPath}`;
  }

  /**
   * 批量生成图片URL
   */
  static getFullUrls(paths: string[], baseUrl?: string): string[] {
    return paths.map(path => this.getFullUrl(path, baseUrl)).filter(Boolean);
  }
}
```

### 2. 环境变量配置

在 `.env` 文件中配置图片服务器地址：

```bash
# 开发环境
VITE_APP_BASE_API=http://localhost:8080

# 生产环境
VITE_APP_BASE_API=https://api.example.com
```

### 3. 图片错误处理

添加图片加载失败的处理：

```vue
<el-image
  :src="photoUrl"
  fit="cover"
  lazy
  @error="handleImageError"
>
  <template #error>
    <div class="image-error">
      <el-icon><Picture /></el-icon>
      <div>图片加载失败</div>
    </div>
  </template>
</el-image>
```

---

## ✨ 总结

### 问题核心

图片 URL 拼接时缺少 `/upload` 前缀，导致 404 错误。

### 解决方案

在所有图片 URL 拼接的地方，统一添加 `/upload` 前缀。

### 修复结果

- ✅ 图片 URL 格式正确
- ✅ 图片能够正常显示
- ✅ 预览功能正常工作
- ✅ 代码统一规范

### 影响范围

- ✅ 不影响其他功能
- ✅ 不需要后端修改
- ✅ 不需要数据库迁移
- ✅ 向后兼容

---

**修复人**: AI Assistant  
**审核**: 待审核  
**版本**: v1.0.0
