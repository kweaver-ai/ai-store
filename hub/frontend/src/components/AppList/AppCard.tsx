import React, { useMemo } from 'react'
import { Card, Tag, Dropdown, Avatar, Button } from 'antd'
import { MoreOutlined } from '@ant-design/icons'
import type { MenuProps } from 'antd'
import { formatTimeSlash } from '@/utils/handle-function/FormatTime'
import type { AppInfo } from '@/apis/app-development'
import { ModeEnum } from './types'
import { getAppCardMenuItems } from './utils'

interface AppCardProps {
  app: AppInfo
  mode: ModeEnum.MyApp | ModeEnum.AppStore
  cardWidth: number
  onMenuClick?: (key: string, app: AppInfo) => void
  onClick?: (app: AppInfo) => void
}

const AppCard: React.FC<AppCardProps> = ({
  app,
  mode,
  cardWidth,
  onMenuClick,
  onClick,
}) => {
  const menuItems = useMemo(() => {
    return getAppCardMenuItems(mode, app) as MenuProps['items']
  }, [mode, app])

  // 渲染状态标签（根据模式区分）
  const renderStatusTag = () => {
    // 应用商店模式：显示安装状态
    // if (mode === ModeEnum.AppStore) {
    //   const isInstalled = app.installed
    //   return (
    //     <Tag
    //       className="rounded text-xs px-0.5 h-5.5 leading-5 border"
    //       style={{
    //         backgroundColor: isInstalled ? '#F6FFED' : '#126EE3',
    //         color: isInstalled ? '#52C41A' : '#FFFFFF',
    //         borderColor: isInstalled ? '#D9F7BE' : '#126EE3',
    //       }}
    //     >
    //       {isInstalled ? '已安装' : '安装'}
    //     </Tag>
    //   )
    // }

    // 我的应用模式：不显示状态标签
    return null
  }

  // 渲染版本标签
  const renderVersionTag = () => {
    return (
      <Tag
        className="rounded text-xs px-0.5 h-5.5 leading-5 border border-[rgba(0,0,0,0.15)]"
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.02)',
          color: 'rgba(0, 0, 0, 0.85)',
        }}
      >
        {app.version || 'v0.0.1'}
      </Tag>
    )
  }

  // 渲染用户信息和更新时间
  const renderUserInfo = () => {
    const updateTime = app.updateTime ? formatTimeSlash(app.updateTime) : ''
    const userName = app.createdByName || app.createdBy

    return (
      <div className="flex items-center gap-0.5 mb-0.5 text-xs text-[#92929d]">
        {/* 用名称的第一个字母作为头像 */}
        <Avatar size={24}>{userName?.charAt(0)}</Avatar>
        <span className="mr-0.5">更新：{updateTime}</span>
        <span>{userName}</span>
      </div>
    )
  }

  // 处理菜单点击
  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    onMenuClick?.(key as string, app)
  }

  return (
    <Card
      className="rounded-[10px] border border-[rgba(0,0,0,0.1)] h-[171px] p-1 cursor-pointer transition-all hover:shadow-md"
      style={{ width: cardWidth }}
      hoverable
      onClick={() => onClick?.(app)}
      variant="borderless"
    >
      <div className="flex justify-between items-start mb-0.5">
        <div className="w-4 h-4 flex-shrink-0">
          {/* 应用图标占位符 */}
          <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg" />
        </div>
        <div className="flex items-center gap-0.5">
          {renderStatusTag()}
          {menuItems && menuItems.length > 0 && (
            <Dropdown
              menu={{ items: menuItems, onClick: handleMenuClick }}
              trigger={['click']}
            >
              <Button
                type="text"
                icon={<MoreOutlined />}
                className="w-1 h-1 p-0 flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
              />
            </Dropdown>
          )}
        </div>
      </div>

      <div className="h-px bg-[rgba(0,0,0,0.04)] -mx-1 mb-0.5" />

      {renderUserInfo()}

      <div>
        <h3 className="text-sm font-medium text-black m-0 mb-0.5 leading-[1.57]">
          {app.appName}
        </h3>
        <p className="text-xs text-black leading-[1.67] m-0 mb-0.5 line-clamp-2">
          {app.appDescription || ''}
        </p>
        <div className="flex items-center gap-0.5">{renderVersionTag()}</div>
      </div>
    </Card>
  )
}

export default AppCard
