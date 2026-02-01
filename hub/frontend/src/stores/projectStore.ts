import { create } from 'zustand'
import type { NodeInfo, ObjectType, ProjectInfo } from '@/apis/projects'
import type { TreeItems } from '@/components/ProjectSider/utils'
import { convertNodeInfoToTree, removeItem, setProperty } from '@/components/ProjectSider/utils'

/**
 * 项目节点信息
 */
export interface SelectedNodeInfo {
  /** 节点 ID */
  nodeId: string
  /** 节点类型 */
  nodeType: ObjectType | 'dictionary'
  /** 节点名称 */
  nodeName: string
  /** 项目 ID */
  projectId: string
}

/**
 * 项目 Store
 * 用于管理项目相关的状态，包括选中的节点、树数据等
 * 每次只维护一个项目的树数据，切换项目时重新加载
 */
interface ProjectState {
  /** 当前选中的节点信息 */
  selectedNode: SelectedNodeInfo | null
  /** 设置选中的节点 */
  setSelectedNode: (node: SelectedNodeInfo | null) => void
  /** 清除选中的节点 */
  clearSelectedNode: () => void

  /** 当前项目 ID */
  currentProjectId: string | null
  /** 当前项目信息 */
  currentProjectInfo: ProjectInfo | null
  /** 树数据 */
  treeData: TreeItems
  /** 节点映射（nodeId -> NodeInfo） */
  nodeMap: Map<string, NodeInfo>

  /** 初始化项目树数据 */
  initProjectTree: (projectId: string, nodes: NodeInfo[]) => void
  /** 设置项目信息 */
  setProjectInfo: (projectInfo: ProjectInfo | null) => void
  /** 获取当前项目信息 */
  getProjectInfo: () => ProjectInfo | null
  /** 更新树数据 */
  setTreeData: (treeData: TreeItems) => void
  /** 根据节点 ID 获取节点信息 */
  getNodeInfo: (nodeId: string) => NodeInfo | undefined
  /** 更新节点信息 */
  updateNodeInfo: (nodeId: string, info: Partial<NodeInfo>) => void
  /** 添加节点 */
  addNode: (node: NodeInfo) => void
  /** 删除节点 */
  removeNode: (nodeId: string) => void
  /** 清除树数据（切换项目时调用） */
  clearTreeData: () => void
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  selectedNode: null,
  setSelectedNode: (node) => set({ selectedNode: node }),
  clearSelectedNode: () => set({ selectedNode: null }),

  currentProjectId: null,
  currentProjectInfo: null,
  treeData: [],
  nodeMap: new Map(),

  initProjectTree: (projectId, nodes) => {
    if (!projectId) return
    if (!nodes.length) {
      set({
        currentProjectId: projectId,
        treeData: [],
        nodeMap: new Map(),
      })
      return
    }
    // 构建节点映射
    const map = new Map<string, NodeInfo>()
    nodes.forEach((node) => {
      map.set(node.id, node)
    })

    // 转换为树结构
    const tree = convertNodeInfoToTree(nodes)

    set({
      currentProjectId: projectId,
      treeData: tree,
      nodeMap: map,
    })
  },

  setTreeData: (treeData) => {
    console.log('setTreeData', treeData)
    set({ treeData })
  },

  getNodeInfo: (nodeId) => {
    return get().nodeMap.get(nodeId)
  },

  updateNodeInfo: (nodeId, info) => {
    set((state) => {
      const existingNode = state.nodeMap.get(nodeId)
      if (!existingNode) {
        return state
      }

      const updatedNode: NodeInfo = {
        ...existingNode,
        ...info,
      }

      const newMap = new Map(state.nodeMap)
      newMap.set(nodeId, updatedNode)

      // 同时更新树数据中的节点名称
      const updateNode = (nodes: TreeItems): TreeItems => {
        return nodes.map((n) => {
          if (n.id === nodeId) {
            return { ...n, name: updatedNode.name }
          }
          return {
            ...n,
            children: updateNode(n.children),
          }
        })
      }
      const updatedTreeData = updateNode(state.treeData)

      return {
        treeData: updatedTreeData,
        nodeMap: newMap,
      }
    })
  },

  addNode: (node) => {
    set((state) => {
      const newMap = new Map(state.nodeMap)
      newMap.set(node.id, node)

      // 添加到树数据
      const newTreeItem = {
        id: node.id,
        name: node.name,
        type: node.type,
        children: [],
      }

      let updatedTreeData: TreeItems
      if (node.parent_id) {
        // 添加到父节点的 children
        updatedTreeData = setProperty(state.treeData, node.parent_id, 'children', (value) => [
          ...value,
          newTreeItem,
        ])
        // 展开父节点
        updatedTreeData = setProperty(updatedTreeData, node.parent_id, 'collapsed', () => false)
      } else {
        // 作为根节点添加
        updatedTreeData = [newTreeItem]
      }

      return {
        treeData: updatedTreeData,
        nodeMap: newMap,
      }
    })
  },

  removeNode: (nodeId) => {
    set((state) => {
      const newMap = new Map(state.nodeMap)
      newMap.delete(nodeId)

      // 从树数据中移除
      const updatedTreeData = removeItem(state.treeData, nodeId)

      return {
        treeData: updatedTreeData,
        nodeMap: newMap,
      }
    })
  },

  clearTreeData: () => {
    set({
      currentProjectId: null,
      currentProjectInfo: null,
      treeData: [],
      nodeMap: new Map(),
      selectedNode: null,
    })
  },

  setProjectInfo: (projectInfo) => {
    set({ currentProjectInfo: projectInfo })
  },

  getProjectInfo: () => {
    return get().currentProjectInfo
  },
}))
