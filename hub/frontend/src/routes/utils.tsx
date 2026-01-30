import { usePreferenceStore } from '@/stores'
import { BASE_PATH } from '@/utils/config'
import { routeConfigs } from './routes'
import type { RouteConfig } from './types'

/**
 * 根据路径获取路由配置
 * 支持动态路由匹配（如 /application/:appId/*）
 * 自动处理 BASE_PATH 前缀，调用方无需手动移除
 */
export const getRouteByPath = (path: string): RouteConfig | undefined => {
  // 先移除 BASE_PATH 前缀（如果存在）
  let processedPath = path
  if (BASE_PATH !== '/' && path.startsWith(BASE_PATH)) {
    processedPath = path.slice(BASE_PATH.length) || '/'
  }

  // 移除前导斜杠
  const normalizedPath = processedPath.startsWith('/') ? processedPath.slice(1) : processedPath

  // 匹配动态路由 /application/:appId/*
  const appRouteMatch = normalizedPath.match(/^application\/([^/]+)/)
  if (appRouteMatch) {
    return {
      path: normalizedPath,
      key: `micro-app-${appRouteMatch[1]}`,
      label: appRouteMatch[1],
      showInSidebar: false,
    }
  }

  // 优先精确匹配
  const exactMatch = routeConfigs.find((route) => route.path === normalizedPath)
  if (exactMatch) return exactMatch

  // 按前缀匹配（处理子路径）
  return routeConfigs.find(
    (route) => route.path && `${normalizedPath}/`.startsWith(`${route.path}/`),
  )
}

/**
 * 根据 key 获取路由配置
 */
export const getRouteByKey = (key: string): RouteConfig | undefined => {
  return routeConfigs.find((route) => route.key === key)
}

/**
 * 判断路由是否对用户可见
 * TODO: 当前没有角色系统，所有路由都允许访问，直接返回 true
 */
export const isRouteVisibleForRoles = (route: RouteConfig, roleIds: Set<string>): boolean => {
  // 当前没有角色系统，所有路由都允许访问
  return true
  // 以下代码为角色系统的实现（暂时禁用）
  // const required = route.requiredRoleIds
  // if (!required || required.length === 0) return true
  // if (roleIds.size === 0) return false
  // return required.some((id) => roleIds.has(id))
}

export const getFirstVisibleSidebarRoute = (roleIds: Set<string>): RouteConfig | undefined => {
  return routeConfigs.find((r) => r.showInSidebar && r.key && isRouteVisibleForRoles(r, roleIds))
}

/**
 * 根据 siderType 获取第一个有权限的路由
 * 用于在点击分类菜单（如 AI Store、DIP Studio）时跳转到该分类下的第一个可访问路由
 *
 * @param siderType 侧边栏类型：'store' | 'studio' | 'home'
 * @param roleIds 用户角色ID集合
 * @returns 第一个有权限的路由配置，如果没有则返回 undefined
 */
export const getFirstVisibleRouteBySiderType = (
  siderType: 'store' | 'studio' | 'home',
  roleIds: Set<string>,
): RouteConfig | undefined => {
  // home 类型固定返回 /application/1
  if (siderType === 'home') {
    return {
      path: 'application/1',
      key: 'micro-app-1',
      label: '问数',
      showInSidebar: false,
    }
  }

  return routeConfigs.find((route) => {
    // 必须在侧边栏显示
    const hasSidebar = route.showInSidebar && route.key
    if (!hasSidebar) {
      return false
    }

    // 必须有权限访问
    const hasPermission = isRouteVisibleForRoles(route, roleIds)
    if (!hasPermission) {
      return false
    }

    // 匹配 siderType（如果没有配置 siderType，默认属于 store）
    const routeSiderType = route.handle?.layout?.siderType || 'store'
    return routeSiderType === siderType
  })
}

/**
 * 从路径中移除 BASE_PATH 前缀
 * 用于处理包含 BASE_PATH 的完整路径，转换为 React Router navigate 可用的相对路径
 * 因为 React Router 配置了 basename，navigate 会自动处理 basename
 *
 * @param path 包含 BASE_PATH 的完整路径（如 /dip-hub/application/123）
 * @returns 移除 BASE_PATH 后的相对路径（如 /application/123）
 */
export const removeBasePath = (path: string): string => {
  if (BASE_PATH === '/' || !path.startsWith(BASE_PATH)) {
    return path
  }
  return path.slice(BASE_PATH.length) || '/'
}

/**
 * 通过固定应用 key（WENSHU_APP_KEY）解析默认微应用路由
 * - 成功时返回 /application/{id}
 * - 失败或找不到应用时返回 /application/error
 */
export const resolveDefaultMicroAppPath = async (): Promise<string> => {
  // 优先使用当前 store 中缓存的 wenshu 应用信息
  let { fetchPinnedMicroApps, wenshuAppInfo } = usePreferenceStore.getState()

  if (wenshuAppInfo) {
    return `/application/${wenshuAppInfo.id}`
  }

  // 如果还没有数据，则触发一次加载
  try {
    await fetchPinnedMicroApps()
    const state = usePreferenceStore.getState()
    wenshuAppInfo = state.wenshuAppInfo

    if (wenshuAppInfo) {
      return `/application/${wenshuAppInfo.id}`
    }
  } catch {
    // 加载失败时，后续直接走兜底逻辑
  }

  return '/application/error'
}
