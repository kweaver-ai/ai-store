import { Dropdown, Tooltip } from 'antd'
import type { MenuProps } from 'antd'
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
      onClick: handleLogout,
    },
  ]

  const menuStyle: React.CSSProperties = {
    minWidth: '120px !important',
    width: 'max-content', // 使用 max-content 确保菜单宽度根据内容自适应
  }

  const content = (
    <div
      className={clsx(
        'flex items-center h-10 mx-1.5 rounded-md cursor-pointer hover:bg-[--dip-hover-bg-color] shrink-0',
        collapsed ? 'justify-center px-0' : 'gap-2 px-2.5'
      )}
    >
      <AvatarIcon className="w-4 h-4" />
      {!collapsed && (
        <div className="min-w-0">
          <span className="text-sm font-normal text-[#000] truncate">
            {userInfo?.vision_name || '用户'}
          </span>
        </div>
      )}
    </div>
  )
  return (
    <Dropdown
      menu={{
        items: menuItems,
        // style: menuStyle,
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
  )
}
