import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../stores'

interface ProtectedRouteProps {
  children: React.ReactNode
}

/**
 * 路由守卫组件（组件包装器形式）
 * 保护需要登录才能访问的路由
 *
 * 使用方式：
 * <Route path="/protected" element={
 *   <ProtectedRoute>
 *     <YourComponent />
 *   </ProtectedRoute>
 * } />
 */
export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated } = useAuthStore()
  const location = useLocation()

  // if (!isAuthenticated) {
  //   // 未登录，重定向到登录页，并保存当前路径以便登录后跳转
  //   return <Navigate to="/login" state={{ from: location }} replace />
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
export function withProtectedRoute<P extends object>(
  Component: React.ComponentType<P>
) {
  return function ProtectedComponent(props: P) {
    const { isAuthenticated } = useAuthStore()
    const location = useLocation()

    if (!isAuthenticated) {
      return <Navigate to="/login" state={{ from: location }} replace />
    }

    return <Component {...props} />
  }
}

export default ProtectedRoute
