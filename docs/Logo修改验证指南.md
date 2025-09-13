# Logo修改验证指南

## 修改概述

将左侧菜单栏的logo图片从`src/assets/logo/logo.png`修改为使用`public/logo.png`，同时保持系统标题为"江苏联储ERP管理系统"。

## 修改详情

### 文件修改
**文件**: `src/layout/components/Sidebar/Logo.vue`

**修改内容**:
1. 移除了对assets目录下logo的导入
2. 添加了对public目录下logo的引用
3. 保持了系统标题的正确显示

### 代码对比

**修改前**:
```typescript
import variables from '@/assets/styles/variables.module.scss'
import logo from '@/assets/logo/logo.png'
import useSettingsStore from '@/store/modules/settings'

// ...

const title = ref('江苏联储ERP管理系统');
const settingsStore = useSettingsStore();
const sideTheme = computed(() => settingsStore.sideTheme);
```

**修改后**:
```typescript
import variables from '@/assets/styles/variables.module.scss'
import useSettingsStore from '@/store/modules/settings'

// ...

const title = ref('江苏联储ERP管理系统');
const logo = '/logo.png'; // 使用public目录下的logo.png
const settingsStore = useSettingsStore();
const sideTheme = computed(() => settingsStore.sideTheme);
```

## 验证步骤

### 1. 文件存在性检查
确认以下文件存在：
- ✅ `public/logo.png` - 新的logo文件
- ✅ `src/layout/components/Sidebar/Logo.vue` - 已修改的组件

### 2. 开发环境验证
1. 启动开发服务器：
   ```bash
   npm run dev
   # 或
   pnpm dev
   ```

2. 打开浏览器访问系统

3. 检查左侧菜单栏：
   - ✅ Logo图片正确显示（来自public/logo.png）
   - ✅ 系统标题显示为"江苏联储ERP管理系统"
   - ✅ 侧边栏收缩时logo仍然正确显示

### 3. 响应式测试
1. **侧边栏展开状态**：
   - Logo图片和标题都应该显示
   - 布局应该正常，无重叠或错位

2. **侧边栏收缩状态**：
   - 只显示Logo图片
   - 标题应该隐藏
   - Logo居中显示

3. **不同屏幕尺寸**：
   - 桌面端：正常显示
   - 平板端：适配正常
   - 移动端：响应式布局正确

### 4. 主题切换测试
1. **深色主题**：
   - Logo在深色背景下清晰可见
   - 标题颜色适配深色主题

2. **浅色主题**：
   - Logo在浅色背景下清晰可见
   - 标题颜色适配浅色主题

## 预期效果

### 视觉效果
- 左侧菜单栏顶部显示新的logo图片
- Logo图片来源于`public/logo.png`
- 系统标题显示为"江苏联储ERP管理系统"
- 整体布局协调美观

### 技术效果
- 减少了打包体积（public文件不会被打包处理）
- 提高了加载性能（直接访问静态资源）
- 便于后续logo更换（直接替换public目录文件）

## 常见问题排查

### 1. Logo不显示
**可能原因**：
- `public/logo.png`文件不存在
- 文件路径错误
- 图片格式不支持

**解决方法**：
- 确认文件存在于`public/logo.png`
- 检查文件格式是否为PNG
- 尝试清除浏览器缓存

### 2. Logo显示模糊
**可能原因**：
- 图片分辨率过低
- 图片尺寸不合适

**解决方法**：
- 使用高分辨率图片（建议至少64x64像素）
- 确保图片为正方形比例
- 使用PNG格式保持清晰度

### 3. 布局错乱
**可能原因**：
- CSS样式冲突
- 图片尺寸过大

**解决方法**：
- 检查CSS样式是否正确
- 调整图片尺寸至合适大小
- 确认组件结构完整

### 4. 主题适配问题
**可能原因**：
- Logo背景不透明
- 颜色与主题不匹配

**解决方法**：
- 使用透明背景的PNG图片
- 设计适配深浅两种主题的logo
- 考虑使用SVG格式获得更好的适配性

## 性能优化建议

### 1. 图片优化
- 压缩图片文件大小（建议<50KB）
- 使用适当的分辨率（32x32或64x64像素）
- 考虑使用WebP格式（需要fallback）

### 2. 缓存策略
- 利用浏览器缓存机制
- 设置合适的缓存头
- 考虑使用CDN加速

### 3. 加载优化
- 预加载关键图片资源
- 使用懒加载技术
- 提供加载失败的fallback

## 后续维护

### 1. Logo更换
如需更换logo，只需：
1. 替换`public/logo.png`文件
2. 保持文件名不变
3. 清除浏览器缓存
4. 刷新页面验证

### 2. 多格式支持
考虑支持多种格式：
```typescript
const logo = '/logo.png'; // 主要格式
const logoWebp = '/logo.webp'; // 现代浏览器优化格式
const logoSvg = '/logo.svg'; // 矢量格式
```

### 3. 响应式logo
考虑为不同设备提供不同尺寸的logo：
```typescript
const logoSmall = '/logo-32.png'; // 小尺寸
const logoMedium = '/logo-64.png'; // 中等尺寸
const logoLarge = '/logo-128.png'; // 大尺寸
```

## 验证完成确认

- [ ] Logo图片正确显示
- [ ] 系统标题正确显示
- [ ] 侧边栏展开/收缩功能正常
- [ ] 深浅主题切换正常
- [ ] 响应式布局正确
- [ ] 性能表现良好
- [ ] 无控制台错误
- [ ] 跨浏览器兼容性良好

## 修改完成时间
2024年12月12日

## 验证人员
待验证
