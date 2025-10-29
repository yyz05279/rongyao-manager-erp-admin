/**
 * 文件上传相关类型定义
 */

/**
 * 业务类型
 */
export type BizType = 'shipping-photos' | 'driver-license' | 'other';

/**
 * 单个文件上传结果
 */
export interface FileUploadResult {
  /** 原始文件名 */
  originalFileName: string;
  /** 保存后的文件名 */
  savedFileName?: string;
  /** 文件路径 */
  filePath?: string;
  /** 文件URL（相对路径） */
  fileUrl?: string;
  /** 文件大小（字节） */
  fileSize?: number;
  /** 文件类型 */
  contentType?: string;
  /** 业务类型 */
  bizType?: string;
  /** 上传时间 */
  uploadTime?: string;
  /** 是否上传成功 */
  success: boolean;
  /** 错误信息（上传失败时） */
  errorMessage?: string;
}

/**
 * 批量上传请求参数
 */
export interface BatchUploadRequest {
  /** 文件列表 */
  files: File[];
  /** 业务类型 */
  bizType: BizType;
}

/**
 * 批量上传响应
 */
export interface BatchUploadResponse {
  code: number;
  message: string;
  data: FileUploadResult[];
}

/**
 * 删除文件请求参数
 */
export interface DeleteFileRequest {
  /** 文件相对路径 */
  filePath: string;
}

/**
 * 支持的文件类型
 */
export interface SupportedFileTypes {
  /** 图片类型 */
  images: string[];
  /** 文档类型 */
  documents?: string[];
  /** 最大文件大小（字节） */
  maxSize: number;
}

