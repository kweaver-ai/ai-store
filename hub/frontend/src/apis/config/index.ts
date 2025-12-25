// TODO: 后端接口待接入，暂时注释导入
// import { get, post } from '@/utils/http'
import type { AppConfigResponse } from './index.d'

/**
 * 获取应用配置接口
 * TODO: 后端接口待接入
 */
export function getAppConfigApi(): Promise<AppConfigResponse> {
  // TODO: 后端接口待接入，暂时返回默认值
  return Promise.resolve({ language: 'zh-CN' })
  // return get('/config/app')
}

/**
 * 更新语言配置接口
 * TODO: 后端接口待接入
 */
export function postLanguageApi(_language: string): Promise<void> {
  // TODO: 后端接口待接入，暂时不执行任何操作
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return Promise.resolve()
  // return post('/config/app', { body: { language } })
}
