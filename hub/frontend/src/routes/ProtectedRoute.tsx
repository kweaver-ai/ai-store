import { Navigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useUserInfoStore } from '../stores'
import { getAccessToken } from '@/utils/http/token-config'
import { getRouteByPath, isRouteVisibleForRoles } from './utils'
import { SYSTEM_FIXED_NORMAL_USER_ID } from '@/apis/types'
import { Spin } from 'antd'

interface ProtectedRouteProps {
  children: React.ReactNode
}

/**
 * 路由守卫组件（组件包装器形式）
 * 保护需要登录才能访问的路由
 */
export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { userInfo, isLoading, fetchUserInfo } = useUserInfoStore()
  const location = useLocation()

  // 1) token 校验：无 token 或未登录 -> 登录页
  const token = getAccessToken()

  // 初始化时检查并获取用户信息
  useEffect(() => {
    if (token && !userInfo && !isLoading) {
      // 有token但还没有用户信息，尝试获取
      fetchUserInfo()
    }
  }, [token, userInfo, isLoading, fetchUserInfo])

  // 检查是否在登录相关页面（避免循环重定向）
  const isLoginPage =
    location.pathname === '/login' || location.pathname.endsWith('/login')

  // 如果没有 token 或用户信息，需要重定向到登录页
  if (!token || (!isLoading && !userInfo)) {
    // 如果已经在登录页面，不需要重定向（避免循环重定向）
    if (isLoginPage) {
      return null
    }
    // 跳转到登录页，并携带当前路径作为重定向参数
    // 注意：如果是根路径 `/`，不传递 asredirect，让后端重定向到 login-success，由前端处理首页跳转
    const currentPath = location.pathname + location.search
    const loginUrl =
      currentPath === '/'
        ? '/login'
        : `/login?asredirect=${encodeURIComponent(currentPath)}`
    return <Navigate to={loginUrl} state={{ from: location }} replace />
  }

  // 正在加载用户信息，显示加载状态
  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Spin size="large" />
      </div>
    )
  }

  // 3) 角色校验：无角色 -> 登录失败页
  // TODO: 角色信息需要从其他地方获取，暂时跳过角色校验
  // const roleIds = new Set<string>([])
  // if (roleIds.size === 0) {
  //   return <Navigate to="/login-failed" replace />
  // }

  // 4) 权限校验：根据当前路由绑定的 requiredRoleIds 判断
  // TODO: 当前没有角色系统，所有权限校验都已放开，允许所有用户访问
  // const pathname = location.pathname
  // // 微应用容器：仅"普通用户"角色可访问
  // if (pathname.startsWith('/application/')) {
  //   if (!roleIds.has(SYSTEM_FIXED_NORMAL_USER_ID)) {
  //     return <Navigate to="/403" replace />
  //   }
  //   return <>{children}</>
  // }

  // const route = getRouteByPath(pathname)
  // if (route && !isRouteVisibleForRoles(route, roleIds)) {
  //   return <Navigate to="/403" replace />
  // }

  return <>{children}</>
}

/**
 * 路由守卫高阶组件（HOC 形式）
 *
 * 使用方式：
 * const ProtectedComponent = withProtectedRoute(YourComponent)
 *
 * 或者在路由配置中：
 * <Route path="/protected" element={<ProtectedComponent />} />
 */
// export function withProtectedRoute<P extends object>(
//   Component: React.ComponentType<P>
// ) {
//   return function ProtectedComponent(props: P) {
//     const { userInfo } = useUserInfoStore()
//     const location = useLocation()

//     if (!userInfo) {
//       return <Navigate to="/login" state={{ from: location }} replace />
//     }

//     return <Component {...props} />
//   }
// }

export default ProtectedRoute
