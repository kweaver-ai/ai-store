import type { MenuProps } from 'antd'
import { Dropdown, Tooltip } from 'antd'
import clsx from 'classnames'
import AvatarIcon from '@/assets/images/sider/avatar.svg?react'
import { useUserInfoStore } from '@/stores'

export interface UserMenuItemProps {
  /** 是否折叠 */
  collapsed: boolean
}

export const UserMenuItem = ({ collapsed }: UserMenuItemProps) => {
  const { userInfo, logout } = useUserInfoStore()
  const handleLogout = () => {
    logout()
  }

  const menuItems: MenuProps['items'] = [
    {
      key: 'logout',
      label: '退出登录',
      title: '',
      onClick: handleLogout,
    },
  ]

  const content = (
    <div
      className={clsx(
        'w-full flex items-center h-10 rounded   cursor-pointer hover:bg-[--dip-hover-bg-color]',
        collapsed ? 'justify-center px-0' : 'gap-2 px-2.5',
      )}
    >
      <AvatarIcon className="w-4 h-4 shrink-0" />
      {!collapsed && (
        <span
          className="w-full text-sm font-normal text-[#000] truncate"
          title={userInfo?.vision_name}
        >
          {userInfo?.vision_name || '用户'}
        </span>
      )}
    </div>
  )
  return (
    <div className="w-full px-1.5">
      <Dropdown
        menu={{
          items: menuItems,
          inlineCollapsed: false,
        }}
        placement="topLeft"
        trigger={['click']}
      >
        {collapsed ? (
          <Tooltip title={userInfo?.vision_name} placement="right">
            {content}
          </Tooltip>
        ) : (
          content
        )}
      </Dropdown>
    </div>
  )
}
