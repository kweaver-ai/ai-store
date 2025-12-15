// import { get } from '../../utils/http' // TODO: 真实接口时取消注释
import { AppFixedStatus, type AppInfo, type GetAppListParams } from './index.d'
import type { PageResponse } from '../type'

// 重新导出类型和 enum，使其可以从 index 直接导入
export { AppFixedStatus, type AppInfo, type GetAppListParams }

/**
 * 获取应用列表接口（mock 方法）
 */
export async function getAppListApi(
  _params: GetAppListParams
): Promise<PageResponse<AppInfo>> {
  // 模拟 API 延迟
  console.log('getAppListApi', _params)
  await new Promise((resolve) => setTimeout(resolve, 300))

  // Mock 数据 - 返回空列表，模拟没有应用的情况
  // 如果需要测试有应用的情况，可以取消下面的注释
  /*
  return {
    apps: [
      {
        appId: 'app-1',
        appName: '数据分析应用',
        appDescription: '用于数据分析和可视化',
        appIcon: '',
        createTime: 1709540220000,
        updateTime: 1709540220000,
        version: 'v0.0.1',
        createdBy: '1234567890',
        createdByName: '张三',
        createdByAvatar: 'https://example.com/avatar.jpg',
        fixedStatus:'fixed',
      },
      {
        appId: 'app-2',
        appName: '智能助手',
        appDescription: 'AI 智能助手应用',
        appIcon: '',
        createTime: 1709540220000,
        updateTime: 1709540220000,
        version: 'v0.0.1',
        createdBy: '1234567890',
        createdByName: '张三',
        createdByAvatar: 'https://example.com/avatar.jpg',
        fixedStatus: 'unfixed',
      },
    ],
    total: 2,
  }
  */

  return {
    entries: [],
    total: 0,
  }
}
