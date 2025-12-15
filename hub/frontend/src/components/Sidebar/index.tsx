import { useState, useEffect, useMemo, useCallback } from 'react'
import { Layout, Dropdown, Avatar, Button, message } from 'antd'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  GlobalOutlined,
  PushpinOutlined,
  AppstoreOutlined,
  DatabaseOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore, usePreferenceStore } from '../../stores'
import { useLanguageStore } from '../../stores/languageStore'
import { useLanguage } from '@/hooks/useLanguage'
import { getRouteByPath, routeConfigs } from '../../routes/routes'
import { getMicroAppList } from '../../apis/micro-app'
import type { MicroAppConfig } from '../../utils/micro-app/type'
import type { MenuProps } from 'antd'
import './index.module.less'

const { Sider } = Layout

interface SidebarProps {
  collapsed: boolean
  onCollapse: (collapsed: boolean) => void
  topOffset?: number
}

const Sidebar = ({ collapsed, onCollapse, topOffset = 0 }: SidebarProps) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { userInfo, logout } = useAuthStore()
  const { language } = useLanguageStore()
  const { updateLanguage } = useLanguage()
  const { pinnedMicroApps, unpinMicroApp } = usePreferenceStore()

  const [microApps, setMicroApps] = useState<MicroAppConfig[]>([])
  const { fetchPinnedMicroApps } = usePreferenceStore()

  // 获取微应用列表和钉住的微应用
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [apps] = await Promise.all([
          getMicroAppList(),
          fetchPinnedMicroApps(),
        ])
        setMicroApps(apps)
      } catch (error) {
        console.error('Failed to fetch data:', error)
      }
    }
    fetchData()
  }, [fetchPinnedMicroApps])

  // 根据当前路由确定选中的菜单项
  const getSelectedKey = () => {
    const pathname = location.pathname === '/' ? '/home' : location.pathname
    const route = getRouteByPath(pathname)

    // 如果是微应用路由
    if (pathname.startsWith('/app/')) {
      const appName = pathname.split('/')[2]
      return `micro-app-${appName}`
    }

    return route?.key || 'my-app'
  }

  const handleItemClick = (key: string) => {
    if (key.startsWith('micro-app-')) {
      const appName = key.replace('micro-app-', '')
      window.open(`/app/${appName}`, '_blank')
      return
    }

    const route = routeConfigs.find((item) => item.key === key)
    if (route && !route.disabled && route.path) {
      navigate(`/${route.path}`)
    }
  }

  // 处理右键菜单（用于钉住/取消钉住微应用）
  // 注意：Ant Design Menu 组件不支持 onContextMenu，可以通过其他方式实现
  // 暂时移除，后续可以通过菜单项的额外操作按钮实现

  // 处理打开微应用
  const handleOpenApp = useCallback((appName: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
    }
    window.open(`/app/${appName}`, '_blank')
  }, [])

  // 处理取消钉住
  const handleUnpin = useCallback(
    async (appName: string, e?: React.MouseEvent) => {
      if (e) {
        e.stopPropagation()
      }
      try {
        await unpinMicroApp(appName)
        message.success('已取消钉住')
      } catch (error) {
        console.error('Failed to unpin micro app:', error)
        message.error('取消钉住失败，请稍后重试')
      }
    },
    [unpinMicroApp]
  )

  // 合并静态路由菜单项和钉住的微应用
  const sidebarData = useMemo(() => {
    const mainRoutes = routeConfigs
      .filter(
        (route) =>
          route.showInSidebar &&
          route.key &&
          !['my-app', 'data-platform', 'system'].includes(route.key)
      )
      .map((route) => ({
        key: route.key!,
        label: route.label || route.key!,
        icon: route.icon,
        disabled: route.disabled,
      }))

    const storeRoute = routeConfigs.find((route) => route.key === 'my-app')
    const storeItem = storeRoute
      ? {
          key: storeRoute.key!,
          label: storeRoute.label || '应用商店',
          icon: storeRoute.icon || <AppstoreOutlined />,
          disabled: storeRoute.disabled,
        }
      : null

    const fixedItems = [
      {
        key: 'data-platform',
        label: 'AI DATA Platform',
        icon: <DatabaseOutlined />,
        disabled: true,
      },
      {
        key: 'system',
        label: '系统工作台',
        icon: <SettingOutlined />,
        disabled: true,
      },
    ]

    const pinnedItems = pinnedMicroApps
      .map((appId) => {
        const app = microApps.find((a) => a.name === appId)
        if (!app) return null
        return {
          key: `micro-app-${app.name}`,
          label: app.name,
          icon: <PushpinOutlined className="text-[#1890FF]" />,
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

    return { mainRoutes, storeItem, fixedItems, pinnedItems }
  }, [pinnedMicroApps, microApps, handleOpenApp, handleUnpin])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const handleLanguageChange = async () => {
    try {
      // 切换到另一个语言
      const newLang = language === 'zh-CN' ? 'en-US' : 'zh-CN'
      await updateLanguage(newLang)
    } catch (error) {
      console.error('Failed to change language:', error)
    }
  }

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'language',
      icon: <GlobalOutlined />,
      label: language === 'zh-CN' ? '中文' : 'English',
      onClick: handleLanguageChange,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ]

  const siderWidth = collapsed ? 64 : 240
  const selectedKey = getSelectedKey()

  const renderNavItem = (
    item: {
      key: string
      label: string
      icon?: React.ReactNode
      disabled?: boolean
      onContextMenu?: MenuProps['items']
    },
    isStore?: boolean
  ) => {
    const isSelected = selectedKey === item.key
    const content = (
      <div
        key={item.key}
        className={`group relative flex items-center gap-3 px-3 py-2 rounded-lg ${
          item.disabled
            ? 'cursor-not-allowed text-[#8A90A5]'
            : 'cursor-pointer text-[#1F1F1F] hover:bg-[#F5F8FF]'
        } ${isSelected ? 'font-semibold text-[#126EE3]' : ''}`}
        style={
          isSelected
            ? {
                background:
                  'linear-gradient(90deg, rgba(63,169,245,0.08) 0%, rgba(18,110,227,0.12) 100%)',
              }
            : undefined
        }
        onClick={() => {
          if (!item.disabled) {
            handleItemClick(item.key)
          }
        }}
      >
        <span
          className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[28px] rounded-full transition-opacity ${
            isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
          style={{
            background:
              'linear-gradient(180deg, rgba(63,169,245,1) 0%, rgba(18,110,227,1) 100%)',
          }}
        />
        <span className="w-[18px] h-[18px] flex items-center justify-center text-[#126EE3]">
          {item.icon || (isStore ? <AppstoreOutlined /> : null)}
        </span>
        <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
          {item.label}
        </span>
      </div>
    )

    if (item.onContextMenu && !item.disabled) {
      return (
        <Dropdown
          key={item.key}
          menu={{ items: item.onContextMenu }}
          trigger={['contextMenu']}
        >
          {content}
        </Dropdown>
      )
    }

    return content
  }

  return (
    <Sider
      width={240}
      collapsedWidth={64}
      collapsible
      collapsed={collapsed}
      trigger={null}
      className="bg-white/85 backdrop-blur-[6px] shadow-[inset_-1px_0_0_rgba(0,0,0,0.1)]"
      style={{
        position: 'fixed',
        left: 0,
        width: siderWidth,
        height: `calc(100vh - ${topOffset}px)`,
        top: topOffset,
        bottom: 0,
      }}
    >
      <div className="flex flex-col h-full px-3 pt-3 pb-4">
        <div className="flex items-center justify-between gap-2 py-1 pb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1C4DFA] to-[#3FA9F5] flex items-center justify-center text-white font-bold text-base shadow-[0_6px_16px_rgba(18,110,227,0.18)]">
              <AppstoreOutlined />
            </div>
            {!collapsed && (
              <span className="text-base text-[#126EE3] font-semibold whitespace-nowrap">
                应用中心
              </span>
            )}
          </div>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => onCollapse(!collapsed)}
            className="min-w-[28px] w-7 h-7 rounded-lg border-none bg-[rgba(18,110,227,0.08)] text-[#126EE3] [&_.ant-btn-icon]:text-sm"
          />
        </div>

        <div className="flex-1 min-h-0 flex flex-col gap-2 overflow-hidden">
          <div className="flex flex-col gap-2 overflow-auto pr-1">
            {sidebarData.mainRoutes.map((item) => renderNavItem(item))}
            {sidebarData.pinnedItems.length > 0 && (
              <>
                <div className="h-[1px] bg-[rgba(0,0,0,0.1)] my-2" />
                {sidebarData.pinnedItems.map((item) => renderNavItem(item))}
              </>
            )}
            {sidebarData.storeItem && (
              <>
                <div className="h-[1px] bg-[rgba(0,0,0,0.1)] my-2" />
                {renderNavItem(sidebarData.storeItem, true)}
              </>
            )}
          </div>

          <div className="flex-1" />

          <div className="pt-2 border-t border-[rgba(0,0,0,0.1)]">
            <div className="flex flex-col gap-2">
              {sidebarData.fixedItems.map((item) => renderNavItem(item))}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-[rgba(0,0,0,0.1)]">
            <Dropdown menu={{ items: userMenuItems }} placement="topLeft">
              <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-[rgba(241,247,254,0.7)] cursor-pointer">
                <Avatar
                  icon={<UserOutlined />}
                  src={userInfo?.avatar}
                  size={32}
                />
                {!collapsed && (
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-[13px] font-medium text-[#1F1F1F] overflow-hidden text-ellipsis whitespace-nowrap">
                      {userInfo?.username || '用户'}
                    </span>
                    {(userInfo?.email || userInfo?.id) && (
                      <span className="text-xs text-[#8A90A5] overflow-hidden text-ellipsis whitespace-nowrap">
                        {userInfo?.email || userInfo?.id}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </Dropdown>
          </div>
        </div>
      </div>
    </Sider>
  )
}

export default Sidebar
