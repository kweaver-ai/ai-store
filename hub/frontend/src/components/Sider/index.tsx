import { useState, useMemo, useCallback } from 'react'
import { Layout, Avatar, message, Tooltip } from 'antd'
import { LogoutOutlined } from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore, usePreferenceStore } from '@/stores'
import {
  getFirstVisibleSidebarRoute,
  getRouteByPath,
  isRouteVisibleForRoles,
} from '@/routes/utils'
import { routeConfigs } from '@/routes/routes'
import type { ApplicationInfo } from '@/apis/dip-hub'
import type { MenuProps } from 'antd'
import clsx from 'classnames'
import LogoIcon from '@/assets/images/brand/logo.svg?react'
import SidebarSystemIcon from '@/assets/images/sider/proton.svg?react'
import SidebarAiDataPlatformIcon from '@/assets/images/sider/adp.svg?react'
import { BottomLinkItem } from './BottomLinkItem'
import { SiderMenuItem } from './SiderMenuItem'
import { UserMenuItem } from './UserMenuItem'
import IconFont from '../IconFont'

const { Sider: AntdSider } = Layout

interface SiderProps {
  /** 是否折叠 */
  collapsed: boolean
  /** 折叠状态改变回调 */
  onCollapse: (collapsed: boolean) => void
  /** 顶部偏移量 */
  topOffset?: number
}

const Sider = ({ collapsed, onCollapse, topOffset = 0 }: SiderProps) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { userInfo, logout } = useAuthStore()
  const { pinnedMicroApps, unpinMicroApp } = usePreferenceStore()

  // TODO: 微应用列表获取待实现
  const [microApps] = useState<ApplicationInfo[]>([])
  const roleIds = useMemo(() => new Set(userInfo?.role_ids ?? []), [userInfo])
  const firstVisibleRoute = useMemo(
    () => getFirstVisibleSidebarRoute(roleIds),
    [roleIds]
  )

  // 根据当前路由确定选中的菜单项
  const getSelectedKey = () => {
    const pathname = location.pathname
    if (pathname === '/') {
      // 根路径默认选中“第一个可见菜单”
      return firstVisibleRoute?.key || 'my-app'
    }
    const route = getRouteByPath(pathname)

    // 如果是微应用路由
    if (pathname.startsWith('/application/')) {
      const appKey = pathname.split('/')[2]
      return `micro-app-${appKey}`
    }

    return route?.key || 'my-app'
  }

  const handleItemClick = (key: string) => {
    if (key.startsWith('micro-app-')) {
      const appKey = key.replace('micro-app-', '')
      window.open(`/application/${appKey}`, '_blank')
      return
    }

    const route = routeConfigs.find((item) => item.key === key)
    if (route && !route.disabled && route.path) {
      navigate(`/${route.path}`)
    }
  }

  // 处理打开微应用
  const handleOpenApp = useCallback((appKey: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
    }
    window.open(`/application/${appKey}`, '_blank')
  }, [])

  // 处理取消钉住
  const handleUnpin = useCallback(
    async (appKey: string, e?: React.MouseEvent) => {
      if (e) {
        e.stopPropagation()
      }
      try {
        await unpinMicroApp(appKey)
        message.success('已取消钉住')
      } catch (error) {
        console.error('Failed to unpin micro app:', error)
        message.error('取消钉住失败，请稍后重试')
      }
    },
    [unpinMicroApp]
  )

  const openExternal = useCallback((url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }, [])

  // 构建侧边栏各区块数据
  const sidebarData = useMemo(() => {
    const visibleSidebarRoutes = routeConfigs
      .filter((route) => route.showInSidebar && route.key)
      .filter((route) => isRouteVisibleForRoles(route, roleIds))

    const toRouteItem = (route: (typeof visibleSidebarRoutes)[number]) => ({
      key: route.key!,
      label: route.label || route.key!,
      iconUrl: route.iconUrl,
      disabled: route.disabled,
      type: 'route' as const,
    })

    const myAppItem = visibleSidebarRoutes.find((r) => r.key === 'my-app')
      ? toRouteItem(visibleSidebarRoutes.find((r) => r.key === 'my-app')!)
      : null

    const appStoreItem = visibleSidebarRoutes.find((r) => r.key === 'app-store')
      ? toRouteItem(visibleSidebarRoutes.find((r) => r.key === 'app-store')!)
      : null

    const pinnedItems = pinnedMicroApps
      .map((appId) => {
        const app = microApps.find((a) => a.name === appId)
        if (!app) return null
        return {
          key: `micro-app-${app.name}`,
          label: app.name,
          icon: (
            <Avatar
              shape="square"
              size={16}
              src={app.icon ? `data:image/png;base64,${app.icon}` : undefined}
            />
          ),
          type: 'pinned' as const,
          onContextMenu: [
            {
              key: 'open',
              label: '打开',
              onClick: () => handleOpenApp(app.name),
            },
            {
              key: 'unpin',
              label: '取消钉住',
              onClick: () => handleUnpin(app.name),
            },
          ] as MenuProps['items'],
        }
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)

    // Figma 顺序：AI Data Platform（y=622）在上，系统工作台（y=663）在下
    const externalItems = [
      {
        key: 'data-platform',
        label: 'AI Data Platform',
        icon: <SidebarAiDataPlatformIcon />,
        type: 'external' as const,
        onClick: () => openExternal('https://dip.aishu.cn/'),
      },
      {
        key: 'system',
        label: '系统工作台',
        icon: <SidebarSystemIcon />,
        type: 'external' as const,
        onClick: () => openExternal('https://anyshare.aishu.cn/'),
      },
    ]

    return { myAppItem, pinnedItems, appStoreItem, externalItems }
  }, [
    pinnedMicroApps,
    microApps,
    handleOpenApp,
    handleUnpin,
    openExternal,
    roleIds,
  ])

  const siderWidth = collapsed ? 60 : 240
  const selectedKey = getSelectedKey()

  return (
    <AntdSider
      width={240}
      collapsedWidth={60}
      collapsible
      collapsed={collapsed}
      trigger={null}
      className="bg-white/85 backdrop-blur-[6px] shadow-[inset_-1px_0_0_rgba(0,0,0,0.1)]"
      style={{
        left: 0,
        width: siderWidth,
        height: `calc(100vh - ${topOffset}px)`,
        top: topOffset,
        bottom: 0,
      }}
    >
      <div className="flex flex-col h-full px-0 pt-4 pb-2 overflow-hidden">
        {/* logo + 收缩按钮 */}
        <div
          className={clsx(
            'flex items-center gap-2 pb-4',
            collapsed
              ? 'justify-center pl-1.5 pr-1.5'
              : 'justify-between pl-3 pr-2'
          )}
        >
          <LogoIcon className={clsx('h-6 w-auto', collapsed && 'hidden')} />
          <Tooltip title={collapsed ? '展开' : '收起'} placement="right">
            <span
              className={clsx(
                'text-sm cursor-pointer flex items-center justify-center w-8 h-8 rounded-md text-[--dip-text-color] hover:text-[--dip-primary-color]'
              )}
              onClick={() => onCollapse(!collapsed)}
            >
              <IconFont type="icon-dip-cebianlan" />
            </span>
          </Tooltip>
        </div>

        {/* 应用菜单（my-app） + 钉住的应用  */}
        <div className="flex flex-col gap-2">
          {sidebarData.myAppItem && (
            <SiderMenuItem
              item={sidebarData.myAppItem}
              collapsed={collapsed}
              selectedKey={selectedKey}
              onItemClick={handleItemClick}
            />
          )}
          {sidebarData.pinnedItems.map((item) => (
            <SiderMenuItem
              key={item.key}
              item={item}
              collapsed={collapsed}
              selectedKey={selectedKey}
              onItemClick={handleItemClick}
            />
          ))}
        </div>

        {/* 分割线 */}
        {(sidebarData.myAppItem || sidebarData.pinnedItems.length > 0) && (
          <div className="h-px bg-[--dip-border-color] my-2 ml-px mr-4" />
        )}

        {/* 应用商店（app-store） */}
        <div className="flex flex-col gap-2">
          {sidebarData.appStoreItem && (
            <SiderMenuItem
              item={sidebarData.appStoreItem}
              collapsed={collapsed}
              selectedKey={selectedKey}
              onItemClick={handleItemClick}
            />
          )}
        </div>

        {/* 中间留空 */}
        <div className="flex-1 min-h-4" />

        {/* AI Data Platform + 系统工作台 */}
        <div className="flex flex-col gap-0">
          {sidebarData.externalItems.map((item) => {
            return (
              <BottomLinkItem
                item={item}
                collapsed={collapsed}
                onClick={item.onClick}
              />
            )
          })}
        </div>

        {/* 分割线 */}
        <div className="h-px bg-[--dip-border-color] my-2 mx-1.5" />

        {/* 用户 */}
        <UserMenuItem collapsed={collapsed} />
      </div>
    </AntdSider>
  )
}

export default Sider
