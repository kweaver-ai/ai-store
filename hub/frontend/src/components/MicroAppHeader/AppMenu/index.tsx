import { useMemo } from 'react'
import { Avatar, Button, Dropdown } from 'antd'
import type { MenuProps } from 'antd'
import { useApplicationsService } from '@/hooks/useApplicationsService'
import AppMenuIcon from '@/assets/images/header/menu.svg?react'

/**
 * 导航菜单图标按钮组件
 */
export const AppMenu = () => {
  // 使用手动加载模式，点击时才触发
  const { apps, loading, fetchAppList } = useApplicationsService({
    autoLoad: false,
  })

  // 处理点击按钮触发加载
  const handleButtonClick = () => {
    fetchAppList()
  }

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    const app = apps.find((item) => item.key === key)
    if (app && app.micro_app.name) {
      // 以新标签页形式打开应用
      window.open(`/application/${app.micro_app.name}`, '_blank')
    }
  }

  const menuItems: MenuProps['items'] = useMemo(
    () =>
      Array.isArray(apps)
        ? [...apps, ...apps].map((app) => ({
            key: app.key,
            icon: app.icon ? (
              <img
                src={`data:image/png;base64,${app.icon}`}
                alt={app.name}
                className="w-4 h-4 shrink-0"
              />
            ) : (
              <Avatar size={24} className="shrink-0">
                {app.name.charAt(0)}
              </Avatar>
            ),
            label: app.name,
          }))
        : [],
    [apps]
  )

  return (
    <Dropdown
      menu={{
        items: menuItems,
        onClick: handleMenuClick,
        style: {
          maxHeight: '80vh',
        },
      }}
      trigger={['click']}
      placement="bottomLeft"
      styles={{
        itemContent: {
          maxWidth: '400px',
          minWidth: '240px',
          // overflow: 'hidden',
          // textOverflow: 'ellipsis',
          // whiteSpace: 'nowrap',
        },
      }}
    >
      <Button
        type="text"
        disabled={loading}
        onClick={handleButtonClick}
        icon={
          <span>
            <AppMenuIcon />
          </span>
        }
      />
    </Dropdown>
  )
}
