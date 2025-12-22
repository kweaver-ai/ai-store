import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserInfo } from '@/apis/dip-hub'
import {
  SYSTEM_FIXED_NORMAL_USER_ID,
  SYSTEM_FIXED_APP_ADMIN_USER_ID,
} from '@/apis/types'
import Cookies from 'js-cookie'

interface AuthState {
  userInfo: UserInfo | null
  isAuthenticated: boolean
  setUserInfo: (userInfo: UserInfo | null) => void
  login: (userInfo: UserInfo) => void
  logout: () => void
}
const mockUserInfo: UserInfo = {
  user_id: 'qewfqwe',
  display_name: 'qewfqwe',
  role_ids: [SYSTEM_FIXED_NORMAL_USER_ID, SYSTEM_FIXED_APP_ADMIN_USER_ID],
  //SYSTEM_FIXED_APP_ADMIN_USER_ID
}

export const useAuthStore = create<AuthState>()((set) => ({
  userInfo: mockUserInfo,
  isAuthenticated: false,
  setUserInfo: (userInfo) => set({ userInfo, isAuthenticated: !!userInfo }),
  login: (userInfo) =>
    set({
      userInfo,
      isAuthenticated: true,
    }),
  logout: () => {
    window.location.replace('/dip/api/session/v1/logout')
    Cookies.remove('dip.access_token')
    set({
      userInfo: null,
      isAuthenticated: false,
    })
  },
}))
