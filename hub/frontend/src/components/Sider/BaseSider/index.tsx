import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { Menu, Tooltip } from 'antd'
import clsx from 'clsx'
import { useCallback, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { routeConfigs } from '@/routes/routes'
import type { RouteConfig, SiderType } from '@/routes/types'
import { getFirstVisibleSidebarRoute, getRouteByPath, isRouteVisibleForRoles } from '@/routes/utils'
import { MaskIcon } from '../components/GradientMaskIcon'

interface BaseSiderProps {
  /** 是否折叠 */
  collapsed: boolean
  /** 折叠状态改变回调 */
  onCollapse: (collapsed: boolean) => void
  /** 侧边栏类型（store 或 studio） */
  type: SiderType
}

/**
 * 商店/工作室版块通用的侧边栏（BaseSider）
 * 用于 store 和 studio 类型的侧边栏
 */
const BaseSider = ({ collapsed, onCollapse, type }: BaseSiderProps) => {
  const navigate = useNavigate()
  const location = useLocation()

  // TODO: 角色信息需要从其他地方获取，暂时使用空数组
  const roleIds = useMemo(() => new Set<string>([]), [])
  const firstVisibleRoute = useMemo(() => getFirstVisibleSidebarRoute(roleIds), [roleIds])

  // 根据当前路由确定选中的菜单项
  const getSelectedKey = useCallback(() => {
    const pathname = location.pathname
    if (pathname === '/') {
      return firstVisibleRoute?.key || 'my-app'
    }
    const route = getRouteByPath(pathname)

    // if (pathname.startsWith('/application/')) {
    //   const appId = pathname.split('/')[2]
    //   return `micro-app-${appId}`
    // }

    return route?.key || 'my-app'
  }, [location.pathname, firstVisibleRoute])

  const selectedKey = getSelectedKey()

  const menuItems = useMemo<MenuProps['items']>(() => {
    const hasKey = (route: RouteConfig): route is RouteConfig & { key: string } => {
      return Boolean(route.key)
    }

    const visibleSidebarRoutes = routeConfigs
      .filter((route) => route.showInSidebar && route.key)
      .filter((route) => isRouteVisibleForRoles(route, roleIds))
      .filter((route) => {
        const routeSiderType = route.handle?.layout?.siderType || 'store'
        return routeSiderType === type
      })
      .filter(hasKey)

    const items: MenuProps['items'] = []

    // 1. MyApp (Only for store)
    const myAppIndex = visibleSidebarRoutes.findIndex((r) => r.key === 'my-app')
    if (type === 'store') {
      if (myAppIndex !== -1) {
        const myApp = visibleSidebarRoutes[myAppIndex]
        items.push({
          key: myApp.key,
          label: myApp.label || myApp.key,
          icon: myApp.iconUrl ? (
            <MaskIcon
              url={myApp.iconUrl}
              className="w-4 h-4"
              background={
                selectedKey === myApp.key
                  ? 'linear-gradient(210deg, #1C4DFA 0%, #3FA9F5 100%)'
                  : '#333333'
              }
            />
          ) : null,
          onClick: () => navigate(`/${myApp.path}`),
        })
      }
      if (visibleSidebarRoutes.length > 1) {
        items.push({ type: 'divider' })
      }
    }

    if (type === 'studio') {
      items.push({ type: 'group', label: '项目' })
    }

    // 3. Main Sidebar Items (excluding my-app)
    visibleSidebarRoutes.forEach((route) => {
      if (route.key === 'my-app' && type === 'store') return

      items.push({
        key: route.key,
        label: route.label || route.key,
        icon: route.iconUrl ? (
          <MaskIcon
            url={route.iconUrl}
            className="w-4 h-4"
            background={
              selectedKey === route.key
                ? 'linear-gradient(210deg, #1C4DFA 0%, #3FA9F5 100%)'
                : '#333333'
            }
          />
        ) : null,
        onClick: () => route.path && navigate(`/${route.path}`),
      })
    })

    return items
  }, [type, roleIds, selectedKey, navigate])

  return (
    <div className="flex flex-col h-full px-0 pt-4 pb-2 overflow-hidden">
      {/* 菜单内容 */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden dip-hideScrollbar">
        <Menu
          mode="inline"
          selectedKeys={[selectedKey]}
          items={menuItems}
          inlineCollapsed={collapsed}
          selectable={true}
        />
      </div>

      {/* 分割线 */}
      <div className="h-px bg-[--dip-border-color] my-2 shrink-0" />

      {/* 底部收缩按钮 */}
      <div
        className={clsx(
          'flex items-center',
          collapsed ? 'justify-center' : 'justify-between pl-2 pr-2',
        )}
      >
        <Tooltip title={collapsed ? '展开' : '收起'} placement="right">
          <button
            type="button"
            className="text-sm cursor-pointer flex items-center justify-center w-8 h-8 rounded-md text-[--dip-text-color] hover:text-[--dip-primary-color]"
            onClick={() => onCollapse(!collapsed)}
          >
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </button>
        </Tooltip>
      </div>
    </div>
  )
}

export default BaseSider
