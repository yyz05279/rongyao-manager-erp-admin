<template>
  <el-dialog
    v-model="dialogVisible"
    title="Excel导入发货清单"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="import-container">
      <el-alert
        title="导入说明"
        type="info"
        :closable="false"
        show-icon
        style="margin-bottom: 20px;"
      >
        <template #default>
          <p>• 请上传Excel格式的发货清单文件</p>
          <p>• 支持.xlsx和.xls格式</p>
          <p>• 文件大小不超过10MB</p>
        </template>
      </el-alert>

      <el-upload
        ref="uploadRef"
        class="upload-area"
        drag
        :auto-upload="false"
        :limit="1"
        accept=".xlsx,.xls"
        :on-change="handleFileChange"
        :on-exceed="handleExceed"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          将Excel文件拖到此处，或<em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            支持.xlsx和.xls格式，文件大小不超过10MB
          </div>
        </template>
      </el-upload>

      <div v-if="selectedFile" class="file-info">
        <el-card shadow="never">
          <div class="file-details">
            <el-icon><document /></el-icon>
            <div class="file-meta">
              <div class="file-name">{{ selectedFile.name }}</div>
              <div class="file-size">{{ formatFileSize(selectedFile.size) }}</div>
            </div>
            <el-button type="danger" link @click="removeFile">
              <el-icon><delete /></el-icon>
            </el-button>
          </div>
        </el-card>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button
          type="primary"
          :disabled="!selectedFile"
          :loading="importing"
          @click="handleImport"
        >
          开始导入
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup name="SimpleImportDialog" lang="ts">
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { UploadFilled, Document, Delete } from '@element-plus/icons-vue';

// Props & Emits
interface Props {
  visible: boolean;
}

interface Emits {
  (e: 'update:visible', value: boolean): void;
  (e: 'success'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 响应式数据
const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
});

const selectedFile = ref<File | null>(null);
const importing = ref(false);

// 方法
const handleFileChange = (file: any) => {
  selectedFile.value = file.raw;
  ElMessage.success('文件选择成功');
};

const handleExceed = () => {
  ElMessage.warning('只能上传一个文件');
};

const removeFile = () => {
  selectedFile.value = null;
};

const handleImport = async () => {
  if (!selectedFile.value) {
    ElMessage.warning('请先选择文件');
    return;
  }

  importing.value = true;
  try {
    // 模拟导入过程
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    ElMessage.success('导入成功');
    emit('success');
    handleClose();
  } catch (error) {
    ElMessage.error('导入失败');
  } finally {
    importing.value = false;
  }
};

const handleClose = () => {
  selectedFile.value = null;
  importing.value = false;
  emit('update:visible', false);
};

const formatFileSize = (size: number): string => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};
</script>

<style scoped lang="scss">
.import-container {
  .upload-area {
    margin-bottom: 20px;
    
    :deep(.el-upload-dragger) {
      width: 100%;
      height: 180px;
      border: 2px dashed #d9d9d9;
      border-radius: 6px;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: border-color 0.3s;
      
      &:hover {
        border-color: #409eff;
      }
    }
  }
  
  .file-info {
    margin-bottom: 20px;
    
    .file-details {
      display: flex;
      align-items: center;
      gap: 12px;
      
      .file-meta {
        flex: 1;
        
        .file-name {
          font-weight: 500;
          color: #303133;
        }
        
        .file-size {
          font-size: 12px;
          color: #909399;
          margin-top: 4px;
        }
      }
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

// 响应式设计
@media (max-width: 768px) {
  :deep(.el-dialog) {
    width: 95% !important;
    margin: 5vh auto;
  }
}
</style>
