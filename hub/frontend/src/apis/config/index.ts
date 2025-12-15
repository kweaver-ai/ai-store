import { get, post } from '@/utils/http'
import type { AppConfigResponse } from './index.d'

/**
 * 获取应用配置接口
 */
export function getAppConfigApi(): Promise<AppConfigResponse> {
  return get('/config/app')
}

/**
 * 更新语言配置接口
 */
export function postLanguageApi(language: string): Promise<void> {
  return post('/config/app', { body: { language } })
}

