import { app } from 'electron'
import path from 'path'

/**
 * 判断是否为开发环境
 */
export const isDev = process.env.NODE_ENV === 'development'

/**
 * 获取资源文件路径
 */
export function getAssetPath(...paths: string[]): string {
  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets')

  return path.join(RESOURCES_PATH, ...paths)
}

/**
 * 获取预加载脚本路径
 */
export function getPreloadPath(): string {
  return path.join(__dirname, '../preload/index.js')
}

/**
 * 获取渲染进程入口文件路径
 */
export function getRendererPath(): string {
  return path.join(__dirname, '../renderer/index.html')
}

