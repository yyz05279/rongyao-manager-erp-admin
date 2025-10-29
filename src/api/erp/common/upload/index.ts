/**
 * 文件上传 API
 */

import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import {
  BizType,
  FileUploadResult,
  BatchUploadResponse,
  DeleteFileRequest,
  SupportedFileTypes
} from './types';

/**
 * 批量上传图片
 * @param files 文件列表（最多9张）
 * @param bizType 业务类型
 * @returns 上传结果列表
 */
export const uploadImages = (
  files: File[],
  bizType: BizType
): AxiosPromise<FileUploadResult[]> => {
  const formData = new FormData();

  // 添加文件
  files.forEach((file) => {
    formData.append('files', file);
  });

  // 添加业务类型
  formData.append('bizType', bizType);

  return request({
    url: '/erp/common/upload/images',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

/**
 * 上传单个图片
 * @param file 文件
 * @param bizType 业务类型
 * @returns 上传结果
 */
export const uploadImage = (
  file: File,
  bizType: BizType
): AxiosPromise<FileUploadResult> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('bizType', bizType);

  return request({
    url: '/erp/common/upload/image',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

/**
 * 删除文件
 * @param filePath 文件相对路径
 */
export const deleteFile = (filePath: string): AxiosPromise<void> => {
  return request({
    url: '/erp/common/upload',
    method: 'delete',
    params: { filePath }
  });
};

/**
 * 获取支持的文件类型
 */
export const getSupportedFileTypes = (): AxiosPromise<SupportedFileTypes> => {
  return request({
    url: '/erp/common/upload/supported-types',
    method: 'get'
  });
};

/**
 * 获取完整的文件访问URL
 * @param fileUrl 文件相对路径
 * @returns 完整URL
 */
export const getFullFileUrl = (fileUrl: string): string => {
  if (!fileUrl) return '';

  // 如果已经是完整URL，直接返回
  if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
    return fileUrl;
  }

  // 拼接服务器地址
  const baseUrl = import.meta.env.VITE_APP_BASE_API || '';
  return `${baseUrl}${fileUrl}`;
};

