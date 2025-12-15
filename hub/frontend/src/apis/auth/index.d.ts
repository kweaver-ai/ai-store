import type { HttpResponse } from '../../utils/http/types'

// 登录请求参数
export interface LoginParams {
  username: string
  password: string
}

// 登录响应数据
export interface LoginResponse {
  accessToken: string
  refreshToken: string
  userInfo: {
    id: string
    username: string
    email?: string
    avatar?: string
    [key: string]: any
  }
}

// 刷新 Token 请求参数
export interface RefreshTokenParams {
  refreshToken: string
}

// 刷新 Token 响应数据
export interface RefreshTokenResponse {
  accessToken: string
  refreshToken?: string
}

