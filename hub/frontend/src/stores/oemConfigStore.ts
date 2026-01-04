import { create } from 'zustand'
import type { OEMConfig } from '@/apis'
import { getOEMConfigApi } from '@/apis/config'

/** OEM 配置状态 */
interface OEMConfigState {
  /** OEM 配置（按语言存储） */
  oemConfigs: Record<string, OEMConfig>
  /** 加载状态 */
  loading: boolean
  /** 错误信息 */
  error: Error | null
  /** 是否已初始化 */
  initialized: boolean
  /** 设置所有语言的 OEM 配置 */
  setOEMConfigs: (configs: Record<string, OEMConfig>) => void
  /** 设置加载状态 */
  setLoading: (loading: boolean) => void
  /** 设置错误信息 */
  setError: (error: Error | null) => void
  /** 根据语言获取 OEM 配置 */
  getOEMConfig: (language: string) => OEMConfig | null
  /** 初始化 OEM 配置 */
  initialize: (languages?: string[], product?: string) => Promise<void>
}

export const useOEMConfigStore = create<OEMConfigState>((set, get) => ({
  oemConfigs: {},
  loading: false,
  error: null,
  initialized: false,
  setOEMConfigs: (configs) => set({ oemConfigs: configs }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  getOEMConfig: (language: string) => {
    const { oemConfigs } = get()
    // 先尝试精确匹配
    if (oemConfigs[language]) {
      return oemConfigs[language]
    }
    // 尝试匹配语言前缀
    const langPrefix = language.split('-')[0].toLowerCase()
    if (langPrefix === 'zh') {
      return oemConfigs['zh-CN'] || oemConfigs['zh-TW'] || null
    }
    if (langPrefix === 'en') {
      return oemConfigs['en-US'] || null
    }
    // 默认返回第一个配置，如果都没有则返回 null
    const keys = Object.keys(oemConfigs)
    return keys.length > 0 ? oemConfigs[keys[0]] : null
  },
  initialize: async (languages = ['zh-CN'], product = 'dip') => {
    // 'zh-CN', 'zh-TW', 'en-US'
    const { initialized } = get()
    // 如果已经初始化过，跳过
    if (initialized) {
      return
    }

    set({ loading: true, error: null })

    try {
      // 并行加载所有语言的配置
      const configPromises = languages.map((lang) =>
        getOEMConfigApi(lang, product).then((config) => ({ lang, config })),
      )

      const results = await Promise.allSettled(configPromises)
      const configs: Record<string, OEMConfig> = {}

      results.forEach((result) => {
        if (result.status === 'fulfilled') {
          configs[result.value.lang] = result.value.config
        }
      })

      set({
        oemConfigs: configs,
        loading: false,
        initialized: true,
        error: null,
      })
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Failed to initialize OEM config')
      set({
        loading: false,
        error: err,
        initialized: true,
      })
    }
  },
}))

export type { OEMConfig }
