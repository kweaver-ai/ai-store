import { del, get, post, put } from '@/utils/http'
import type {
  CreateDictionaryParams,
  CreateNodeParams,
  DictionaryItem,
  DocumentInfo,
  MoveNodeParams,
  NodeInfo,
  NodeType,
  ObjectType,
  ProjectInfo,
} from './index.d'

export type {
  CreateDictionaryParams,
  CreateNodeParams,
  DictionaryItem,
  DocumentInfo,
  MoveNodeParams,
  NodeInfo,
  NodeType,
  ObjectType,
  ProjectInfo,
}

// ==================== 项目管理 ====================

/**
 * 获取项目列表
 * @returns 项目列表
 */
export const getProjects = (): Promise<ProjectInfo[]> =>
  get(`/api/dip-studio/v1/projects`).then((result: any) => {
    // 如果结果不是数组，返回空数组
    return Array.isArray(result) ? result : []
  })

/**
 * 新建项目
 * @param params 项目信息
 * @returns 项目 ID
 */
export const postProjects = (params: {
  name: string
  description?: string
}): Promise<{ id: string }> => post(`/api/dip-studio/v1/projects`, { body: params })

/**
 * 编辑项目
 * @param id 项目 ID
 * @param params 项目信息
 * @returns 项目 ID
 */
export const putProjects = (
  id: string,
  params: {
    name: string
    description?: string
  },
): Promise<{ id: string }> => put(`/api/dip-studio/v1/projects/${id}`, { body: params })

/**
 * 删除项目
 * @param id 项目 ID
 * @returns 是否删除成功
 */
export const deleteProjects = (id: string): Promise<void> =>
  del(`/api/dip-studio/v1/projects/${id}`)

// ==================== 项目结构管理（节点） ====================

/**
 * 创建应用节点
 * @param params 节点信息
 * @returns 节点信息
 */
export const postApplicationNode = (params: CreateNodeParams): Promise<NodeInfo> =>
  post(`/api/dip-studio/v1/nodes/application`, { body: params })

/**
 * 编辑应用节点
 * @param nodeId 节点 ID
 * @param params 节点信息
 * @returns 节点信息
 */
export const putApplicationNode = (nodeId: string, params: CreateNodeParams): Promise<NodeInfo> =>
  put(`/api/dip-studio/v1/nodes/application/${nodeId}`, { body: params })

/**
 * 删除应用节点
 * @param nodeId 节点 ID
 * @returns 是否删除成功
 */
export const deleteApplicationNode = (nodeId: string): Promise<void> =>
  del(`/api/dip-studio/v1/nodes/application/${nodeId}`)

/**
 * 创建页面节点
 * @param params 节点信息
 * @returns 节点信息
 */
export const postPageNode = (params: CreateNodeParams): Promise<NodeInfo> =>
  post(`/api/dip-studio/v1/nodes/page`, { body: params })

/**
 * 编辑页面节点
 * @param nodeId 节点 ID
 * @param params 节点信息
 * @returns 节点信息
 */
export const putPageNode = (nodeId: string, params: CreateNodeParams): Promise<NodeInfo> =>
  put(`/api/dip-studio/v1/nodes/page/${nodeId}`, { body: params })

/**
 * 删除页面节点
 * @param nodeId 节点 ID
 * @returns 是否删除成功
 */
export const deletePageNode = (nodeId: string): Promise<void> =>
  del(`/api/dip-studio/v1/nodes/page/${nodeId}`)

/**
 * 创建功能节点
 * @param params 节点信息
 * @returns 节点信息（创建功能节点时会自动创建并绑定功能设计文档）
 */
export const postFunctionNode = (params: CreateNodeParams): Promise<NodeInfo> =>
  post(`/api/dip-studio/v1/nodes/function`, { body: params })

/**
 * 编辑功能节点
 * @param nodeId 节点 ID
 * @param params 节点信息
 * @returns 节点信息
 */
export const putFunctionNode = (nodeId: string, params: CreateNodeParams): Promise<NodeInfo> =>
  put(`/api/dip-studio/v1/nodes/function/${nodeId}`, { body: params })

/**
 * 删除功能节点
 * @param nodeId 节点 ID
 * @returns 是否删除成功
 */
export const deleteFunctionNode = (nodeId: string): Promise<void> =>
  del(`/api/dip-studio/v1/nodes/function/${nodeId}`)

/**
 * 获取项目节点树
 * @param projectId 项目 ID
 * @returns 节点树（树形结构）
 */
export const getProjectNodes = (projectId: string): Promise<NodeInfo[]> =>
  get(`/api/dip-studio/v1/nodes`, { params: { project_id: projectId } }).then((result: any) => {
    // 如果结果不是数组，返回空数组
    return Array.isArray(result) ? result : []
  })

/**
 * 删除节点
 * @param nodeId 节点 ID
 * @returns 是否删除成功
 */
export const deleteNode = (nodeId: string): Promise<void> =>
  del(`/api/dip-studio/v1/nodes/${nodeId}`)

/**
 * 移动节点
 * @param params 移动参数
 * @returns 是否移动成功
 */
export const moveNode = (params: MoveNodeParams): Promise<void> =>
  put(`/api/dip-studio/v1/nodes/move`, { body: params })

// ==================== 项目词典 ====================

/**
 * 获取项目词典
 * @param projectId 项目 ID
 * @returns 词典列表
 */
export const getProjectDictionary = (projectId: string): Promise<DictionaryItem[]> =>
  get(`/api/dip-studio/v1/dictionary`, { params: { project_id: projectId } }).then(
    (result: any) => {
      // 如果结果不是数组，返回空数组
      return Array.isArray(result) ? result : []
    },
  )

/**
 * 新增术语
 * @param params 术语信息
 * @returns 术语信息
 */
export const postProjectDictionary = (params: CreateDictionaryParams): Promise<DictionaryItem> =>
  post(`/api/dip-studio/v1/dictionary`, { body: params })

/**
 * 更新术语
 * @param id 术语 ID
 * @param params 术语信息
 * @returns 术语信息
 */
export const putProjectDictionary = (
  id: string,
  params: CreateDictionaryParams,
): Promise<DictionaryItem> => put(`/api/dip-studio/v1/dictionary/${id}`, { body: params })

/**
 * 删除术语
 * @param id 术语 ID
 */
export const deleteProjectDictionary = (id: string): Promise<void> =>
  del(`/api/dip-studio/v1/dictionary/${id}`)

// ==================== 功能设计文档 ====================

/**
 * 获取功能设计文档
 * @param nodeId 节点 ID
 * @returns 文档信息
 */
export const getDocument = (nodeId: string): Promise<DocumentInfo> =>
  get(`/api/dip-studio/v1/documents`, { params: { node_id: nodeId } })

/**
 * 更新功能设计文档
 * @param nodeId 节点 ID
 * @param content 文档内容
 * @returns 文档信息
 */
export const putDocument = (nodeId: string, content: any): Promise<DocumentInfo> =>
  put(`/api/dip-studio/v1/documents`, {
    body: { node_id: nodeId, content },
  })
