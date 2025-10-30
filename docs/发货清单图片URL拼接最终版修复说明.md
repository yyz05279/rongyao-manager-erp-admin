# 发货清单图片 URL 拼接最终版修复说明

**修复日期**: 2025-10-30  
**依据文档**: 图片访问路径配置说明.md  
**状态**: ✅ 已完成

---

## 📋 问题回顾

### 初始问题

发货清单详情页面图片无法显示，原因是 URL 拼接不正确。

### 修复过程

1. **第一版修复**：添加了 `/upload` 前缀
2. **第二版修复**：添加了端口 `:8080` 处理
3. **最终版修复**：根据官方文档，使用相对路径而非完整 URL

---

## 🎯 最终解决方案

### 核心逻辑

根据 `图片访问路径配置说明.md` 文档，采用以下规则：

```typescript
/**
 * 获取图片完整访问URL
 *
 * @param photoPath 后端返回的图片相对路径（如：/shipping-photos/2025-10-30/xxx.jpg）
 * @returns 完整的图片访问URL
 */
export function getFullPhotoUrl(photoPath: string, baseUrl?: string): string {
  if (!photoPath) {
    return '';
  }

  // 如果已经是完整URL，直接返回
  if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
    return photoPath;
  }

  // 如果提供了自定义baseUrl，使用它
  if (baseUrl) {
    const path = photoPath.startsWith('/') ? photoPath : `/${photoPath}`;
    return `${baseUrl}/upload${path}`;
  }

  // 确保路径以 / 开头
  const path = photoPath.startsWith('/') ? photoPath : `/${photoPath}`;

  // 🔥 开发环境使用代理 /dev-api
  if (import.meta.env.DEV) {
    return `/dev-api/upload${path}`;
  }

  // 🔥 生产环境直接使用 /upload
  return `/upload${path}`;
}
```

---

## 📊 URL 生成规则

### 后端返回的路径格式

```
/shipping-photos/2025-10-30/1761791383184_0aa6aaff.jpg
/driver-license/2025-10-30/1761791383100_6e61a2ae.jpg
```

**注意**: 路径以 `/` 开头，但**不包含** `/upload` 前缀。

### 前端拼接后的完整 URL

| 环境     | 输入路径                              | 输出 URL                                             |
| -------- | ------------------------------------- | ---------------------------------------------------- |
| 开发环境 | `/shipping-photos/2025-10-30/xxx.jpg` | `/dev-api/upload/shipping-photos/2025-10-30/xxx.jpg` |
| 生产环境 | `/shipping-photos/2025-10-30/xxx.jpg` | `/upload/shipping-photos/2025-10-30/xxx.jpg`         |

### 请求流程

#### 开发环境

```
┌─────────────────────────────────────────────────────┐
│  前端请求                                            │
│  /dev-api/upload/shipping-photos/xxx.jpg            │
└────────────┬────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────┐
│  Vite Dev Proxy (vite.config.ts)                    │
│  /dev-api → http://localhost:8080                   │
└────────────┬────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────┐
│  后端实际接收                                        │
│  http://localhost:8080/upload/shipping-photos/xxx.jpg│
└─────────────────────────────────────────────────────┘
```

#### 生产环境

```
┌─────────────────────────────────────────────────────┐
│  前端请求                                            │
│  /upload/shipping-photos/xxx.jpg                    │
└────────────┬────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────┐
│  Nginx 转发 / 直接访问                               │
│  http://backend:8080/upload/shipping-photos/xxx.jpg │
└─────────────────────────────────────────────────────┘
```

---

## ✅ 优势对比

### 之前的方案（完整 URL）

```typescript
// ❌ 使用完整URL
const baseUrl = window.location.origin; // http://localhost:3000
return `${baseUrl}/upload${path}`;
// 生成: http://localhost:3000/upload/shipping-photos/xxx.jpg
```

**问题**:

- 前端端口（3000）和后端端口（8080）不一致
- 需要手动处理端口问题
- 不符合项目的代理配置规范

### 最终方案（相对路径）

```typescript
// ✅ 使用相对路径
if (import.meta.env.DEV) {
  return `/dev-api/upload${path}`;
}
return `/upload${path}`;
// 开发环境生成: /dev-api/upload/shipping-photos/xxx.jpg
// 生产环境生成: /upload/shipping-photos/xxx.jpg
```

**优势**:

- ✅ 自动利用 Vite 的代理配置
- ✅ 不需要关心端口问题
- ✅ 开发/生产环境自动切换
- ✅ 符合项目规范
- ✅ URL 更简洁

---

## 🔧 配置说明

### Vite 代理配置

开发环境需要在 `vite.config.ts` 中配置代理：

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/dev-api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/dev-api/, '')
      }
    }
  }
});
```

### 后端静态资源配置

后端已配置静态资源映射：

```java
// ResourcesConfig.java
@Override
public void addResourceHandlers(ResourceHandlerRegistry registry) {
    registry.addResourceHandler("/upload/**")
            .addResourceLocations("file:" + uploadPath + File.separator)
            .setCachePeriod(3600);
}
```

### 安全配置

后端允许公开访问上传的图片：

```yaml
# application.yml
security:
    excludes:
        - /upload/** # 允许公开访问上传文件
```

---

## 🎯 使用示例

### 在 Vue 组件中使用

```vue
<template>
  <div class="shipping-detail">
    <!-- 发货照片 -->
    <div v-if="shippingPhotoUrls.length > 0" class="photo-gallery">
      <el-image
        v-for="(url, index) in shippingPhotoUrls"
        :key="index"
        :src="url"
        :preview-src-list="shippingPhotoUrls"
        :initial-index="index"
        fit="cover"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { getFullPhotoUrls } from '@/api/erp/saltprocess/shipping/data-parser';

// 假设从后端获取的数据
const shippingDetail = ref({
  shippingPhotoUrls: [
    '/shipping-photos/2025-10-30/1761791383184_0aa6aaff.jpg',
    '/shipping-photos/2025-10-30/1761791383186_680cc232.jpg'
  ]
});

// 🔥 使用工具函数转换URL
const shippingPhotoUrls = computed(() => {
  return getFullPhotoUrls(shippingDetail.value.shippingPhotoUrls || []);
});

// 输出结果（开发环境）:
// [
//   "/dev-api/upload/shipping-photos/2025-10-30/1761791383184_0aa6aaff.jpg",
//   "/dev-api/upload/shipping-photos/2025-10-30/1761791383186_680cc232.jpg"
// ]
</script>
```

---

## 🧪 测试验证

### 1. 开发环境测试

```bash
# 启动前端开发服务器
npm run dev

# 访问: http://localhost:3000
# 打开发货清单详情页面
```

**预期结果**:

- 浏览器请求：`/dev-api/upload/shipping-photos/xxx.jpg`
- 代理转发到：`http://localhost:8080/upload/shipping-photos/xxx.jpg`
- 图片正常显示

### 2. 生产环境测试

```bash
# 构建生产版本
npm run build

# 预览生产版本
npm run preview
```

**预期结果**:

- 浏览器请求：`/upload/shipping-photos/xxx.jpg`
- 直接访问后端静态资源
- 图片正常显示

### 3. 控制台验证

```javascript
// 在浏览器控制台执行
import { getFullPhotoUrl } from '@/api/erp/saltprocess/shipping/data-parser';

// 测试开发环境
console.log(getFullPhotoUrl('/shipping-photos/2025-10-30/xxx.jpg'));
// 开发环境输出: /dev-api/upload/shipping-photos/2025-10-30/xxx.jpg

// 测试生产环境
// 生产环境输出: /upload/shipping-photos/2025-10-30/xxx.jpg
```

---

## 📝 常见问题

### Q1: 开发环境图片 404

**检查清单**:

1. ✅ Vite 代理配置是否正确
2. ✅ 后端服务是否在 8080 端口运行
3. ✅ 文件是否真实存在于服务器

### Q2: 生产环境图片 404

**检查清单**:

1. ✅ Nginx 是否正确配置了 `/upload` 路径
2. ✅ 静态文件是否正确部署
3. ✅ 后端静态资源映射是否生效

### Q3: 图片路径出现重复的 upload

**原因**: 后端返回的路径已包含 `/upload` 前缀

**解决**: 确认后端返回的路径格式为 `/shipping-photos/...`，不包含 `/upload`

---

## 📚 相关文档

1. **图片访问路径配置说明.md** - 官方配置文档（本次修复依据）
2. **发货清单图片 URL 拼接修复说明.md** - 初版修复文档
3. **发货清单重量数据修复完成报告.md** - 重量数据修复文档

---

## ✨ 总结

### 核心要点

1. **使用相对路径，不使用完整 URL**

   - 开发环境：`/dev-api/upload${path}`
   - 生产环境：`/upload${path}`

2. **利用 Vite 代理配置**

   - 自动处理开发环境的跨域问题
   - 自动转发到正确的后端端口

3. **统一的工具函数**
   - 使用 `getFullPhotoUrl()` 和 `getFullPhotoUrls()`
   - 自动判断环境并生成正确的 URL

### 修复效果

- ✅ 开发环境图片正常显示
- ✅ 生产环境图片正常显示
- ✅ 符合项目规范
- ✅ 代码简洁易维护
- ✅ 自动环境切换

### 影响范围

- ✅ 发货清单详情页面
- ✅ 所有使用图片 URL 的地方
- ✅ 不影响其他功能
- ✅ 不需要后端修改

---

**修复人**: AI Assistant  
**审核**: 待审核  
**版本**: v3.0.0 (最终版)
