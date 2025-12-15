import { lazy, type ReactNode } from 'react'
import type { RouteObject } from 'react-router-dom'
import { AppstoreOutlined, CodeOutlined } from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { ProtectedRoute } from './ProtectedRoute'

const MyApp = lazy(() => import('../pages/MyApp'))
const AppStore = lazy(() => import('../pages/AppStore'))

export interface RouteConfig {
  path?: string
  element?: ReactNode | null
  key?: string
  label?: string
  icon?: ReactNode
  disabled?: boolean
  showInSidebar?: boolean
  showInBreadcrumb?: boolean
  handle?: RouteObject['handle']
  children?: RouteConfig[]
}

/**
 * 路由配置数组
 * 这里定义了所有路由信息，包括路径、组件、菜单显示等
 */
export const routeConfigs: RouteConfig[] = [
  {
    path: 'my-app',
    key: 'my-app',
    label: '应用',
    icon: <AppstoreOutlined />,
    element: (
      <ProtectedRoute>
        <MyApp />
      </ProtectedRoute>
    ),
    showInSidebar: true,
    showInBreadcrumb: true,
    handle: {
      layout: {
        hasSider: true,
        hasHeader: false,
      },
    },
  },
  {
    path: 'app-store',
    key: 'app-store',
    label: '应用商店',
    icon: <CodeOutlined />,
    element: (
      <ProtectedRoute>
        <AppStore />
      </ProtectedRoute>
    ),
    showInSidebar: true,
    showInBreadcrumb: true,
    handle: {
      layout: {
        hasSider: true,
        hasHeader: false,
      },
    },
  },
]

/**
 * 根据路径获取路由配置
 * 支持动态路由匹配（如 /app/:name/*）
 */
export const getRouteByPath = (path: string): RouteConfig | undefined => {
  // 移除前导斜杠
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path

  // 先尝试精确匹配
  const exactMatch = routeConfigs.find((route) => route.path === normalizedPath)
  if (exactMatch) return exactMatch

  // 匹配动态路由 /app/:name/*
  const appRouteMatch = normalizedPath.match(/^app\/([^/]+)/)
  if (appRouteMatch) {
    // 返回一个虚拟的路由配置，用于微应用
    return {
      path: normalizedPath,
      key: `micro-app-${appRouteMatch[1]}`,
      label: appRouteMatch[1], // 默认使用 name，后续可以从微应用列表获取
      showInSidebar: false,
      showInBreadcrumb: true,
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
 * 获取侧边栏菜单项
 */
export const getSidebarMenuItems = (): MenuProps['items'] => {
  return routeConfigs
    .filter((route) => route.showInSidebar && route.key)
    .map((route) => ({
      key: route.key!,
      icon: route.icon,
      label: route.label,
      disabled: route.disabled,
    }))
}

/**
 * 面包屑项接口
 */
export interface BreadcrumbItem {
  title: string
  path?: string
  key?: string
}

/**
 * 根据路径生成完整的面包屑路径
 * @param path 当前路径
 * @param microAppName 微应用名称（如果是微应用路由）
 * @returns 面包屑项数组
 */
export const getBreadcrumbByPath = (
  path: string,
  microAppName?: string
): BreadcrumbItem[] => {
  const items: BreadcrumbItem[] = []

  // 始终包含首页
  items.push({
    title: '首页',
    path: '/home',
    key: 'home',
  })

  // 移除前导斜杠并分割路径
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path
  const pathSegments = normalizedPath.split('/').filter(Boolean)

  // 处理微应用路由 /app/:name/*
  if (pathSegments[0] === 'app' && pathSegments[1]) {
    const appName = microAppName || pathSegments[1]
    items.push({
      title: appName,
      path: `/app/${pathSegments[1]}`,
      key: `micro-app-${pathSegments[1]}`,
    })

    // 如果有子路径，可以继续处理（这里简化处理）
    if (pathSegments.length > 2) {
      items.push({
        title: pathSegments.slice(2).join(' / '),
        key: 'sub-path',
      })
    }
    return items
  }

  // 处理普通路由
  let currentPath = ''
  for (const segment of pathSegments) {
    currentPath = currentPath ? `${currentPath}/${segment}` : segment
    const route = getRouteByPath(currentPath)

    if (route && route.showInBreadcrumb) {
      items.push({
        title: route.label || segment,
        path: `/${currentPath}`,
        key: route.key || currentPath,
      })
    }
  }

  return items
}

/**
 * 根据路径获取面包屑名称（兼容旧接口）
 */
export const getBreadcrumbNameByPath = (path: string): string => {
  const route = getRouteByPath(path)
  return route?.label || ''
}
