import { post, get, del } from '@/utils/http'
import type { ListResponse, PageParams } from '../types'
import type {
  Application,
  PinnedMicroAppsResponse,
  PinMicroAppParams,
} from './index.d'

/**
 * 安装应用
 * @param appId 应用ID
 * @returns 应用信息
 */
// 文件上传
export const postApplications = (file: FormData): Promise<void> => {
  return post(`/api/dip-hub/v1/applications`, {
    body: file,
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

/**
 * 获取应用列表
 * @param params 分页参数
 * @returns 应用列表
 */
export const getApplications = (
  params: PageParams = {}
): Promise<ListResponse<Application>> => {
  // return get(`/api/dip-hub/v1/applications`, { params })
  return Promise.resolve({
    entries: [
      {
        id: 1,
        key: 'micro-app-two',
        name: 'micro-app-two',
        icon: '',
        version: '1.0.0',
        category: 'micro-app',
        config: {
          headless: false,
        },
        updated_by: 'admin',
        updated_at: '2021-01-01 12:00:00',
      },
      {
        id: 1,
        key: 'micro-app-two',
        name: 'micro-app-two',
        icon: '',
        version: '1.0.0',
        category: 'micro-app',
        config: {
          headless: false,
        },
        updated_by: 'admin',
        updated_at: '2021-01-01 12:00:00',
      },
      {
        id: 1,
        key: 'micro-app-two',
        name: 'micro-app-two',
        icon: '',
        version: '1.0.0',
        category: 'micro-app',
        config: {
          headless: false,
        },
        updated_by: 'admin',
        updated_at: '2021-01-01 12:00:00',
      },
      {
        id: 1,
        key: 'micro-app-two',
        name: 'micro-app-two',
        icon: '',
        version: '1.0.0',
        category: 'micro-app',
        config: {
          headless: false,
        },
        updated_by: 'admin',
        updated_at: '2021-01-01 12:00:00',
      },
      {
        id: 1,
        key: 'micro-app-two',
        name: 'micro-app-two',
        icon: '',
        version: '1.0.0',
        category: 'micro-app',
        config: {
          headless: false,
        },
        updated_by: 'admin',
        updated_at: '2021-01-01 12:00:00',
      },
      {
        id: 1,
        key: 'micro-app-two',
        name: 'micro-app-two',
        icon: '',
        version: '1.0.0',
        category: 'micro-app',
        config: {
          headless: false,
        },
        updated_by: 'admin',
        updated_at: '2021-01-01 12:00:00',
      },
    ],
    total: 6,
  })
}

/**
 * 查看应用配置
 * @param key 应用唯一标识
 * @param item 配置项
 * @returns 应用配置
 */
export const getApplicationsConfig = (
  key: string,
  item: string
): Promise<any> => {
  return get(`/api/dip-hub/v1/applications/${key}/config/${item}`)
}

/**
 * 卸载应用
 * @param key 应用唯一标识
 */
export const deleteApplications = (key: string): Promise<void> => {
  return del(`/api/dip-hub/v1/applications/${key}`)
}

/**
 * 获取钉住的微应用列表
 */
export async function getPinnedMicroAppsApi(): Promise<PinnedMicroAppsResponse> {
  // TODO: 替换为真实接口
  // return get('/micro-app/pinned')

  // Mock 数据
  await new Promise((resolve) => setTimeout(resolve, 200))
  return {
    appIds: [],
  }
}

/**
 * 钉住/取消钉住微应用
 */
export async function pinMicroAppApi(params: PinMicroAppParams): Promise<void> {
  // TODO: 替换为真实接口
  // return post('/micro-app/pin', { body: params })

  // Mock 数据
  await new Promise((resolve) => setTimeout(resolve, 200))
  console.log('Pin micro app:', params) // 避免未使用警告
}
