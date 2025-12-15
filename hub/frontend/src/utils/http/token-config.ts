import axios from 'axios'
import Cookies from 'js-cookie'

export interface HttpConfig {
  accessToken: string
  refreshToken?: () => Promise<{ accessToken: string }>
  onTokenExpired?: (code?: number) => void
}

const ACCESS_TOKEN_KEY = 'dip.access_token'

/**
 * 获取当前 access token（从 Cookie 读取，保证获取最新值）
 */
export function getAccessToken(): string {
  return Cookies.get(ACCESS_TOKEN_KEY) || ''
}

// 刷新中的 Promise，用于实现"第一个 401 触发刷新，其它等待结果"的队列逻辑
let refreshingPromise: Promise<{ accessToken: string }> | null = null

async function doRefreshTokenRequest(): Promise<{ accessToken: string }> {
  const response = await axios.get<{ accessToken: string }>(
    '/af/api/session/v1/refresh-token'
  )
  const newToken = response.data?.accessToken
  if (!newToken) {
    throw new Error('刷新 token 接口未返回 accessToken')
  }
  Cookies.set(ACCESS_TOKEN_KEY, newToken)
  return { accessToken: newToken }
}

/**
 * 默认的刷新 token 实现：
 * - 保证同一时间只会有一个真实的刷新请求
 * - 其它调用方共用这一次请求的结果
 */
export function defaultRefreshToken(): Promise<{ accessToken: string }> {
  if (!refreshingPromise) {
    refreshingPromise = doRefreshTokenRequest().finally(() => {
      refreshingPromise = null
    })
  }

  return refreshingPromise
}

const onTokenExpired = (code?: number) => {
  window.location.href = '/login'
}

export const httpConfig: HttpConfig = {
  get accessToken() {
    // 使用 getter，每次访问时都从 Cookie 读取最新值
    return getAccessToken()
  },
  refreshToken: defaultRefreshToken,
  onTokenExpired: onTokenExpired,
}
