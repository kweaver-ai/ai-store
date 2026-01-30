/** 项目信息 */
export interface ProjectInfo {
  id: string
  name: string
  description: string
  updated_at: string
  updated_by: string
  created_at?: string
  created_by?: string
}

/** 节点类型 */
export type NodeType = 'application' | 'page' | 'function'

/** 节点模型 */
export interface NodeInfo {
  id: string
  project_id: string
  type: NodeType
  parent_id: string | null
  name: string
  description?: string
  dev_mode: boolean
  creator: string
  created_at: string
  editor: string
  edited_at: string
  node_code?: string // 22位大小写敏感字符串，用于MCP访问
}

/** 创建节点请求参数 */
export interface CreateNodeParams {
  project_id: string
  parent_id?: string
  name: string
  description?: string
}

/** 移动节点请求参数 */
export interface MoveNodeParams {
  node_id: string
  target_parent_id: string | null
}

/** 开发模式请求参数 */
export interface DevModeParams {
  node_id: string
  dev_mode: boolean
}

/** 项目词典项 */
export interface DictionaryItem {
  id: string
  project_id: string
  term: string
  definition: string
  created_at: string
  updated_at: string
}

/** 创建词典项请求参数 */
export interface CreateDictionaryParams {
  project_id: string
  term: string
  definition: string
}

/** 功能设计文档 */
export interface DocumentInfo {
  id: string
  node_id: string
  content: string
  created_at: string
  updated_at: string
}
