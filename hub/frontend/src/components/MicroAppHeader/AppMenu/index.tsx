import type { MenuProps } from 'antd'
import { Avatar, Button, Dropdown } from 'antd'
import { useMemo } from 'react'
import AppMenuIcon from '@/assets/images/header/menu.svg?react'
import { useApplicationsService } from '@/hooks/useApplicationsService'
import { getFullPath } from '@/utils/config'

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
    if (loading) return
    fetchAppList()
  }

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    const app = apps.find((item) => item.id === Number(key))
    if (app?.id) {
      // 以新标签页形式打开应用
      window.open(getFullPath(`/application/${app.id}`), '_blank')
    }
  }

  const menuItems: MenuProps['items'] = useMemo(
    () =>
      Array.isArray(apps)
        ? apps.map((app) => ({
            key: app.id,
            icon: app.icon ? (
              <img
                src={`data:image/png;base64,${app.icon}`}
                alt={app.name}
                className="w-4 h-4 shrink-0 rounded-full"
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
