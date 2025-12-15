// import { get, post } from '../../utils/http' // TODO: 真实接口时取消注释
import type { MicroAppConfig } from '../../utils/micro-app/type'
import type {
  UploadAppParams,
  UploadAppResponse,
  PinnedMicroAppsResponse,
  PinMicroAppParams,
} from './index.d'

/**
 * 获取所有子应用配置（mock 方法）
 */
export async function getMicroAppList(): Promise<MicroAppConfig[]> {
  // 模拟 API 延迟
  await new Promise((resolve) => setTimeout(resolve, 300))

  // 返回 mock 数据
  return [
    {
      /**
       * arRoutingPrefix = '';
       * hostRoute = `${host}${arRoutingPrefix}`;
       * {
      name: 'anyrobot-web-visualization',
      entry: `//${hostRoute}/web/visualization/v1/`,
      activeRule: [
        ...['new-dashboard', 'vis-share', 'panorama', 'data-explore', 'trace-detail-graph', 'third-party'].map(
          item => `${arRoutingPrefix}/#/home/${item}`
        )
      ]
    },
       */
      // 注意：这里的 name 需要和子应用 package.json 中的 name 保持一致
      // 用于 qiankun 通过 UMD 库名获取生命周期函数
      name: 'anyrobot-web-visualization',
      // 远程生产环境微应用入口（通过代理访问，解决 CORS 问题）
      // 注意：entry 必须是 HTML 文件的 URL，不能包含路由 hash
      // 原始 entry: //10.4.111.16/web/visualization/v1/
      entry: '/micro-app-proxy/web/visualization/v1/',
    },
    {
      // 注意：这里的 name 需要和子应用 package.json 中的 name 保持一致
      // 用于 qiankun 通过 UMD 库名获取生命周期函数
      name: 'micro-app-two',
      entry: 'http://localhost:1101',
    },
  ]
}

/**
 * 根据 ID 获取子应用配置（mock 方法）
 */
export async function getMicroAppById(
  name: string
): Promise<MicroAppConfig | null> {
  const apps = await getMicroAppList()
  return apps.find((app) => app.name === name) || null
}

/**
 * 上传应用接口（mock 方法）
 * @param params 上传参数
 * @param onProgress 上传进度回调
 */
export async function uploadAppApi(
  params: UploadAppParams,
  onProgress?: (progress: number) => void
): Promise<UploadAppResponse> {
  // 模拟上传进度
  const simulateProgress = () => {
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 20
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        onProgress?.(100)
      } else {
        onProgress?.(progress)
      }
    }, 200)
  }

  simulateProgress()

  // 模拟 API 延迟（总上传时间约 2-3 秒）
  await new Promise((resolve) =>
    setTimeout(resolve, 2000 + Math.random() * 1000)
  )

  // 模拟 70% 成功率，30% 失败率
  const isSuccess = Math.random() > 0.3

  if (isSuccess) {
    return {
      appId: `app-${Date.now()}`,
      appName: params.appName,
      status: 'success',
    }
  } else {
    throw new Error('上传失败：文件格式验证未通过或服务器错误')
  }
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
