import { lazy } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import type { RouteObject } from 'react-router-dom'
import { routeConfigs } from './routes'
import { ProtectedRoute } from './ProtectedRoute'

const Login = lazy(() => import('../pages/Login'))
const AppContainer = lazy(() => import('../pages/MicroAppContainer'))
const GlobalLayout = lazy(() => import('../layout/GlobalLayout'))
const NotFound = lazy(() => import('../pages/ErrorPage/NotFound'))
const NoAccess = lazy(() => import('../pages/ErrorPage/NoAccess'))

/**
 * 从路由配置生成 React Router 路由
 * 过滤掉占位路由（element 为 null 的）
 */
const generateRoutesFromConfig = (): RouteObject[] => {
  return routeConfigs
    .filter((route) => route.element !== null && route.element !== undefined)
    .map(
      ({
        key,
        label,
        icon,
        showInSidebar,
        showInBreadcrumb,
        disabled,
        ...route
      }) => {
        const { element, path, handle, children } = route
        return {
          path,
          element,
          handle,
          children,
        } as RouteObject
      }
    )
}

/**
 * 路由配置
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <GlobalLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/my-app" replace />,
      },
      {
        path: 'login',
        element: <Login />,
        // 登录页不需要侧边栏和导航栏
        handle: {
          layout: {
            hasSider: false,
            hasHeader: false,
          },
        },
      },
      // 从配置生成的路由
      ...generateRoutesFromConfig(),
      // 动态路由（微应用容器）
      {
        path: 'app/:name/*',
        element: (
          <ProtectedRoute>
            <AppContainer />
          </ProtectedRoute>
        ),
        handle: {
          layout: {
            hasSider: false,
            hasHeader: true,
          },
        },
      },
    ],
  },
  // 403 页面
  {
    path: '403',
    element: <NoAccess />,
  },
  // 404 页面
  {
    path: '*',
    element: <NotFound />,
  },
])
