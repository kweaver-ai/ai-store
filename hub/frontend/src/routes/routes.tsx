import { lazy, type ReactNode } from 'react'
import type { RouteObject } from 'react-router-dom'
import type { MenuProps } from 'antd'
import { ProtectedRoute } from './ProtectedRoute'
import ApplicationIcon from '@/assets/images/applications.svg?react'
import AppStoreIcon from '@/assets/images/app-store.svg?react'

const MyApp = lazy(() => import('../pages/MyApp'))
const AppStore = lazy(() => import('../pages/AppStore'))

export interface RouteConfig {
  path?: string
  element?: ReactNode | null
  key?: string
  label?: string
  icon?: ReactNode
  disabled?: boolean
  /** 是否在侧边栏展示 */
  showInSidebar?: boolean
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
    icon: <ApplicationIcon />,
    element: (
      <ProtectedRoute>
        <MyApp />
      </ProtectedRoute>
    ),
    showInSidebar: true,
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
    icon: <AppStoreIcon />,
    element: (
      <ProtectedRoute>
        <AppStore />
      </ProtectedRoute>
    ),
    showInSidebar: true,
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
 * 支持动态路由匹配（如 /application/:appKey/*）
 */
export const getRouteByPath = (path: string): RouteConfig | undefined => {
  // 移除前导斜杠
  const normalizedPath = path.startsWith('/') ? path.slice(1) : path

  // 先尝试精确匹配
  const exactMatch = routeConfigs.find((route) => route.path === normalizedPath)
  if (exactMatch) return exactMatch

  // 匹配动态路由 /application/:appKey/*
  const appRouteMatch = normalizedPath.match(/^application\/([^/]+)/)
  if (appRouteMatch) {
    // 返回一个虚拟的路由配置，用于微应用
    return {
      path: normalizedPath,
      key: `micro-app-${appRouteMatch[1]}`,
      label: appRouteMatch[1], // 默认使用 appKey，后续可以从微应用列表获取
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

// 这里保留路由配置和侧边栏菜单构建逻辑，面包屑由微应用全局状态驱动，详见 MicroAppHeader 与 micro-app/globalState.ts
