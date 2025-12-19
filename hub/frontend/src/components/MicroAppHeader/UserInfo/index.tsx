import { Dropdown, Avatar } from 'antd'
import type { MenuProps } from 'antd'
import AvatarIcon from '@/assets/images/sider/avatar.svg?react'
import { DownOutlined } from '@ant-design/icons'
import Cookies from 'js-cookie'
import { useAuthStore } from '@/stores'

/**
 * 用户信息组件
 */
export const UserInfo = () => {
  const { userInfo } = useAuthStore()

  const handleLogout = async () => {
    Cookies.remove('dip.access_token')
  }

  const menuItems: MenuProps['items'] = [
    {
      key: 'logout',
      label: <a href="/dip/api/session/v1/logout">退出登录</a>,
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
          {userInfo?.display_name}
        </span>
        <DownOutlined className="text-[10px]" />
      </div>
    </Dropdown>
  )
}
