import { create } from 'zustand'
import type { Application } from '@/apis/dip-hub'

/**
 * 当前激活的微应用信息
 * 用于主应用内部使用，不会传递给微应用
 */
export interface CurrentMicroAppInfo extends Application {
  /** 微应用路由基础路径 */
  routeBasename: string
}

interface MicroAppStoreState {
  /** 当前激活的微应用信息 */
  currentMicroApp: CurrentMicroAppInfo | null
  /** 设置当前激活的微应用 */
  setCurrentMicroApp: (info: CurrentMicroAppInfo | null) => void
  /** 清空当前微应用信息 */
  clearCurrentMicroApp: () => void
}

/**
 * 微应用信息 Store
 * 用于存储当前激活的微应用信息，方便主应用各组件使用
 */
export const useMicroAppStore = create<MicroAppStoreState>()((set) => ({
  currentMicroApp: null,

  setCurrentMicroApp: (info) => {
    set({ currentMicroApp: info })
  },

  clearCurrentMicroApp: () => {
    set({ currentMicroApp: null })
  },
}))
