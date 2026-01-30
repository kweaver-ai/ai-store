import { create } from 'zustand'
import { type ApplicationInfo, pinMicroAppApi } from '../apis/applications'
import { WENSHU_APP_KEY } from '../routes/types'

/**
 * 用户偏好配置 Store
 * 用于存储侧边栏钉住的微应用等用户偏好
 * 数据从后端接口获取和更新
 */
interface PreferenceState {
  /** 钉在侧边栏的微应用 Key 列表 */
  pinnedMicroApps: ApplicationInfo[]
  /** wenshu 应用信息 */
  wenshuAppInfo: ApplicationInfo | null

  /** 加载状态 */
  loading: boolean
  /** 从后端获取钉住的微应用列表 */
  fetchPinnedMicroApps: () => Promise<void>
  /** 添加钉住的微应用 */
  pinMicroApp: (appId: number) => Promise<void>
  /** 取消钉住的微应用 */
  unpinMicroApp: (appId: number, needRequest?: boolean) => Promise<void>
  /** 检查是否已钉住 */
  isPinned: (appId: number) => boolean
  /** 切换钉住状态 */
  togglePin: (appId: number) => Promise<void>
}

export const testPinnedMicroApps: any[] = [
  {
    id: 1,
    key: 'wenshu-app',
    name: '测试应用1',
    description: '测试应用1',
    is_config: true,
    is_pinned: true,
    updated_by: 'test',
    updated_at: new Date().toISOString(),
    micro_app: {
      name: '问数',
      entry: 'local-wenshu',
      headless: false,
    },
  },
  {
    id: 2,
    key: 'test-app-2',
    name: '测试应用2',
    description: '测试应用2',
    release_config: {},
    is_config: true,
    is_pinned: true,
    updated_by: 'test',
    updated_at: new Date().toISOString(),
    micro_app: {
      name: '测试应用2',
      entry: 'local-test-app-2',
      headless: false,
    },
  },
]

// 缓存正在进行中的 pinned 微应用加载 Promise，避免重复请求
let fetchPinnedMicroAppsPromise: Promise<void> | null = null

export const usePreferenceStore = create<PreferenceState>()((set, get) => ({
  pinnedMicroApps: testPinnedMicroApps,
  wenshuAppInfo: null,
  loading: false,

  fetchPinnedMicroApps: async () => {
    // 如果已经有加载中的 Promise，复用该 Promise，避免重复请求
    if (fetchPinnedMicroAppsPromise) {
      return fetchPinnedMicroAppsPromise
    }

    fetchPinnedMicroAppsPromise = (async () => {
      set({ loading: true })
      try {
        // 通过应用列表接口获取应用列表，再本地过滤出已钉住的微应用，并缓存 wenshu 应用信息
        // const apps: ApplicationInfo[] = await getApplications()
        const apps = testPinnedMicroApps
        const wenshuAppInfo = (apps ?? []).find((app) => app?.key === WENSHU_APP_KEY) ?? null
        set({
          pinnedMicroApps: (apps ?? []).filter((app) => app?.is_pinned ?? false),
          wenshuAppInfo,
          loading: false,
        })
      } catch {
        set({ loading: false })
      } finally {
        fetchPinnedMicroAppsPromise = null
      }
    })()

    return fetchPinnedMicroAppsPromise
  },

  pinMicroApp: async (appId: number) => {
    const { pinnedMicroApps } = get()
    if (pinnedMicroApps.some((app) => app.id === appId)) {
      return
    }

    try {
      await pinMicroAppApi({ appId, pinned: true })
      await get().fetchPinnedMicroApps()
    } catch (error) {
      console.error('Failed to pin micro app:', error)
    }
  },

  unpinMicroApp: async (appId: number, needRequest = true) => {
    const { pinnedMicroApps } = get()
    if (!pinnedMicroApps.some((app) => app.id === appId)) {
      return
    }
    if (!needRequest) {
      set({ pinnedMicroApps: pinnedMicroApps.filter((app) => app.id !== appId) })
      return
    }
    try {
      await pinMicroAppApi({ appId, pinned: false })
      set({ pinnedMicroApps: pinnedMicroApps.filter((app) => app.id !== appId) })
    } catch (error) {
      console.error('Failed to unpin micro app:', error)
    }
  },

  isPinned: (appId: number) => {
    return get().pinnedMicroApps.some((app) => app.id === appId)
  },

  togglePin: async (appId: number) => {
    const { isPinned, pinMicroApp, unpinMicroApp } = get()
    if (isPinned(appId)) {
      await unpinMicroApp(appId)
    } else {
      await pinMicroApp(appId)
    }
  },
}))
