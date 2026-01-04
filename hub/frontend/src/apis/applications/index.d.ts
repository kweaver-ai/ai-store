/** 应用基础信息 */
export interface ApplicationBasicInfo {
  /** 应用 ID */
  id: number
  /** 应用包唯一标识 */
  key: string
  /** 应用名称 */
  name: string
  /** 应用描述 */
  description?: string
  /** 应用图标（Base64编码字符串） */
  icon?: string
  /** 应用所属分组 */
  category?: string
  /** 应用版本号 */
  version?: string
  /** 是否完成配置 */
  is_config: boolean
  /** 更新者用户 ID */
  updated_by: string
  /** 更新时间（ISO 8601 date-time） */
  updated_at: string
  /** 微应用配置 */
  micro_app: {
    /** 微应用名称 */
    name: string
    /** 微应用入口 */
    entry: string
    /** 是否无头模式 */
    headless: boolean
  }
}

/** 应用信息 */
export interface ApplicationInfo extends ApplicationBasicInfo {
  /** 应用安装配置：记录应用安装了哪些 helm release */
  release_config: string[]
  /** 业务知识网络 ID 列表 */
  ontology_ids?: number[]
  /** 智能体 ID 列表 */
  agent_ids?: number[]
}

/** 业务知识网络信息 */
export interface OntologyInfo {
  id: number
  name?: string
  description?: string
  is_config?: boolean
}

/** 业务知识网络列表 */
export interface OntologyList {
  ontologies?: OntologyInfo[]
}

/** 智能体信息 */
export interface AgentInfo {
  id: number
  name?: string
  description?: string
  /** 提示词 */
  prompt?: string
  /** 技能列表 */
  skills?: string[]
}

/** 智能体列表 */
export interface AgentList {
  agents?: AgentInfo[]
}

/** 应用配置请求体 */
export interface ApplicationConfigRequest {
  ontology_ids?: number[]
  agent_ids?: number[]
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
