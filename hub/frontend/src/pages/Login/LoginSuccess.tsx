import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Spin } from 'antd'
import { useUserInfoStore } from '@/stores'
import { getFirstVisibleSidebarRoute } from '@/routes/utils'

const LoginSuccess = () => {
  const navigate = useNavigate()
  const { fetchUserInfo, userInfo, isLoading } = useUserInfoStore()

  useEffect(() => {
    // 登录成功后获取用户信息
    fetchUserInfo()
  }, [fetchUserInfo])

  useEffect(() => {
    // 用户信息加载完成后，根据权限跳转
    // 注意：如果有 asredirect 参数，后端会直接重定向到该地址，不会到 login-success 页面
    // 所以这里只需要处理没有 asredirect 的情况（跳转到首页）
    if (!isLoading && userInfo) {
      // TODO: 角色信息需要从其他地方获取，暂时使用空数组
      const roleIds = new Set<string>([])
      const firstRoute = getFirstVisibleSidebarRoute(roleIds)
      const to = firstRoute?.path ? `/${firstRoute.path}` : '/'
      navigate(to, { replace: true })
    } else if (!isLoading && !userInfo) {
      // 如果获取用户信息失败，跳转到登录失败页面
      navigate('/login-failed', { replace: true })
    }
  }, [isLoading, userInfo, navigate])

  return (
    <div className="w-full h-full flex items-center justify-center">
      <Spin size="large" />
    </div>
  )
}

export default LoginSuccess
