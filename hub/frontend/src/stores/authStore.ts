import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// 用户信息接口
export interface UserInfo {
  id: string
  username: string
  email?: string
  avatar?: string
  [key: string]: any
}

interface AuthState {
  userInfo: UserInfo | null
  isAuthenticated: boolean
  setUserInfo: (userInfo: UserInfo | null) => void
  login: (userInfo: UserInfo) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      userInfo: null,
      isAuthenticated: false,
      setUserInfo: (userInfo) => set({ userInfo, isAuthenticated: !!userInfo }),
      login: (userInfo) =>
        set({
          userInfo,
          isAuthenticated: true,
        }),
      logout: () =>
        set({
          userInfo: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        userInfo: state.userInfo,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)


