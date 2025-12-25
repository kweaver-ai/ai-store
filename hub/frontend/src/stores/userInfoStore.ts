import { create } from 'zustand'
import type { UserInfo } from '@/apis/user'
import { getUserInfo } from '@/apis/user'
import { getLogoutUrl } from '@/apis/login'
import { getAccessToken, clearAuthCookies } from '@/utils/http/token-config'

/**
 * 用户信息 Store
 * 专职处理用户信息的获取、存储和管理
 */
interface UserInfoState {
  /** 用户信息 */
  userInfo: UserInfo | null
  /** 加载状态 */
  isLoading: boolean
  /** 设置用户信息 */
  setUserInfo: (userInfo: UserInfo | null) => void
  /** 登出：清除用户信息、Cookie 并跳转到登出 URL */
  logout: () => void
  /** 从服务端获取用户信息 */
  fetchUserInfo: () => Promise<void>
}

export const useUserInfoStore = create<UserInfoState>((set) => ({
  userInfo: null,
  isLoading: false,

  setUserInfo: (userInfo) => set({ userInfo }),

  logout: () => {
    // 清除本地状态
    set({ userInfo: null })
    // 清除认证相关的 Cookie
    clearAuthCookies()
    // 跳转到登出 URL
    window.location.replace(getLogoutUrl())
  },

  fetchUserInfo: async () => {
    const token = getAccessToken()
    if (!token) {
      set({ userInfo: null, isLoading: false })
      return
    }

    set({ isLoading: true })
    try {
      const userInfo: UserInfo = await getUserInfo()
      set({
        userInfo,
        isLoading: false,
      })
    } catch (error) {
      console.error('获取用户信息失败:', error)
      set({
        userInfo: null,
        isLoading: false,
      })
    }
  },
}))
