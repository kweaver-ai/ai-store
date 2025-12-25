import { Dropdown, Avatar } from 'antd'
import type { MenuProps } from 'antd'
import AvatarIcon from '@/assets/images/sider/avatar.svg?react'
import { DownOutlined } from '@ant-design/icons'
import { useUserInfoStore } from '@/stores'

/**
 * 用户信息组件
 */
export const UserInfo = () => {
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

  return (
    <Dropdown
      menu={{ items: menuItems }}
      trigger={['click']}
      placement="bottomRight"
    >
      <div className="flex items-center gap-x-2 cursor-pointer">
        <Avatar icon={<AvatarIcon />} size={24} className="flex-shrink-0" />
        <span className="text-sm font-normal text-black">
          {userInfo?.vision_name}
        </span>
        <DownOutlined className="text-[10px]" />
      </div>
    </Dropdown>
  )
}
