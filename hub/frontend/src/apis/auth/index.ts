import { post } from '../../utils/http'
import type { LoginParams, LoginResponse } from './index.d'

/**
 * 登录接口
 */
export function loginApi(params: LoginParams): Promise<LoginResponse> {
  return post('/auth/login', {
    body: params,
    headers: {
      Authorization: '',
      Token: '',
    },
  })
}

/**
 * 登出接口
 */
export function logoutApi(): Promise<void> {
  return post('/auth/logout')
}

/**
 * 获取用户信息接口
 */
export function getUserInfoApi(): Promise<LoginResponse['userInfo']> {
  return post('/auth/userinfo')
}
