import { routeConfigs } from './routes'
import type { RouteConfig } from './types'

/**
 * 根据路径获取路由配置
 * 支持动态路由匹配（如 /application/:appId/*）
 */
export const getRouteByPath = (path: string): RouteConfig | undefined => {
  // 移除前导斜杠
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path

  // 先尝试精确匹配
  const exactMatch = routeConfigs.find((route) => route.path === normalizedPath)
  if (exactMatch) return exactMatch

  // 匹配动态路由 /application/:appId/*
  const appRouteMatch = normalizedPath.match(/^application\/([^/]+)/)
  if (appRouteMatch) {
    // 返回一个虚拟的路由配置，用于微应用
    return {
      path: normalizedPath,
      key: `micro-app-${appRouteMatch[1]}`,
      label: appRouteMatch[1], // 默认使用 appId，后续可以从微应用列表获取
      showInSidebar: false,
    }
  }

  return undefined
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
export const isRouteVisibleForRoles = (
  route: RouteConfig,
  roleIds: Set<string>
): boolean => {
  // 当前没有角色系统，所有路由都允许访问
  return true
  // 以下代码为角色系统的实现（暂时禁用）
  // const required = route.requiredRoleIds
  // if (!required || required.length === 0) return true
  // if (roleIds.size === 0) return false
  // return required.some((id) => roleIds.has(id))
}

export const getFirstVisibleSidebarRoute = (
  roleIds: Set<string>
): RouteConfig | undefined => {
  return routeConfigs.find(
    (r) => r.showInSidebar && r.key && isRouteVisibleForRoles(r, roleIds)
  )
}
