import type { MenuProps } from 'antd'
import { Avatar, Button, Card, Dropdown } from 'antd'
import classNames from 'classnames'
import type React from 'react'
import { useMemo, useState } from 'react'
import type { ApplicationInfo } from '@/apis/applications'
import { formatTimeMinute } from '@/utils/handle-function/FormatTime'
import AppIcon from '../AppIcon'
import IconFont from '../IconFont'
import { ModeEnum } from './types'
import { cardHeight, getAppCardMenuItems } from './utils'

interface AppCardProps {
  app: ApplicationInfo
  mode: ModeEnum.MyApp | ModeEnum.AppStore
  onMenuClick?: (key: string, app: ApplicationInfo) => void
}

const AppCard: React.FC<AppCardProps> = ({ app, mode, onMenuClick }) => {
  const [menuOpen, setMenuOpen] = useState(false)

  const menuItems = useMemo(() => {
    return getAppCardMenuItems(mode, app) as MenuProps['items']
  }, [mode, app])

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    onMenuClick?.(key as string, app)
  }

  const updateTime = app.updated_at ? formatTimeMinute(new Date(app.updated_at).getTime()) : ''
  const userName = app.updated_by || ''

  return (
    <Card
      className="group rounded-[10px] border border-[var(--dip-border-color)] transition-all w-full"
      style={{ height: cardHeight }}
      styles={{
        body: {
          height: '100%',
          padding: '16px 16px 12px 16px',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <div className="flex gap-4 mb-2 flex-shrink-0">
        {/* 应用图标 */}
        <div className="w-16 h-16 flex-shrink-0 rounded-full flex items-center justify-center overflow-hidden">
          <AppIcon icon={app.icon} name={app.name} size={64} className="w-full h-full" />
        </div>
        {/* 名称 + 版本号 + 描述 */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium mr-px truncate text-black" title={app.name}>
                {app.name}
              </div>
              {mode === ModeEnum.MyApp && (
                <Button
                  color="default"
                  variant="filled"
                  className="px-3 bg-[#F9FAFC] text-[--dip-text-color-65] hover:!bg-[--dip-primary-color] hover:!text-[--dip-white]"
                  onClick={() => {
                    onMenuClick?.('use', app)
                  }}
                >
                  <span className="text-xs">立即使用</span>
                  <IconFont type="icon-dip-arrow-up" rotate={90} className="text-xs" />
                </Button>
              )}
            </div>
            {mode === ModeEnum.AppStore && (
              <div className="w-fit rounded text-xs px-2 py-0.5 border border-[var(--dip-border-color-base)]">
                {app.version}
              </div>
            )}
            <p
              className="text-xs line-clamp-2 text-[--dip-text-color] leading-5"
              title={app.description}
            >
              {app.description || '[暂无描述]'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-end flex-1 h-0">
        <div className="mb-2 h-px bg-[var(--dip-line-color)]" />
        <div className="flex items-center justify-between">
          {/* 更新信息 */}
          <div className="flex items-center text-xs text-[var(--dip-text-color-45)]">
            <Avatar size={24} className="flex-shrink-0 mr-2">
              {userName.charAt(0)}
            </Avatar>
            <span className="truncate max-w-20 mr-4" title={userName}>
              {userName}
            </span>
            <span>更新：{updateTime}</span>
          </div>
          {/* 更多操作 */}
          {menuItems && menuItems.length > 0 && (
            <Dropdown
              menu={{ items: menuItems, onClick: handleMenuClick }}
              trigger={['click']}
              placement="bottomRight"
              onOpenChange={(open) => {
                setMenuOpen(open)
              }}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                }}
                className={classNames(
                  'w-6 h-6 flex items-center justify-center rounded text-[var(--dip-text-color-45)] hover:text-[var(--dip-text-color-85)] hover:bg-[--dip-hover-bg-color] transition-opacity',
                  menuOpen
                    ? 'opacity-100 visible'
                    : 'opacity-0 invisible group-hover:opacity-100 group-hover:visible',
                )}
              >
                <IconFont type="icon-dip-gengduo" />
              </button>
            </Dropdown>
          )}
        </div>
      </div>
    </Card>
  )
}

export default AppCard
