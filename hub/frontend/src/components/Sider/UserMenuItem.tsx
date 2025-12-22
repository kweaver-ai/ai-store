import { Dropdown, Tooltip } from 'antd'
import type { MenuProps } from 'antd'
import clsx from 'classnames'
import AvatarIcon from '@/assets/images/sider/avatar.svg?react'
import { useAuthStore } from '@/stores'

export interface UserMenuItemProps {
  /** 是否折叠 */
  collapsed: boolean
}

export const UserMenuItem = ({ collapsed }: UserMenuItemProps) => {
  const { userInfo, logout } = useAuthStore()
  const handleLogout = () => {
    logout()
  }

  const menuItems: MenuProps['items'] = [
    {
      key: 'logout',
      label: '退出登录',
      onClick: handleLogout,
    },
  ]

  const content = (
    <div
      className={clsx(
        'flex items-center h-10 mx-1.5 rounded-md cursor-pointer hover:bg-[--dip-hover-bg-color]',
        collapsed ? 'justify-center px-0' : 'gap-2 px-2.5'
      )}
    >
      <AvatarIcon className="w-4 h-4" />
      {!collapsed && (
        <div className="min-w-0">
          <span className="text-sm font-normal text-[#000] truncate">
            {userInfo?.display_name || '用户'}
          </span>
        </div>
      )}
    </div>
  )
  return (
    <Dropdown
      menu={{ items: menuItems }}
      placement="topLeft"
      trigger={['click']}
    >
      {collapsed ? (
        <Tooltip title={userInfo?.display_name} placement="right">
          {content}
        </Tooltip>
      ) : (
        content
      )}
    </Dropdown>
  )
}
