import type { MenuProps } from 'antd'
import { Layout, message, Tooltip } from 'antd'
import clsx from 'classnames'
import { useCallback, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import type { ApplicationInfo } from '@/apis/applications'
import LogoIcon from '@/assets/images/brand/logo.svg?react'
import SidebarAiDataPlatformIcon from '@/assets/images/sider/adp.svg?react'
import SidebarSystemIcon from '@/assets/images/sider/proton.svg?react'
import { routeConfigs } from '@/routes/routes'
import type { RouteConfig } from '@/routes/types'
import { getFirstVisibleSidebarRoute, getRouteByPath, isRouteVisibleForRoles } from '@/routes/utils'
import { usePreferenceStore } from '@/stores'
import { useLanguageStore } from '@/stores/languageStore'
import { useOEMConfigStore } from '@/stores/oemConfigStore'
import { getFullPath } from '@/utils/config'
import AppIcon from '../AppIcon'
import IconFont from '../IconFont'
import { BottomLinkItem } from './BottomLinkItem'
import { SiderMenuItem } from './SiderMenuItem'
import { UserMenuItem } from './UserMenuItem'

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
  const { pinnedMicroApps, unpinMicroApp } = usePreferenceStore()
  const { language } = useLanguageStore()
  const { getOEMConfig } = useOEMConfigStore()
  const oemConfig = getOEMConfig(language)

  // TODO: 微应用列表获取待实现
  const [microApps] = useState<ApplicationInfo[]>([])
  // TODO: 角色信息需要从其他地方获取，暂时使用空数组
  const roleIds = useMemo(() => new Set<string>([]), [])
  const firstVisibleRoute = useMemo(() => getFirstVisibleSidebarRoute(roleIds), [roleIds])

  // 根据当前路由确定选中的菜单项
  const getSelectedKey = () => {
    const pathname = location.pathname
    if (pathname === '/') {
      // 根路径默认选中“第一个可见菜单”
      return firstVisibleRoute?.key || 'my-app'
    }
    const route = getRouteByPath(pathname)

    // 如果是微应用路由
    // 注意：location.pathname 是相对于 basename 的路径，不包含 BASE_PATH
    if (pathname.startsWith('/application/')) {
      const appId = pathname.split('/')[2]
      return `micro-app-${appId}`
    }

    return route?.key || 'my-app'
  }

  const handleItemClick = (key: string) => {
    if (key.startsWith('micro-app-')) {
      const appId = key.replace('micro-app-', '')
      window.open(getFullPath(`/application/${appId}`), '_blank')
      return
    }

    const route = routeConfigs.find((item) => item.key === key)
    if (route && !route.disabled && route.path) {
      navigate(`/${route.path}`)
    }
  }

  // 处理打开微应用
  const handleOpenApp = useCallback((appId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
    }
    window.open(getFullPath(`/application/${appId}`), '_blank')
  }, [])

  // 处理取消钉住
  const handleUnpin = useCallback(
    async (appId: string, e?: React.MouseEvent) => {
      if (e) {
        e.stopPropagation()
      }
      try {
        await unpinMicroApp(appId)
        message.success('已取消钉住')
      } catch (error) {
        console.error('Failed to unpin micro app:', error)
        message.error('取消钉住失败，请稍后重试')
      }
    },
    [unpinMicroApp],
  )

  const openExternal = useCallback((url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }, [])

  // 构建侧边栏各区块数据
  const sidebarData = useMemo(() => {
    // 类型守卫：确保 route 有 key
    const hasKey = (route: RouteConfig): route is RouteConfig & { key: string } => {
      return Boolean(route.key)
    }

    const visibleSidebarRoutes = routeConfigs
      .filter((route) => route.showInSidebar && route.key)
      .filter((route) => isRouteVisibleForRoles(route, roleIds))
      .filter(hasKey)

    const toRouteItem = (route: (typeof visibleSidebarRoutes)[number]) => ({
      key: route.key,
      label: route.label || route.key,
      iconUrl: route.iconUrl,
      disabled: route.disabled,
      type: 'route' as const,
    })

    const myAppRoute = visibleSidebarRoutes.find((r) => r.key === 'my-app')
    const myAppItem = myAppRoute ? toRouteItem(myAppRoute) : null

    const appStoreRoute = visibleSidebarRoutes.find((r) => r.key === 'app-store')
    const appStoreItem = appStoreRoute ? toRouteItem(appStoreRoute) : null

    const pinnedItems = pinnedMicroApps
      .map((appId) => {
        const app = microApps.find((a) => a.id === Number(appId))
        if (!app) return null
        return {
          key: `micro-app-${app.id}`,
          label: app.name,
          icon: <AppIcon icon={app.icon} name={app.name} size={16} shape="square" />,
          type: 'pinned' as const,
          onContextMenu: [
            {
              key: 'open',
              label: '打开',
              onClick: () => handleOpenApp(app.id.toString()),
            },
            {
              key: 'unpin',
              label: '取消钉住',
              onClick: () => handleUnpin(app.id.toString()),
            },
          ] as MenuProps['items'],
        }
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)

    const getExternalUrl = (path: string) => {
      return `${window.location.origin}${path}`
    }
    const externalItems = [
      {
        key: 'data-platform',
        label: 'AI Data Platform',
        icon: <SidebarAiDataPlatformIcon />,
        type: 'external' as const,
        onClick: () => openExternal(getExternalUrl('/studio')),
      },
      {
        key: 'system',
        label: '系统工作台',
        icon: <SidebarSystemIcon />,
        type: 'external' as const,
        onClick: () => openExternal(getExternalUrl('/deploy')),
      },
    ]

    return { myAppItem, pinnedItems, appStoreItem, externalItems }
  }, [pinnedMicroApps, microApps, handleOpenApp, handleUnpin, openExternal, roleIds])

  const siderWidth = collapsed ? 60 : 240
  const selectedKey = getSelectedKey()

  // 获取 OEM logo，如果获取不到则使用默认 logo
  const getLogoUrl = () => {
    const base64Image = oemConfig?.['logo.png']
    if (!base64Image) {
      return null
    }
    // 如果已经是 data URL 格式，直接使用
    if (base64Image.startsWith('data:image/')) {
      return base64Image
    }
    // 否则添加 base64 前缀
    return `data:image/png;base64,${base64Image}`
  }
  const logoUrl = getLogoUrl()

  return (
    <AntdSider
      width={240}
      collapsedWidth={60}
      collapsible
      collapsed={collapsed}
      trigger={null}
      className="bg-white backdrop-blur-[6px] shadow-[inset_-1px_0_0_rgba(0,0,0,0.1)]"
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
            collapsed ? 'justify-center pl-1.5 pr-1.5' : 'justify-between pl-3 pr-2',
          )}
        >
          {logoUrl ? (
            <img src={logoUrl} alt="logo" className={clsx('h-6 w-auto', collapsed && 'hidden')} />
          ) : (
            <LogoIcon className={clsx('h-6 w-auto', collapsed && 'hidden')} />
          )}
          <Tooltip title={collapsed ? '展开' : '收起'} placement="right">
            <button
              type="button"
              className={clsx(
                'text-sm cursor-pointer flex items-center justify-center w-8 h-8 rounded-md text-[--dip-text-color] hover:text-[--dip-primary-color]',
              )}
              onClick={() => onCollapse(!collapsed)}
            >
              <IconFont type="icon-dip-cebianlan" />
            </button>
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
          <div className="h-px bg-[--dip-border-color] my-2 ml-px mr-4 shrink-0" />
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
                key={item.key}
                item={item}
                collapsed={collapsed}
                onClick={item.onClick}
              />
            )
          })}
        </div>

        {/* 分割线 */}
        <div className="h-px bg-[--dip-border-color] my-2 mx-1.5 shrink-0" />

        {/* 用户 */}
        <UserMenuItem collapsed={collapsed} />
      </div>
    </AntdSider>
  )
}

export default Sider
