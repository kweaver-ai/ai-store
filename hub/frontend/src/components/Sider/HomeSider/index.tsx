import { PushpinOutlined } from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { Dropdown, Menu, message, Tooltip } from 'antd'
import clsx from 'classnames'
import type React from 'react'
import { useCallback, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import LogoIcon from '@/assets/images/brand/logo.svg?react'
import SidebarAiDataPlatformIcon from '@/assets/images/sider/adp.svg?react'
import SidebarAiStoreIcon from '@/assets/images/sider/aiStore.svg?react'
import SidebarDipStudioIcon from '@/assets/images/sider/dipStudio.svg?react'
import SidebarSystemIcon from '@/assets/images/sider/proton.svg?react'
import { getFirstVisibleRouteBySiderType } from '@/routes/utils'
import { usePreferenceStore } from '@/stores'
import { useLanguageStore } from '@/stores/languageStore'
import { useOEMConfigStore } from '@/stores/oemConfigStore'
import { getFullPath } from '@/utils/config'
import AppIcon from '../../AppIcon'
import IconFont from '../../IconFont'
import { UserMenuItem } from '../components/UserMenuItem'

interface HomeSiderProps {
  /** 是否折叠 */
  collapsed: boolean
  /** 折叠状态改变回调 */
  onCollapse: (collapsed: boolean) => void
}

/**
 * 首页侧边栏（HomeSider）
 *
 * - 负责渲染：Logo + 折叠按钮 + 用户信息
 * - 显示路由菜单项、钉住的应用、外部链接等
 */
const HomeSider = ({ collapsed, onCollapse }: HomeSiderProps) => {
  const navigate = useNavigate()
  const { pinnedMicroApps, unpinMicroApp, wenshuAppInfo } = usePreferenceStore()
  const { language } = useLanguageStore()
  const { getOEMResourceConfig } = useOEMConfigStore()
  const oemResourceConfig = getOEMResourceConfig(language)
  // TODO: 角色信息需要从其他地方获取，暂时使用空数组
  const roleIds = useMemo(() => new Set<string>([]), [])
  // 记录最近点击的 Dropdown 菜单项，用于阻止 Menu item 的 onClick
  const recentDropdownClickRef = useRef<number | null>(null)

  const handleOpenApp = useCallback((appId: number) => {
    // 如果最近点击了 Dropdown 菜单项，则不执行
    if (recentDropdownClickRef.current === appId) {
      recentDropdownClickRef.current = null
      return
    }
    navigate(`/application/${appId}`)
  }, [])

  const handleUnpin = useCallback(
    async (appId: number) => {
      // 记录最近点击的 Dropdown 菜单项
      recentDropdownClickRef.current = appId
      try {
        await unpinMicroApp(appId)
        message.success('已取消钉住')
      } catch (error) {
        console.error('Failed to unpin micro app:', error)
        message.error('取消钉住失败，请稍后重试')
      }
      // 延迟清除标记，确保 Menu item 的 onClick 能检测到
      requestAnimationFrame(() => {
        if (recentDropdownClickRef.current === appId) {
          recentDropdownClickRef.current = null
        }
      })
    },
    [unpinMicroApp],
  )

  const handleNavLinkClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>, path: string) => {
      // 支持浏览器新标签页/新窗口（Ctrl+Click / Cmd+Click / 中键等）由浏览器接管
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.button === 1) {
        return
      }
      // 默认行为改为 SPA 内部跳转
      event.preventDefault()
      navigate(path)
    },
    [navigate],
  )

  const menuItems = useMemo<MenuProps['items']>(() => {
    const items: MenuProps['items'] = []
    if (pinnedMicroApps.length > 0) {
      pinnedMicroApps.forEach((app) => {
        const isWenshuApp = app.id === wenshuAppInfo?.id
        if (app) {
          items.push({
            key: `micro-app-${app.id}`,
            label: (
              <div className="w-full h-full flex justify-between items-center">
                {app.name}
                {!isWenshuApp && (
                  <Dropdown
                    menu={{
                      items: [
                        {
                          key: 'unpin',
                          label: '取消固定',
                          onClick: () => handleUnpin(app.id),
                          icon: <PushpinOutlined className="text-[var(--dip-warning-color)]" />,
                        },
                      ],
                    }}
                    trigger={['click']}
                  >
                    <PushpinOutlined
                      className="w-6 h-6 text-base flex items-center justify-center rounded text-[var(--dip-warning-color)] pin-icon opacity-0 hover:bg-[rgba(0,0,0,0.04)]"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </Dropdown>
                )}
              </div>
            ),
            icon: <AppIcon icon={app.icon} name={app.name} size={16} shape="square" />,
            onClick: () => handleOpenApp(app.id),
          })
        }
      })
    }

    return items
  }, [pinnedMicroApps, handleOpenApp, handleUnpin, wenshuAppInfo])

  const externalMenuItems = useMemo<MenuProps['items']>(() => {
    const firstStoreRoute = getFirstVisibleRouteBySiderType('store', roleIds)
    const firstStudioRoute = getFirstVisibleRouteBySiderType('studio', roleIds)
    const getExternalUrl = (path: string) => `${window.location.origin}${path}`

    const storePath = `/${firstStoreRoute?.path || 'store/my-app'}`
    const studioPath = `/${firstStudioRoute?.path || 'studio/project-management'}`

    const storeHref = getFullPath(storePath)
    const studioHref = getFullPath(studioPath)

    return [
      {
        key: 'ai-store',
        label: (
          <a href={storeHref} onClick={(e) => handleNavLinkClick(e, storePath)}>
            AI Store
          </a>
        ),
        icon: <SidebarAiStoreIcon />,
      },
      {
        key: 'dip-studio',
        label: (
          <a href={studioHref} onClick={(e) => handleNavLinkClick(e, studioPath)}>
            DIP Studio
          </a>
        ),
        icon: <SidebarDipStudioIcon />,
      },
      {
        key: 'data-platform',
        label: (
          <a href={getExternalUrl('/studio')} target="_blank" rel="noopener noreferrer">
            AI Data Platform
          </a>
        ),
        icon: <SidebarAiDataPlatformIcon />,
      },
      {
        key: 'system',
        label: (
          <a href={getExternalUrl('/deploy')} target="_blank" rel="noopener noreferrer">
            系统工作台
          </a>
        ),
        icon: <SidebarSystemIcon />,
      },
    ]
  }, [roleIds, handleNavLinkClick])

  // 获取 OEM logo，如果获取不到则使用默认 logo
  const logoUrl = useMemo(() => {
    const base64Image = oemResourceConfig?.['logo.png']
    if (!base64Image) {
      return null
    }
    // 如果已经是 data URL 格式，直接使用
    if (base64Image.startsWith('data:image/')) {
      return base64Image
    }
    // 否则添加 base64 前缀
    return `data:image/png;base64,${base64Image}`
  }, [oemResourceConfig])

  return (
    <div className="flex flex-col h-full px-0 pt-4 pb-1 overflow-hidden">
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
            className="text-sm cursor-pointer flex items-center justify-center w-8 h-8 rounded-md text-[--dip-text-color] hover:text-[--dip-primary-color]"
            onClick={() => onCollapse(!collapsed)}
          >
            <IconFont type="icon-dip-cebianlan" />
          </button>
        </Tooltip>
      </div>

      {/* 菜单内容 */}
      <div className="flex-1 flex flex-col dip-hideScrollbar">
        <div className="flex-1">
          <Menu
            mode="inline"
            selectedKeys={[]}
            items={menuItems}
            inlineCollapsed={collapsed}
            selectable
          />
        </div>

        {/* 外链菜单内容 */}
        <div className="shrink-0">
          <Menu
            mode="inline"
            selectedKeys={[]}
            items={externalMenuItems}
            inlineCollapsed={collapsed}
            selectable={false}
          />
        </div>
      </div>

      {/* 用户 */}
      <UserMenuItem collapsed={collapsed} />
    </div>
  )
}

export default HomeSider
