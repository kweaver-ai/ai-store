import { useMemo } from 'react'
import { Dropdown } from 'antd'
import type { MenuProps } from 'antd'
import { useApplicationsService } from '@/hooks/useApplicationsService'

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
        ? apps.map((app) => ({
            key: app.key,
            label: (
              <div className="flex items-center gap-2">
                {app.icon && (
                  <img
                    src={`data:image/png;base64,${app.icon}`}
                    alt={app.name}
                    className="w-[4px] h-[4px]"
                  />
                )}
                <span>{app.name}</span>
              </div>
            ),
          }))
        : [],
    [apps]
  )

  return (
    <Dropdown
      menu={{ items: menuItems, onClick: handleMenuClick }}
      trigger={['click']}
      placement="bottomLeft"
    >
      <button
        className="flex items-center justify-center w-6 h-6 cursor-pointer bg-transparent border-0 p-0 text-[--dip-text-color] transition-opacity duration-200 hover:text-[--dip-link-color] disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={loading}
        onClick={handleButtonClick}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* 第一行 */}
          <circle cx="4" cy="4" r="2" fill="currentColor" />
          <circle cx="12" cy="4" r="2" fill="currentColor" />
          <circle cx="20" cy="4" r="2" fill="currentColor" />
          {/* 第二行 */}
          <circle cx="4" cy="12" r="2" fill="currentColor" />
          <circle cx="12" cy="12" r="2" fill="currentColor" />
          <circle cx="20" cy="12" r="2" fill="currentColor" />
          {/* 第三行 */}
          <circle cx="4" cy="20" r="2" fill="currentColor" />
          <circle cx="12" cy="20" r="2" fill="currentColor" />
          <circle cx="20" cy="20" r="2" fill="currentColor" />
        </svg>
      </button>
    </Dropdown>
  )
}
