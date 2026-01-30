import { create } from 'zustand'
import type { NodeType } from '@/apis/projects'

/**
 * 项目节点信息
 */
export interface SelectedNodeInfo {
  /** 节点 ID */
  nodeId: string
  /** 节点类型 */
  nodeType: NodeType | 'dictionary'
  /** 节点名称 */
  nodeName: string
  /** 项目 ID */
  projectId: string
}

/**
 * 项目 Store
 * 用于管理项目相关的状态，包括选中的节点等
 */
interface ProjectState {
  /** 当前选中的节点信息 */
  selectedNode: SelectedNodeInfo | null
  /** 设置选中的节点 */
  setSelectedNode: (node: SelectedNodeInfo | null) => void
  /** 清除选中的节点 */
  clearSelectedNode: () => void
}

export const useProjectStore = create<ProjectState>((set) => ({
  selectedNode: null,
  setSelectedNode: (node) => set({ selectedNode: node }),
  clearSelectedNode: () => set({ selectedNode: null }),
}))
