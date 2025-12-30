import { del, get, post } from '@/utils/http'
import type {
  AgentInfo,
  AgentList,
  ApplicationBasicInfo,
  ApplicationInfo,
  OntologyInfo,
  OntologyList,
  PinMicroAppParams,
  PinnedMicroAppsResponse,
} from './index.d'

// 导出类型定义（仅导出外部使用的类型）
export type { ApplicationInfo, ApplicationBasicInfo, OntologyInfo, AgentInfo }

/**
 * 安装应用
 * OpenAPI: POST /applications (application/octet-stream, binary)
 * @returns 应用信息
 */
export const postApplications = (file: Blob | ArrayBuffer): Promise<ApplicationInfo> => {
  return post(`/api/dip-hub/v1/applications`, {
    body: file,
    headers: { 'Content-Type': 'application/octet-stream' },
  })
}

/**
 * 获取应用列表
 * @returns 应用列表
 */
export const getApplications = (): Promise<ApplicationInfo[]> => get(`/api/dip-hub/v1/applications`)

/**
 * 配置应用（业务知识网络 & 智能体）
 * OpenAPI: PUT /applications/config?app_id=xxx
 */
// export const putApplicationsConfig = (
//   appId: string,
//   body: ApplicationConfigRequest,
// ): Promise<ApplicationInfo> =>
//   put(`/api/dip-hub/v1/applications/config`, {
//     params: { app_id: appId },
//     body,
//   })

/**
 * 查看应用基础信息
 * OpenAPI: GET /applications/basic-info?app_id=xxx 或 ?package_name=xxx
 * 支持通过 appId 或 packageName 任意一个参数查询
 */
export const getApplicationsBasicInfo = (id?: number): Promise<ApplicationBasicInfo> => {
  return get(`/api/dip-hub/v1/applications/basic-info`, { params: { id } })
}

/**
 * 查看业务知识网络配置
 * OpenAPI: GET /applications/ontologies?app_id=xxx
 */
export const getApplicationsOntologies = (id: number): Promise<OntologyList> =>
  get(`/api/dip-hub/v1/applications/ontologies`, { params: { id } })

/**
 * 查看智能体配置
 * OpenAPI: GET /applications/agents?app_id=xxx
 */
export const getApplicationsAgents = (id: number): Promise<AgentList> =>
  get(`/api/dip-hub/v1/applications/agents`, { params: { id } })

/**
 * 卸载应用
 * @param key 应用唯一标识
 */
export const deleteApplications = (id: number): Promise<void> => {
  return del(`/api/dip-hub/v1/applications/${id}`)
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
