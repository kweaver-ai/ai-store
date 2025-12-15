/**
 * 应用开发相关类型定义
 */

import type { PageParams } from '../type'

/** 应用固定状态 */
export enum AppFixedStatus {
  /** 未固定 */
  Unfixed = 'unfixed',
  /** 已固定 */
  Fixed = 'fixed',
}

/**
 * 应用信息
 */
export interface AppInfo {
  /** 应用 ID */
  appId: string
  /** 应用名称 */
  appName: string
  /** 应用描述 */
  appDescription?: string
  /** 应用图标 URL */
  appIcon?: string
  /** 创建时间 */
  createTime?: number
  /** 更新时间 */
  updateTime?: number
  /** 版本号 */
  version?: string
  /** 创建人 */
  createdBy?: string
  /** 创建人名称 */
  createdByName?: string
  /** 应用固定状态 */
  fixedStatus?: AppFixedStatus
}

/**
 * 获取应用列表请求
 */
export interface GetAppListParams extends PageParams {}
