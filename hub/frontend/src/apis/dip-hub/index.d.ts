/** 应用对象 */
export interface Application {
  /** 应用主键 ID */
  id: number
  /** 应用包唯一标识 */
  key: string
  /** 应用名称 */
  name: string
  /** 应用描述 */
  description?: string
  /** 应用图标（Base64编码字符串） */
  icon?: string
  /** 当前版本号 */
  version?: string
  /** 应用所属分类 */
  category?: string
  /** 应用配置（JSON格式） */
  config?: {
    /** 是否为无头模式（不显示 Header） */
    headless?: boolean
    [key: string]: any
  }
  /** 更新者用户 ID */
  updated_by?: string
  /** 更新时间 */
  updated_at?: string
}

/** 用户对象 */
export interface User {
  /** 用户ID */
  user_id: string
  /** 用户显示名 */
  display_name: string
}

/** 角色对象 */
export interface Role {
  /** 角色ID */
  role_id: string
  /** 角色名称 */
  role_name: string
}

/** 获取钉住的微应用列表响应 */
export interface PinnedMicroAppsResponse {
  /** 钉住的微应用 ID 列表 */
  appIds: string[]
}

/** 钉住/取消钉住微应用参数 */
export interface PinMicroAppParams {
  /** 微应用 ID */
  appId: string
  /** 是否钉住 */
  pinned: boolean
}
