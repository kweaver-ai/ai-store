import { lazy, useMemo } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import type { RouteObject } from 'react-router-dom'
import { routeConfigs } from './routes'
import { getFirstVisibleSidebarRoute } from './utils'
import { ProtectedRoute } from './ProtectedRoute'
import { useAuthStore } from '../stores/authStore'

const Login = lazy(() => import('../pages/Login'))
const MicroAppContainer = lazy(() => import('../pages/MicroAppContainer'))
const GlobalLayout = lazy(() => import('../layout/GlobalLayout'))
const NotFound = lazy(() => import('../pages/ErrorPage/NotFound'))
const NoAccess = lazy(() => import('../pages/ErrorPage/NoAccess'))
const LoginFailed = lazy(() => import('../pages/ErrorPage/LoginFailed'))

/**
 * 默认首页重定向
 */
const DefaultIndexRedirect = () => {
  const { userInfo } = useAuthStore()

  const roleIds = useMemo(() => new Set(userInfo?.role_ids ?? []), [userInfo])
  const first = useMemo(() => getFirstVisibleSidebarRoute(roleIds), [roleIds])
  const to = first?.path ? `/${first.path}` : '/403'
  return <Navigate to={to} replace />
}

/**
 * 从路由配置生成 React Router 路由
 * 过滤掉占位路由（element 为 null 的）
 */
const generateRoutesFromConfig = (): RouteObject[] => {
  return routeConfigs
    .filter((route) => route.element !== null && route.element !== undefined)
    .map(({ key, label, iconUrl, showInSidebar, disabled, ...route }) => {
      const { element, path, handle, children } = route
      return {
        path,
        element,
        handle,
        children,
      } as RouteObject
    })
}

/**
 * 路由配置
 */
export const router = createBrowserRouter([
  {
    path: 'login',
    element: <Login />,
  },
  // 登录失败页面
  {
    path: 'login-failed',
    element: <LoginFailed />,
  },
  // 403 页面
  {
    path: '403',
    element: <NoAccess />,
  },
  // 受保护区域（除 login/login-failed/403/404 外的所有页面）
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <GlobalLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DefaultIndexRedirect />,
      },
      // 从配置生成的路由
      ...generateRoutesFromConfig(),
      // 动态路由（微应用容器）
      {
        path: 'application/:appName/*',
        element: <MicroAppContainer />,
        handle: {
          layout: {
            hasSider: false,
            hasHeader: true,
          },
        },
      },
    ],
  },
  // 404 页面
  {
    path: '*',
    element: <NotFound />,
  },
])
