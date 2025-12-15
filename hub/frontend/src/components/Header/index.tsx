import { useState, useEffect, useMemo, useCallback } from 'react'
import { Layout } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore, useMicroAppStore } from '../../stores'
import {
  onMicroAppGlobalStateChange,
  type MicroAppGlobalState,
} from '../../utils/micro-app/globalState'
import type { BreadcrumbItem } from './types'
import { AppMenu } from './AppMenu'
import { Breadcrumb } from './Breadcrumb'
import { CopilotButton } from './CopilotButton'
import { UserInfo } from './UserInfo'

const { Header: AntHeader } = Layout

const Header = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { userInfo } = useAuthStore()
  const { currentMicroApp } = useMicroAppStore()

  const [microAppBreadcrumb, setMicroAppBreadcrumb] = useState<
    Array<{ title: string; path?: string; icon?: string }>
  >([])

  const isMicroAppRoute = location.pathname.startsWith('/app/')

  // 监听微应用的全局状态（面包屑）
  useEffect(() => {
    if (!isMicroAppRoute) {
      setMicroAppBreadcrumb([])
      return
    }

    const unsubscribe = onMicroAppGlobalStateChange(
      (state: MicroAppGlobalState) => {
        if (state.breadcrumb) {
          setMicroAppBreadcrumb(state.breadcrumb)
        }
      },
      true
    )

    return () => {
      unsubscribe()
    }
  }, [isMicroAppRoute])

  // 获取面包屑项
  const breadcrumbItems: BreadcrumbItem[] = useMemo(() => {
    if (!isMicroAppRoute || microAppBreadcrumb.length === 0) {
      return []
    }

    return microAppBreadcrumb.map((item, index) => {
      let fullPath = item.path
      const itemPath = item.path

      if (itemPath && currentMicroApp?.routeBasename) {
        const mainAppRoutes = ['/home', '/login']
        const isMainAppRoute = mainAppRoutes.some((route) =>
          itemPath.startsWith(route)
        )

        if (isMainAppRoute) {
          fullPath = itemPath
        } else if (itemPath === '/') {
          fullPath = `${currentMicroApp.routeBasename}/`
        } else if (!itemPath.startsWith('/')) {
          fullPath = `${currentMicroApp.routeBasename}/${itemPath}`
        } else if (!itemPath.startsWith('/app/')) {
          fullPath = `${currentMicroApp.routeBasename}${itemPath}`
        }
      }

      return {
        key: `micro-breadcrumb-${index}`,
        name: item.title,
        path: fullPath,
        icon: index === 0 ? item.icon : undefined,
      }
    })
  }, [isMicroAppRoute, microAppBreadcrumb, currentMicroApp?.routeBasename])

  // 面包屑导航跳转
  const handleBreadcrumbNavigate = useCallback(
    (item: BreadcrumbItem) => {
      if (!item.path) return

      if (
        isMicroAppRoute &&
        item.path.startsWith('/') &&
        !item.path.startsWith('/app/')
      ) {
        window.location.href = item.path
      } else {
        navigate(item.path)
      }
    },
    [isMicroAppRoute, navigate]
  )

  // Copilot 按钮点击
  const handleCopilotClick = useCallback(() => {
    // TODO: 打开 Copilot 面板
    console.log('Copilot clicked')
  }, [])

  return (
    <AntHeader className="h-[52px] bg-white border-b border-gray-200 flex items-center justify-between px-3 fixed top-0 left-0 right-0 z-10">
      {/* 左侧：应用菜单和面包屑 */}
      <div className="flex items-center gap-x-2">
        <AppMenu />
        <Breadcrumb
          items={breadcrumbItems}
          onNavigate={handleBreadcrumbNavigate}
        />
      </div>

      {/* 右侧：Copilot 按钮和用户信息 */}
      <div className="flex items-center gap-x-4">
        {isMicroAppRoute && <CopilotButton onClick={handleCopilotClick} />}
        <UserInfo username={userInfo?.username || userInfo?.name || 'Admin'} />
      </div>
    </AntHeader>
  )
}

export default Header
