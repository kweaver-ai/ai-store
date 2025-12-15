import type { MicroAppConfig } from '../../utils/micro-app/type'

// 微应用相关类型已在 utils/micro-app/type 中定义
export type { MicroAppConfig }

/**
 * 上传应用参数
 */
export interface UploadAppParams {
  /** 应用名称 */
  appName: string
  /** 应用描述 */
  appDescription?: string
  /** 应用图标文件 */
  appIcon?: File
  /** 应用安装包文件 */
  packageFile: File
}

/**
 * 上传应用响应
 */
export interface UploadAppResponse {
  /** 应用 ID */
  appId: string
  /** 应用名称 */
  appName: string
  /** 上传状态 */
  status: 'success' | 'failed'
  /** 错误信息（失败时） */
  error?: string
}

/**
 * 获取钉住的微应用列表响应
 */
export interface PinnedMicroAppsResponse {
  /** 钉住的微应用 ID 列表 */
  appIds: string[]
}

/**
 * 钉住/取消钉住微应用参数
 */
export interface PinMicroAppParams {
  /** 微应用 ID */
  appId: string
  /** 是否钉住 */
  pinned: boolean
}