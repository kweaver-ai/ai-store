import { create } from 'zustand'
import { getPinnedMicroAppsApi, pinMicroAppApi } from '../apis/applications'

/**
 * 用户偏好配置 Store
 * 用于存储侧边栏钉住的微应用等用户偏好
 * 数据从后端接口获取和更新
 */
interface PreferenceState {
  /** 钉在侧边栏的微应用 ID 列表 */
  pinnedMicroApps: string[]
  /** 加载状态 */
  loading: boolean
  /** 从后端获取钉住的微应用列表 */
  fetchPinnedMicroApps: () => Promise<void>
  /** 添加钉住的微应用 */
  pinMicroApp: (appId: string) => Promise<void>
  /** 取消钉住的微应用 */
  unpinMicroApp: (appId: string) => Promise<void>
  /** 检查是否已钉住 */
  isPinned: (appId: string) => boolean
  /** 切换钉住状态 */
  togglePin: (appId: string) => Promise<void>
}

export const usePreferenceStore = create<PreferenceState>()((set, get) => ({
  pinnedMicroApps: [],
  loading: false,

  fetchPinnedMicroApps: async () => {
    set({ loading: true })
    try {
      const response = await getPinnedMicroAppsApi()
      set({ pinnedMicroApps: response.appIds, loading: false })
    } catch (error) {
      console.error('Failed to fetch pinned micro apps:', error)
      set({ loading: false })
    }
  },

  pinMicroApp: async (appId: string) => {
    const { pinnedMicroApps } = get()
    if (pinnedMicroApps.includes(appId)) {
      return
    }

    try {
      await pinMicroAppApi({ appId, pinned: true })
      set({ pinnedMicroApps: [...pinnedMicroApps, appId] })
    } catch (error) {
      console.error('Failed to pin micro app:', error)
      throw error
    }
  },

  unpinMicroApp: async (appId: string) => {
    const { pinnedMicroApps } = get()
    if (!pinnedMicroApps.includes(appId)) {
      return
    }

    try {
      await pinMicroAppApi({ appId, pinned: false })
      set({ pinnedMicroApps: pinnedMicroApps.filter((id) => id !== appId) })
    } catch (error) {
      console.error('Failed to unpin micro app:', error)
      throw error
    }
  },

  isPinned: (appId: string) => {
    return get().pinnedMicroApps.includes(appId)
  },

  togglePin: async (appId: string) => {
    const { isPinned, pinMicroApp, unpinMicroApp } = get()
    if (isPinned(appId)) {
      await unpinMicroApp(appId)
    } else {
      await pinMicroApp(appId)
    }
  },
}))
