import type { MenuProps } from 'antd'
import { Dropdown } from 'antd'
import { useMemo } from 'react'
import AppIcon from '@/components/AppIcon'
import IconFont from '@/components/IconFont'
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
            icon: <AppIcon icon={app.icon} name={app.name} size={16} className="shrink-0" />,
            label: app.name,
          }))
        : [],
    [apps],
  )

  return (
    <Dropdown
      menu={{
        items: menuItems,
        onClick: handleMenuClick,
        style: {
          maxHeight: 'calc(100vh - 80px)',
        },
      }}
      trigger={['click']}
      placement="bottomLeft"
      styles={{
        itemContent: {
          maxWidth: '400px',
        },
      }}
    >
      <div className="flex items-center justify-center cursor-pointer">
        <IconFont type="icon-dip-a-quanbu11" className="!text-2xl" onClick={handleButtonClick} />
      </div>
    </Dropdown>
  )
}
